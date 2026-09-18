@echo off
title HOTTY ZILLA - VIP Friendship, Video Shorts ^& SPA Club
color 0C

echo ========================================================
echo        HOTTY ZILLA - VIP LOUNGE ^& MEDIA STUDIO
echo ========================================================
echo.
echo [1/3] Checking dependencies...
if not exist "node_modules\" (
    echo Installing node dependencies, please wait...
    call npm.cmd install
)

echo.
echo [2/3] Starting Hotty Zilla Server on Port 5000...
echo.
echo Public Storefront:    http://localhost:5000
echo VIP Member Lounge:    http://localhost:5000/my-library.html
echo.
echo [SECRET] Private Control Desk: http://localhost:5000/hz-secret-control-desk.html (PIN: 1234)
echo.
echo [3/3] Opening browser in 2 seconds...
start "" http://localhost:5000

node server.js
pause
