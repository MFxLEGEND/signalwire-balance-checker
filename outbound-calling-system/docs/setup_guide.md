# Outbound Calling with DTMF Setup Guide

## Overview
This guide will help you set up a free/low-cost outbound calling system with DTMF support on Windows. The solution uses Asterisk PBX with a VoIP provider and Python scripts for automation.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Option 1: Windows WSL Setup (Recommended)](#option-1-windows-wsl-setup-recommended)
3. [Option 2: Linux VM Setup](#option-2-linux-vm-setup)
4. [Option 3: Docker Setup](#option-3-docker-setup)
5. [VoIP Provider Setup](#voip-provider-setup)
6. [Configuration](#configuration)
7. [Testing](#testing)
8. [Usage Examples](#usage-examples)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

- Windows 10/11 with administrator access
- Python 3.8+ (already installed in your environment)
- Internet connection
- Budget: ~$5-10/month for VoIP service

## Option 1: Windows WSL Setup (Recommended)

### Step 1: Install WSL2
```powershell
# Open PowerShell as Administrator
wsl --install Ubuntu-22.04
# Restart computer when prompted
```

### Step 2: Install Asterisk in WSL
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y build-essential wget libssl-dev libncurses5-dev libnewt-dev libxml2-dev linux-headers-$(uname -r) libsqlite3-dev uuid-dev libjansson-dev

# Download and compile Asterisk
cd /usr/src
sudo wget http://downloads.asterisk.org/pub/telephony/asterisk/asterisk-18-current.tar.gz
sudo tar xzf asterisk-18-current.tar.gz
cd asterisk-18*

# Configure and compile
sudo ./configure --with-pjproject-bundled
sudo make menuselect  # Select needed modules
sudo make -j4 && sudo make install
sudo make samples  # Install sample configs
sudo make config    # Install init scripts
```

### Step 3: Create Asterisk User
```bash
sudo groupadd asterisk
sudo useradd -r -d /var/lib/asterisk -g asterisk asterisk
sudo usermod -aG audio,dialout asterisk
sudo chown -R asterisk:asterisk /etc/asterisk /var/{lib,log,spool}/asterisk /usr/lib/asterisk
```

## Option 2: Linux VM Setup

### Install VirtualBox/VMware
1. Download VirtualBox: https://www.virtualbox.org/
2. Download Ubuntu 22.04 LTS ISO
3. Create VM with 2GB RAM, 20GB disk
4. Follow Option 1 steps inside VM

## Option 3: Docker Setup

### Create Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  asterisk:
    image: astronomerio/asterisk:18
    container_name: asterisk-outbound
    restart: unless-stopped
    ports:
      - "5060:5060/udp"  # SIP
      - "10000-10100:10000-10100/udp"  # RTP
    volumes:
      - ./asterisk-config:/etc/asterisk
      - ./asterisk-spool:/var/spool/asterisk
    environment:
      - ASTERISK_UID=1000
      - ASTERISK_GID=1000
```

## VoIP Provider Setup

### Option A: VoIP.ms (Recommended)
1. Sign up at https://voip.ms
2. Add funds ($10 minimum)
3. Order a DID number (~$1/month)
4. Configure SIP trunk in account settings
5. Note your credentials

### Option B: Sonetel
1. Sign up at https://sonetel.com
2. Get API credentials
3. Purchase phone number
4. Configure SIP settings

## Configuration

### Step 1: Configure Asterisk

Copy the provided configuration files:

```bash
# Copy configurations
sudo cp asterisk_dialplan.conf /etc/asterisk/extensions_custom.conf
sudo cp sip_trunk_config.conf /etc/asterisk/sip_custom.conf

# Edit main configuration files
sudo nano /etc/asterisk/extensions.conf
```

Add to extensions.conf:
```
#include extensions_custom.conf
```

Add to sip.conf:
```
#include sip_custom.conf
```

### Step 2: Configure SIP Trunk
Edit `/etc/asterisk/sip_custom.conf` and update:
- YOUR_VOIPMS_ACCOUNT
- YOUR_VOIPMS_PASSWORD
- YOUR.EXTERNAL.IP
- Local network settings

### Step 3: Set Up Python Environment
```bash
# Install required packages
pip install pathlib datetime uuid argparse

# Make script executable
chmod +x outbound_caller.py
```

### Step 4: Configure Spool Directory
```bash
# Create spool directory accessible from Windows
mkdir -p /mnt/c/asterisk_spool/outgoing
sudo ln -s /mnt/c/asterisk_spool /var/spool/asterisk_shared

# Set permissions
sudo chown -R asterisk:asterisk /var/spool/asterisk_shared
```

## Testing

### Step 1: Test Asterisk
```bash
# Start Asterisk
sudo systemctl start asterisk

# Check status
sudo asterisk -r
```

### Step 2: Test SIP Registration
In Asterisk CLI:
```
sip show registry
sip show peers
```

### Step 3: Test DTMF
```bash
# Create test call
python outbound_caller.py 15551234567 --dtmf "123#456*" --spool-dir /var/spool/asterisk_shared
```

## Usage Examples

### Basic Call with DTMF
```python
from outbound_caller import OutboundCaller

caller = OutboundCaller(asterisk_spool_dir="/var/spool/asterisk_shared")

# Call and send account number
caller.make_immediate_call(
    phone_number="15551234567",
    dtmf_sequence="123456789#",
    caller_id="My Business <5551234567>"
)
```

### Command Line Usage
```bash
# Immediate call
python outbound_caller.py 15551234567 --dtmf "123#456*"

# Scheduled call (5 minutes from now)
python outbound_caller.py 15551234567 --dtmf "789*123#" --schedule 5

# Custom caller ID
python outbound_caller.py 15551234567 --dtmf "555#" --caller-id "AutoDialer <5555551234>"
```

### Bank/Service System Navigation
```python
# Navigate bank system
caller.make_immediate_call(
    phone_number="18005551234",
    dtmf_sequence="2*123456789#1234#1",  # Menu->Account->PIN->Balance
    context="outbound-service-system"
)
```

### Conference Call with DTMF
```python
# Join conference call
caller.create_call_file(
    phone_number="18005551234",
    context="outbound-conference",
    extension="s",
    priority="1"
)
# Set variables
caller.create_call_file(
    phone_number="18005551234",
    context="outbound-conference",
    extension="s",
    priority="1"
)
```

## Cost Breakdown

### VoIP.ms Pricing
- **Account minimum**: $10 (one-time)
- **DID rental**: ~$1/month
- **Outbound calls**: $0.01-0.02/minute
- **Monthly cost**: $1-5 for moderate usage

### Sonetel Pricing
- **Phone number**: $0.79/month
- **Outbound calls**: Varies by destination
- **No setup fees**

## Advanced Features

### Bulk Calling Script
```python
# bulk_caller.py
import csv
from outbound_caller import OutboundCaller

def bulk_call_from_csv(csv_file):
    caller = OutboundCaller()
    
    with open(csv_file, 'r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            caller.make_immediate_call(
                phone_number=row['phone'],
                dtmf_sequence=row['dtmf'],
                caller_id=f"Auto <{row.get('caller_id', '1234567890')}>"
            )
            time.sleep(30)  # 30-second delay between calls

# Usage: python bulk_caller.py calls.csv
```

### Web Interface (Optional)
```python
# web_interface.py
from flask import Flask, request, render_template
from outbound_caller import OutboundCaller

app = Flask(__name__)
caller = OutboundCaller()

@app.route('/')
def home():
    return render_template('caller.html')

@app.route('/make_call', methods=['POST'])
def make_call():
    phone = request.form['phone']
    dtmf = request.form['dtmf']
    
    result = caller.make_immediate_call(phone, dtmf)
    return {'status': 'success' if result else 'error'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

## Troubleshooting

### Common Issues

1. **DTMF not working**
   - Check codec (use ulaw/alaw)
   - Verify dtmfmode=rfc2833
   - Test with provider's echo service

2. **Calls not connecting**
   - Check SIP registration: `sip show registry`
   - Verify firewall settings
   - Check NAT configuration

3. **Call files not processing**
   - Check permissions on spool directory
   - Verify Asterisk is running
   - Check logs: `/var/log/asterisk/messages`

### Debug Commands
```bash
# Asterisk CLI debugging
asterisk -r
core set verbose 5
core set debug 5
sip set debug on

# Check logs
tail -f /var/log/asterisk/messages
tail -f /var/log/asterisk/full
```

### Testing DTMF
```bash
# Test with echo service (VoIP.ms)
# Call 1-613-800-1234 and press buttons
# You should hear the tones repeated back
```

## Security Considerations

1. **Firewall Rules**
   - Allow UDP 5060 (SIP) from provider IP only
   - Allow UDP 10000-20000 (RTP) as needed
   - Block unnecessary ports

2. **Strong Passwords**
   - Use complex SIP passwords
   - Change default Asterisk passwords
   - Enable fail2ban for SIP protection

3. **Call Limits**
   - Set reasonable call duration limits
   - Monitor usage to prevent abuse
   - Implement rate limiting

## Support and Maintenance

### Regular Tasks
- Monitor call logs
- Update Asterisk security patches  
- Review VoIP provider bills
- Test DTMF functionality monthly

### Getting Help
- Asterisk Community: https://community.asterisk.org/
- VoIP.ms Support: https://voip.ms/support
- This project issues: [Create issue for bugs]

## Legal Considerations

- **Compliance**: Follow local telemarketing laws
- **Consent**: Ensure you have permission to call numbers
- **Recording**: Check local laws about call recording
- **Privacy**: Protect any collected phone numbers

---

**Total Setup Time**: 2-4 hours  
**Monthly Cost**: $1-10 depending on usage  
**Difficulty**: Intermediate

This solution provides enterprise-grade outbound calling capabilities at a fraction of the cost of commercial solutions! 