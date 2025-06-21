# Automated IVR Balance Checker

An automated system to check account balances by dialing financial institutions' IVR systems, navigating menus with DTMF tones, and transcribing spoken balance information using cloud webhooks.

## Features

- 🔄 **Concurrent Processing**: Handle multiple calls simultaneously
- 🎙️ **Speech Recognition**: Transcribe IVR responses in real-time
- 📊 **Balance Extraction**: Automatically extract balance amounts from speech
- 📝 **Structured Output**: Results saved to CSV for easy analysis
- ☁️ **Cloud Webhooks**: Reliable webhook handling via cloud deployment
- ⚙️ **Configurable**: Easy setup for different institutions and parameters

## Quick Start

### 1. Installation

```bash
pip install -r requirements.txt
```

### 2. SignalWire Account Setup

1. Create a [SignalWire account](https://signalwire.com)
2. Purchase a phone number for outbound calls
3. Note your Project ID, API Token, and Space URL from the dashboard

### 3. Deploy Cloud Webhook

Deploy the webhook to a cloud service (recommended: Railway):

1. Go to [railway.app](https://railway.app) and sign up
2. Upload files from `../cloud-webhook/` directory:
   - `main.py`
   - `requirements.txt`
3. Deploy and copy your webhook URL

### 4. Configuration

Edit `config.py` with your settings:

```python
# API Credentials
PROJECT_ID = "your-signalwire-project-id"
API_TOKEN = "your-signalwire-api-token"  
SPACE_URL = "your-space.signalwire.com"

# Call Routing
FROM_NUMBER = "+1234567890"  # Your SignalWire number
TO_NUMBER = "+1800123456"    # Institution's IVR number

# Cloud Webhook
WEBHOOK_BASE_URL = "https://your-app.railway.app"  # Your deployed webhook URL
```

## Usage

### 1. Prepare Card Data

Create a `cards.txt` file with card numbers and zip codes:

```
1234567890123456|12345
9876543210987654|54321
5555444433332222|67890
```

Format: `card_number|zip_code` (one per line)

### 2. Run the Application

```bash
python main.py
```

The application will:
1. Load card data from `cards.txt`
2. Start the local webhook server
3. Begin processing calls concurrently
4. Save results to `results.csv`

### 3. Monitor Progress

- Real-time console output
- Application logs in `balance_checker.log`
- Results saved to `results.csv`

## Results

Results are saved to `results.csv` with columns:

| Column | Description |
|--------|-------------|
| `CardNumber` | The card number processed |
| `ZipCode` | The associated zip code |
| `DetectedBalance` | Extracted balance amount |
| `CallStatus` | Final call status (COMPLETED/FAILED/etc.) |
| `TranscriptionLog` | Full speech transcription log |

Example output:
```csv
CardNumber,ZipCode,DetectedBalance,CallStatus,TranscriptionLog
1234567890123456,12345,$1234.56,COMPLETED,Your available balance is one thousand two hundred thirty four dollars and fifty six cents
9876543210987654,54321,,FAILED,Call ended with status: busy
```

## Architecture

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Balance       │    │  SignalWire  │    │  Cloud Webhook  │
│   Checker       │◄──►│   Service    │◄──►│   (Railway)     │
│   Application   │    │              │    │                 │
└─────────────────┘    └──────────────┘    └─────────────────┘
         │                       │                    │
         ▼                       ▼                    ▼
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   cards.txt     │    │  IVR System  │    │   LAML/TwiML    │
│   results.csv   │    │  Phone Call  │    │   Generation    │
└─────────────────┘    └──────────────┘    └─────────────────┘
```

## Configuration Options

### Call Behavior
- `CONCURRENT_CALLS`: Number of simultaneous calls (default: 1)
- `CALL_TIMEOUT`: Maximum call duration in seconds (default: 60)
- `PAUSE_AFTER_PICKUP`: Wait time after call pickup (default: 6)
- `PAUSE_BETWEEN_DTMF`: Delay between DTMF sequences (default: 1)

### Files
- `CARD_DATA_FILE`: Input file with card data (default: "cards.txt")
- `RESULTS_FILE`: Output CSV file (default: "results.csv")
- `LOG_FILE`: Application log file (default: "balance_checker.log")

## Troubleshooting

### Common Issues

**"Missing SignalWire credentials"**
- Ensure `PROJECT_ID`, `API_TOKEN`, and `SPACE_URL` are set in `config.py`

**"No card data loaded"**
- Check that `cards.txt` exists and has valid `card_number|zip_code` entries
- Ensure file encoding is UTF-8

**Webhook errors**
- Verify your cloud webhook is deployed and accessible
- Check webhook logs in your cloud service dashboard
- Test webhook endpoint: `curl https://your-webhook-url.com/health`

## Development

### Local Development
1. Run webhook locally: `python ../cloud-webhook/main.py`
2. Use ngrok for testing: `ngrok http 5000`
3. Update `WEBHOOK_BASE_URL` with ngrok URL

### Cloud Deployment
See `../cloud-webhook/DEPLOY.md` for detailed deployment instructions.

## License

This project is for educational and testing purposes. Ensure compliance with all applicable laws and regulations. 