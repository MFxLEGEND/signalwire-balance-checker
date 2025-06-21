@echo off
echo ========================================
echo    BALANCE CHECKER - Quick Start
echo ========================================
echo.
echo This will start the balance checker with
echo all API credentials pre-configured.
echo.
echo Make sure ngrok is running on port 8080:
echo   ngrok http 8080
echo.
pause
echo.
echo Starting Balance Checker...
python balance_checker_ready.py
pause 