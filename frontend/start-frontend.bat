@echo off
echo ========================================
echo Frontend Startup Script
echo ========================================
echo.

echo Checking if port 3001 is in use...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    echo Port 3001 is occupied by PID: %%a
    echo Attempting to kill process %%a...
    taskkill /F /PID %%a
    if %errorlevel% equ 0 (
        echo Successfully killed process %%a
    ) else (
        echo Failed to kill process %%a
        echo Will attempt to start on alternative port
    )
)

echo.
echo Port 3001 is now available or will use alternative port
echo.
echo Starting Vite dev server...
call npm run dev

pause
