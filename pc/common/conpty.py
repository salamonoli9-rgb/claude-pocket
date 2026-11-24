"""Pseudoterminal Windows (ConPTY) przez ctypes – bez dodatkowych pakietów. Windows 10 1809+ / Windows 11.

Daje programom (Claude Code, PowerShell) prawdziwą konsolę, tak jak pty na Linuksie:
kolory, pełny ekran, zmiana rozmiaru. Odczyt w osobnym wątku, wynik oddawany przez callback."""
import ctypes
import os
import threading
from ctypes import byref, c_int16, c_size_t, c_uint16, c_uint32, c_void_p, c_wchar_p, sizeof

HANDLE = c_void_p
DWORD = c_uint32
WORD = c_uint16


class COORD(ctypes.Structure):
    _fields_ = [('X', c_int16), ('Y', c_int16)]


class STARTUPINFOW(ctypes.Structure):
    _fields_ = [('cb', DWORD), ('lpReserved', c_wchar_p), ('lpDesktop', c_wchar_p), ('lpTitle', c_wchar_p),
                ('dwX', DWORD), ('dwY', DWORD), ('dwXSize', DWORD), ('dwYSize', DWORD),
                ('dwXCountChars', DWORD), ('dwYCountChars', DWORD), ('dwFillAttribute', DWORD), ('dwFlags', DWORD),
                ('wShowWindow', WORD), ('cbReserved2', WORD), ('lpReserved2', c_void_p),
                ('hStdInput', HANDLE), ('hStdOutput', HANDLE), ('hStdError', HANDLE)]


class STARTUPINFOEXW(ctypes.Structure):
    _fields_ = [('StartupInfo', STARTUPINFOW), ('lpAttributeList', c_void_p)]


class PROCESS_INFORMATION(ctypes.Structure):
    _fields_ = [('hProcess', HANDLE), ('hThread', HANDLE), ('dwProcessId', DWORD), ('dwThreadId', DWORD)]


EXTENDED_STARTUPINFO_PRESENT = 0x00080000
CREATE_UNICODE_ENVIRONMENT = 0x00000400
STARTF_USESTDHANDLES = 0x00000100
PROC_THREAD_ATTRIBUTE_PSEUDOCONSOLE = 0x00020016
INFINITE = 0xFFFFFFFF

_k = None


def _api():
    """Funkcje kernel32 z pełnymi typami (inaczej uchwyty 64-bit się obcinają)."""
    global _k
    if _k:
        return _k
    k = ctypes.WinDLL('kernel32', use_last_error=True)
    sig = {
        'CreatePipe': (ctypes.c_bool, [ctypes.POINTER(HANDLE), ctypes.POINTER(HANDLE), c_void_p, DWORD]),
        'CreatePseudoConsole': (ctypes.c_long, [COORD, HANDLE, HANDLE, DWORD, ctypes.POINTER(HANDLE)]),
        'ResizePseudoConsole': (ctypes.c_long, [HANDLE, COORD]),
        'ClosePseudoConsole': (None, [HANDLE]),
        'InitializeProcThreadAttributeList': (ctypes.c_bool, [c_void_p, DWORD, DWORD, ctypes.POINTER(c_size_t)]),
        'UpdateProcThreadAttribute': (ctypes.c_bool, [c_void_p, DWORD, c_size_t, c_void_p, c_size_t, c_void_p, c_void_p]),
        'DeleteProcThreadAttributeList': (None, [c_void_p]),
        'CreateProcessW': (ctypes.c_bool, [c_wchar_p, c_void_p, c_void_p, c_void_p, ctypes.c_bool, DWORD, c_void_p, c_wchar_p,
                                           c_void_p, ctypes.POINTER(PROCESS_INFORMATION)]),
        'ReadFile': (ctypes.c_bool, [HANDLE, c_void_p, DWORD, ctypes.POINTER(DWORD), c_void_p]),
        'WriteFile': (ctypes.c_bool, [HANDLE, c_void_p, DWORD, ctypes.POINTER(DWORD), c_void_p]),
        'CloseHandle': (ctypes.c_bool, [HANDLE]),
        'WaitForSingleObject': (DWORD, [HANDLE, DWORD]),
        'TerminateProcess': (ctypes.c_bool, [HANDLE, ctypes.c_uint]),
    }
    for name, (res, args) in sig.items():
        f = getattr(k, name)
        f.restype, f.argtypes = res, args
    _k = k
    return k


class ConPty:
    """spawn(cmdline, cwd, env, cols, rows, on_data, on_exit) – on_data(bytes) i on_exit() wołane z wątków."""

    def __init__(self, cmdline, cwd, env, cols, rows, on_data, on_exit):
        k = _api()
        self.k, self.closed = k, False
        in_r, in_w, out_r, out_w = HANDLE(), HANDLE(), HANDLE(), HANDLE()
        if not k.CreatePipe(byref(in_r), byref(in_w), None, 0) or not k.CreatePipe(byref(out_r), byref(out_w), None, 0):
            raise OSError(ctypes.get_last_error(), 'CreatePipe')
        self.hpc = HANDLE()
        hr = k.CreatePseudoConsole(COORD(cols, rows), in_r, out_w, 0, byref(self.hpc))
        if hr != 0:
            raise OSError(hr, 'CreatePseudoConsole (potrzebny Windows 10 1809 lub nowszy)')
        k.CloseHandle(in_r)            # konsola ma swoje kopie
        k.CloseHandle(out_w)
        self.inw, self.outr = in_w, out_r

        size = c_size_t(0)
        k.InitializeProcThreadAttributeList(None, 1, 0, byref(size))
        self._attr_buf = ctypes.create_string_buffer(size.value)
        attr = ctypes.cast(self._attr_buf, c_void_p)
        if not k.InitializeProcThreadAttributeList(attr, 1, 0, byref(size)):
            raise OSError(ctypes.get_last_error(), 'InitializeProcThreadAttributeList')
        if not k.UpdateProcThreadAttribute(attr, 0, PROC_THREAD_ATTRIBUTE_PSEUDOCONSOLE, self.hpc, sizeof(HANDLE), None, None):
            raise OSError(ctypes.get_last_error(), 'UpdateProcThreadAttribute')
        si = STARTUPINFOEXW()
        si.StartupInfo.cb = sizeof(STARTUPINFOEXW)
        si.StartupInfo.dwFlags = STARTF_USESTDHANDLES   # nie dziedzicz wyjścia rodzica (pythonw), tylko konsola ConPTY
        si.lpAttributeList = attr
        envblock = ctypes.create_unicode_buffer(''.join(f'{a}={b}\0' for a, b in sorted(env.items(), key=lambda x: x[0].upper())) + '\0')
        cmd = ctypes.create_unicode_buffer(cmdline)
        self.pi = PROCESS_INFORMATION()
        ok = k.CreateProcessW(None, ctypes.cast(cmd, c_void_p), None, None, False,
                              EXTENDED_STARTUPINFO_PRESENT | CREATE_UNICODE_ENVIRONMENT,
                              ctypes.cast(envblock, c_void_p), cwd, byref(si), byref(self.pi))
        k.DeleteProcThreadAttributeList(attr)
        if not ok:
            err = ctypes.get_last_error()
            self.close()
            raise OSError(err, f'CreateProcessW: {cmdline}')
        k.CloseHandle(self.pi.hThread)
        self.on_data, self.on_exit = on_data, on_exit
        threading.Thread(target=self._reader, daemon=True).start()
        threading.Thread(target=self._waiter, daemon=True).start()

    def _reader(self):
        buf = ctypes.create_string_buffer(65536)
        n = DWORD(0)
        while True:
            if not self.k.ReadFile(self.outr, buf, 65536, byref(n), None) or n.value == 0:
                break
            self.on_data(buf.raw[:n.value])
        try:
            self.k.CloseHandle(self.outr)
        except Exception:
            pass
        self.on_exit()

    def _waiter(self):
        # po wyjściu programu ConPTY nie zamyka sam wyjścia – trzeba zamknąć konsolę, żeby czytnik dostał koniec
        self.k.WaitForSingleObject(self.pi.hProcess, INFINITE)
        self.close()

    def write(self, data: bytes):
        if self.closed:
            return
        n = DWORD(0)
        self.k.WriteFile(self.inw, data, len(data), byref(n), None)

    def resize(self, cols, rows):
        if not self.closed:
            self.k.ResizePseudoConsole(self.hpc, COORD(cols, rows))

    def close(self):
        if self.closed:
            return
        self.closed = True
        try:
            if self.pi.hProcess:
                self.k.TerminateProcess(self.pi.hProcess, 1)
        except Exception:
            pass
        try:
            self.k.ClosePseudoConsole(self.hpc)
        except Exception:
            pass
        for h in (self.inw,):
            try:
                self.k.CloseHandle(h)
            except Exception:
                pass
