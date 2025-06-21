import os
import logging
from google.cloud import speech_v1p1beta1 as speech
from google.cloud import storage
import wave
import pyaudio

class VoiceTranscriber:
    def __init__(self, 
                 google_credentials_path=None, 
                 language_code='en-US', 
                 sample_rate=16000):
        """
        Initialize Voice Transcription Service
        
        Args:
            google_credentials_path (str): Path to Google Cloud credentials JSON
            language_code (str): Language for transcription
            sample_rate (int): Audio sample rate
        """
        # Set Google Cloud credentials
        if google_credentials_path:
            os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = google_credentials_path
        
        self.client = speech.SpeechClient()
        self.language_code = language_code
        self.sample_rate = sample_rate
        self.logger = logging.getLogger('voice_transcriber')
        
    def transcribe_audio_file(self, audio_path, enable_speaker_diarization=True):
        """
        Transcribe an audio file using Google Cloud Speech-to-Text
        
        Args:
            audio_path (str): Path to audio file
            enable_speaker_diarization (bool): Separate speakers in transcription
        
        Returns:
            dict: Transcription results with confidence and speaker info
        """
        try:
            with open(audio_path, 'rb') as audio_file:
                content = audio_file.read()
            
            audio = speech.RecognitionAudio(content=content)
            
            # Configure recognition settings
            config = speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
                sample_rate_hertz=self.sample_rate,
                language_code=self.language_code,
                enable_speaker_diarization=enable_speaker_diarization,
                diarization_speaker_count=2,  # Adjust based on expected speakers
                model='phone_call'  # Optimized for phone call audio
            )
            
            # Perform transcription
            response = self.client.recognize(config=config, audio=audio)
            
            # Process results
            results = []
            for result in response.results:
                alternative = result.alternatives[0]
                transcript = {
                    'transcript': alternative.transcript,
                    'confidence': alternative.confidence,
                    'speakers': []
                }
                
                # Extract speaker information if diarization enabled
                if result.speaker_labels:
                    for speaker_label in result.speaker_labels:
                        transcript['speakers'].append({
                            'tag': speaker_label.tag,
                            'start_time': speaker_label.start_time.total_seconds(),
                            'end_time': speaker_label.end_time.total_seconds()
                        })
                
                results.append(transcript)
            
            return results
        
        except Exception as e:
            self.logger.error(f"Transcription error: {e}")
            return None
    
    def record_audio(self, duration=10, output_path='recorded_call.wav'):
        """
        Record audio from microphone
        
        Args:
            duration (int): Recording duration in seconds
            output_path (str): Path to save recorded audio
        
        Returns:
            str: Path to recorded audio file
        """
        CHUNK = 1024
        FORMAT = pyaudio.paInt16
        CHANNELS = 1
        RATE = self.sample_rate
        
        p = pyaudio.PyAudio()
        
        stream = p.open(format=FORMAT,
                        channels=CHANNELS,
                        rate=RATE,
                        input=True,
                        frames_per_buffer=CHUNK)
        
        self.logger.info(f"Recording {duration} seconds...")
        
        frames = []
        for _ in range(0, int(RATE / CHUNK * duration)):
            data = stream.read(CHUNK)
            frames.append(data)
        
        self.logger.info("Recording complete.")
        
        stream.stop_stream()
        stream.close()
        p.terminate()
        
        # Save the recorded audio to a WAV file
        wf = wave.open(output_path, 'wb')
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(p.get_sample_size(FORMAT))
        wf.setframerate(RATE)
        wf.writeframes(b''.join(frames))
        wf.close()
        
        return output_path
    
    def upload_to_cloud_storage(self, local_file_path, bucket_name, destination_blob_name=None):
        """
        Upload audio file to Google Cloud Storage
        
        Args:
            local_file_path (str): Path to local audio file
            bucket_name (str): Google Cloud Storage bucket name
            destination_blob_name (str, optional): Name in cloud storage
        
        Returns:
            str: Cloud Storage URI
        """
        storage_client = storage.Client()
        bucket = storage_client.bucket(bucket_name)
        
        if not destination_blob_name:
            destination_blob_name = os.path.basename(local_file_path)
        
        blob = bucket.blob(destination_blob_name)
        blob.upload_from_filename(local_file_path)
        
        return f'gs://{bucket_name}/{destination_blob_name}'

def main():
    # Example usage
    transcriber = VoiceTranscriber(
        google_credentials_path='path/to/google_credentials.json'
    )
    
    # Record audio
    audio_path = transcriber.record_audio(duration=10)
    
    # Transcribe recorded audio
    results = transcriber.transcribe_audio_file(audio_path)
    
    if results:
        for result in results:
            print(f"Transcript: {result['transcript']}")
            print(f"Confidence: {result['confidence']}")
            print("Speakers:", result['speakers'])

if __name__ == '__main__':
    main() 