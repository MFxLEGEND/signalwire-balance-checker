# main.py: The primary entry point for starting the application 

import asyncio
import logging
import signal
import sys
import time
import subprocess
import os
import re
from datetime import datetime
from aiohttp import web
from signalwire.rest import Client
from call_manager import CallSession, CallStatus
from webhook_server import WebhookServer
from utils import setup_results_file, load_card_data, write_result
import config


class BalanceChecker:
    """Main application class for orchestrating IVR balance checking."""
    
    def __init__(self):
        self.webhook_server = WebhookServer()
        self.signalwire_client = None
        self.semaphore = asyncio.Semaphore(config.CONCURRENT_CALLS)
        self.running = True
        self.call_counter = 0
        self.total_calls = 0
        self.start_time = None
        
    def setup_logging(self):
        """Configure logging to both console and file."""
        # Create custom formatter
        class CustomFormatter(logging.Formatter):
            def format(self, record):
                # Add timestamp and clean formatting
                timestamp = datetime.now().strftime('%H:%M:%S')
                if record.levelname == 'INFO':
                    return f"[{timestamp}] {record.getMessage()}"
                else:
                    return f"[{timestamp}] {record.levelname}: {record.getMessage()}"
        
        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            handlers=[
                logging.FileHandler(config.LOG_FILE),
                logging.StreamHandler(sys.stdout)
            ]
        )
        
        # Apply custom formatter to console handler
        for handler in logging.getLogger().handlers:
            if isinstance(handler, logging.StreamHandler):
                handler.setFormatter(CustomFormatter())
        
        self._print_header()
    
    def _print_header(self):
        """Print a neat application header."""
        print("\n" + "="*70)
        print("🔄 BALANCE CHECKER - AUTOMATED CALL SYSTEM")
        print("="*70)
        print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🔗 Webhook Port: {config.WEBHOOK_PORT}")
        print(f"📞 Max Concurrent Calls: {config.CONCURRENT_CALLS}")
        print("="*70 + "\n")
    
    def _check_webhook_deployment(self):
        """Check if webhook needs to be deployed automatically."""
        placeholder_urls = [
            "https://your-webhook.railway.app",
            "https://your-webhook-url.railway.app", 
            "https://your-actual-railway-url.railway.app"
        ]
        
        return config.WEBHOOK_BASE_URL in placeholder_urls
    
    def _install_railway_cli(self):
        """Install Railway CLI if not present."""
        try:
            # Check if Railway CLI is already installed
            result = subprocess.run(['railway', '--version'], 
                                   capture_output=True, text=True, shell=True)
            if result.returncode == 0:
                print("✅ Railway CLI ready")
                return True
        except:
            pass
        
        print("📦 Installing Railway CLI (this may take 30 seconds)...")
        try:
            # Install Railway CLI via npm
            result = subprocess.run(['npm', 'install', '-g', '@railway/cli'], 
                                   capture_output=True, text=True, shell=True)
            if result.returncode == 0:
                print("✅ Railway CLI installed successfully")
                return True
            else:
                print(f"❌ Failed to install Railway CLI")
                print(f"   Error: {result.stderr.strip()}")
                print("💡 Please ensure Node.js is installed: https://nodejs.org")
                return False
        except Exception as e:
            print(f"❌ Error installing Railway CLI: {e}")
            print("💡 Please install Node.js first: https://nodejs.org")
            return False
    
    def _deploy_webhook_to_railway(self):
        """Automatically deploy webhook to Railway."""
        webhook_dir = os.path.join(os.path.dirname(__file__), '..', 'cloud-webhook')
        
        if not os.path.exists(webhook_dir):
            print("❌ cloud-webhook directory not found")
            return None
        
        try:
            print("🚀 Deploying webhook to Railway...")
            print("   This may take 1-2 minutes...")
            
            # Change to webhook directory
            original_dir = os.getcwd()
            os.chdir(webhook_dir)
            
            # Set Railway token as environment variable
            railway_token = "6ce3ddc0-6d5c-41c8-9c16-dac5ba47b7a9"
            os.environ['RAILWAY_TOKEN'] = railway_token
            
            # Check if already logged in or use token
            result = subprocess.run(['railway', 'whoami'], 
                                   capture_output=True, text=True, shell=True)
            
            if result.returncode != 0:
                print("🔐 Authenticating with Railway using API token...")
                # Login using the token
                login_result = subprocess.run(['railway', 'login', '--token', railway_token], 
                                            capture_output=True, text=True, shell=True)
                if login_result.returncode != 0:
                    print("❌ Railway authentication failed")
                    print(f"   Error: {login_result.stderr.strip()}")
                    return None
                print("✅ Railway authentication successful")
            
            # Create or link to project
            print("🔗 Setting up Railway project...")
            project_result = subprocess.run(['railway', 'project', 'create', '--name', 'signalwire-webhook'], 
                                          capture_output=True, text=True, shell=True)
            
            if project_result.returncode != 0:
                # Project might already exist, try to link
                link_result = subprocess.run(['railway', 'link'], 
                                           capture_output=True, text=True, shell=True, input='\n')
                if link_result.returncode != 0:
                    print("⚠️  Project setup had issues, continuing with deployment...")
            
            # Deploy the webhook
            print("🌐 Deploying to Railway cloud...")
            deploy_result = subprocess.run(['railway', 'up', '--detached'], 
                                         capture_output=True, text=True, shell=True)
            
            if deploy_result.returncode == 0:
                print("✅ Deployment initiated successfully!")
                
                # Wait a moment and then get the domain
                print("⏳ Waiting for deployment to complete...")
                time.sleep(10)
                
                # Get the deployment URL
                url_result = subprocess.run(['railway', 'domain'], 
                                          capture_output=True, text=True, shell=True)
                
                if url_result.returncode == 0 and url_result.stdout.strip():
                    # Extract URL from output
                    output = url_result.stdout.strip()
                    url_match = re.search(r'https://[^\s]+', output)
                    if url_match:
                        deployed_url = url_match.group(0)
                        print(f"✅ Webhook deployed successfully!")
                        print(f"🌐 URL: {deployed_url}")
                        return deployed_url
                
                # If domain command didn't work, try to generate one
                print("🔗 Generating public domain...")
                domain_gen_result = subprocess.run(['railway', 'domain', 'generate'], 
                                                 capture_output=True, text=True, shell=True)
                
                if domain_gen_result.returncode == 0:
                    time.sleep(5)  # Wait for domain to propagate
                    url_result = subprocess.run(['railway', 'domain'], 
                                              capture_output=True, text=True, shell=True)
                    if url_result.returncode == 0:
                        output = url_result.stdout.strip()
                        url_match = re.search(r'https://[^\s]+', output)
                        if url_match:
                            deployed_url = url_match.group(0)
                            print(f"✅ Webhook deployed with generated domain!")
                            print(f"🌐 URL: {deployed_url}")
                            return deployed_url
                
                print("✅ Deployment completed!")
                print("📋 Please check Railway dashboard for your webhook URL at: https://railway.app/dashboard")
                print("🔍 Look for your 'signalwire-webhook' service")
                return "DEPLOYED_BUT_URL_UNKNOWN"
            else:
                print(f"❌ Deployment failed")
                print(f"   Error: {deploy_result.stderr.strip()}")
                return None
                
        except Exception as e:
            print(f"❌ Error during deployment: {e}")
            return None
        finally:
            # Return to original directory
            os.chdir(original_dir)
    
    def _update_config_with_webhook_url(self, webhook_url):
        """Update config.py with the new webhook URL."""
        try:
            config_path = os.path.join(os.path.dirname(__file__), 'config.py')
            
            # Read current config
            with open(config_path, 'r') as f:
                content = f.read()
            
            # Replace the webhook URL
            old_pattern = r'WEBHOOK_BASE_URL = "https://[^"]*"'
            new_line = f'WEBHOOK_BASE_URL = "{webhook_url}"'
            
            updated_content = re.sub(old_pattern, new_line, content)
            
            # Write back to file
            with open(config_path, 'w') as f:
                f.write(updated_content)
            
            # Update the config module in memory
            config.WEBHOOK_BASE_URL = webhook_url
            
            print(f"✅ Config updated with webhook URL: {webhook_url}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to update config: {e}")
            return False
    
    def setup_webhook_deployment(self):
        """Handle automatic webhook deployment if needed."""
        if not self._check_webhook_deployment():
            print("✅ Webhook URL already configured")
            return True
        
        print("🔍 Detected placeholder webhook URL - starting automatic deployment...")
        print("\n" + "="*60)
        print("🚀 AUTOMATIC RAILWAY WEBHOOK DEPLOYMENT")
        print("="*60)
        print("🤖 Auto-deploying webhook to Railway...")
        print("   (This will take 1-2 minutes)")
        print("="*60)
        
        # Install Railway CLI
        if not self._install_railway_cli():
            return False
        
        # Deploy webhook
        deployed_url = self._deploy_webhook_to_railway()
        
        if deployed_url and deployed_url != "DEPLOYED_BUT_URL_UNKNOWN":
            # Update config
            if self._update_config_with_webhook_url(deployed_url):
                print("\n" + "="*60)
                print("✅ WEBHOOK DEPLOYMENT COMPLETE!")
                print("="*60)
                print(f"🌐 Your webhook is now live at: {deployed_url}")
                print("🎉 Continuing with balance checking...")
                print("="*60 + "\n")
                return True
        elif deployed_url == "DEPLOYED_BUT_URL_UNKNOWN":
            print("\n⚠️  Deployment completed but URL detection failed")
            print("📋 Please manually update config.py with your Railway URL")
            print("🌐 Check your Railway dashboard for the webhook URL")
            return False
        
        print("❌ Automatic deployment failed")
        print("💡 Fallback options:")
        print("   1. Restart the script (it will retry)")
        print("   2. Manual deploy: cd cloud-webhook && railway login && railway up")
        print("   3. Use one-click deploy: https://railway.app/template/python-flask")
        return False
    
    def setup_signalwire_client(self):
        """Initialize SignalWire client with credentials from config."""
        if not all([config.PROJECT_ID, config.API_TOKEN, config.SPACE_URL]):
            raise ValueError("Missing SignalWire credentials in config.py")
        
        print("🔧 Initializing SignalWire client...")
        self.signalwire_client = Client(
            config.PROJECT_ID,
            config.API_TOKEN,
            signalwire_space_url=config.SPACE_URL
        )
        print("✅ SignalWire client ready")
    
    async def start_webhook_server(self):
        """Start the webhook server as a background task."""
        print("🌐 Starting webhook server...")
        runner = web.AppRunner(self.webhook_server.app)
        await runner.setup()
        site = web.TCPSite(runner, 'localhost', config.WEBHOOK_PORT)
        await site.start()
        print(f"✅ Webhook server online at http://localhost:{config.WEBHOOK_PORT}")
        return runner
    
    async def initiate_call(self, session: CallSession):
        """Initiate a SignalWire call for the given session."""
        try:
            # Show call initiation
            masked_card = f"****{session.card_number[-4:]}"
            print(f"📞 Initiating call for card {masked_card} (ZIP: {session.zip_code})")
            
            webhook_url = f"{config.WEBHOOK_BASE_URL}/voice"
            
            call = self.signalwire_client.calls.create(
                from_=config.FROM_NUMBER,
                to=config.TO_NUMBER,
                url=webhook_url,
                timeout=config.CALL_TIMEOUT
            )
            
            session.set_in_progress(call.sid)
            self.webhook_server.register_call(call.sid, session)
            
            # Success message with call ID
            short_call_id = call.sid[-8:] if len(call.sid) > 8 else call.sid
            print(f"   ✅ Call connected! ID: {short_call_id}")
            
            return call.sid
            
        except Exception as e:
            print(f"   ❌ Call failed: {str(e)[:50]}...")
            logging.error(f"Failed to initiate call for card {session.card_number}: {e}")
            session.set_failed(f"API Error: {e}")
            return None
    
    async def process_call(self, card_number: str, zip_code: str):
        """Process a single card balance check call."""
        async with self.semaphore:
            session = CallSession(card_number, zip_code)
            call_start_time = time.time()
            
            # Increment and show progress
            self.call_counter += 1
            progress = f"({self.call_counter}/{self.total_calls})"
            
            try:
                # Initiate the call with progress indicator
                print(f"\n🎯 Processing {progress}")
                call_sid = await self.initiate_call(session)
                if not call_sid:
                    print(f"   ⏩ Skipping due to initiation failure")
                    write_result(card_number, zip_code, "", "FAILED", session.transcription_log)
                    return
                
                # Show waiting status
                print(f"   ⏳ Waiting for call completion...")
                
                # Wait for call completion with timeout
                try:
                    await asyncio.wait_for(session.completion_event.wait(), timeout=config.CALL_TIMEOUT)
                except asyncio.TimeoutError:
                    print(f"   ⏰ Call timed out after {config.CALL_TIMEOUT}s")
                    session.set_failed("Timeout")
                
                # Calculate duration
                duration = round(time.time() - call_start_time, 1)
                
                # Show final result
                status_str = session.status.value if hasattr(session.status, 'value') else str(session.status)
                
                if session.status == CallStatus.COMPLETED:
                    balance_display = session.detected_balance or "Not detected"
                    print(f"   ✅ COMPLETED in {duration}s - Balance: {balance_display}")
                elif session.status == CallStatus.FAILED:
                    print(f"   ❌ FAILED in {duration}s - {session.failure_reason}")
                else:
                    print(f"   ⚠️  {status_str.upper()} in {duration}s")
                
                # Write results
                write_result(
                    card_number, 
                    zip_code, 
                    session.detected_balance, 
                    status_str, 
                    session.transcription_log
                )
                
            except Exception as e:
                duration = round(time.time() - call_start_time, 1)
                print(f"   💥 ERROR in {duration}s: {str(e)[:50]}...")
                logging.error(f"Error processing card {card_number}: {e}")
                write_result(card_number, zip_code, "", "ERROR", [str(e)])
            
            finally:
                # Clean up
                if session.call_sid:
                    self.webhook_server.unregister_call(session.call_sid)
    
    def _print_progress_header(self, total_calls):
        """Print progress tracking header."""
        print(f"\n🚀 STARTING BATCH PROCESSING")
        print(f"📊 Total cards to process: {total_calls}")
        print(f"⚡ Concurrent calls: {config.CONCURRENT_CALLS}")
        print(f"⏱️  Timeout per call: {config.CALL_TIMEOUT}s")
        print("-" * 50)
    
    def _print_completion_summary(self):
        """Print completion summary."""
        duration = round(time.time() - self.start_time, 1)
        print(f"\n" + "="*50)
        print(f"🏁 BATCH PROCESSING COMPLETE")
        print(f"⏱️  Total time: {duration}s")
        print(f"📞 Calls processed: {self.call_counter}")
        if duration > 0:
            rate = round(self.call_counter / duration * 60, 1)
            print(f"📈 Average rate: {rate} calls/minute")
        print("="*50)
    
    async def run_producer(self, card_data):
        """Producer task to process all cards concurrently."""
        self.total_calls = len(card_data)
        self.call_counter = 0
        self.start_time = time.time()
        
        self._print_progress_header(self.total_calls)
        
        tasks = []
        
        for card_number, zip_code in card_data:
            if not self.running:
                break
                
            task = asyncio.create_task(self.process_call(card_number, zip_code))
            tasks.append(task)
        
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
        
        self._print_completion_summary()
    
    def handle_shutdown(self, signum, frame):
        """Handle shutdown signals gracefully."""
        print(f"\n⚠️  Received shutdown signal {signum}")
        print("🛑 Gracefully stopping all operations...")
        self.running = False
    
    async def run(self):
        """Main application entry point."""
        try:
            # Setup
            print("🔧 Step 1: Setting up logging...")
            self.setup_logging()
            
            print("🔧 Step 2: Setting up results file...")
            setup_results_file()
            
            print("🔧 Step 3: Checking webhook deployment...")
            if not self.setup_webhook_deployment():
                print("⚠️  Webhook deployment required but not completed")
                print("📋 Please deploy manually or restart with 'y' to auto-deploy")
                return
            
            print("🔧 Step 4: Setting up SignalWire client...")
            self.setup_signalwire_client()
            
            # Load card data
            print("📁 Step 5: Loading card data...")
            card_data = load_card_data(config.CARD_DATA_FILE)
            if not card_data:
                print("❌ No card data found. Please check your data file.")
                return
            print(f"✅ Loaded {len(card_data)} cards")
            
            # Start webhook server
            print("🌐 Step 6: Starting webhook server...")
            runner = await self.start_webhook_server()
            
            # Give the webhook server time to fully initialize
            print("⏳ Step 7: Initializing webhook server...")
            await asyncio.sleep(2)
            print("✅ System ready for call processing!")
            
            try:
                # Run the producer
                print("🚀 Step 8: Running call producer...")
                await self.run_producer(card_data)
            finally:
                # Cleanup webhook server
                print("🔄 Shutting down webhook server...")
                await runner.cleanup()
                print("✅ Webhook server stopped")
                
        except KeyboardInterrupt:
            print("\n🛑 Application interrupted by user")
        except Exception as e:
            print(f"\n💥 Critical error: {e}")
            logging.error(f"Application error: {e}")
            import traceback
            traceback.print_exc()
            raise
        finally:
            print("🏁 Application shutdown complete\n")


def main():
    """Entry point for the application."""
    app = BalanceChecker()
    
    # Setup signal handlers for graceful shutdown
    signal.signal(signal.SIGINT, app.handle_shutdown)
    signal.signal(signal.SIGTERM, app.handle_shutdown)
    
    # Run the application
    try:
        asyncio.run(app.run())
    except KeyboardInterrupt:
        print("🛑 Application stopped by user")
    except Exception as e:
        print(f"💥 Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main() 