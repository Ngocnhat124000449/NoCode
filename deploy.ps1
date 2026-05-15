# ScamShield — Railway Deploy Script
# Usage:
#   1. Set all required env vars (see below)
#   2. Run: .\deploy.ps1
#
# Required env vars to set before running:
#   $env:RAILWAY_TOKEN       = "get from railway.app/account/tokens"
#   $env:PHONE_HMAC_SECRET   = (node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
#   $env:JWT_SECRET          = (node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
#   $env:RISK_TOKEN_SECRET   = (node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

$required = @("RAILWAY_TOKEN", "PHONE_HMAC_SECRET", "JWT_SECRET", "RISK_TOKEN_SECRET")
$missing  = $required | Where-Object { -not (Get-Item "env:$_" -ErrorAction SilentlyContinue) }

if ($missing) {
    Write-Host "ERROR: Missing required environment variables:" -ForegroundColor Red
    $missing | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
    Write-Host "`nRun setup-secrets.ps1 first to generate and set them." -ForegroundColor Cyan
    exit 1
}

Write-Host "=== ScamShield Railway Deploy ===" -ForegroundColor Cyan

Write-Host "`n[1/5] Initializing Railway project..." -ForegroundColor Green
railway init --name scamshield

Write-Host "`n[2/5] Adding PostgreSQL..." -ForegroundColor Green
railway add --plugin postgresql

Write-Host "`n[3/5] Adding Redis..." -ForegroundColor Green
railway add --plugin redis

Write-Host "`n[4/5] Setting environment variables..." -ForegroundColor Green
railway variables set `
    NODE_ENV=production `
    PORT=3000 `
    PHONE_HMAC_SECRET=$env:PHONE_HMAC_SECRET `
    JWT_SECRET=$env:JWT_SECRET `
    RISK_TOKEN_SECRET=$env:RISK_TOKEN_SECRET `
    RISK_TOKEN_TTL_SECONDS=600 `
    JWT_EXPIRES_IN=30d

Write-Host "`n[5/5] Deploying..." -ForegroundColor Green
railway up --detach

Write-Host "`n=== Generating public domain ===" -ForegroundColor Cyan
railway domain

Write-Host "`nDone! Copy the URL above and share it to update API_BASE." -ForegroundColor Green
