@echo off
title Deploy Notty Boyzz to Vercel
color 0a
echo ========================================================
echo         DEPLOY NOTTY BOYZZ TO VERCEL (CHROME ACCOUNT)
echo ========================================================
echo.
echo Ye project aapke Chrome me open Vercel account par direct deploy hoga!
echo.
echo Steps:
echo 1. Browser me authorization puche to 'Authorize/Confirm' karein.
echo 2. Terminal me questions puche to bas 'Enter' dabate rahein (Default settings).
echo.
cd /d "%~dp0"
call npx.cmd vercel --prod
pause
