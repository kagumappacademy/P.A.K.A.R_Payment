param([int]$Port = 3000, [string]$MySqlDirectory = 'C:\xampp\mysql')
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
if (-not (Test-Path -LiteralPath '.env.local')) { throw 'Salin .env.example kepada .env.local dan lengkapkan konfigurasi MySQL dahulu.' }
if (-not (Test-Path -LiteralPath 'node_modules')) { & npm.cmd install; if ($LASTEXITCODE -ne 0) { throw 'Pemasangan dependency gagal.' } }
$localData = Join-Path $PSScriptRoot '.local\mysql-data'
$localListener = Get-NetTCPConnection -LocalPort 3307 -State Listen -ErrorAction SilentlyContinue
if ((Test-Path -LiteralPath $localData) -and -not $localListener) {
  $server = Join-Path $MySqlDirectory 'bin\mysqld.exe'
  if (-not (Test-Path -LiteralPath $server)) { throw 'Lokasi MySQL tidak ditemui. Gunakan parameter -MySqlDirectory.' }
  Start-Process -FilePath $server -ArgumentList @('--no-defaults', ('--basedir="' + $MySqlDirectory + '"'), ('--datadir="' + $localData + '"'), '--port=3307', '--bind-address=127.0.0.1', '--max-allowed-packet=16M', '--character-set-server=utf8mb4', '--collation-server=utf8mb4_unicode_ci') -WindowStyle Hidden
  $ready = $false
  for ($attempt = 0; $attempt -lt 30; $attempt++) {
    if (Get-NetTCPConnection -LocalPort 3307 -State Listen -ErrorAction SilentlyContinue) { $ready = $true; break }
    Start-Sleep -Milliseconds 500
  }
  if (-not $ready) { throw 'MySQL belum bersedia. Semak log di .local\mysql-data.' }
}
& npm.cmd run db:setup
if ($LASTEXITCODE -ne 0) { throw 'Sambungan database gagal. Semak .env.local.' }
Write-Host "Website: http://localhost:$Port" -ForegroundColor Cyan
Write-Host "Admin: http://localhost:$Port/admin | Log masuk: .local-admin.txt" -ForegroundColor Cyan
& npm.cmd run dev -- --port $Port
