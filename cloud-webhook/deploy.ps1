Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "🚀 AUTOMATED RAILWAY WEBHOOK DEPLOYMENT" -ForegroundColor Cyan  
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📦 Step 1: Installing Railway CLI..." -ForegroundColor Yellow
try {
    npm install -g @railway/cli
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Railway CLI installed successfully!" -ForegroundColor Green
    } else {
        throw "Installation failed"
    }
} catch {
    Write-Host "❌ Failed to install Railway CLI" -ForegroundColor Red
    Write-Host "Please install Node.js first: https://nodejs.org" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "🔐 Step 2: Login to Railway (browser will open)..." -ForegroundColor Yellow
try {
    railway login
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Logged in successfully!" -ForegroundColor Green
    } else {
        throw "Login failed"
    }
} catch {
    Write-Host "❌ Railway login failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "🚀 Step 3: Deploying webhook to Railway..." -ForegroundColor Yellow
try {
    railway up
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "===============================================" -ForegroundColor Green
        Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
        Write-Host "===============================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Next steps:" -ForegroundColor Cyan
        Write-Host "1. Copy your Railway URL from above" -ForegroundColor White
        Write-Host "2. Update config.py with your new webhook URL" -ForegroundColor White  
        Write-Host "3. Run: python main.py" -ForegroundColor White
        Write-Host ""
        Write-Host "Your webhook URL will be something like:" -ForegroundColor Cyan
        Write-Host "https://your-app-name.railway.app" -ForegroundColor Yellow
    } else {
        throw "Deployment failed"
    }
} catch {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    Write-Host "Please check the error messages above." -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to exit" 