param([int]$Port = 3000)
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
if (-not (Test-Path -LiteralPath '.env.local')) { throw 'Salin .env.example kepada .env.local dan lengkapkan konfigurasi Turso dahulu.' }
if (-not (Test-Path -LiteralPath 'node_modules')) { & npm.cmd install; if ($LASTEXITCODE -ne 0) { throw 'Pemasangan dependency gagal.' } }
if (-not (Test-Path -LiteralPath '.local')) { New-Item -ItemType Directory -Path '.local' | Out-Null }
& npm.cmd run db:setup
if ($LASTEXITCODE -ne 0) { throw 'Sambungan database gagal. Semak .env.local.' }
Write-Host "Website: http://localhost:$Port" -ForegroundColor Cyan
Write-Host "Admin: http://localhost:$Port/admin | Log masuk: .local-admin.txt" -ForegroundColor Cyan
& npm.cmd run dev -- --port $Port
