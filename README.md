# Claude Pocket

Aplikacja na Androida, która łączy telefon z Twoim komputerem:

- **Limity Claude** – 5‑godzinny i tygodniowy, z odliczaniem do resetu, plus „kwadraciki” zużycia dzień po dniu.
- **Claude Code w telefonie** – ta sama sesja, co na komputerze (piszesz na telefonie, widzisz na PC i odwrotnie).
- **Terminal** – zwykły bash (Linux) albo PowerShell (Windows), z paskiem klawiszy, przewijaniem palcem i polem do pisania.
- **Zwierzak** – pięć postaci (duszek, robot, kryształek, lisek, kotek), każda z własnym charakterem, tekstami
  i ulubionym jedzeniem. Można go karmić, głaskać, przesuwać i usypiać. Mieszka w urządzonym pokoju (łóżko, lampa,
  komputer, piłka, okno z dniem i nocą, zegar z prawdziwą godziną) – meble można dotykać, a śpiący zwierzak kładzie się do łóżka.
- **9 języków** – polski, angielski, niemiecki, hiszpański, francuski, włoski, portugalski, ukraiński, rosyjski;
  wybór przy pierwszym uruchomieniu, zmiana w Ustawieniach (`android/assets/i18n.js`).

> Nieoficjalny projekt hobbystyczny – nie jest związany z Anthropic. Wszystkie postacie i grafiki są własne.

## Jak to działa

```
telefon (aplikacja)  ──Wi‑Fi / Tailscale──►  komputer (program Claude Pocket, port 8765)
                                              ├─ limity: login Claude Code z tego komputera
                                              └─ terminal: pty (Linux) / ConPTY (Windows)
```

Program na komputerze wpuszcza **tylko** urządzenia z sieci domowej albo z Twojego Tailscale, i tylko z **kodem
parowania** (po 10 błędnych kodach – blokada na 5 minut). Kod daje pełny dostęp do terminala, więc nie dawaj go obcym.

## Program na komputer

| System | Instalator | Działa na |
|---|---|---|
| **Linux** | `bash claude-pocket-pc.sh` | Linux Mint i Ubuntu (sprawdzone), Debian, Pop!_OS, Fedora, Arch, Manjaro, openSUSE… – wystarczy bash i Python 3.8+ |
| **Windows** | dwuklik `claude-pocket-windows.bat` | Windows 10 (1809+) i 11; brakującego Pythona proponuje doinstalować przez winget |

Oba instalatory są też w aplikacji (ekran parowania → „Jaki masz komputer?” → Zapisz instalator).
Na końcu wypisują **adres** komputera i **kod** do wpisania w telefonie.

- Linux: kod pokaże `claude-pocket-kod`, nowy kod `claude-pocket-kod --nowy`, odinstalowanie `bash claude-pocket-pc.sh --odinstaluj`.
- Windows: menu Start → „Claude Pocket – kod” / „Claude Pocket – nowy kod”, odinstalowanie `claude-pocket-windows.bat odinstaluj`.
- Wspólny terminal na Linuksie (ten sam co w telefonie): `claude-pocket-term` albo `claude-pocket-term shell`.

Wszystko instaluje się w katalogu użytkownika, bez sudo / administratora. Biblioteka `websockets` jest w zestawie.

## Budowanie

```bash
python3 tools/skins.py      # postacie   → android/assets/skins.js
python3 tools/foods.py      # jedzenie   → android/assets/foods.js
bash android/build.sh       # instalatory PC + APK → android/out/ClaudePocket.apk
```

Potrzebne: Android SDK (build-tools + platforms), JDK 17+, Python 3, `zip`. Bez Gradle.
Klucz podpisu tworzy się przy pierwszym buildzie w `~/.config/claude-pocket/` – **trzymaj go poza repozytorium**
(jest w `.gitignore`), bo aktualizacje aplikacji muszą być podpisane tym samym kluczem.

## Struktura

```
android/            aplikacja (WebView): AndroidManifest, MainActivity.java, ikony
  assets/           index.html, app.js, app.css, i18n.js (języki), skins.js, foods.js,
                    lines.js / lines_en.js (teksty zwierzaka), xterm.js, pc/ (instalatory)
pc/
  common/           server.py (Linux + Windows), usage.py (limity), conpty.py (terminal Windows)
  linux/            instalator .sh, claude-pocket-kod, claude-pocket-term
  windows/          instalator .bat (PowerShell), kod.ps1
  vendor/           websockets 10.4 (BSD)
  build_installers.py
tools/              generatory grafik: skins.py, foods.py
```

## Licencja

**MIT** – zobacz [LICENSE](LICENSE). Możesz używać, kopiować, zmieniać i rozpowszechniać ten kod (także w swoich
projektach), pod warunkiem że zostawisz informację o autorze i treść licencji – czyli napiszesz, czyj to kod
i że go użyłeś.

Licencje zewnętrzne (dołączone pliki zachowują swoje licencje):

- [xterm.js](https://github.com/xtermjs/xterm.js) – MIT
- [websockets](https://github.com/python-websockets/websockets) – BSD‑3‑Clause

---

## English

**Claude Pocket** is an Android app that connects your phone to your own computer: Claude usage limits (5‑hour and
weekly, with a daily heat map), the same Claude Code session as on the computer, a plain terminal (bash / PowerShell)
and a little pet with its own furnished room. The interface is available in 9 languages.

The computer side is a small Python program (Linux: `bash claude-pocket-pc.sh`, Windows 10/11: double‑click
`claude-pocket-windows.bat`) that only accepts devices from the home network or your Tailscale, and only with the
pairing code. Build with `bash android/build.sh` (Android SDK, JDK 17+, Python 3 – no Gradle).

Unofficial hobby project, not affiliated with Anthropic. Licensed under the **MIT License** – you may use, copy and
modify the code as long as you keep the copyright notice (credit the author).
