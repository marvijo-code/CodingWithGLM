# LLM Speed Test Application Runner

Write-Host "Starting LLM Speed Test Application..." -ForegroundColor Green

# Function to cleanup background processes
function Cleanup {
    Write-Host "Stopping all processes..." -ForegroundColor Yellow
    if ($backendProcess) {
        Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    }
    if ($frontendProcess) {
        Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
    }
    exit
}

# Set up signal handlers
[Console]::TreatControlCAsInput = $false
$ctrlC = {
    Cleanup
}
try {
    $null = Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action $ctrlC
    $null = [Console]::CancelKeyPress.Register({
        param($sender, $e)
        Cleanup
        $e.Cancel = $true
    })
} catch {
    # Fallback if event registration fails
    Write-Host "Warning: Could not register event handlers. Ctrl+C may not work properly." -ForegroundColor Yellow
}

# Start backend
Write-Host "Starting backend..." -ForegroundColor Cyan
$backendProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "deno", "task", "dev" -WorkingDirectory "./backend" -PassThru -NoNewWindow

# Wait a moment for backend to start
Start-Sleep -Seconds 2

# Start frontend
Write-Host "Starting frontend..." -ForegroundColor Cyan
$frontendProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npm", "run", "dev" -WorkingDirectory "./frontend" -PassThru -NoNewWindow

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "LLM Speed Test is now running!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Red

# Wait for all background processes
try {
    Wait-Process -Id $backendProcess.Id -ErrorAction Stop
} catch {
    # Process already terminated
}

try {
    Wait-Process -Id $frontendProcess.Id -ErrorAction Stop
} catch {
    # Process already terminated
}