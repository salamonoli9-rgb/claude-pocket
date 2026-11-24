#!/usr/bin/env bash
# ============================================================================
#  Claude Pocket – program na komputer (Linux)
#  Działa na: Linux Mint, Ubuntu, Debian, Pop!_OS, Fedora, Arch / Manjaro, openSUSE i podobnych –
#  wystarczy bash i Python 3.8+ (jest prawie wszędzie). Windows: claude-pocket-windows.bat
#  Łączy aplikację Claude Pocket na telefonie z tym komputerem:
#  limity Claude, Claude Code i terminal w telefonie.
#
#  Instalacja:      bash claude-pocket-pc.sh
#  Pokaż kod:       claude-pocket-kod
#  Odinstalowanie:  bash claude-pocket-pc.sh --odinstaluj
#
#  Wszystko trafia do Twojego katalogu domowego, bez sudo:
#    ~/.local/share/claude-pocket   program
#    ~/.config/claude-pocket        kod parowania
#    ~/.local/bin                   claude-pocket-kod, claude-pocket-term
# ============================================================================
set -euo pipefail
APP="$HOME/.local/share/claude-pocket"; CFG="$HOME/.config/claude-pocket"; BIN="$HOME/.local/bin"
UNIT="$HOME/.config/systemd/user/claude-pocket.service"; AUTO="$HOME/.config/autostart/claude-pocket.desktop"
O=$'\e[38;2;217;119;87m'; B=$'\e[1m'; R=$'\e[0m'; RED=$'\e[31m'
say() { echo "${O}✦${R} $*"; }
die() { echo "${RED}✗ $*${R}" >&2; exit 1; }
has_systemd() { systemctl --user show-environment >/dev/null 2>&1; }

if [ "${1:-}" = "--odinstaluj" ] || [ "${1:-}" = "--uninstall" ]; then
  has_systemd && systemctl --user disable --now claude-pocket 2>/dev/null || true
  pkill -f "[c]laude-pocket/server.py" 2>/dev/null || true
  rm -rf "$APP" "$UNIT" "$AUTO" "$BIN/claude-pocket-kod" "$BIN/claude-pocket-term"
  has_systemd && systemctl --user daemon-reload || true
  say "Odinstalowane. Kod parowania zostawiłem w $CFG (usuń ręcznie, jeśli chcesz)."
  exit 0
fi

[ "$(uname -s)" = Linux ] || die "To instalator dla Linuksa. Na Windowsa jest claude-pocket-windows.bat."
command -v python3 >/dev/null || die "Brak python3. Zainstaluj go (np. sudo apt install python3) i uruchom instalator ponownie."
python3 -c 'import sys; sys.exit(0 if sys.version_info >= (3, 8) else 1)' || die "Potrzebny Python 3.8 lub nowszy."
python3 -c 'import pty, termios' 2>/dev/null || die "Ten Python nie ma modułów terminala (pty)."

# port 8765 zajęty przez coś innego niż my?
if (exec 3<>/dev/tcp/127.0.0.1/8765) 2>/dev/null; then
  if ! pgrep -f "[c]laude-pocket/server.py" >/dev/null; then
    die "Port 8765 jest już zajęty przez inny program (może Claude Pocket jest tu już ustawiony inaczej?). Przerywam."
  fi
fi

say "Instaluję Claude Pocket do $APP"
has_systemd && systemctl --user stop claude-pocket 2>/dev/null || true
pkill -f "[c]laude-pocket/server.py" 2>/dev/null || true
rm -rf "$APP"; mkdir -p "$APP" "$BIN" "$CFG"; chmod 700 "$CFG"
sed '1,/^__PAYLOAD__$/d' "$0" | base64 -d | tar xz -C "$APP"
install -m 755 "$APP/claude-pocket-kod" "$BIN/claude-pocket-kod"
install -m 755 "$APP/claude-pocket-term" "$BIN/claude-pocket-term"

if has_systemd; then
  mkdir -p "$(dirname "$UNIT")"
  cat > "$UNIT" <<UNITEOF
[Unit]
Description=Claude Pocket – most telefon <-> komputer (tylko sieć domowa i Tailscale)
After=network-online.target

[Service]
ExecStart=/usr/bin/env python3 $APP/server.py
Restart=on-failure
RestartSec=3

[Install]
WantedBy=default.target
UNITEOF
  systemctl --user daemon-reload
  systemctl --user enable --now claude-pocket >/dev/null 2>&1
  say "Działa w tle i startuje sam po zalogowaniu (usługa claude-pocket)."
else
  mkdir -p "$(dirname "$AUTO")"
  printf '[Desktop Entry]\nType=Application\nName=Claude Pocket\nExec=python3 %s/server.py\nNoDisplay=true\nX-GNOME-Autostart-enabled=true\n' "$APP" > "$AUTO"
  nohup python3 "$APP/server.py" >/dev/null 2>&1 &
  say "Działa w tle i startuje sam po zalogowaniu (autostart)."
fi

for i in $(seq 40); do [ -s "$CFG/token" ] && break; sleep 0.25; done
sleep 0.5
(exec 3<>/dev/tcp/127.0.0.1/8765) 2>/dev/null || die "Program nie wystartował. Sprawdź: journalctl --user -u claude-pocket"

if [ -f /etc/ufw/ufw.conf ] && grep -q '^ENABLED=yes' /etc/ufw/ufw.conf; then
  echo
  echo "${O}!${R} Masz włączoną zaporę (ufw). Wpuść telefon z sieci domowej jedną komendą:"
  echo "    ${B}sudo ufw allow from 192.168.0.0/16 to any port 8765 proto tcp${R}"
fi
if ! command -v claude >/dev/null && [ ! -x "$HOME/.local/bin/claude" ]; then
  echo
  echo "${O}!${R} Nie widzę Claude Code. Terminal w telefonie zadziała, ale zakładka ✦ Claude Code i limity"
  echo "  potrzebują zainstalowanego i zalogowanego Claude Code (https://claude.com/claude-code)."
fi
case ":$PATH:" in *":$BIN:"*) ;; *) echo; echo "${O}!${R} Dodaj $BIN do PATH, żeby działało polecenie claude-pocket-kod (albo uruchamiaj $BIN/claude-pocket-kod).";; esac

"$BIN/claude-pocket-kod"
exit 0
__PAYLOAD__
