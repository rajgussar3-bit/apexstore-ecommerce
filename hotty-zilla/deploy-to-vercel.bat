@echo off
title Deploy Hotty Zilla to Vercel
color 0a
echo ========================================================
echo         DEPLOY HOTTY ZILLA TO VERCEL (PRODUCTION)
echo ========================================================
echo.
echo Deploying latest Hotty Zilla updates:
echo - 16:9 Widescreen Mobile Video Feed
echo - 60 FPS Butter-Smooth Mobile Scrolling (No Hang)
echo - Ellie Bellas & J Mac 21-min Full HD Episode
echo - Luxury Transparent Models Ambient Background
echo.
cd /d "%~dp0"
call npx.cmd vercel --prod
echo.
echo ========================================================
echo Deployment complete! Check https://hotty-zilla.vercel.app
echo ========================================================
pause
