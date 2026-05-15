# ScamShield — Generate and set production secrets for this PowerShell session
# Run this ONCE before deploy.ps1. Secrets exist only in memory — never written to disk.

Write-Host "Generating production secrets..." -ForegroundColor Cyan

$env:PHONE_HMAC_SECRET = node -e "process.stdout.write(require('crypto').randomBytes(32).toString('hex'))"
$env:JWT_SECRET        = node -e "process.stdout.write(require('crypto').randomBytes(32).toString('hex'))"
$env:RISK_TOKEN_SECRET = node -e "process.stdout.write(require('crypto').randomBytes(64).toString('hex'))"

Write-Host "Secrets generated and set in this session:" -ForegroundColor Green
Write-Host "  PHONE_HMAC_SECRET = $($env:PHONE_HMAC_SECRET.Substring(0,8))..." -ForegroundColor Gray
Write-Host "  JWT_SECRET        = $($env:JWT_SECRET.Substring(0,8))..." -ForegroundColor Gray
Write-Host "  RISK_TOKEN_SECRET = $($env:RISK_TOKEN_SECRET.Substring(0,8))..." -ForegroundColor Gray

Write-Host "`nNow set your Railway token:" -ForegroundColor Yellow
Write-Host '  $env:RAILWAY_TOKEN = "paste_token_from_railway_dashboard"' -ForegroundColor White
Write-Host "`nThen run: .\deploy.ps1" -ForegroundColor Cyan
