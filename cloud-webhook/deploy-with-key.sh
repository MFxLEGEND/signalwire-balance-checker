#!/bin/bash

# SignalWire Balance Checker - Railway Auto Deploy
# Uses provided Railway API key for authentication

echo "============================================================"
echo "🚀 RAILWAY WEBHOOK AUTO-DEPLOY"
echo "============================================================"

# Set Railway API token
export RAILWAY_TOKEN="6ce3ddc0-6d5c-41c8-9c16-dac5ba47b7a9"

echo "✅ Railway API token configured"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    if command -v npm &> /dev/null; then
        npm install -g @railway/cli
    else
        echo "❌ Node.js/npm not found. Please install from: https://nodejs.org"
        exit 1
    fi
fi

echo "✅ Railway CLI ready"

# Authenticate
echo "🔐 Authenticating with Railway..."
railway login --token "$RAILWAY_TOKEN" || {
    echo "❌ Authentication failed"
    exit 1
}

echo "✅ Authentication successful"

# Create project if it doesn't exist
echo "🔗 Setting up project..."
railway project create --name "signalwire-webhook" 2>/dev/null || echo "⚠️  Project may already exist"

# Deploy
echo "🚀 Deploying webhook..."
railway up --detached || {
    echo "❌ Deployment failed"
    exit 1
}

echo "✅ Deployment initiated!"

# Wait for deployment
echo "⏳ Waiting for deployment to complete..."
sleep 15

# Generate domain if needed
echo "🌐 Setting up public domain..."
railway domain generate 2>/dev/null || echo "⚠️  Domain may already exist"

# Get the URL
sleep 5
WEBHOOK_URL=$(railway domain 2>/dev/null | grep -oE 'https://[^[:space:]]+' | head -1)

if [ -n "$WEBHOOK_URL" ]; then
    echo ""
    echo "============================================================"
    echo "✅ DEPLOYMENT COMPLETE!"
    echo "============================================================"
    echo "🌐 Webhook URL: $WEBHOOK_URL"
    echo "📡 Voice Endpoint: $WEBHOOK_URL/voice"
    echo "🏥 Health Check: $WEBHOOK_URL/health"
    echo "📊 Status Endpoint: $WEBHOOK_URL/status"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Update your config.py with: WEBHOOK_BASE_URL = \"$WEBHOOK_URL\""
    echo "2. Test the webhook: curl $WEBHOOK_URL/health"
    echo "3. Run your balance checker: python main.py"
    echo "============================================================"
else
    echo "⚠️  Deployment completed but URL detection failed"
    echo "📋 Check Railway dashboard: https://railway.app/dashboard"
    echo "🔍 Look for 'signalwire-webhook' service"
fi 