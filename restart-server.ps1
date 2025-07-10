# Bug Hunt Server Restart Utility (PowerShell)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🎮 Bug Hunt Server Restart Utility" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔍 Checking for processes on ports 3000 and 3001..." -ForegroundColor Green
Write-Host ""

# Function to stop processes on a specific port
function Stop-ProcessOnPort {
    param($Port)
    
    Write-Host "📡 Stopping processes on port $Port..." -ForegroundColor Yellow
    
    # Get processes using the port
    $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | 
                 Select-Object -ExpandProperty OwningProcess | 
                 Sort-Object -Unique
    
    if ($processes) {
        foreach ($processId in $processes) {
            try {
                $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "Found process $processId ($($process.ProcessName)) on port $Port" -ForegroundColor White
                    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                    Write-Host "✅ Stopped process $processId" -ForegroundColor Green
                }
            }
            catch {
                Write-Host "⚠️  Could not stop process $processId" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "No processes found on port $Port" -ForegroundColor Gray
    }
}

# Stop processes on both ports
Stop-ProcessOnPort 3000
Stop-ProcessOnPort 3001

Write-Host ""
Write-Host "🚀 Starting Bug Hunt server..." -ForegroundColor Green
Write-Host ""

# Start the server
npm run dev

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🎉 Server restarted successfully!" -ForegroundColor Green
Write-Host "🌐 Visit: http://localhost:3000" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan 