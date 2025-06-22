# config.py: For all static and user-specific configurations 

# API Credentials
PROJECT_ID = "cd4c08db-07c7-4d54-b7e9-e3c902470cca"  # SignalWire Project ID
API_TOKEN = "PT4b50e497c449268d57a151bcbd670a8d3f7c5a80ca756936"   # SignalWire API Token
SPACE_URL = "topple-solutions.signalwire.com"   # SignalWire Space URL

# Call Routing
FROM_NUMBER = "+18083038566"  # Your SignalWire phone number
TO_NUMBER = "+18665701238"    # Target institution phone number

# Application Settings - REDUCED FOR NETWORK SAFETY
CONCURRENT_CALLS = 1           # Reduced from 3 to prevent network conflicts
CARD_DATA_FILE = "cards.txt"   # Input file with card_number|zip_code format
RESULTS_FILE = "results.csv"   # Output CSV file
LOG_FILE = "balance_checker.log"  # Application log file

# Webhook Server
WEBHOOK_PORT = 8080           # Port for webhook server
WEBHOOK_BASE_URL = "https://just-just-starfish.ngrok-free.app"    # 🔄 NGROK TUNNEL URL

# Call Behavior - Updated for specific IVR sequence
CALL_TIMEOUT = 60             # Reduced from 120 to prevent resource holding
PAUSE_AFTER_PICKUP = 6        # Wait 6 seconds after call pickup before pressing 9
INITIAL_DTMF_KEY = "9"        # Press 9 first
PAUSE_AFTER_INITIAL_DTMF = 3  # Wait 3 seconds after pressing 9
PAUSE_BETWEEN_DTMF = 1        # Seconds between DTMF tone sequences
PAUSE_FOR_ZIP_PROMPT = 5      # Wait for system to ask for zip code

# Application Timeout Settings
DEFAULT_REQUEST_TIMEOUT = 30  # Default timeout for HTTP requests

# Enhanced Balance & Credit Detection Keywords
BALANCE_KEYWORDS = [
    "current balance", "account balance", "balance", "current_balance", 
    "available balance", "available_balance",
    "available credit", "available_credit", "credit available", "credit_available",
    "credit limit", "credit_limit", "spending limit", "spending_limit",
    "remaining credit", "remaining_credit", "credit remaining",
    "outstanding balance", "outstanding_balance",
    "total available", "total_available", "total credit",
    "credit", "available", "limit", "remaining", "outstanding"
] 