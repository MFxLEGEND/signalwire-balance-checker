#!/usr/bin/env python3
"""
Setup script for the Outbound Calling System
Installs dependencies and sets up the environment
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Run a shell command and handle errors"""
    print(f"\n{description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✓ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ {description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return False

def main():
    """Main setup function"""
    print("🚀 Setting up Outbound Calling System...")
    
    # Get the project directory
    project_dir = Path(__file__).parent
    os.chdir(project_dir)
    
    # Create necessary directories
    directories = ['logs', 'utils', 'examples']
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"✓ Created directory: {directory}")
    
    # Install Python dependencies
    if not run_command("pip install -r requirements.txt", "Installing Python dependencies"):
        print("❌ Failed to install dependencies. Please check your Python environment.")
        return False
    
    # Check if ngrok is available
    if not run_command("ngrok version", "Checking ngrok installation"):
        print("⚠️  ngrok not found. Please install ngrok for webhook functionality.")
        print("   Visit: https://ngrok.com/download")
    
    # Create a sample environment file
    env_file = Path(".env")
    if not env_file.exists():
        with open(env_file, 'w') as f:
            f.write("""# SignalWire Configuration
SIGNALWIRE_PROJECT_ID=cd4c08db-07c7-4d54-b7e9-e3c902470cca
SIGNALWIRE_API_TOKEN=PT4b50e497c449268d57a151bcbd670a8d3f7c5a80ca756936
SIGNALWIRE_SPACE_URL=topple-solutions.signalwire.com

# Phone Numbers
OUTGOING_NUMBER=+18083038566
TARGET_NUMBER=+18665701238

# Webhook Configuration
WEBHOOK_BASE_URL=https://still-troll-easily.ngrok-free.app
WEBHOOK_PORT=8080
""")
        print("✓ Created .env file with default configuration")
    
    print("\n🎉 Setup completed successfully!")
    print("\nNext steps:")
    print("1. Review the configuration in configs/signalwire_config.py")
    print("2. Start ngrok tunnel: ngrok http 8080")
    print("3. Run the balance checker: python scripts/balance_checker.py")
    print("\nFor more information, see README.md")

if __name__ == "__main__":
    main() 