@echo off
echo ================================
echo  SignalWire Webhook Deployment
echo ================================
echo.

echo Checking if Vercel CLI is installed...
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Vercel CLI not found. Installing via npm...
    npm install -g vercel
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to install Vercel CLI. Please install Node.js first.
        echo Visit: https://nodejs.org/
        pause
        exit /b 1
    )
)

echo.
echo Vercel CLI found! Deploying webhook...
echo.

rem Deploy to Vercel
vercel --prod

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================
    echo  DEPLOYMENT SUCCESSFUL!
    echo ================================
    echo.
    echo Your webhook URL is now available.
    echo Copy the HTTPS URL and update your config.py:
    echo.
    echo WEBHOOK_BASE_URL = "https://your-url.vercel.app"
    echo.
) else (
    echo.
    echo Deployment failed. Please check the error messages above.
)

pause 