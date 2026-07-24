@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Piszpad WAV
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0Piszpad-WAV.ps1"
if errorlevel 1 (
    echo.
    echo Piszpad zakonczyl dzialanie z bledem.
    pause
)
