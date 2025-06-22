# 🔄 SignalWire Balance Checker - Ngrok Setup

## 🚀 Quick Start

### 1. Start the Balance Checker
```bash
cd balance-checker-project
python main.py
```

### 2. Start Ngrok Tunnel (in another terminal)
```bash
ngrok start webhook
```

## 🔧 Configuration

- **Ngrok Config**: `ngrok.yml`
- **Tunnel URL**: `https://just-just-starfish.ngrok-free.app`
- **Local Port**: `8080`
- **Webhook URL**: Auto-configured in `config.py`

## 📁 Project Structure

```
├── balance-checker-project/
│   ├── main.py              # Main application
│   ├── config.py            # Configuration
│   ├── webhook_server.py    # Local webhook server
│   ├── call_manager.py      # Call management
│   ├── utils.py             # Utilities
│   └── cards.txt            # Card data
├── ngrok.yml                # Ngrok configuration
└── start_ngrok.bat          # Ngrok startup script
```

## 🎯 How It Works

1. **Local Webhook Server** runs on port 8080
2. **Ngrok Tunnel** exposes webhook to internet
3. **SignalWire** sends events to tunnel URL
4. **Balance Checker** processes IVR responses

## ✅ All Cloud Deployment Files Removed

- Deleted `cloud-webhook/` directory
- Removed Railway configuration
- Cleaned up all cloud deployment code
- Restored original ngrok-based setup 