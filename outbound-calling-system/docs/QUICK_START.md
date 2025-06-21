# Quick Start Guide

Get your outbound calling system up and running in 5 minutes!

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
cd outbound-calling-system
python setup.py
```

Or manually:
```bash
pip install -r requirements.txt
```

### 2. Start Ngrok Tunnel

```bash
ngrok http 8080
```

Keep this terminal open - you'll need the ngrok URL.

### 3. Run the Balance Checker

```bash
python scripts/balance_checker.py
```

## 📋 What You'll Need

Before running the script, have ready:
- **16-digit card number** (the account you want to check)
- **5-digit zip code** (associated with the account)

## 🔧 Configuration

The system is pre-configured with:
- **SignalWire Account**: Already set up
- **Phone Numbers**: Configured for the target IVR system
- **Webhook URL**: Uses the provided ngrok tunnel

## 📱 How It Works

1. **Input**: You provide card number and zip code
2. **Call**: System dials the IVR number (+18665701238)
3. **Navigate**: Automatically presses '9' and enters your data
4. **Listen**: Transcribes the balance information
5. **Result**: Displays your account balance

## 🎯 Expected Flow

```
System: "Please enter your 16-digit card number:"
You: [Enter your card number]

System: "Please enter your 5-digit zip code:"
You: [Enter your zip code]

System: "Starting balance check..."
System: "Call initiated..."
System: "Waiting for pickup..."
System: "Navigating IVR..."
System: "Entering account information..."
System: "Listening for balance..."
System: "Balance received: $XXX.XX"
```

## 🛠️ Troubleshooting

### Common Issues

**"Webhook not receiving events"**
- Check if ngrok is running
- Verify the webhook URL in the script matches your ngrok URL

**"Call not connecting"**
- Verify your internet connection
- Check SignalWire account status

**"No balance detected"**
- The IVR might have changed - check logs for speech transcription
- Try running again (sometimes timing issues occur)

**"Invalid card number"**
- Ensure you're entering exactly 16 digits
- No spaces or dashes

### Debug Mode

To see detailed logs:
1. Check `logs/balance_checker.log`
2. Look for call status and speech recognition results

## 📞 Test Numbers

- **Target IVR**: +18665701238 (configured)
- **Your Number**: +18083038566 (outgoing)

## 🔍 Next Steps

After your first successful run:
1. Review the logs to understand the call flow
2. Customize the IVR navigation if needed
3. Add error handling for your specific use case

## 📚 More Information

- See `README.md` for full documentation
- Check `docs/setup_guide.md` for detailed setup
- Review `PROJECT_OVERVIEW.md` for architecture details

---

**Need Help?** Check the logs first, then review the full documentation! 