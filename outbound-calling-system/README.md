# Outbound Calling System

An automated outbound calling system built with SignalWire that can interact with IVR systems and transcribe balance information from financial institutions.

## Project Overview

This system is designed to:
- Make automated outbound calls to IVR systems
- Navigate through DTMF prompts
- Transcribe balance information using speech recognition
- Handle various call scenarios and error conditions

## Features

- **Balance Checker**: Automated balance checking for financial accounts
- **IVR Navigation**: Smart DTMF navigation through phone systems
- **Speech Recognition**: Real-time transcription of balance information
- **Webhook Integration**: Handles call status and speech events
- **Logging**: Comprehensive logging for debugging and monitoring

## Project Structure

```
outbound-calling-system/
├── scripts/
│   ├── balance_checker.py      # Main balance checking script
│   ├── outbound_caller.py      # Core outbound calling functionality
│   ├── voice_transcription.py  # Speech recognition utilities
│   ├── test_calls.py          # Testing utilities
│   └── test_ngrok.py          # Ngrok testing script
├── configs/
│   ├── ngrok.yml              # Ngrok configuration
│   ├── sip_trunk_config.conf  # SIP trunk configuration
│   └── asterisk_dialplan.conf # Asterisk dialplan
├── logs/
│   └── balance_checker.log    # Application logs
├── docs/
│   ├── README.md              # Documentation
│   └── setup_guide.md         # Setup instructions
├── utils/                     # Utility functions
├── examples/                  # Example implementations
├── requirements.txt           # Python dependencies
└── PROJECT_OVERVIEW.md       # Project overview
```

## Quick Start

### Prerequisites

- Python 3.8+
- SignalWire account with API credentials
- Ngrok account (for webhook tunneling)

### Installation

1. Clone or navigate to the project directory
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up your SignalWire credentials in the script or as environment variables:
   - Project ID: `cd4c08db-07c7-4d54-b7e9-e3c902470cca`
   - API Token: `PT4b50e497c449268d57a151bcbd670a8d3f7c5a80ca756936`
   - Space URL: `topple-solutions.signalwire.com`
   - Phone Number: `+18083038566`

### Usage

#### Balance Checker

Run the balance checker script:

```bash
python scripts/balance_checker.py
```

The script will prompt you for:
- 16-digit card number
- 5-digit zip code

The system will then:
1. Make an outbound call to the target number
2. Wait for call pickup (6 seconds)
3. Send DTMF '9' to navigate the IVR
4. Enter the provided account number and zip code
5. Transcribe the balance information
6. End the call and display results

## Configuration

### SignalWire Setup

The system uses the following SignalWire configuration:
- **Outgoing Number**: +18083038566
- **Target Number**: +18665701238 (configurable)
- **Webhook URL**: Uses ngrok for local development

### Ngrok Configuration

The `configs/ngrok.yml` file contains the ngrok configuration for webhook tunneling.

## Call Flow

The balance checker follows this call flow:
1. **Initiate Call**: Place outbound call to target number
2. **Wait for Pickup**: 6-second delay after call connects
3. **Navigate IVR**: Send DTMF '9' to access account services
4. **Enter Account**: Input 16-digit account number
5. **Enter ZIP**: Input 5-digit zip code when prompted
6. **Listen for Balance**: Transcribe balance information
7. **End Call**: Hang up after receiving balance

## Logging

All activities are logged to `logs/balance_checker.log` with detailed information about:
- Call initiation and status
- DTMF sequences sent
- Speech recognition results
- Error conditions and debugging info

## Troubleshooting

Common issues and solutions:

1. **Webhook not receiving calls**: Check ngrok tunnel status
2. **Speech recognition not working**: Verify Google Cloud credentials
3. **Call not connecting**: Verify SignalWire credentials and phone numbers
4. **DTMF not working**: Check timing and sequence in call flow

## Development

### Testing

Use the test scripts in the `scripts/` directory:
- `test_calls.py`: Test call functionality
- `test_ngrok.py`: Test ngrok connectivity

### Adding New Features

1. Create new scripts in the `scripts/` directory
2. Add configuration files to `configs/`
3. Update requirements.txt if new dependencies are needed
4. Add documentation to `docs/`

## License

This project is for internal use and testing purposes.

## Support

For issues and questions, refer to the logs and documentation in the `docs/` directory. 