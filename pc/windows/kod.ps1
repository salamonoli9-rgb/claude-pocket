# Claude Pocket – adres komputera i kod parowania dla aplikacji na telefonie.
#   kod.ps1         pokaż adres i kod
#   kod.ps1 nowy    nowy kod (stary przestaje działać – np. żeby komuś odciąć dostęp)
param([string]$cmd = '')
try { [Console]::OutputEncoding = [Text.Encoding]::UTF8 } catch {}
$APP = Join-Path $env:LOCALAPPDATA 'ClaudePocket'
$CFG = Join-Path $env:APPDATA 'ClaudePocket'
$tok = Join-Path $CFG 'token'
if ($cmd -eq 'nowy') {
  Get-CimInstance Win32_Process -Filter "Name like 'python%'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -like '*ClaudePocket*server.py*' } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
  Remove-Item $tok -Force -ErrorAction SilentlyContinue
  $lnk = (New-Object -ComObject WScript.Shell).CreateShortcut((Join-Path ([Environment]::GetFolderPath('Startup')) 'Claude Pocket.lnk'))
  Start-Process -FilePath $lnk.TargetPath -ArgumentList $lnk.Arguments -WorkingDirectory $APP -WindowStyle Hidden
  for ($i = 0; $i -lt 40 -and -not (Test-Path $tok); $i++) { Start-Sleep -Milliseconds 250 }
  Write-Host 'Nowy kod wygenerowany – stary już nie działa.'
}
if (-not (Test-Path $tok)) { Write-Host 'Claude Pocket jeszcze nie działa (brak kodu). Uruchom instalator ponownie.'; Read-Host 'Enter, żeby zamknąć'; exit 1 }
Write-Host ''
Write-Host '  ✦ Claude Pocket – dane do aplikacji na telefonie' -ForegroundColor DarkYellow
Write-Host ''
$ips = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
  Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' } | ForEach-Object IPAddress
$first = $true
foreach ($ip in $ips) {
  $o = $ip.Split('.') | ForEach-Object { [int]$_ }
  if ($o[0] -eq 100 -and $o[1] -ge 64 -and $o[1] -le 127) { Write-Host "  Adres (Tailscale, poza domem): $ip`:8765" }
  elseif ($o[0] -eq 10 -or ($o[0] -eq 172 -and $o[1] -ge 16 -and $o[1] -le 31) -or ($o[0] -eq 192 -and $o[1] -eq 168)) {
    if ($first) { Write-Host "  Adres komputera:   $ip`:8765" -ForegroundColor White; $first = $false } else { Write-Host "  Inny adres:        $ip`:8765" }
  }
}
if ($first) { Write-Host '  Adres komputera:   nie znalazłem adresu w sieci domowej – podłącz komputer do Wi‑Fi/kabla' }
Write-Host "  Kod parowania:     $((Get-Content $tok -Raw).Trim())" -ForegroundColor DarkYellow
Write-Host ''
Write-Host '  Telefon musi być w tym samym Wi‑Fi. Kodu nie podawaj obcym – daje dostęp do terminala.' -ForegroundColor DarkGray
Write-Host '  Nowy kod (odcina stary): Start → „Claude Pocket – nowy kod”' -ForegroundColor DarkGray
Write-Host ''
if ($Host.Name -eq 'ConsoleHost' -and -not $env:CP_SELF) { Read-Host 'Enter, żeby zamknąć' | Out-Null }
