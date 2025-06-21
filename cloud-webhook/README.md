# 🚀 SignalWire Webhook - One-Click Deploy

## ⚡ **INSTANT DEPLOY TO RAILWAY**

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/python-flask?referralCode=alphasec)

👆 **Click this button above** → Railway will automatically:
- Create your account (free)
- Deploy your webhook 
- Give you a live URL
- Takes 60 seconds total!

## 📋 **After Deployment:**

1. **Copy Your Railway URL** (something like `https://signalwire-webhook-production.railway.app`)

2. **Update Your Balance Checker Config:**
   ```python
   # In balance-checker-project/config.py, line 18:
   WEBHOOK_BASE_URL = "https://your-railway-url.railway.app"
   ```

3. **Test Your Webhook:**
   ```bash
   curl https://your-railway-url.railway.app/health
   ```
   Should return: `{"status": "healthy"}`

4. **Run Your Balance Checker:**
   ```bash
   cd balance-checker-project
   python main.py
   ```

## 🔄 **Alternative: GitHub Deploy**

If the button doesn't work:
1. Go to [railway.app](https://railway.app) 
2. Click "Deploy from GitHub"
3. Connect this repository
4. Select the `cloud-webhook` folder
5. Deploy!

## ✅ **Your Webhook Endpoints:**

- **Health Check:** `https://your-url.railway.app/health`
- **Voice Webhook:** `https://your-url.railway.app/voice` (used by SignalWire)
- **Status Webhook:** `https://your-url.railway.app/status` (call status updates)

---

**That's it! Your webhook is now hosted in the cloud and ready to receive SignalWire calls.** 🎉 