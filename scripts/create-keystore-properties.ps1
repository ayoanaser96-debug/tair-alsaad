# Creates apps/mobile/android/keystore.properties (gitignored) for release signing.
# Run from repo root: powershell -File scripts/create-keystore-properties.ps1

$ErrorActionPreference = 'Stop'
$dest = Join-Path $PSScriptRoot '..\apps\mobile\android\keystore.properties'
$example = Join-Path $PSScriptRoot '..\apps\mobile\android\keystore.properties.example'

if (Test-Path $dest) {
  Write-Host "Already exists: $dest" -ForegroundColor Yellow
  $overwrite = Read-Host 'Overwrite? (y/N)'
  if ($overwrite -notmatch '^y') { exit 0 }
}

$storePassword = Read-Host 'Upload keystore store password'
$keyPassword = Read-Host 'Upload key password (often same as store password)'

$content = @"
storeFile=tayralsaad-upload.jks
keyAlias=upload
storePassword=$storePassword
keyPassword=$keyPassword
"@

Set-Content -Path $dest -Value $content -Encoding UTF8 -NoNewline
Write-Host "Written: $dest" -ForegroundColor Green
Write-Host 'Verify with: powershell -File scripts/verify-android-signing.ps1'
