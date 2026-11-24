#!/usr/bin/env python3
"""Claude Pocket – program na komputer (Linux i Windows). Łączy aplikację na telefonie z tym komputerem.

  GET /api/ping?token=…     – sprawdzenie połączenia i kodu (+ adresy komputera: Wi‑Fi/LAN i Tailscale)
  GET /api/usage?token=…    – limity Claude (z loginu Claude Code na tym komputerze)
  GET /api/sessions?token=… – otwarte wspólne sesje terminala
  WS  /term?token=…&session=claude|shell&cols=&rows=
        wspólna sesja: "claude" (Claude Code) albo "shell" (bash / PowerShell). Sesja żyje dalej po rozłączeniu,
        a telefon i komputer (claude-pocket-term) widzą i sterują tym samym ekranem.

Bezpieczeństwo: wpuszcza tylko sieć domową (adresy prywatne) i Tailscale, i tylko z kodem parowania
(tworzony przy pierwszym starcie). Po 10 błędnych kodach z jednego adresu – blokada na 5 minut."""
import asyncio, codecs, getpass, http, ipaddress, json, os, platform, secrets, shutil, signal, socket, subprocess, sys, time, urllib.parse
import logging

WIN = os.name == 'nt'
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'vendor'))         # websockets 10.4 w zestawie – nic nie trzeba instalować
import websockets                                          # noqa: E402

if WIN:
    from conpty import ConPty                              # noqa: E402
else:
    import fcntl, pty, struct, termios                     # noqa: E401,E402

PORT = int(os.environ.get('CP_PORT', 8765))
HOME = os.path.expanduser('~')
CFG = os.environ.get('CP_CFG') or (os.path.join(os.environ.get('APPDATA', HOME), 'ClaudePocket') if WIN
                                   else f'{HOME}/.config/claude-pocket')
TOKF = os.path.join(CFG, 'token')
USAGE = os.path.join(HERE, 'usage.py')
ALPH = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'


def load_token():
    os.makedirs(CFG, mode=0o700, exist_ok=True)
    try:
        with open(TOKF) as f:
            t = f.read().strip()
    except FileNotFoundError:
        t = ''
    if len(t.replace('-', '')) < 12:
        t = '-'.join(''.join(secrets.choice(ALPH) for _ in range(4)) for _ in range(3))
        fd = os.open(TOKF, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
        os.write(fd, t.encode())
        os.close(fd)
    return t


TOKEN = load_token()
fails = {}
TAILNETS = (ipaddress.ip_network('100.64.0.0/10'), ipaddress.ip_network('fd7a:115c:a1e0::/48'))


def norm(t):
    return (t or '').upper().replace(' ', '').replace('-', '')


def ip_ok(ip):
    try:
        a = ipaddress.ip_address((ip or '').split('%')[0])
    except ValueError:
        return False
    if a.version == 6 and a.ipv4_mapped:
        a = a.ipv4_mapped
    return a.is_private or a.is_loopback or any(a in n for n in TAILNETS if n.version == a.version)


def _ipv4s():
    """Wszystkie adresy IPv4 tego komputera (bez pętli zwrotnej)."""
    found = []
    if shutil.which('ip'):
        try:
            out = subprocess.run(['ip', '-4', '-o', 'addr', 'show', 'scope', 'global'], capture_output=True, text=True, timeout=3).stdout
            for line in out.splitlines():
                f = line.split()
                if len(f) >= 4 and not f[1].startswith(('docker', 'br-', 'veth', 'virbr')):
                    found.append(f[3].split('/')[0])
        except Exception:
            pass
    if not found:                                          # Windows i systemy bez polecenia „ip”
        try:
            found = [i[4][0] for i in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET)]
        except Exception:
            pass
        try:                                               # adres „wychodzący” (bez wysyłania czegokolwiek)
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(('192.168.0.1', 9))
            found.append(s.getsockname()[0])
            s.close()
        except Exception:
            pass
    return list(dict.fromkeys(found))


def my_addrs():
    """Adresy dla telefonu: najpierw domowe Wi‑Fi/LAN, potem Tailscale."""
    lan, tail = [], []
    for ip in _ipv4s():
        try:
            a = ipaddress.ip_address(ip)
        except ValueError:
            continue
        if a.is_loopback or a.is_link_local:
            continue
        if any(a in n for n in TAILNETS if n.version == 4):
            tail.append(f'{a}:{PORT}')
        elif a.is_private:
            lan.append(f'{a}:{PORT}')
    return lan + tail


def check(ip, tok):
    """None = wolno; inaczej powód odmowy."""
    if not ip_ok(ip):
        return 'tylko-siec-domowa'
    n, t0 = fails.get(ip, (0, 0))
    if n >= 10 and time.time() - t0 < 300:
        return 'zablokowane-na-5-min'
    if secrets.compare_digest(norm(tok).encode(), norm(TOKEN).encode()):
        fails.pop(ip, None)
        return None
    fails[ip] = (n + 1, time.time())
    return 'zly-kod'


HDR = [('Access-Control-Allow-Origin', '*'), ('Cache-Control', 'no-store'), ('Content-Type', 'application/json')]
usage_cache = {'t': 0, 'body': b''}


async def get_usage():
    if time.time() - usage_cache['t'] < 30 and usage_cache['body']:
        return usage_cache['body']
    exe = sys.executable or 'python3'
    if exe.lower().endswith('pythonw.exe'):                # pythonw nie ma wyjścia – limity liczy zwykły python
        alt = exe[:-len('pythonw.exe')] + 'python.exe'
        exe = alt if os.path.exists(alt) else exe
    kw = {'creationflags': 0x08000000} if WIN else {}      # CREATE_NO_WINDOW – bez migającego okienka
    p = await asyncio.create_subprocess_exec(exe, USAGE, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.DEVNULL, **kw)
    out, _ = await asyncio.wait_for(p.communicate(), 40)
    json.loads(out)                                        # tylko poprawny JSON trafia do telefonu
    usage_cache.update(t=time.time(), body=out)
    return out


class Proto(websockets.WebSocketServerProtocol):
    async def process_request(self, path, headers):
        u = urllib.parse.urlparse(path)
        q = urllib.parse.parse_qs(u.query)
        if u.path == '/term':
            return None                                    # rozmowa WebSocket (kod sprawdzany w handlerze)
        ip = (self.remote_address or ('',))[0]
        if u.path not in ('/api/ping', '/api/usage', '/api/sessions'):
            return (http.HTTPStatus(404), HDR, b'{"error":"nie-ma-takiej-strony"}')
        err = check(ip, q.get('token', [''])[0])
        if err:
            return (http.HTTPStatus(403), HDR, json.dumps({'error': err}).encode())
        if u.path == '/api/sessions':
            return (http.HTTPStatus(200), HDR, json.dumps({n: {'clients': len(x.clients)} for n, x in SESSIONS.items()}).encode())
        if u.path == '/api/ping':
            try:
                user = getpass.getuser()
            except Exception:
                user = ''
            return (http.HTTPStatus(200), HDR, json.dumps({'ok': True, 'host': platform.node(), 'user': user,
                                                            'os': 'windows' if WIN else 'linux', 'addrs': my_addrs()}).encode())
        try:
            return (http.HTTPStatus(200), HDR, await get_usage())
        except Exception as e:
            return (http.HTTPStatus(500), HDR, json.dumps({'error': f'usage: {e}'[:200]}).encode())


# ---------- wspólne sesje terminala ----------
def claude_dir():
    """Folder rozmów Claude Code z telefonu (plik claude-dir w ustawieniach, domyślnie ~/claude-telefon)."""
    try:
        with open(os.path.join(CFG, 'claude-dir')) as f:
            d = f.read().strip()
    except FileNotFoundError:
        d = ''
    d = os.path.expanduser(d) if d else os.path.join(HOME, 'claude-telefon')
    os.makedirs(d, exist_ok=True)
    return d


NO_CLAUDE = 'Na tym komputerze nie ma Claude Code. Zainstaluj go: https://claude.com/claude-code – na razie masz zwykły terminal.'


def session_cmd(name):
    """(polecenie, folder startowy) dla sesji."""
    if WIN:
        if name == 'claude':
            if shutil.which('claude'):
                # --continue wznawia ostatnią rozmowę z folderu, a gdy jej nie ma – nowa
                return 'cmd.exe /d /c "claude --continue || claude"', claude_dir()
            return f'powershell.exe -NoLogo -NoExit -Command "Write-Host \'{NO_CLAUDE}\'"', HOME
        return 'powershell.exe -NoLogo', HOME
    if name == 'claude':
        return ['bash', '-lc', 'if command -v claude >/dev/null; then claude --continue || exec claude; '
                               f'else printf "\\n  {NO_CLAUDE}\\n\\n"; exec bash -l; fi'], claude_dir()
    return ['bash', '-l'], HOME


SESSION_NAMES = ('claude', 'shell')
SCROLLBACK = 200_000                                       # znaków pamiętanych dla nowo podłączonych


def child_env():
    env = dict(os.environ, TERM='xterm-256color', COLORTERM='truecolor')
    if not WIN:
        env['PATH'] = f'{HOME}/.local/bin:' + env.get('PATH', '/usr/bin:/bin')
    return env


class Session:
    def __init__(self, name, cols, rows):
        self.name, self.clients, self.buf = name, set(), ''
        self.cols, self.rows = max(20, min(400, cols)), max(5, min(200, rows))
        self.dec = codecs.getincrementaldecoder('utf-8')(errors='replace')
        self.loop = asyncio.get_running_loop()
        self.done = False
        cmd, cwd = session_cmd(name)
        if WIN:
            self.pty = ConPty(cmd, cwd, child_env(), self.cols, self.rows,
                              on_data=lambda b: self.loop.call_soon_threadsafe(self.feed, b),
                              on_exit=lambda: self.loop.call_soon_threadsafe(self.close, 'koniec-sesji'))
        else:
            self.pid, self.fd = pty.fork()
            if self.pid == 0:
                try:
                    os.chdir(cwd)
                except OSError:
                    os.chdir(HOME)
                os.execvpe(cmd[0], cmd, child_env())
            self.resize(self.cols, self.rows)
            self.loop.add_reader(self.fd, self.readable)

    def resize(self, cols, rows):
        self.cols, self.rows = max(20, min(400, cols)), max(5, min(200, rows))
        if WIN:
            self.pty.resize(self.cols, self.rows)
            return
        try:
            fcntl.ioctl(self.fd, termios.TIOCSWINSZ, struct.pack('HHHH', self.rows, self.cols, 0, 0))
        except OSError:
            pass

    def redraw(self):
        """Wymusza przerysowanie programu (np. Claude Code) po podłączeniu nowego ekranu."""
        self.resize(self.cols, self.rows - 1)
        self.loop.call_later(0.15, self.resize, self.cols, self.rows + 1)

    def readable(self):
        try:
            data = os.read(self.fd, 65536)
        except OSError:
            data = b''
        if not data:
            self.close('koniec-sesji')
            return
        self.feed(data)

    def feed(self, data):
        text = self.dec.decode(data)
        if not text:
            return
        self.buf = (self.buf + text)[-SCROLLBACK:]
        for c in list(self.clients):
            asyncio.ensure_future(self.safe_send(c, text))

    async def safe_send(self, c, text):
        try:
            await c.send(text)
        except Exception:
            self.clients.discard(c)

    def write(self, text):
        data = text.encode()
        if WIN:
            self.pty.write(data)
            return
        try:
            os.write(self.fd, data)
        except OSError:
            pass

    def close(self, why):
        if self.done:
            return
        self.done = True
        if SESSIONS.get(self.name) is self:
            SESSIONS.pop(self.name, None)
        for c in list(self.clients):
            asyncio.ensure_future(c.close(1000, why))
        if WIN:
            self.pty.close()
            return
        try:
            self.loop.remove_reader(self.fd)
        except Exception:
            pass
        try:
            os.close(self.fd)
        except OSError:
            pass
        asyncio.ensure_future(reap(self.pid))


SESSIONS = {}


async def term(ws, path=None):
    q = urllib.parse.parse_qs(urllib.parse.urlparse(ws.path).query)
    err = check(ws.remote_address[0], q.get('token', [''])[0])
    if err:
        await ws.close(4001, err)
        return
    name = q.get('session', ['shell'])[0]
    if name not in SESSION_NAMES:
        name = 'shell'
    cols = int(q.get('cols', ['80'])[0] or 80)
    rows = int(q.get('rows', ['24'])[0] or 24)
    s = SESSIONS.get(name)
    if s is None:
        try:
            s = SESSIONS[name] = Session(name, cols, rows)
        except Exception as e:
            await ws.close(1011, f'nie-udalo-sie-uruchomic: {e}'[:120])
            return
    else:
        if s.buf:
            await ws.send('\x1b[2J\x1b[H' + s.buf[-60_000:])   # ostatni stan ekranu
        s.resize(cols, rows)
        s.redraw()
    s.clients.add(ws)
    try:
        async for msg in ws:
            try:
                m = json.loads(msg)
            except Exception:
                continue
            if m.get('t') == 'in':
                s.write(str(m.get('d', '')))
            elif m.get('t') == 'rs':
                s.resize(int(m.get('c', 80)), int(m.get('r', 24)))
    except websockets.ConnectionClosed:
        pass
    finally:
        s.clients.discard(ws)                              # sesja zostaje – Claude Code działa dalej


async def reap(pid):
    """Sprzątanie po zakończonej powłoce (Linux): czekamy na koniec, w razie czego dobijamy."""
    try:
        os.killpg(os.getpgid(pid), signal.SIGHUP)
    except Exception:
        pass
    for i in range(30):
        try:
            done, _ = os.waitpid(pid, os.WNOHANG)
        except ChildProcessError:
            return
        if done:
            return
        if i == 20:
            try:
                os.killpg(os.getpgid(pid), signal.SIGKILL)
            except Exception:
                pass
        await asyncio.sleep(0.1)


async def main():
    async with websockets.serve(term, '0.0.0.0', PORT, create_protocol=Proto, max_size=2**20, ping_interval=20):
        await asyncio.Future()


if __name__ == '__main__':
    if WIN and sys.stdout is None:                         # pythonw: brak konsoli – błędy do pliku
        sys.stdout = sys.stderr = open(os.path.join(CFG, 'server.log'), 'a', encoding='utf-8', buffering=1)
    logging.basicConfig(level=logging.WARNING, format='%(asctime)s %(levelname)s %(name)s: %(message)s')
    asyncio.run(main())
