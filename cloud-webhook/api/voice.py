from urllib.parse import parse_qs
import re

def handler(request, context):
    """Vercel serverless function to handle SignalWire webhook events."""
    
    if request.method != 'POST':
        return {
            'statusCode': 405,
            'body': 'Method not allowed'
        }
    
    try:
        # Parse form data from SignalWire
        body = request.body.decode('utf-8') if hasattr(request, 'body') else ''
        data = parse_qs(body)
        
        # Extract webhook parameters
        call_sid = data.get('CallSid', [''])[0]
        call_status = data.get('CallStatus', [''])[0].lower()
        speech_result = data.get('SpeechResult', [''])[0]
        
        print(f"SignalWire Webhook - CallSid: {call_sid}, Status: {call_status}")
        
        # Handle speech results - check for balance information
        if speech_result:
            print(f"Speech transcribed: {speech_result}")
            balance_info = extract_balance_info(speech_result)
            if balance_info:
                print(f"Balance detected: {balance_info}")
                return generate_response(hangup_laml())
        
        # Handle call completion states
        if call_status in ['completed', 'failed', 'busy', 'no-answer']:
            print(f"Call ended with status: {call_status}")
            return generate_response(hangup_laml())
        
        # Handle in-progress calls - generate IVR navigation
        if call_status == 'in-progress':
            print("Generating IVR navigation LAML")
            
            # Static demo values - in production, retrieve from your database
            card_number = "1234567890123456"  
            zip_code = "12345"
            
            ivr_laml = generate_ivr_laml(card_number, zip_code)
            return generate_response(ivr_laml)
        
        # Default response for any other status
        return generate_response(hangup_laml())
        
    except Exception as e:
        print(f"Error handling webhook: {e}")
        return generate_response(hangup_laml())

def generate_response(xml_content):
    """Generate HTTP response with XML content."""
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'text/xml',
            'Access-Control-Allow-Origin': '*'
        },
        'body': xml_content
    }

def generate_ivr_laml(card_number, zip_code):
    """Generate LAML for IVR navigation with card and ZIP code."""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Pause length="6"/>
    <Play digits="9"/>
    <Pause length="3"/>
    <Play digits="{card_number}"/>
    <Pause length="5"/>
    <Play digits="{zip_code}"/>
    <Pause length="1"/>
    <Gather input="speech" timeout="45" speechTimeout="5" action="/api/voice" method="POST">
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
    """Extract balance information from speech text."""
    if not text:
        return ""
    
    text_lower = text.lower()
    
    # Common balance detection patterns
    balance_patterns = [
        r'current balance.*?is.*?(\$?[\d,]+\.?\d*)',
        r'account balance.*?is.*?(\$?[\d,]+\.?\d*)', 
        r'available balance.*?is.*?(\$?[\d,]+\.?\d*)',
        r'available credit.*?is.*?(\$?[\d,]+\.?\d*)',
        r'credit limit.*?is.*?(\$?[\d,]+\.?\d*)',
        r'balance.*?(\$?[\d,]+\.?\d*)',
        r'(\$[\d,]+\.?\d*)\s*dollars?',
        r'(\$[\d,]+\.?\d*)'
    ]
    
    # Try to extract specific amounts
    for pattern in balance_patterns:
        matches = re.findall(pattern, text_lower)
        if matches:
            amount = matches[0].strip()
            if not amount.startswith('$'):
                amount = f"${amount}"
            print(f"Extracted amount: {amount}")
            return amount
    
    # Check for financial keywords without specific amounts
    financial_keywords = ['balance', 'credit', 'available', 'limit', 'dollar', 'payment']
    if any(keyword in text_lower for keyword in financial_keywords):
        print(f"Financial keywords detected in: {text}")
        return f"Financial Info Detected: {text}"
    
    return "" 