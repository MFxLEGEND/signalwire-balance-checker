# SignalWire Webhook Cloud Endpoint

This is a serverless webhook endpoint for handling SignalWire voice calls, deployed on Vercel.

## Features

- ✅ Handles SignalWire webhook events
- ✅ Generates LAML/TwiML for IVR navigation
- ✅ Extracts balance information from speech
- ✅ Serverless deployment (no server management)
- ✅ Automatic HTTPS
- ✅ Global edge deployment

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/signalwire-webhook)

## Manual Deployment

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd cloud-webhook
   vercel
   ```

4. **Your webhook URL will be:**
   ```
   https://your-project-name.vercel.app/api/voice
   ```

## Usage

Once deployed, update your balance checker configuration:

```python
# In your config.py
WEBHOOK_BASE_URL = "https://your-project-name.vercel.app"
```

## Webhook Endpoints

- `POST /api/voice` - Main webhook endpoint for SignalWire calls

## Environment Variables

For production deployment, you may want to add:

- `CARD_DATABASE_URL` - Database connection for card information
- `LOG_LEVEL` - Logging level (default: INFO)

## Monitoring

- View logs in Vercel dashboard
- Monitor function performance
- Track webhook events

## Local Development

```bash
vercel dev
```

This will start a local development server at `http://localhost:3000` 