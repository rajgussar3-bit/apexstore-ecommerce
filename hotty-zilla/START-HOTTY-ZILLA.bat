@echo off
title HOTTY ZILLA VIP SERVER
color 0C
echo ====================================================
echo   HOTTY ZILLA - VIP ENTERTAINMENT AND FRIENDSHIP
echo ====================================================
echo.
echo Server start ho raha hai...
echo Browser automatically khul jayega!
echo.
timeout /t 2 /nobreak >nul
start "" "http://localhost:5000"
echo Storefront:          http://localhost:5000
echo VIP Lounge:          http://localhost:5000/my-library.html
echo Secret Control Desk: http://localhost:5000/hz-secret-control-desk.html (PIN: 1234)
echo.
node server.js
pause
