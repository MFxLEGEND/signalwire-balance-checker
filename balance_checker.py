#!/usr/bin/env python3
from signalwire.rest import Client as signalwire_client
import time
import asyncio
import json
import logging
import nest_asyncio
from aiohttp import web

# Apply nest_asyncio to allow nested event loops
nest_asyncio.apply()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# SignalWire credentials
PROJECT_ID = "cd4c08db-07c7-4d54-b7e9-e3c902470cca"
API_TOKEN = "PT4b50e497c449268d57a151bcbd670a8d3f7c5a80ca756936"
SPACE_URL = "topple-solutions.signalwire.com"

# Call parameters
FROM_NUMBER = "+18083038566"
TO_NUMBER = "+18665701238"

# Webhook URL
WEBHOOK_URL = "https://still-troll-easily.ngrok-free.app"

# Global variables
balance_info = None
call_complete = asyncio.Event()
call_sid = None
client = None

def get_user_input():
    """Get card number and zip code from user"""
    print("\n=== Balance Checker ===")
    print("Please enter the following information:")
    while True:
        card_number = input("\nEnter card number (16 digits): ").strip()
        if len(card_number) == 16 and card_number.isdigit():
            break
        print("Invalid card number. Please enter exactly 16 digits.")
    
    while True:
        zip_code = input("Enter zip code (5 digits): ").strip()
        if len(zip_code) == 5 and zip_code.isdigit():
            break
        print("Invalid zip code. Please enter exactly 5 digits.")
    
    return card_number, zip_code

# Create web app for webhook
app = web.Application()
routes = web.RouteTableDef()

@routes.post('/voice')
async def handle_voice(request):
    """Handle incoming voice webhook"""
    try:
        # Get form data
        form = await request.post()
        logger.info(f"Received voice webhook: {form}")
        
        # Check for speech result
        if 'SpeechResult' in form:
            text = form['SpeechResult'].lower()
            if 'current balance' in text or 'available balance' in text:
                global balance_info
                balance_info = text
                logger.info(f"\nBalance Information Detected:\n{text}")
                call_complete.set()
                
                return web.Response(text="""
                    <?xml version="1.0" encoding="UTF-8"?>
                    <Response>
                        <Hangup/>
                    </Response>
                """, content_type='text/xml')
        
        # Check for Digits (DTMF)
        if 'Digits' in form:
            logger.info(f"DTMF received: {form['Digits']}")
            
        # Check for call status
        if 'CallStatus' in form:
            status = form['CallStatus']
            logger.info(f"Call status: {status}")
            if status in ['completed', 'failed']:
                call_complete.set()
    except Exception as e:
        logger.error(f"Error in voice webhook: {e}")
    
    return web.Response(text="""
        <?xml version="1.0" encoding="UTF-8"?>
        <Response>
            <Gather input="speech dtmf" timeout="30" speechTimeout="auto" speechModel="phone_call" enhanced="true" language="en-US">
                <Say>Waiting for balance information.</Say>
            </Gather>
            <Redirect>/voice</Redirect>
        </Response>
    """, content_type='text/xml')

app.add_routes(routes)

async def run_webserver():
    """Run the webhook webserver"""
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, 'localhost', 8080)
    await site.start()
    logger.info("Webhook server running on http://localhost:8080")

# TwiML for handling the call
def get_twiml(card_number, zip_code):
    """Get TwiML for the call"""
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
<Pause length="6"/>
<Play digits="9"/>
<Pause length="1"/>
<Play digits="{card_number}"/>
<Pause length="3"/>
<Play digits="{zip_code}"/>
<Redirect>{WEBHOOK_URL}/voice</Redirect>
</Response>"""

async def make_call(card_number, zip_code):
    """Make an outbound call and handle DTMF/transcription"""
    try:
        # Initialize SignalWire client
        global client, call_sid
        client = signalwire_client(PROJECT_ID, API_TOKEN, signalwire_space_url=SPACE_URL)
        
        # Make the call
        call = client.calls.create(
            from_=FROM_NUMBER,
            to=TO_NUMBER,
            twiml=get_twiml(card_number, zip_code),
            status_callback=f"{WEBHOOK_URL}/voice",
            status_callback_event=['completed', 'failed']
        )
        
        call_sid = call.sid
        logger.info("Call initiated successfully!")
        logger.info(f"Call SID: {call.sid}")

        # Wait for balance information
        try:
            await asyncio.wait_for(call_complete.wait(), timeout=120)
            logger.info("Call completed successfully with balance information")
            if balance_info:
                logger.info(f"Balance information: {balance_info}")
        except asyncio.TimeoutError:
            logger.error("Timeout waiting for balance information")
            
    except Exception as e:
        logger.error(f"Error during call: {e}")

async def main():
    try:
        # Get user input
        card_number, zip_code = get_user_input()
        
        # Start webhook server
        await run_webserver()
        
        # Make the call
        await make_call(card_number, zip_code)
        
        # Keep the server running for a bit to handle any pending webhooks
        await asyncio.sleep(5)
        
    except KeyboardInterrupt:
        logger.info("Stopping due to keyboard interrupt...")
    except Exception as e:
        logger.error(f"Error in main: {e}")

if __name__ == "__main__":
    asyncio.run(main())