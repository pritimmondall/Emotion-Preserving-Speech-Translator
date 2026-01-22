from transformers import pipeline
import logging

class EmotionDetector:
    def __init__(self):
        print("Loading Emotion Model...")
        try:
            # A small, fast model for emotion recognition
            self.classifier = pipeline(
                "audio-classification", 
                model="ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition"
            )
            print("Emotion Model Loaded successfully.")
        except Exception as e:
            print(f"Error loading emotion model: {e}")
            print("Emotion detection will not be available.")
            self.classifier = None

    def detect(self, audio_file_path):
        """Detect emotion from audio file"""
        try:
            if not self.classifier:
                print("Emotion classifier not available, returning neutral")
                return {"emotion": "neutral", "intensity": 0.5}
            
            # Returns a list of dicts: [{'score': 0.9, 'label': 'angry'}, ...]
            results = self.classifier(audio_file_path)
            
            if not results:
                print("No emotion results returned")
                return {"emotion": "neutral", "intensity": 0.5}
            
            # Get the top result
            top_result = max(results, key=lambda x: x['score'])
            
            emotion_result = {
                "emotion": top_result['label'],
                "intensity": top_result['score']  # Confidence acts as intensity
            }
            
            print(f"Emotion detection result: {emotion_result}")
            return emotion_result
            
        except Exception as e:
            print(f"Error detecting emotion: {e}")
            import traceback
            traceback.print_exc()
            return {"emotion": "neutral", "intensity": 0.5}