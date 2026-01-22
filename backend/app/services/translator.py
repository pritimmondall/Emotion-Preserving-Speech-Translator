from transformers import pipeline, AutoModelForSeq2SeqLM, AutoTokenizer
import logging
from typing import Optional

# Language code mapping for Helsinki-NLP models
LANGUAGE_CODES = {
    "English": "en",
    "Spanish": "es", 
    "French": "fr",
    "German": "de",
    "Italian": "it",
    "Portuguese": "pt",
    "Russian": "ru",
    "Chinese": "zh",
    "Japanese": "ja",
    "Korean": "ko",
    "Arabic": "ar",
    "Hindi": "hi",
}

class Translator:
    def __init__(self):
        print("Loading Translation Model...")
        # Use a lightweight multilingual translation model
        # This model supports many language pairs
        self.model_name = "Helsinki-NLP/opus-mt-en-es"  # Default English to Spanish
        self.models = {}
        self.tokenizers = {}
        
        # Pre-load the default model
        self._load_model("en", "es")
        print("Translation Model Loaded.")

    def _get_model_name(self, source_lang: str, target_lang: str) -> str:
        """Get the appropriate model name for the language pair"""
        return f"Helsinki-NLP/opus-mt-{source_lang}-{target_lang}"

    def _load_model(self, source_lang: str, target_lang: str):
        """Load a translation model for a specific language pair"""
        model_key = f"{source_lang}-{target_lang}"
        if model_key not in self.models:
            try:
                model_name = self._get_model_name(source_lang, target_lang)
                print(f"Loading translation model: {model_name}")
                self.tokenizers[model_key] = AutoTokenizer.from_pretrained(model_name)
                self.models[model_key] = AutoModelForSeq2SeqLM.from_pretrained(model_name)
                print(f"Model {model_name} loaded successfully")
            except Exception as e:
                print(f"Failed to load model for {source_lang}->{target_lang}: {e}")
                # Fallback to pipeline with mBART for unsupported pairs
                return None
        return model_key

    def translate(
        self, 
        text: str, 
        source_lang: str = "English", 
        target_lang: str = "Spanish",
        emotion: Optional[str] = None,
        intensity: Optional[float] = None
    ) -> str:
        """
        Translate text from source language to target language.
        Optionally preserves emotional context through punctuation and emphasis.
        """
        if not text or not text.strip():
            return ""

        # Convert language names to codes
        src_code = LANGUAGE_CODES.get(source_lang, "en")
        tgt_code = LANGUAGE_CODES.get(target_lang, "es")

        try:
            model_key = self._load_model(src_code, tgt_code)
            
            if model_key and model_key in self.models:
                tokenizer = self.tokenizers[model_key]
                model = self.models[model_key]
                
                # Tokenize and translate
                inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
                outputs = model.generate(**inputs, max_length=512, num_beams=4, early_stopping=True)
                translated = tokenizer.decode(outputs[0], skip_special_tokens=True)
            else:
                # Fallback: return original text with note
                translated = text

            # Apply emotion-preserving modifications
            if emotion and intensity:
                translated = self._apply_emotional_styling(translated, emotion, intensity)

            return translated

        except Exception as e:
            print(f"Translation error: {e}")
            return text  # Return original on error

    def _apply_emotional_styling(self, text: str, emotion: str, intensity: float) -> str:
        """
        Apply emotional styling to translated text based on detected emotion.
        This preserves the emotional intent in the translation.
        """
        # Normalize intensity to 0-1 range
        intensity_normalized = intensity / 100 if intensity > 1 else intensity

        if emotion.lower() == "angry" and intensity_normalized > 0.6:
            # Add emphasis for angry emotions
            text = text.upper() if intensity_normalized > 0.8 else text
            if not text.endswith("!"):
                text = text.rstrip(".") + "!"
                
        elif emotion.lower() == "happy" and intensity_normalized > 0.6:
            # Add exclamation for happy emotions
            if not text.endswith("!"):
                text = text.rstrip(".") + "!"
                
        elif emotion.lower() == "sad" and intensity_normalized > 0.5:
            # Add ellipsis for sad emotions
            if text.endswith("."):
                text = text.rstrip(".") + "..."
                
        return text
