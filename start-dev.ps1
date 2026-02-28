$ErrorActionPreference = "Continue"

Write-Host "🚀 Starting Inventory System..." -ForegroundColor Cyan
$wt = Get-Command wt.exe -ErrorAction SilentlyContinue

if ($wt) {
    Write-Host "✨ Windows Terminal detected! Opening split-pane..." -ForegroundColor Yellow
    wt.exe new-tab -d "$PSScriptRoot\backend" cmd /k "title Backend Server && npm run dev" `; split-pane -d "$PSScriptRoot\frontend" cmd /k "title Frontend Server && npm run dev"
}
else {
    Write-Host "✨Opening Split Command Prompt..." -ForegroundColor Yellow
    Start-Process -FilePath "cmd.exe" -ArgumentList "/k title Backend Server && cd `"$PSScriptRoot\backend`" && npm run dev"
    Start-Process -FilePath "cmd.exe" -ArgumentList "/k title Frontend Server && cd `"$PSScriptRoot\frontend`" && npm run dev"
}

Write-Host "✅ Server booting!." -ForegroundColor Green
