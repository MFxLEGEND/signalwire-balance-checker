# SignalWire Balance Checker System

A complete automated system for checking account balances via phone calls using SignalWire's voice API and cloud-hosted webhooks.

## 🏗️ Project Structure

```
signalwire-balance-checker/
├── balance-checker-project/     # Main application
│   ├── main.py                 # Balance checker application
│   ├── config.py               # Configuration settings
│   ├── utils.py                # Utility functions
│   ├── webhook_server.py       # Local webhook server
│   ├── call_manager.py         # Call session management
│   ├── cards.txt               # Sample card data
│   ├── requirements.txt        # Python dependencies
│   └── README.md              # Application documentation
└── cloud-webhook/              # Cloud webhook deployment
    ├── main.py                 # Flask webhook server
    ├── requirements.txt        # Cloud dependencies
    ├── DEPLOY.md              # Deployment guide
    └── README.md              # Webhook documentation
```

## 🚀 Quick Start

### 1. Deploy Cloud Webhook (2 minutes)

```bash
cd cloud-webhook
# Follow deployment guide in DEPLOY.md
# Recommended: Railway.app for free hosting
```

### 2. Configure Balance Checker

```bash
cd balance-checker-project
pip install -r requirements.txt

# Edit config.py with your:
# - SignalWire credentials
# - Cloud webhook URL
# - Target phone number
```

### 3. Run Balance Checker

```bash
python main.py
```

## 💡 How It Works

1. **Balance Checker** reads card data and initiates calls via SignalWire
2. **SignalWire** places calls to IVR systems and sends webhook events
3. **Cloud Webhook** receives events and generates DTMF navigation instructions
4. **IVR System** responds with balance information via speech
5. **Speech Recognition** extracts balance amounts from transcriptions
6. **Results** are saved to CSV for analysis

## 🌟 Features

- ☁️ **Cloud-hosted webhooks** - No local tunneling required
- 🔄 **Concurrent call processing** - Handle multiple calls simultaneously  
- 🎙️ **Real-time speech recognition** - Extract balance information automatically
- 📊 **Structured output** - Results saved to CSV format
- ⚙️ **Highly configurable** - Customize for different IVR systems
- 🛡️ **Error handling** - Robust error handling and logging

## 📋 Requirements

- Python 3.8+
- SignalWire account with phone number
- Cloud hosting service (Railway, Render, Heroku, etc.)

## 🔧 Configuration

Key settings in `balance-checker-project/config.py`:

```python
# SignalWire API
PROJECT_ID = "your-project-id"
API_TOKEN = "your-api-token"
SPACE_URL = "your-space.signalwire.com"

# Phone numbers
FROM_NUMBER = "+1234567890"  # Your SignalWire number
TO_NUMBER = "+1800123456"    # Target IVR number

# Cloud webhook
WEBHOOK_BASE_URL = "https://your-app.railway.app"

# Call behavior
CONCURRENT_CALLS = 1
CALL_TIMEOUT = 60
```

## 📞 Supported IVR Flow

The system is configured for IVR systems that follow this pattern:

1. Call connects
2. Wait 6 seconds
3. Press "9" (initial menu option)
4. Wait 3 seconds
5. Enter card number
6. Wait 5 seconds (for ZIP prompt)
7. Enter ZIP code
8. Listen for balance information

## 📈 Results

Output CSV contains:
- Card number
- ZIP code
- Detected balance amount
- Call status
- Full transcription log

## 🔍 Monitoring

- Real-time console output
- Detailed application logs
- Cloud webhook logs
- SignalWire call dashboard

## 📚 Documentation

- [`balance-checker-project/README.md`](balance-checker-project/README.md) - Application details
- [`cloud-webhook/README.md`](cloud-webhook/README.md) - Webhook documentation
- [`cloud-webhook/DEPLOY.md`](cloud-webhook/DEPLOY.md) - Deployment guide

## ⚠️ Important Notes

- This system is for educational and testing purposes
- Ensure compliance with applicable laws and regulations
- Monitor call costs through SignalWire dashboard
- Keep API credentials secure and never commit to version control

## 🆘 Support

For issues:
1. Check application logs in `balance_checker.log`
2. Verify cloud webhook is responding at `/health` endpoint
3. Review SignalWire call logs
4. Check configuration settings

## 📄 License

Educational and testing use only. Ensure compliance with all applicable laws and regulations. 