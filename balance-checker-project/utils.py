# utils.py: Essential utility functions for the balance checker

import csv
import logging
from typing import List, Tuple
from pathlib import Path
import config


def setup_results_file():
    """Create the results CSV file with proper headers."""
    try:
        with open(config.RESULTS_FILE, 'w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow(['CardNumber', 'ZipCode', 'DetectedBalance', 'CallStatus', 'TranscriptionLog'])
        logging.info(f"Results file initialized: {config.RESULTS_FILE}")
    except Exception as e:
        logging.error(f"Failed to setup results file: {e}")
        raise


def load_card_data(filename: str) -> List[Tuple[str, str]]:
    """Load card data from file with format: card_number|zip_code"""
    cards = []
    try:
        if not Path(filename).exists():
            logging.error(f"Card data file not found: {filename}")
            return cards
            
        with open(filename, 'r', encoding='utf-8') as file:
            for line_num, line in enumerate(file, 1):
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                    
                parts = line.split('|')
                if len(parts) != 2:
                    logging.warning(f"Invalid format on line {line_num}: {line}")
                    continue
                    
                card_number, zip_code = parts[0].strip(), parts[1].strip()
                if card_number and zip_code:
                    cards.append((card_number, zip_code))
                else:
                    logging.warning(f"Empty card/zip on line {line_num}: {line}")
                    
        logging.info(f"Loaded {len(cards)} cards from {filename}")
        return cards
        
    except Exception as e:
        logging.error(f"Failed to load card data from {filename}: {e}")
        return []


def write_result(card_number: str, zip_code: str, balance: str, status: str, transcription_log: List[str]):
    """Write a single result to the CSV file."""
    try:
        # Join transcription log into a single string
        transcription_text = " | ".join(transcription_log) if transcription_log else ""
        
        with open(config.RESULTS_FILE, 'a', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow([card_number, zip_code, balance, status, transcription_text])
            
    except Exception as e:
        logging.error(f"Failed to write result for card {card_number}: {e}") 