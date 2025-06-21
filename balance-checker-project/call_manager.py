# call_manager.py: To handle the business logic and state of each phone call 

import asyncio
from enum import Enum
from typing import List, Optional


class CallStatus(Enum):
    """Status tracking for call sessions."""
    QUEUED = "QUEUED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class CallSession:
    """Single source of truth for each call being processed."""
    
    def __init__(self, card_number: str, zip_code: str):
        # Card information
        self.card_number = card_number
        self.zip_code = zip_code
        
        # Call tracking
        self.call_sid: Optional[str] = None  # Unique ID from SignalWire
        self.status = CallStatus.QUEUED
        
        # Call data
        self.transcription_log: List[str] = []  # Timestamped speech-to-text results
        self.detected_balance: str = ""  # Extracted balance information
        self.failure_reason: str = ""  # Reason for call failure
        
        # Synchronization
        self.completion_event = asyncio.Event()  # Signal that call has finished
    
    def add_transcription(self, text: str):
        """Add a transcription result to the log."""
        if text and text.strip():
            self.transcription_log.append(text.strip())
    
    def set_completed(self, balance: str = ""):
        """Mark the call as completed and set the detected balance."""
        self.status = CallStatus.COMPLETED
        self.detected_balance = balance
        self.completion_event.set()
    
    def set_failed(self, reason: str = ""):
        """Mark the call as failed."""
        self.status = CallStatus.FAILED
        self.failure_reason = reason
        if reason:
            self.add_transcription(f"FAILED: {reason}")
        self.completion_event.set()
    
    def set_in_progress(self, call_sid: str):
        """Mark the call as in progress with SignalWire call ID."""
        self.call_sid = call_sid
        self.status = CallStatus.IN_PROGRESS 