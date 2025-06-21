"""
SignalWire Configuration
Contains all SignalWire-related configuration settings
"""

# SignalWire Credentials
SIGNALWIRE_PROJECT_ID = "cd4c08db-07c7-4d54-b7e9-e3c902470cca"
SIGNALWIRE_API_TOKEN = "PT4b50e497c449268d57a151bcbd670a8d3f7c5a80ca756936"
SIGNALWIRE_SPACE_URL = "topple-solutions.signalwire.com"

# Phone Numbers
OUTGOING_NUMBER = "+18083038566"
TARGET_NUMBER = "+18665701238"

# Webhook Configuration
WEBHOOK_BASE_URL = "https://still-troll-easily.ngrok-free.app"
WEBHOOK_PORT = 8080

# Call Flow Configuration
INITIAL_WAIT_TIME = 6  # seconds to wait after call pickup
DTMF_WAIT_TIME = 1     # seconds to wait between DTMF tones
BALANCE_LISTEN_TIME = 30  # seconds to listen for balance information

# IVR Navigation
IVR_MENU_KEY = "9"  # Key to press to access account services

# Speech Recognition Settings
SPEECH_TIMEOUT = 10  # seconds to wait for speech
SPEECH_LANGUAGE = "en-US"
BALANCE_KEYWORDS = ["balance", "available", "current", "dollars", "cents"]

# Logging Configuration
LOG_LEVEL = "INFO"
LOG_FORMAT = "%(asctime)s - %(levelname)s - %(message)s"
LOG_FILE = "logs/balance_checker.log" 