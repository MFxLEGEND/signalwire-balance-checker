#!/usr/bin/env python3
from signalwire.rest import Client as signalwire_client
import time
import asyncio
import json
import logging
import nest_asyncio
from aiohttp import web
import socket
import requests
from logging.handlers import RotatingFileHandler
import subprocess
import psutil
import os

# Apply nest_asyncio to allow nested event loops
nest_asyncio.apply()

# Configure logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Create console handler
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_formatter = logging.Formatter('%(levelname)s: %(message)s')
console_handler.setFormatter(console_formatter)
logger.addHandler(console_handler)

# Create file handler
file_handler = RotatingFileHandler('balance_checker.log', maxBytes=1024*1024, backupCount=5)
file_handler.setLevel(logging.DEBUG)
file_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
file_handler.setFormatter(file_formatter)
logger.addHandler(file_handler)

# SignalWire credentials
PROJECT_ID = "cd4c08db-07c7-4d54-b7e9-e3c902470cca"
API_TOKEN = "PT4b50e497c449268d57a151bcbd670a8d3f7c5a80ca756936"
SPACE_URL = "topple-solutions.signalwire.com"

# Call parameters
FROM_NUMBER = "+18083038566"
TO_NUMBER = "+18665701238"

# Global variables
transcription_log = []  # Store all transcriptions
call_complete = asyncio.Event()
call_sid = None
client = None
dtmf_sent = False  # Track if we've sent DTMF
balance_found = False  # Track if we've found balance information

def kill_ngrok_processes():
    """Kill any existing ngrok processes"""
    for proc in psutil.process_iter(['pid', 'name']):
        try:
            if 'ngrok' in proc.info['name'].lower():
                logger.info(f"Killing existing ngrok process: {proc.info['pid']}")
                psutil.Process(proc.info['pid']).kill()
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass

def kill_processes_on_port(port):
    """Kill any processes using the specified port"""
    for proc in psutil.process_iter(['pid']):
        try:
            # Get connections without asking for them in process_iter
            connections = proc.net_connections()  # Using net_connections instead of connections
            for conn in connections:
                if hasattr(conn, 'laddr') and len(conn.laddr) >= 2 and conn.laddr[1] == port:
                    logger.info(f"Killing process using port {port}: {proc.pid}")
                    proc.kill()
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass

# Create web app for webhook
app = web.Application()
routes = web.RouteTableDef()

@routes.get('/')
async def handle_root(request):
    """Handle root path for testing"""
    logger.info("Root path accessed")
    return web.Response(text="Webhook server is running", content_type='text/plain')

@routes.post('/test')
async def handle_test(request):
    """Handle test webhook"""
    try:
        form = await request.post()
        logger.info("=== Test Webhook Data Start ===")
        for key, value in form.items():
            logger.info(f"{key}: {value}")
        logger.info("=== Test Webhook Data End ===")
        return web.Response(text="Test webhook received", content_type='text/plain')
    except Exception as e:
        logger.error(f"Error in test webhook: {e}")
        return web.Response(text=str(e), status=500)

@routes.post('/voice')
async def voice_webhook(request):
    """Handle incoming voice webhooks"""
    global dtmf_sent, balance_found
    
    try:
        # Get form data
        form = await request.post()
        
        # Log all webhook data
        logger.info("=== Webhook Data Start ===")
        for key, value in form.items():
            logger.info(f"{key}: {value}")
        logger.info("=== Webhook Data End ===")
        
        # Check for call status
        if 'CallStatus' in form:
            status = form['CallStatus']
            timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
            logger.info(f"[{timestamp}] Call status: {status}")
            
            if status == 'completed':
                # Only set call complete when the call is actually done
                call_complete.set()
                # Log all transcriptions
                if transcription_log:
                    logger.info("\nComplete Call Transcription:")
                    for entry in transcription_log:
                        logger.info(entry)
                return web.Response(text="""
                    <?xml version="1.0" encoding="UTF-8"?>
                    <Response>
                        <Hangup/>
                    </Response>
                """, content_type='text/xml')
            
            # If call is in-progress and we haven't sent DTMF, send it
            if status == 'in-progress' and not dtmf_sent:
                dtmf_sent = True
                # Send DTMF sequence with appropriate pauses and enable transcription
                return web.Response(text="""
                    <?xml version="1.0" encoding="UTF-8"?>
                    <Response>
                        <Pause length="8"/>
                        <Play digits="9"/>
                        <Pause length="3"/>
                        <Play digits="5119604801904455"/>
                        <Pause length="3"/>
                        <Play digits="75979"/>
                        <Pause length="2"/>
                        <Gather input="speech" timeout="10" speechTimeout="3" speechModel="phone_call" enhanced="true" language="en-US" hints="dollar,dollars,balance,amount,total">
                            <Say></Say>
                        </Gather>
                        <Redirect>/voice</Redirect>
                    </Response>
                """, content_type='text/xml')
    
    except Exception as e:
        logger.error(f"Error in voice webhook: {e}")
    
    # Default response with speech recognition
    return web.Response(text="""
        <?xml version="1.0" encoding="UTF-8"?>
        <Response>
            <Gather input="speech" timeout="10" speechTimeout="3" speechModel="phone_call" enhanced="true" language="en-US" hints="dollar,dollars,balance,amount,total">
                <Say></Say>
            </Gather>
            <Redirect>/voice</Redirect>
        </Response>
    """, content_type='text/xml')

@routes.post('/gather')
async def gather_webhook(request):
    """Handle speech recognition results"""
    try:
        # Get form data
        form = await request.post()
        
        # Log gather data
        logger.info("=== Gather Data Start ===")
        for key, value in form.items():
            logger.info(f"{key}: {value}")
        logger.info("=== Gather Data End ===")
        
        # Get speech result
        if 'SpeechResult' in form:
            text = form['SpeechResult'].lower()
            timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
            transcription_log.append(f"[{timestamp}] {text}")
            logger.info(f"\nTranscription: {text}")
            
            # Look for balance information with more variations and number patterns
            balance_indicators = [
                'current balance', 'available balance', 
                'your balance', 'account balance',
                'balance is', 'balance of',
                'have a balance', 'remaining balance',
                'balance in', 'balance on',
                'total balance', 'checking balance',
                'savings balance', 'credit balance',
                'dollar', 'dollars', '$',
                'amount', 'total'
            ]
            
            # Also look for patterns that might indicate a balance amount
            has_amount = any(word.replace(',', '').replace('.', '').isdigit() for word in text.split())
            has_indicator = any(indicator in text for indicator in balance_indicators)
            
            if has_indicator or has_amount:
                balance_found = True
                logger.info(f"\nBalance Information Detected:\n{text}")
                
                # Keep listening for a bit longer
                return web.Response(text="""
                    <?xml version="1.0" encoding="UTF-8"?>
                    <Response>
                        <Gather input="speech" timeout="10" speechTimeout="3" speechModel="phone_call" enhanced="true" language="en-US" hints="dollar,dollars,balance,amount,total">
                            <Say></Say>
                        </Gather>
                        <Redirect>/voice</Redirect>
                    </Response>
                """, content_type='text/xml')
    
    except Exception as e:
        logger.error(f"Error in gather webhook: {e}")
    
    # Continue gathering speech
    return web.Response(text="""
        <?xml version="1.0" encoding="UTF-8"?>
        <Response>
            <Gather input="speech" timeout="10" speechTimeout="3" speechModel="phone_call" enhanced="true" language="en-US" hints="dollar,dollars,balance,amount,total">
                <Say></Say>
            </Gather>
            <Redirect>/voice</Redirect>
        </Response>
    """, content_type='text/xml')

app.add_routes([
    web.post('/voice', voice_webhook),
    web.post('/gather', gather_webhook)
])

def get_initial_twiml():
    """Get TwiML for sending DTMF"""
    return """<?xml version="1.0" encoding="UTF-8"?>
<Response>
<Pause length="2"/>
<Play digits="9"/>
<Pause length="2"/>
<Play digits="5119604801904455"/>
<Pause length="3"/>
<Play digits="75979"/>
<Gather input="speech" timeout="5" speechTimeout="2" speechModel="phone_call" enhanced="true" language="en-US">
    <Say></Say>
</Gather>
<Redirect>/voice</Redirect>
</Response>"""

async def setup_local_tunnel():
    """Set up local tunnel with ngrok"""
    try:
        # Kill any existing ngrok processes
        kill_ngrok_processes()
        await asyncio.sleep(2)  # Wait for processes to be killed
        
        # Kill any processes using our target port
        port = 9090  # Using a different port
        kill_processes_on_port(port)
        await asyncio.sleep(2)  # Wait for processes to be killed
        
        # Start local server
        runner = web.AppRunner(app)
        await runner.setup()
        site = web.TCPSite(runner, 'localhost', port)
        await site.start()
        logger.info(f"Local webhook server running on http://localhost:{port}")
        
        # Start ngrok
        process = subprocess.Popen(
            ['ngrok', 'http', str(port)],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            creationflags=subprocess.CREATE_NEW_PROCESS_GROUP  # Windows-specific
        )
        
        # Wait for ngrok to start
        await asyncio.sleep(5)  # Give ngrok time to start
        
        # Get tunnel URL
        max_retries = 10
        retry_delay = 2
        tunnel_url = None
        
        for attempt in range(max_retries):
            try:
                response = requests.get('http://localhost:4040/api/tunnels')
                tunnels = response.json()['tunnels']
                if tunnels:
                    tunnel_url = tunnels[0]['public_url']
                    logger.info(f"ngrok tunnel established at: {tunnel_url}")
                    break
            except Exception as e:
                logger.warning(f"Attempt {attempt + 1} failed to get tunnel URL: {e}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(retry_delay)
        
        if not tunnel_url:
            raise Exception("Failed to get ngrok tunnel URL")
        
        # Return a tunnel-like object
        class Tunnel:
            def __init__(self, url, proc):
                self.public_url = url
                self.process = proc
        
        return Tunnel(tunnel_url, process)
        
    except Exception as e:
        logger.error(f"Error setting up local tunnel: {e}")
        raise

async def make_call(webhook_url):
    """Make outbound call with SignalWire"""
    global client, call_sid
    
    try:
        # Initialize SignalWire client
        client = signalwire_client(PROJECT_ID, API_TOKEN, signalwire_space_url=SPACE_URL)
        
        # Make the call with speech recognition
        call = client.calls.create(
            url=f"{webhook_url}/voice",
            to=TO_NUMBER,
            from_=FROM_NUMBER,
            record=True,
            timeout=300  # 5 minute timeout
        )
        
        call_sid = call.sid
        logger.info("Call initiated successfully!")
        logger.info(f"Call SID: {call.sid}")

        # Wait for call to complete with increased timeout
        try:
            await asyncio.wait_for(call_complete.wait(), timeout=600)  # 10 minutes timeout
            logger.info("Call completed")
            if transcription_log:
                logger.info("\nFinal Call Transcription:")
                for entry in transcription_log:
                    logger.info(entry)
        except asyncio.TimeoutError:
            logger.error("Timeout waiting for call to complete")
            # Try to end the call gracefully
            try:
                if client and call_sid:
                    client.calls(call_sid).update(status='completed')
            except Exception as e:
                logger.error(f"Error ending call: {e}")
            
    except Exception as e:
        logger.error(f"Error during call: {e}")
        raise

async def main():
    tunnel = None
    try:
        # Set up local tunnel
        tunnel = await setup_local_tunnel()
        
        # Make the call
        await make_call(tunnel.public_url)
        
        # Keep the server running for a bit to handle any pending webhooks
        await asyncio.sleep(5)
        
    except KeyboardInterrupt:
        logger.info("Stopping due to keyboard interrupt...")
    except Exception as e:
        logger.error(f"Error in main: {e}")
    finally:
        # Clean up
        try:
            if tunnel and hasattr(tunnel, 'process'):
                tunnel.process.terminate()
                await asyncio.sleep(1)  # Give process time to terminate
        except:
            pass
        kill_ngrok_processes()
        kill_processes_on_port(9090)

if __name__ == "__main__":
    asyncio.run(main())