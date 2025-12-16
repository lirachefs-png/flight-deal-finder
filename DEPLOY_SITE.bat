@echo off
title DEPLOY ALL TRIP WEBSITE 🚀
color 0B
echo ===================================================
echo   A COLOCAR O SITE "ALL TRIP" ONLINE...
echo   (Siga as instrucoes na tela)
echo ===================================================
echo.
cd /d "c:\Users\lirag\OneDrive\doc jr\flight-deal-finder"
call npx -y vercel
echo.
echo ===================================================
echo   SE TUDO CORREU BEM, O TEU SITE ESTA NO AR!
echo   Copie o link 'Production' acima.
echo ===================================================
pause
