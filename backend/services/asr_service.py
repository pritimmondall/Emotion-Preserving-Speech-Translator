import os
from faster_whisper import WhisperModel

class ASRService:
    def __init__(self):
        print("Loading Whisper Model... (This runs only once)")
        # OPTIMIZATION: 
        # 1. Use "tiny.en" for maximum speed on CPU (Latency < 1s).
        # 2. Use "int8" quantization to reduce memory usage.
        self.model = WhisperModel("tiny.en", device="cpu", compute_type="int8")

    def transcribe(self, audio_file_path):
        """
        Transcribes audio file to text.
        Returns: (text)
        """
        try:
            if not os.path.exists(audio_file_path):
                print(f"Error: File {audio_file_path} not found.")
                return None

            # OPTIMIZATION:
            # beam_size=1: Greedily pick the best word (Faster)
            # vad_filter=True: Skips silence automatically (Crucial for latency)
            segments, info = self.model.transcribe(
                audio_file_path, 
                beam_size=1, 
                vad_filter=True
            )
            
            # Combine segments into a single string
            transcription = " ".join([segment.text for segment in segments]).strip()
            
            if not transcription:
                return None
            
            return transcription
        except Exception as e:
            print(f"ASR Error: {e}")
            return None