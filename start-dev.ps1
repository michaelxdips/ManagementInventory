Write-Host "🚀 Starting Inventory System..."

# Start Backend
Write-Host "Starting Backend Server..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# Wait a bit for backend to initialize
Start-Sleep -Seconds 2

# Start Frontend
Write-Host "Starting Frontend Server..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "✅ System Starting! Check the new windows."
