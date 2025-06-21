from flask import Flask, request, Response
import re
import os

app = Flask(__name__)

@app.route('/voice', methods=['POST'])
def handle_voice_webhook():
    """Handle SignalWire voice webhook events."""
    try:
        # Get form data from SignalWire
        call_sid = request.form.get('CallSid', '')
        call_status = request.form.get('CallStatus', '').lower()
        speech_result = request.form.get('SpeechResult', '')
        
        print(f"SignalWire Webhook - CallSid: {call_sid}, Status: {call_status}")
        
        # Handle speech results
        if speech_result:
            print(f"Speech transcribed: {speech_result}")
            balance_info = extract_balance_info(speech_result)
            if balance_info:
                print(f"Balance detected: {balance_info}")
                return Response(hangup_laml(), mimetype='text/xml')
        
        # Handle call completion
        if call_status in ['completed', 'failed', 'busy', 'no-answer']:
            print(f"Call ended: {call_status}")
            return Response(hangup_laml(), mimetype='text/xml')
        
        # Handle in-progress calls
        if call_status == 'in-progress':
            print("Generating IVR navigation")
            
            # Static demo values - replace with your actual card data
            card_number = "1234567890123456"  
            zip_code = "12345"
            
            laml = generate_ivr_laml(card_number, zip_code)
            return Response(laml, mimetype='text/xml')
        
        # Default response
        return Response(hangup_laml(), mimetype='text/xml')
        
    except Exception as e:
        print(f"Error handling webhook: {e}")
        return Response(hangup_laml(), mimetype='text/xml')

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "signalwire-webhook"}

@app.route('/', methods=['GET'])
def index():
    """Index page."""
    return """
    <h1>SignalWire Webhook Endpoint</h1>
    <p>This service handles SignalWire voice webhook events.</p>
    <p>Webhook URL: <code>/voice</code></p>
    <p>Health Check: <code>/health</code></p>
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