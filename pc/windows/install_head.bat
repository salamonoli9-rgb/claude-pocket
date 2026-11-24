<# : Claude Pocket - instalator na Windows (czesc dla cmd.exe)
@echo off
chcp 65001 >nul
powershell -NoProfile -ExecutionPolicy Bypass -Command "$env:CP_SELF='%~f0'; $env:CP_ARG='%~1'; iex ([IO.File]::ReadAllText('%~f0', [Text.Encoding]::UTF8))"
echo.
pause
exit /b
#>
# ============================================================================
#  Claude Pocket – program na komputer (Windows 10 1809+ / Windows 11)
#  Łączy aplikację Claude Pocket na telefonie z tym komputerem:
#  limity Claude, Claude Code i terminal (PowerShell) w telefonie.
#
#  Instalacja:      dwuklik na claude-pocket-windows.bat
#  Pokaż kod:       Start → „Claude Pocket – kod”
#  Odinstalowanie:  claude-pocket-windows.bat odinstaluj
#
#  Wszystko trafia do Twojego profilu, bez uprawnień administratora:
#    %LOCALAPPDATA%\ClaudePocket   program
#    %APPDATA%\ClaudePocket        kod parowania
# ============================================================================
$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [Text.Encoding]::UTF8 } catch {}
$APP = Join-Path $env:LOCALAPPDATA 'ClaudePocket'
$CFG = Join-Path $env:APPDATA 'ClaudePocket'
$STARTUP = [Environment]::GetFolderPath('Startup')
$MENU = Join-Path ([Environment]::GetFolderPath('Programs')) 'Claude Pocket'
function Say($t) { Write-Host "✦ $t" -ForegroundColor DarkYellow }
function Die($t) { Write-Host "✗ $t" -ForegroundColor Red; exit 1 }
function Stop-Pocket {
  Get-CimInstance Win32_Process -Filter "Name like 'python%'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -like '*ClaudePocket*server.py*' } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
}

if ($env:CP_ARG -eq 'odinstaluj' -or $env:CP_ARG -eq '--odinstaluj') {
  Stop-Pocket
  Remove-Item -Recurse -Force $APP, $MENU -ErrorAction SilentlyContinue
  Remove-Item -Force (Join-Path $STARTUP 'Claude Pocket.lnk') -ErrorAction SilentlyContinue
  Say "Odinstalowane. Kod parowania został w $CFG (usuń ręcznie, jeśli chcesz)."
  exit 0
}

if ([Environment]::OSVersion.Version.Build -lt 17763) { Die 'Potrzebny Windows 10 w wersji 1809 lub nowszej (albo Windows 11).' }

# --- Python 3.8+ ---
function Find-Python {
  $cands = @()
  foreach ($c in @('py', 'python', 'python3')) {
    $cmd = Get-Command $c -ErrorAction SilentlyContinue
    if ($cmd -and $cmd.Source -notlike '*WindowsApps*') { $cands += $cmd.Source }   # pomijamy skrót do Microsoft Store
  }
  $cands += Get-ChildItem "$env:LOCALAPPDATA\Programs\Python\Python3*\python.exe", "$env:ProgramFiles\Python3*\python.exe" -ErrorAction SilentlyContinue |
    Sort-Object FullName -Descending | ForEach-Object FullName
  foreach ($p in $cands) {
    try {
      $exe = & $p -c "import sys; print(sys.executable if sys.version_info >= (3, 8) else '')" 2>$null
      if ($exe -and (Test-Path $exe)) { return $exe.Trim() }
    } catch {}
  }
  return $null
}
$py = Find-Python
if (-not $py) {
  Write-Host ''
  Write-Host 'Do działania potrzebny jest Python 3 (darmowy, z python.org).'
  if (Get-Command winget -ErrorAction SilentlyContinue) {
    $a = Read-Host 'Zainstalować go teraz przez winget? [T/n]'
    if ($a -eq '' -or $a -match '^[tTyY]') {
      winget install -e --id Python.Python.3.12 --scope user --accept-package-agreements --accept-source-agreements
      $py = Find-Python
    }
  }
  if (-not $py) { Die 'Zainstaluj Pythona z https://www.python.org/downloads/ (zaznacz „Add python.exe to PATH”) i uruchom instalator jeszcze raz.' }
}
$pyw = Join-Path (Split-Path $py) 'pythonw.exe'
if (-not (Test-Path $pyw)) { $pyw = $py }
Say "Python: $py"

# --- port 8765 zajęty przez coś innego? ---
Stop-Pocket
Start-Sleep -Milliseconds 400
$busy = $false
try { $t = New-Object Net.Sockets.TcpClient; $t.Connect('127.0.0.1', 8765); $busy = $true; $t.Close() } catch {}
if ($busy) { Die 'Port 8765 jest zajęty przez inny program. Przerywam.' }

# --- rozpakowanie programu ---
Say "Instaluję Claude Pocket do $APP"
Remove-Item -Recurse -Force $APP -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $APP, $CFG, $MENU | Out-Null
$self = [IO.File]::ReadAllText($env:CP_SELF, [Text.Encoding]::UTF8)
$m1 = '<#__PAY' + 'LOAD__'; $m2 = '__EN' + 'D__'          # sklejane, żeby nie trafić na samą tę linijkę
$i1 = $self.LastIndexOf($m1); $i2 = $self.LastIndexOf($m2)
if ($i1 -lt 0 -or $i2 -le $i1) { Die 'Plik instalatora jest uszkodzony – pobierz go jeszcze raz.' }
$b64 = $self.Substring($i1 + $m1.Length, $i2 - $i1 - $m1.Length) -replace '[^A-Za-z0-9+/=]', ''
$zip = Join-Path $env:TEMP "claude-pocket-$PID.zip"
[IO.File]::WriteAllBytes($zip, [Convert]::FromBase64String($b64))
Expand-Archive -Path $zip -DestinationPath $APP -Force
Remove-Item $zip -Force

# --- start razem z Windowsem + skróty w menu Start ---
$sh = New-Object -ComObject WScript.Shell
function Link($path, $target, $arg, $desc) {
  $l = $sh.CreateShortcut($path); $l.TargetPath = $target; $l.Arguments = $arg
  $l.WorkingDirectory = $APP; $l.Description = $desc; $l.Save()
}
Link (Join-Path $STARTUP 'Claude Pocket.lnk') $pyw "`"$APP\server.py`"" 'Claude Pocket – most do telefonu'
Link (Join-Path $MENU 'Claude Pocket – kod.lnk') 'powershell.exe' "-NoProfile -ExecutionPolicy Bypass -File `"$APP\kod.ps1`"" 'Adres i kod parowania dla telefonu'
Link (Join-Path $MENU 'Claude Pocket – nowy kod.lnk') 'powershell.exe' "-NoProfile -ExecutionPolicy Bypass -File `"$APP\kod.ps1`" nowy" 'Nowy kod (odcina stary)'
Say 'Startuje sam po zalogowaniu do Windowsa.'

# --- uruchomienie teraz ---
Start-Process -FilePath $pyw -ArgumentList "`"$APP\server.py`"" -WorkingDirectory $APP -WindowStyle Hidden
$tok = Join-Path $CFG 'token'
for ($i = 0; $i -lt 40 -and -not (Test-Path $tok); $i++) { Start-Sleep -Milliseconds 250 }
Start-Sleep -Milliseconds 800
$ok = $false
try { $t = New-Object Net.Sockets.TcpClient; $t.Connect('127.0.0.1', 8765); $ok = $true; $t.Close() } catch {}
if (-not $ok) { Die "Program nie wystartował. Szczegóły: $CFG\server.log" }

Write-Host ''
Write-Host '! Jeśli Windows zapyta o zaporę dla „Python” – zaznacz „Sieci prywatne” i kliknij „Zezwalaj”.' -ForegroundColor Yellow
Write-Host '  Bez tego telefon nie połączy się z komputerem.' -ForegroundColor Yellow
if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
  Write-Host ''
  Write-Host '! Nie widzę Claude Code. Terminal w telefonie zadziała, ale zakładka ✦ Claude Code i limity' -ForegroundColor Yellow
  Write-Host '  potrzebują zainstalowanego i zalogowanego Claude Code (https://claude.com/claude-code).' -ForegroundColor Yellow
}
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$APP\kod.ps1"
exit 0
<#__PAYLOAD__
