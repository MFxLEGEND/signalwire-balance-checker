#!/usr/bin/env python3
"""
Outbound Caller with DTMF Support
Creates Asterisk call files for automated outbound calling with DTMF sequences
"""

import os
import time
import uuid
from pathlib import Path
from datetime import datetime, timedelta
import argparse

class OutboundCaller:
    def __init__(self, asterisk_spool_dir="/tmp/asterisk_spool", outgoing_dir="outgoing"):
        """
        Initialize the OutboundCaller
        
        Args:
            asterisk_spool_dir: Path to Asterisk spool directory
            outgoing_dir: Subdirectory for outgoing calls (usually 'outgoing')
        """
        self.spool_path = Path(asterisk_spool_dir) / outgoing_dir
        self.spool_path.mkdir(parents=True, exist_ok=True)
    
    def create_call_file(self, phone_number, dtmf_sequence="", context="outbound-calls", 
                        extension="s", priority="1", caller_id="AutoDialer <1234567890>",
                        max_retries=2, retry_time=300, wait_time=45, schedule_time=None):
        """
        Create an Asterisk call file with DTMF support
        
        Args:
            phone_number: Phone number to call (e.g., "15551234567")
            dtmf_sequence: DTMF tones to send (e.g., "123#456*789")
            context: Asterisk dialplan context
            extension: Extension in the context
            priority: Priority in the dialplan
            caller_id: Caller ID to display
            max_retries: Maximum retry attempts
            retry_time: Seconds between retries
            wait_time: Seconds to wait for answer
            schedule_time: datetime object for scheduled calls (optional)
        """
        
        # Generate unique filename
        call_id = str(uuid.uuid4())[:8]
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"call_{timestamp}_{call_id}.call"
        
        # Create call file content
        call_content = [
            f"Channel: SIP/trunk/{phone_number}",
            f"Context: {context}",
            f"Extension: {extension}",
            f"Priority: {priority}",
            f"CallerID: {caller_id}",
            f"MaxRetries: {max_retries}",
            f"RetryTime: {retry_time}",
            f"WaitTime: {wait_time}",
            f"Archive: yes"
        ]
        
        # Add DTMF sequence as a variable if provided
        if dtmf_sequence:
            call_content.append(f"Set: DTMF_SEQUENCE={dtmf_sequence}")
        
        # Add phone number as variable for reference
        call_content.append(f"Set: TARGET_NUMBER={phone_number}")
        
        # Add schedule time if provided
        if schedule_time:
            # Convert to Unix timestamp
            schedule_timestamp = int(schedule_time.timestamp())
            call_content.append(f"Set: __CALLFILENAME={filename}")
            
            # Write to future spool directory first, then move
            temp_path = self.spool_path / f"temp_{filename}"
            final_path = self.spool_path / filename
        else:
            final_path = self.spool_path / filename
            temp_path = final_path
        
        # Write call file
        try:
            with open(temp_path, 'w') as f:
                f.write('\n'.join(call_content) + '\n')
            
            if schedule_time and temp_path != final_path:
                # Schedule the call by setting the file modification time
                os.utime(temp_path, (schedule_timestamp, schedule_timestamp))
                temp_path.rename(final_path)
            
            print(f"✅ Call file created: {filename}")
            print(f"📞 Target: {phone_number}")
            if dtmf_sequence:
                print(f"🔢 DTMF: {dtmf_sequence}")
            if schedule_time:
                print(f"⏰ Scheduled: {schedule_time}")
            
            return str(final_path)
            
        except Exception as e:
            print(f"❌ Error creating call file: {e}")
            return None
    
    def schedule_call(self, phone_number, dtmf_sequence, minutes_from_now=1, **kwargs):
        """
        Schedule a call for future execution
        
        Args:
            phone_number: Phone number to call
            dtmf_sequence: DTMF sequence to send
            minutes_from_now: Minutes from now to schedule the call
            **kwargs: Additional arguments for create_call_file
        """
        schedule_time = datetime.now() + timedelta(minutes=minutes_from_now)
        return self.create_call_file(
            phone_number=phone_number,
            dtmf_sequence=dtmf_sequence,
            schedule_time=schedule_time,
            **kwargs
        )
    
    def make_immediate_call(self, phone_number, dtmf_sequence="", **kwargs):
        """
        Make an immediate call
        
        Args:
            phone_number: Phone number to call
            dtmf_sequence: DTMF sequence to send
            **kwargs: Additional arguments for create_call_file
        """
        return self.create_call_file(
            phone_number=phone_number,
            dtmf_sequence=dtmf_sequence,
            **kwargs
        )

def main():
    parser = argparse.ArgumentParser(description='Outbound Caller with DTMF Support')
    parser.add_argument('phone_number', help='Phone number to call (e.g., 15551234567)')
    parser.add_argument('--dtmf', default='', help='DTMF sequence to send (e.g., 123#456*)')
    parser.add_argument('--schedule', type=int, help='Schedule call X minutes from now')
    parser.add_argument('--caller-id', default='AutoDialer <1234567890>', help='Caller ID')
    parser.add_argument('--spool-dir', default='/var/spool/asterisk', help='Asterisk spool directory')
    parser.add_argument('--context', default='outbound-calls', help='Asterisk context')
    
    args = parser.parse_args()
    
    # Create caller instance
    caller = OutboundCaller(asterisk_spool_dir=args.spool_dir)
    
    if args.schedule:
        print(f"📅 Scheduling call for {args.schedule} minutes from now...")
        result = caller.schedule_call(
            phone_number=args.phone_number,
            dtmf_sequence=args.dtmf,
            minutes_from_now=args.schedule,
            caller_id=args.caller_id,
            context=args.context
        )
    else:
        print("📞 Creating immediate call...")
        result = caller.make_immediate_call(
            phone_number=args.phone_number,
            dtmf_sequence=args.dtmf,
            caller_id=args.caller_id,
            context=args.context
        )
    
    if result:
        print(f"✅ Success! Call file: {result}")
    else:
        print("❌ Failed to create call file")

# Example usage functions
def example_call_with_dtmf():
    """Example: Call a number and send DTMF sequence"""
    caller = OutboundCaller()
    
    # Call and send account number + PIN
    caller.make_immediate_call(
        phone_number="15551234567",
        dtmf_sequence="123456789#1234*",  # Account number + PIN
        caller_id="My Business <5551234567>"
    )

def example_scheduled_call():
    """Example: Schedule a call for later"""
    caller = OutboundCaller()
    
    # Schedule call for 5 minutes from now
    caller.schedule_call(
        phone_number="15551234567",
        dtmf_sequence="*67#",  # Skip to menu option
        minutes_from_now=5
    )

if __name__ == "__main__":
    main() 