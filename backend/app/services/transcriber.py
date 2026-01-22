import os
from faster_whisper import WhisperModel

class Transcriber:
    def __init__(self):
        # "tiny" is fastest. Use "base" if accuracy is too low.
        # compute_type="int8" is CRITICAL for CPU performance.
        print("Loading Whisper Model...")
        self.model = WhisperModel("tiny", device="cpu", compute_type="int8")
        print("Whisper Model Loaded.")

    def transcribe(self, audio_file_path):
        segments, info = self.model.transcribe(audio_file_path, beam_size=5)
        
        # Generator to string conversion
        text = " ".join([segment.text for segment in segments])
        return text.strip()