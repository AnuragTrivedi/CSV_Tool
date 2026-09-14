@echo off
setlocal enabledelayedexpansion
title Build ChapterAssetFiller.exe
echo ===================================================================
echo     BOOK ASSET CSV ENTRY FILLER - WINDOWS EXE BUILDER
echo ===================================================================
echo.
echo Checking Python installation...
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python 3 was not found on your system PATH.
    echo Please install Python 3 from https://www.python.org/
    echo Remember to check the box "Add Python to PATH" during installation.
    echo.
    pause
    exit /b 1
)

echo Python is available. Checking PyInstaller...
python -m pip show pyinstaller >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo PyInstaller is not installed yet. Installing PyInstaller now...
    python -m pip install pyinstaller
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to install PyInstaller. Check internet connection.
        pause
        exit /b 1
    )
)

echo.
echo Building standalone executable ChapterAssetFiller.exe...
echo This will package chapter_asset_app.pyw and fill_chapter_assets.py into a single .exe!
echo.

python -m PyInstaller --clean --onefile --windowed --name "ChapterAssetFiller" "%~dp0chapter_asset_app.pyw"

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] PyInstaller failed to build the .exe.
    pause
    exit /b 1
)

if exist "%~dp0dist\ChapterAssetFiller.exe" (
    copy /y "%~dp0dist\ChapterAssetFiller.exe" "%~dp0ChapterAssetFiller.exe" >nul
    echo.
    echo ===================================================================
    echo  SUCCESS! Your standalone Windows executable has been created:
    echo  %~dp0ChapterAssetFiller.exe
    echo ===================================================================
    echo.
    echo You can now move ChapterAssetFiller.exe anywhere and double-click to run!
) else (
    echo.
    echo Build completed. Executable is located in the dist folder:
    echo %~dp0dist\ChapterAssetFiller.exe
)

echo.
pause
