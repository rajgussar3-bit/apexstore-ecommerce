@echo off
title Notty Boyzz - Web Server & Control Desk
color 0b
echo ========================================================
echo         NOTTY BOYZZ - WEB & CONTROL DESK SYSTEM
echo ========================================================
echo.
echo [1/2] Checking dependencies...
if not exist node_modules (
    echo Installing required packages...
    call npm.cmd install
)

echo.
echo [2/2] Launching Notty Boyzz Server...
start "" http://localhost:3000
start "" http://localhost:3000/control-desk.html
node server.js
pause
