# 🚀 Quick Cloud Webhook Deployment

## Option 1: Railway (Recommended - 2 minutes) 

Railway is the easiest way to deploy your webhook:

### Deploy to Railway:
1. **Create Railway Account**: Go to [railway.app](https://railway.app) and sign up with GitHub
2. **Click Deploy**: [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/python-flask)
3. **Upload Files**: 
   - Upload `main.py`
   - Upload `requirements.txt`
4. **Deploy**: Railway will automatically deploy your webhook
5. **Get URL**: Copy your Railway app URL (e.g., `https://your-app.railway.app`)

### Update Your Config:
```python
# In balance-checker-project/config.py
WEBHOOK_BASE_URL = "https://your-app.railway.app"
```

## Option 2: Render (Free Tier)

1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect your GitHub repo or upload files
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `gunicorn main:app`
6. Deploy and get your URL

## Option 3: Heroku

1. Install Heroku CLI
2. `git init` in cloud-webhook folder
3. `heroku create your-app-name`
4. `git add . && git commit -m "Deploy webhook"`
5. `git push heroku main`

## Option 4: Local with ngrok (Temporary)

If you want to test quickly:

```bash
cd cloud-webhook
python main.py
# In another terminal:
ngrok http 5000
```

Use the ngrok HTTPS URL in your config.

## ✅ Test Your Webhook

Once deployed, test it:
```bash
curl https://your-webhook-url.com/health
```

Should return: `{"status": "healthy", "service": "signalwire-webhook"}`

## 🔧 Production Notes

For production use:
1. Replace the static card_number and zip_code in `main.py` with database lookups
2. Add authentication if needed
3. Set up monitoring/logging
4. Use environment variables for sensitive data

Your webhook URL will be: `https://your-app.railway.app/voice` 