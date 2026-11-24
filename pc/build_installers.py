#!/usr/bin/env python3
"""Buduje instalatory programu na komputer z plików w pc/:
  dist/claude-pocket-pc.sh        – Linux (bash + Python 3.8+)
  dist/claude-pocket-windows.bat  – Windows 10 1809+ / 11 (PowerShell + Python 3.8+)
i kopiuje je do android/assets/pc/, żeby aplikacja mogła je zapisać na telefonie."""
import base64, io, os, shutil, tarfile, zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.join(HERE, 'dist')
ASSETS = os.path.join(HERE, '..', 'android', 'assets', 'pc')
COMMON = ['server.py', 'usage.py', 'conpty.py']


def vendor_files():
    with tarfile.open(os.path.join(HERE, 'vendor', 'websockets-10.4.tgz')) as t:
        for m in t.getmembers():
            if m.isfile() and '..' not in m.name and not m.name.startswith('/'):
                yield 'vendor/' + m.name, t.extractfile(m).read()


def common_files():
    for n in COMMON:
        with open(os.path.join(HERE, 'common', n), 'rb') as f:
            data = f.read()
        compile(data, n, 'exec')
        yield n, data
    yield from vendor_files()


def linux():
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode='w:gz') as tar:
        def add(name, data, mode=0o644):
            ti = tarfile.TarInfo(name); ti.size = len(data); ti.mode = mode; ti.mtime = 0
            tar.addfile(ti, io.BytesIO(data))
        for n, d in common_files():
            add(n, d)
        for n in ('claude-pocket-term', 'claude-pocket-kod'):
            with open(os.path.join(HERE, 'linux', n), 'rb') as f:
                add(n, f.read(), 0o755)
    with open(os.path.join(HERE, 'linux', 'install_head.sh')) as f:
        head = f.read()
    assert head.endswith('__PAYLOAD__\n')
    out = os.path.join(DIST, 'claude-pocket-pc.sh')
    with open(out, 'w', newline='\n') as f:
        f.write(head + base64.encodebytes(buf.getvalue()).decode())
    os.chmod(out, 0o755)
    return out


def windows():
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as z:
        for n, d in common_files():
            z.writestr(n, d)
        with open(os.path.join(HERE, 'windows', 'kod.ps1'), 'rb') as f:
            z.writestr('kod.ps1', b'\xef\xbb\xbf' + f.read())          # BOM: PowerShell 5 czyta wtedy polskie znaki poprawnie
    with open(os.path.join(HERE, 'windows', 'install_head.bat'), encoding='utf-8') as f:
        head = f.read()
    assert head.rstrip().endswith('<#__PAYLOAD__')
    b64 = base64.encodebytes(buf.getvalue()).decode()
    text = head + b64 + '__END__#>\n'
    out = os.path.join(DIST, 'claude-pocket-windows.bat')
    with open(out, 'w', encoding='utf-8', newline='\r\n') as f:   # cmd.exe woli końce linii CRLF
        f.write(text)
    return out


if __name__ == '__main__':
    os.makedirs(DIST, exist_ok=True)
    os.makedirs(ASSETS, exist_ok=True)
    for p in (linux(), windows()):
        shutil.copy(p, ASSETS)
        print(os.path.relpath(p, HERE), os.path.getsize(p), 'bajtów')
