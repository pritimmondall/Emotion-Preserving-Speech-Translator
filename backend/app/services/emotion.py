from transformers import pipeline
import logging

class EmotionDetector:
    def __init__(self):
        print("Loading Emotion Model...")
        # A small, fast model for emotion recognition
        self.classifier = pipeline(
            "audio-classification", 
            model="ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition"
        )
        print("Emotion Model Loaded.")

    def detect(self, audio_file_path):
        # Returns a list of dicts: [{'score': 0.9, 'label': 'angry'}, ...]
        results = self.classifier(audio_file_path)
        
        # Get the top result
        top_result = max(results, key=lambda x: x['score'])
        
        return {
            "emotion": top_result['label'],
            "intensity": top_result['score'] # Confidence acts as intensity
        }