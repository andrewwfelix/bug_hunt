@echo off
echo ========================================
echo 🎮 Bug Hunt Server Restart Utility
echo ========================================
echo.

echo 🔍 Checking for processes on ports 3000 and 3001...
echo.

REM Kill processes on port 3000
echo 📡 Killing processes on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    echo Found process %%a on port 3000
    taskkill /F /PID %%a 2>nul
    if !errorlevel! equ 0 (
        echo ✅ Killed process %%a
    ) else (
        echo ⚠️  Process %%a not found or already killed
    )
)

REM Kill processes on port 3001
echo 📡 Killing processes on port 3001...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do (
    echo Found process %%a on port 3001
    taskkill /F /PID %%a 2>nul
    if !errorlevel! equ 0 (
        echo ✅ Killed process %%a
    ) else (
        echo ⚠️  Process %%a not found or already killed
    )
)

echo.
echo 🚀 Starting Bug Hunt server...
echo.

REM Start the server
npm run dev

echo.
echo ========================================
echo 🎉 Server restarted successfully!
echo 🌐 Visit: http://localhost:3000
echo ======================================== 