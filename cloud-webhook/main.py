from flask import Flask, request, Response
from flask_cors import CORS
import re
import os
import logging

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.after_request
def after_request(response):
    """Add security and CORS headers."""
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Signature-Ed25519,X-Signature-Timestamp')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('X-Content-Type-Options', 'nosniff')
    response.headers.add('X-Frame-Options', 'DENY')
    return response

@app.route('/options', methods=['OPTIONS'])
@app.route('/voice', methods=['OPTIONS'])
def handle_options():
    """Handle preflight OPTIONS requests."""
    return Response('', 200)

@app.route('/voice', methods=['POST'])
def handle_voice_webhook():
    """Handle SignalWire voice webhook events."""
    try:
        # Log the incoming request
        logger.info(f"Incoming webhook request from {request.remote_addr}")
        logger.info(f"Request headers: {dict(request.headers)}")
        logger.info(f"Request form data: {dict(request.form)}")
        
        # Get form data from SignalWire
        call_sid = request.form.get('CallSid', '')
        call_status = request.form.get('CallStatus', '').lower()
        speech_result = request.form.get('SpeechResult', '')
        from_number = request.form.get('From', '')
        to_number = request.form.get('To', '')
        
        logger.info(f"SignalWire Webhook - CallSid: {call_sid}, Status: {call_status}, From: {from_number}, To: {to_number}")
        
        # Handle speech results
        if speech_result:
            logger.info(f"Speech transcribed: {speech_result}")
            balance_info = extract_balance_info(speech_result)
            if balance_info:
                logger.info(f"Balance detected: {balance_info}")
                return Response(hangup_laml(), mimetype='text/xml')
        
        # Handle call completion
        if call_status in ['completed', 'failed', 'busy', 'no-answer']:
            logger.info(f"Call ended: {call_status}")
            return Response(hangup_laml(), mimetype='text/xml')
        
        # Handle in-progress calls
        if call_status == 'in-progress':
            logger.info("Generating IVR navigation")
            
            # Static demo values - replace with your actual card data lookup
            card_number = "1234567890123456"  
            zip_code = "12345"
            
            laml = generate_ivr_laml(card_number, zip_code)
            logger.info(f"Generated LAML: {laml}")
            return Response(laml, mimetype='text/xml')
        
        # Default response for other statuses
        logger.info(f"Unhandled call status: {call_status}")
        return Response(hangup_laml(), mimetype='text/xml')
        
    except Exception as e:
        logger.error(f"Error handling webhook: {e}", exc_info=True)
        return Response(hangup_laml(), mimetype='text/xml')

@app.route('/status', methods=['POST'])
def handle_status_webhook():
    """Handle SignalWire call status updates."""
    try:
        call_sid = request.form.get('CallSid', '')
        call_status = request.form.get('CallStatus', '')
        call_duration = request.form.get('CallDuration', '0')
        
        logger.info(f"Status update - CallSid: {call_sid}, Status: {call_status}, Duration: {call_duration}s")
        
        return Response('OK', 200)
        
    except Exception as e:
        logger.error(f"Error handling status webhook: {e}", exc_info=True)
        return Response('ERROR', 500)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy", 
        "service": "signalwire-webhook",
        "version": "1.0.0",
        "endpoints": ["/voice", "/status", "/health"]
    }

@app.route('/', methods=['GET'])
def index():
    """Index page."""
    return """
    <h1>🔄 SignalWire Balance Checker Webhook</h1>
    <p><strong>Status:</strong> ✅ Online and Ready</p>
    <hr>
    <h3>📡 Webhook Endpoints:</h3>
    <ul>
        <li><code>POST /voice</code> - Voice call handling</li>
        <li><code>POST /status</code> - Call status updates</li>
        <li><code>GET /health</code> - Health check</li>
    </ul>
    <hr>
    <p><em>This webhook automatically handles IVR navigation and balance extraction for SignalWire calls.</em></p>
    """

def generate_ivr_laml(card_number, zip_code):
    """Generate LAML for IVR navigation."""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Pause length="6"/>
    <Play digits="9"/>
    <Pause length="3"/>
    <Play digits="{card_number}"/>
    <Pause length="5"/>
    <Play digits="{zip_code}"/>
    <Pause length="1"/>
    <Gather input="speech" timeout="45" speechTimeout="5" action="/voice" method="POST">
        <Say>Please wait while we retrieve your balance information.</Say>
    </Gather>
    <Hangup/>
</Response>'''

def hangup_laml():
    """Generate LAML to end the call."""
    return '''<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Hangup/>
</Response>'''

def extract_balance_info(text):
    """Extract balance information from speech."""
    if not text:
        return ""
    
    text_lower = text.lower()
    
    # Balance detection patterns
    patterns = [
        r'current balance.*?is.*?(\$?[\d,]+\.?\d*)',
        r'account balance.*?is.*?(\$?[\d,]+\.?\d*)',
        r'available balance.*?is.*?(\$?[\d,]+\.?\d*)',
        r'available credit.*?is.*?(\$?[\d,]+\.?\d*)',
        r'credit limit.*?is.*?(\$?[\d,]+\.?\d*)',
        r'balance.*?(\$?[\d,]+\.?\d*)',
        r'(\$[\d,]+\.?\d*)\s*dollars?',
        r'(\$[\d,]+\.?\d*)'
    ]
    
    # Extract amounts
    for pattern in patterns:
        matches = re.findall(pattern, text_lower)
        if matches:
            amount = matches[0].strip()
            if not amount.startswith('$'):
                amount = f"${amount}"
            print(f"Extracted amount: {amount}")
            return amount
    
    # Check for financial keywords
    keywords = ['balance', 'credit', 'available', 'limit', 'dollar', 'payment']
    if any(keyword in text_lower for keyword in keywords):
        print(f"Financial keywords detected: {text}")
        return f"Financial Info: {text}"
    
    return ""

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False) 