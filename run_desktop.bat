@echo off
title Book Asset CSV Entry Filler - Desktop App Launcher
echo ========================================================
echo   Launching Book Asset CSV Entry Filler Desktop App...
echo ========================================================
echo.

where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python is not found in your system PATH.
    echo Please install Python 3 from https://www.python.org/
    echo (Make sure to check "Add Python to PATH" during installation)
    echo.
    pause
    exit /b 1
)

start "" pythonw "%~dp0chapter_asset_app.pyw"
exit /b 0
