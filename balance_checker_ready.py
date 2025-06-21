#!/usr/bin/env python3
"""
Balance Checker - Ready to Use
All API credentials pre-configured
"""

from signalwire.rest import Client as signalwire_client
import time
import asyncio
import logging
import nest_asyncio
from aiohttp import web
import re

nest_asyncio.apply()

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

# ===== CONFIGURED API CREDENTIALS =====
PROJECT_ID = "cd4c08db-07c7-4d54-b7e9-e3c902470cca"
API_TOKEN = "PT4b50e497c449268d57a151bcbd670a8d3f7c5a80ca756936"
SPACE_URL = "topple-solutions.signalwire.com"
FROM_NUMBER = "+18083038566"
TO_NUMBER = "+18665701238"
WEBHOOK_URL = "https://still-troll-easily.ngrok-free.app"

# Global variables
transcriptions = []
call_done = asyncio.Event()
dtmf_sent = False
card_number = ""
zip_code = ""

def get_user_info():
    """Get card number and zip from user"""
    global card_number, zip_code
    
    print("\n" + "="*50)
    print("🏦 BALANCE CHECKER")
    print("="*50)
    
    # Get card number
    while True:
        card = input("\n📱 Enter 16-digit card number: ").strip()
        card = re.sub(r'[^\d]', '', card)
        if len(card) == 16:
            card_number = card
            print(f"✅ Card: {card[:4]}****{card[-4:]}")
            break
        print("❌ Need exactly 16 digits")
    
    # Get zip code
    while True:
        zip_input = input("\n📍 Enter 5-digit zip code: ").strip()
        zip_clean = re.sub(r'[^\d]', '', zip_input)
        if len(zip_clean) == 5:
            zip_code = zip_clean
            print(f"✅ Zip: {zip_clean}")
            break
        print("❌ Need exactly 5 digits")
    
    print(f"\n🚀 Starting balance check...")

# Webhook handler
async def handle_voice(request):
    global dtmf_sent, card_number, zip_code
    
    try:
        form = await request.post()
        
        # Log data
        for key, value in form.items():
            logger.info(f"{key}: {value}")
        
        # Handle call status
        if 'CallStatus' in form:
            status = form['CallStatus']
            
            if status == 'completed':
                call_done.set()
                if transcriptions:
                    print("\n📋 TRANSCRIPTIONS:")
                    for t in transcriptions:
                        print(f"   {t}")
                return web.Response(text='<?xml version="1.0"?><Response><Hangup/></Response>', content_type='text/xml')
            
            # Send DTMF when connected
            if status == 'in-progress' and not dtmf_sent:
                dtmf_sent = True
                print("📞 Call connected, sending DTMF...")
                
                return web.Response(text=f'''<?xml version="1.0"?>
                <Response>
                    <Pause length="6"/>
                    <Play digits="9"/>
                    <Pause length="2"/>
                    <Play digits="{card_number}"/>
                    <Pause length="2"/>
                    <Play digits="{zip_code}"/>
                    <Pause length="3"/>
                    <Gather input="speech" timeout="15" language="en-US">
                        <Say></Say>
                    </Gather>
                    <Redirect>/voice</Redirect>
                </Response>''', content_type='text/xml')
        
        # Handle speech
        if 'SpeechResult' in form:
            text = form['SpeechResult'].lower()
            timestamp = time.strftime('%H:%M:%S')
            transcriptions.append(f"[{timestamp}] {text}")
            
            # Check for balance
            if any(word in text for word in ['balance', 'dollar', 'amount', '$']):
                print(f"\n💰 BALANCE: {text}")
    
    except Exception as e:
        logger.error(f"Error: {e}")
    
    # Keep listening
    return web.Response(text='''<?xml version="1.0"?>
    <Response>
        <Gather input="speech" timeout="15" language="en-US">
            <Say></Say>
        </Gather>
        <Redirect>/voice</Redirect>
    </Response>''', content_type='text/xml')

async def main():
    try:
        # Get user input
        get_user_info()
        
        # Start webhook server
        app = web.Application()
        app.router.add_post('/voice', handle_voice)
        runner = web.AppRunner(app)
        await runner.setup()
        site = web.TCPSite(runner, 'localhost', 8080)
        await site.start()
        print("🌐 Webhook server started")
        
        # Make call
        client = signalwire_client(PROJECT_ID, API_TOKEN, signalwire_space_url=SPACE_URL)
        call = client.calls.create(
            url=f"{WEBHOOK_URL}/voice",
            to=TO_NUMBER,
            from_=FROM_NUMBER
        )
        
        print(f"📞 Call started: {call.sid}")
        
        # Wait for completion
        await asyncio.wait_for(call_done.wait(), timeout=300)
        print("✅ Call completed!")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(main()) 