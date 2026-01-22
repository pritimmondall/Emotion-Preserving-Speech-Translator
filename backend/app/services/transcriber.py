import os
from faster_whisper import WhisperModel

class Transcriber:
    def __init__(self):
        # Use "base" for better accuracy than "tiny"
        # compute_type="int8" is CRITICAL for CPU performance.
        print("Loading Whisper Model...")
        self.model = WhisperModel("base", device="cpu", compute_type="int8")
        print("Whisper Model Loaded.")

    def transcribe(self, audio_file_path):
        """Transcribe audio file to text"""
        try:
            # Check if file exists and has content
            if not os.path.exists(audio_file_path):
                print(f"Audio file not found: {audio_file_path}")
                return ""
            
            file_size = os.path.getsize(audio_file_path)
            if file_size < 1000:
                print(f"Audio file too small: {file_size} bytes")
                return ""
            
            # Transcribe with better parameters
            segments, info = self.model.transcribe(
                audio_file_path, 
                beam_size=5,
                language="en",  # Specify language for better accuracy
                condition_on_previous_text=False  # Better for short utterances
            )
            
            print(f"Detected language: {info.language} with probability {info.language_probability}")
            
            # Convert generator to string
            text = " ".join([segment.text for segment in segments])
            result = text.strip()
            
            print(f"Transcription result: '{result}'")
            return result
            
        except Exception as e:
            print(f"Transcription error: {e}")
            import traceback
            traceback.print_exc()
            return ""