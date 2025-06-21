# webhook_server.py: To run the web server that listens for SignalWire events 

import logging
import re
from aiohttp import web, web_request
from typing import Dict
from call_manager import CallSession, CallStatus
from config import (PAUSE_AFTER_PICKUP, PAUSE_BETWEEN_DTMF, INITIAL_DTMF_KEY, 
                   PAUSE_AFTER_INITIAL_DTMF, PAUSE_FOR_ZIP_PROMPT, BALANCE_KEYWORDS)


class WebhookServer:
    """Handles SignalWire webhook events for voice calls."""
    
    def __init__(self):
        self.active_calls: Dict[str, CallSession] = {}
        self.app = web.Application()
        self.app.router.add_post('/voice', self.handle_voice_webhook)
    
    def register_call(self, call_sid: str, session: CallSession):
        """Register a new call session."""
        self.active_calls[call_sid] = session
        logging.info(f"Registered call session: {call_sid}")
    
    def unregister_call(self, call_sid: str):
        """Remove a completed call session."""
        if call_sid in self.active_calls:
            del self.active_calls[call_sid]
            logging.info(f"Unregistered call session: {call_sid}")
    
    async def handle_voice_webhook(self, request: web_request.Request):
        """Handle incoming SignalWire voice webhook events."""
        try:
            # Parse form data from SignalWire
            data = await request.post()
            call_sid = data.get('CallSid', '')
            call_status = data.get('CallStatus', '').lower()
            speech_result = data.get('SpeechResult', '')
            
            logging.info(f"Webhook received - CallSid: {call_sid}, Status: {call_status}")
            
            # Find the corresponding call session
            session = self.active_calls.get(call_sid)
            if not session:
                logging.warning(f"No session found for CallSid: {call_sid}")
                return web.Response(text=self._generate_hangup_laml(), content_type='text/xml')
            
            # Handle speech results
            if speech_result:
                session.add_transcription(speech_result)
                logging.info(f"Speech transcribed: {speech_result}")
                
                # Check for both current balance and available credit
                balance_info = self._extract_balance_info(speech_result)
                if balance_info:
                    session.set_completed(balance_info)
                    self.unregister_call(call_sid)
                    return web.Response(text=self._generate_hangup_laml(), content_type='text/xml')
            
            # Handle call status updates
            if call_status in ['completed', 'failed', 'busy', 'no-answer']:
                if session.status != CallStatus.COMPLETED:
                    session.set_failed(f"Call ended with status: {call_status}")
                self.unregister_call(call_sid)
                return web.Response(text=self._generate_hangup_laml(), content_type='text/xml')
            
            # Generate LAML for in-progress calls
            if call_status == 'in-progress':
                session.set_in_progress(call_sid)
                laml_response = self._generate_ivr_laml(session)
                return web.Response(text=laml_response, content_type='text/xml')
            
            # Default response
            return web.Response(text=self._generate_hangup_laml(), content_type='text/xml')
            
        except Exception as e:
            logging.error(f"Error handling webhook: {e}")
            return web.Response(text=self._generate_hangup_laml(), content_type='text/xml')
    
    def _generate_ivr_laml(self, session: CallSession) -> str:
        """Generate LAML/TwiML to navigate IVR system with specific sequence."""
        card_number = session.card_number
        zip_code = session.zip_code
        
        laml = f'''<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Pause length="{PAUSE_AFTER_PICKUP}"/>
    <Play digits="{INITIAL_DTMF_KEY}"/>
    <Pause length="{PAUSE_AFTER_INITIAL_DTMF}"/>
    <Play digits="{card_number}"/>
    <Pause length="{PAUSE_FOR_ZIP_PROMPT}"/>
    <Play digits="{zip_code}"/>
    <Pause length="{PAUSE_BETWEEN_DTMF}"/>
    <Gather input="speech" timeout="45" speechTimeout="5" action="/voice" method="POST">
        <Say>Please wait while we retrieve your balance information.</Say>
    </Gather>
    <Hangup/>
</Response>'''
        return laml
    
    def _generate_hangup_laml(self) -> str:
        """Generate LAML to end the call."""
        return '''<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Hangup/>
</Response>'''
    
    def _extract_balance_info(self, text: str) -> str:
        """Extract both current balance and available credit information from speech."""
        if not text:
            return ""
        
        text_lower = text.lower()
        extracted_info = {}
        
        # Comprehensive patterns for different types of financial information
        financial_patterns = {
            'current_balance': [
                r'current balance.*?(?:is|of)?\s*(\$?[\d,]+\.?\d*)',
                r'account balance.*?(?:is|of)?\s*(\$?[\d,]+\.?\d*)',
                r'your balance.*?(?:is|of)?\s*(\$?[\d,]+\.?\d*)',
                r'balance.*?(?:is|of)?\s*(\$?[\d,]+\.?\d*)',
                r'outstanding balance.*?(?:is|of)?\s*(\$?[\d,]+\.?\d*)',
            ],
            'available_credit': [
                r'available credit.*?(?:is|of)?\s*(\$?[\d,]+\.?\d*)',
                r'credit available.*?(?:is|of)?\s*(\$?[\d,]+\.?\d*)',
                r'available.*?credit.*?(?:is|of)?\s*(\$?[\d,]+\.?\d*)',
                r'remaining credit.*?(?:is|of)?\s*(\$?[\d,]+\.?\d*)',
                r'credit remaining.*?(?:is|of)?\s*(\$?[\d,]+\.?\d*)',
            ],
            'credit_limit': [
                r'credit limit.*?(?:is|of)?\s*(\$?[\d,]+\.?\d*)',
                r'spending limit.*?(?:is|of)?\s*(\$?[\d,]+\.?\d*)',
                r'total credit.*?(?:is|of)?\s*(\$?[\d,]+\.?\d*)',
                r'limit.*?(?:is|of)?\s*(\$?[\d,]+\.?\d*)',
            ],
            'available_balance': [
                r'available balance.*?(?:is|of)?\s*(\$?[\d,]+\.?\d*)',
                r'total available.*?(?:is|of)?\s*(\$?[\d,]+\.?\d*)',
                r'available.*?balance.*?(?:is|of)?\s*(\$?[\d,]+\.?\d*)',
            ]
        }
        
        # Generic currency patterns as fallback
        generic_patterns = [
            r'(\$?[\d,]+\.?\d*)\s*dollars?',
            r'(\$?[\d,]+\.?\d*)\s*cents?',
            r'\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
            r'(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*dollars?'
        ]
        
        # Extract specific financial information
        for info_type, patterns in financial_patterns.items():
            for pattern in patterns:
                matches = re.findall(pattern, text_lower)
                if matches:
                    # Clean up the amount (remove $ if present, add if missing)
                    amount = matches[0].strip()
                    if not amount.startswith('$'):
                        amount = f"${amount}"
                    
                    extracted_info[info_type] = amount
                    logging.info(f"Extracted {info_type}: {amount} from text: {text}")
                    break
        
        # If we found specific financial info, format it nicely
        if extracted_info:
            result_parts = []
            
            # Prioritize the order of information display
            priority_order = ['current_balance', 'available_balance', 'available_credit', 'credit_limit']
            
            for info_type in priority_order:
                if info_type in extracted_info:
                    display_name = info_type.replace('_', ' ').title()
                    result_parts.append(f"{display_name}: {extracted_info[info_type]}")
            
            # Add any other types found
            for info_type, amount in extracted_info.items():
                if info_type not in priority_order:
                    display_name = info_type.replace('_', ' ').title()
                    result_parts.append(f"{display_name}: {amount}")
            
            result = " | ".join(result_parts)
            logging.info(f"Final extracted info: {result}")
            return result
        
        # Fallback: Try generic patterns if we detect financial keywords
        if any(keyword in text_lower for keyword in BALANCE_KEYWORDS):
            for pattern in generic_patterns:
                matches = re.findall(pattern, text_lower)
                if matches:
                    amount = matches[0].strip()
                    if not amount.startswith('$'):
                        amount = f"${amount}"
                    
                    logging.info(f"Generic financial info extracted: {amount} from text: {text}")
                    return f"Financial Info: {amount}"
        
        # Last resort: Check if text contains financial keywords
        financial_keywords_found = [kw for kw in BALANCE_KEYWORDS if kw in text_lower]
        if financial_keywords_found:
            logging.info(f"Financial keywords detected but no amounts extracted: {financial_keywords_found}")
            logging.info(f"Full text for manual review: {text}")
            return f"Financial Info Detected: {text}"  # Return full text for manual review
        
        return "" 