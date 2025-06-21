@echo off
echo ===============================================
echo 🚀 AUTOMATED RAILWAY WEBHOOK DEPLOYMENT
echo ===============================================
echo.

echo 📦 Step 1: Installing Railway CLI...
npm install -g @railway/cli
if %errorlevel% neq 0 (
    echo ❌ Failed to install Railway CLI
    echo Please install Node.js first: https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Railway CLI installed successfully!
echo.

echo 🔐 Step 2: Login to Railway (browser will open)...
railway login
if %errorlevel% neq 0 (
    echo ❌ Railway login failed
    pause
    exit /b 1
)

echo ✅ Logged in successfully!
echo.

echo 🚀 Step 3: Deploying webhook to Railway...
railway up
if %errorlevel% neq 0 (
    echo ❌ Deployment failed
    pause
    exit /b 1
)

echo.
echo ===============================================
echo ✅ DEPLOYMENT COMPLETE!
echo ===============================================
echo.
echo 📋 Next steps:
echo 1. Copy your Railway URL from above
echo 2. Update config.py with your new webhook URL
echo 3. Run: python main.py
echo.
echo Your webhook URL will be something like:
echo https://your-app-name.railway.app
echo.
pause 