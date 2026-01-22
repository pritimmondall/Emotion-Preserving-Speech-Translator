from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer
import logging
from typing import Optional

# Language code mapping for M2M100 model - Regional Indian Languages
LANGUAGE_CODES = {
    "English": "en",
    "Hindi": "hi",
    "Bengali": "bn",
    "Telugu": "te",
    "Marathi": "mr",
    "Tamil": "ta",
    "Gujarati": "gu",
    "Kannada": "kn",
    "Malayalam": "ml",
    "Punjabi": "pa",
    "Odia": "or",
    "Urdu": "ur",
}

class Translator:
    def __init__(self):
        print("Loading Translation Model...")
        # Use M2M100 - a multilingual model that supports many-to-many translation
        # This eliminates the need to load separate models for each language pair
        self.model_name = "facebook/m2m100_418M"
        try:
            self.tokenizer = M2M100Tokenizer.from_pretrained(self.model_name)
            self.model = M2M100ForConditionalGeneration.from_pretrained(self.model_name)
            print("Translation Model Loaded successfully.")
        except Exception as e:
            print(f"Error loading translation model: {e}")
            print("Translation will not be available.")
            self.tokenizer = None
            self.model = None

    def _get_model_name(self, source_lang: str, target_lang: str) -> str:
        """Get the appropriate model name for the language pair"""
        return self.model_name

    def _load_model(self, source_lang: str, target_lang: str):
        """Check if model is loaded"""
        if self.model and self.tokenizer:
            return "m2m100"
        return None

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

        # If model is not available, return original text
        if not self.model or not self.tokenizer:
            print("Translation model not available, returning original text")
            return text

        # Convert language names to codes
        src_code = LANGUAGE_CODES.get(source_lang, "en")
        tgt_code = LANGUAGE_CODES.get(target_lang, "es")

        try:
            # Set source language
            self.tokenizer.src_lang = src_code
            
            # Tokenize the input text
            encoded = self.tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
            
            # Generate translation
            # Force the target language with forced_bos_token_id
            forced_bos_token_id = self.tokenizer.get_lang_id(tgt_code)
            generated_tokens = self.model.generate(
                **encoded,
                forced_bos_token_id=forced_bos_token_id,
                max_length=512,
                num_beams=5,
                early_stopping=True
            )
            
            # Decode the translation
            translated = self.tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]

            # Apply emotion-preserving modifications
            if emotion and intensity:
                translated = self._apply_emotional_styling(translated, emotion, intensity)

            return translated

        except Exception as e:
            print(f"Translation error: {e}")
            import traceback
            traceback.print_exc()
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