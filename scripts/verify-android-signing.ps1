$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$android = Join-Path $root 'apps\mobile\android'
$keystoreProps = Join-Path $android 'keystore.properties'
$keystore = Join-Path $android 'app\tayralsaad-upload.jks'
$rootKeystore = Join-Path $root 'app\tayralsaad-upload.jks'

Write-Host 'Android signing verification' -ForegroundColor Cyan
Write-Host "keystore.properties: $(if (Test-Path $keystoreProps) { 'OK' } else { 'MISSING' })"
Write-Host "keystore (android/app): $(if (Test-Path $keystore) { 'OK' } else { 'MISSING' })"
Write-Host "keystore (repo app/): $(if (Test-Path $rootKeystore) { 'OK' } else { 'MISSING' })"

if (Test-Path $keystoreProps) {
  Write-Host ''
  Write-Host 'keystore.properties:' -ForegroundColor Cyan
  Get-Content $keystoreProps | ForEach-Object {
    if ($_ -match 'Password') { ($_ -split '=')[0] + '=***' } else { $_ }
  }
}

if (-not (Test-Path $keystore)) { exit 1 }
