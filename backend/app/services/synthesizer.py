"""
Text-to-Speech Synthesizer with Emotion-Aware Prosody Control

This module provides speech synthesis using edge-tts with prosody adjustments
based on detected emotion and user-controlled parameters (pitch, rate, volume).
"""

import asyncio
import edge_tts
import os
import uuid
from typing import Optional, Dict

# Voice mapping for different languages
# Using neural voices that support SSML for prosody control
VOICE_MAP = {
    "English": "en-US-AriaNeural",  # Expressive female voice
    "Hindi": "hi-IN-SwaraNeural",
    "Bengali": "bn-IN-TanishaaNeural",
    "Telugu": "te-IN-ShrutiNeural",
    "Marathi": "mr-IN-AarohiNeural",
    "Tamil": "ta-IN-PallaviNeural",
    "Gujarati": "gu-IN-DhwaniNeural",
    "Kannada": "kn-IN-SapnaNeural",
    "Malayalam": "ml-IN-SobhanaNeural",
    "Punjabi": "pa-IN-VaaniNeural",  # Note: May fall back to Hindi
    "Odia": "or-IN-SubhasiniNeural",  # Note: Limited availability
    "Urdu": "ur-PK-UzmaNeural",
}

# Fallback voices
FALLBACK_VOICE = "en-US-AriaNeural"

# Emotion-to-prosody mapping (values in Hz for pitch, percentage for rate/volume)
# edge-tts requires pitch in Hz format: "+10Hz" or "-5Hz"
# rate and volume use percentage: "+10%" or "-5%"
EMOTION_PROSODY = {
    "happy": {
        "pitch": 10,      # Hz - Higher pitch for happiness
        "rate": 10,       # % - Slightly faster
        "volume": 5,      # % - Slightly louder
    },
    "sad": {
        "pitch": -10,     # Hz - Lower pitch for sadness
        "rate": -15,      # % - Slower speech
        "volume": -10,    # % - Softer
    },
    "angry": {
        "pitch": 5,       # Hz - Slightly higher pitch
        "rate": 15,       # % - Faster, more intense
        "volume": 15,     # % - Louder
    },
    "fear": {
        "pitch": 15,      # Hz - Higher pitch
        "rate": 20,       # % - Faster (anxious)
        "volume": -5,     # % - Slightly softer
    },
    "disgust": {
        "pitch": -5,      # Hz - Slightly lower
        "rate": -5,       # % - Slightly slower
        "volume": 0,      # %
    },
    "surprise": {
        "pitch": 20,      # Hz - Higher pitch
        "rate": 5,        # % - Slightly faster
        "volume": 10,     # % - Louder
    },
    "neutral": {
        "pitch": 0,
        "rate": 0,
        "volume": 0,
    },
}


def _format_pitch(value: int) -> str:
    """Format pitch value as Hz string for edge-tts"""
    return f"{'+' if value >= 0 else ''}{value}Hz"


def _format_percentage(value: int) -> str:
    """Format rate/volume value as percentage string for edge-tts"""
    return f"{'+' if value >= 0 else ''}{value}%"


class Synthesizer:
    """
    Text-to-Speech synthesizer with emotion-aware prosody control.
    Uses Microsoft Edge TTS (free, no API key required) with SSML support.
    """
    
    def __init__(self):
        print("Initializing TTS Synthesizer...")
        self.temp_dir = "temp_audio"
        os.makedirs(self.temp_dir, exist_ok=True)
        print("TTS Synthesizer ready.")

    def _get_voice(self, language: str) -> str:
        """Get the appropriate voice for a language"""
        return VOICE_MAP.get(language, FALLBACK_VOICE)

    def _calculate_prosody(
        self, 
        emotion: Optional[str] = None,
        intensity: float = 0.5,
        user_pitch: int = 50,
        user_rate: int = 50,
        user_volume: int = 50
    ) -> Dict[str, str]:
        """
        Calculate final prosody values combining emotion detection and user preferences.
        
        Args:
            emotion: Detected emotion (happy, sad, angry, etc.)
            intensity: Emotion intensity 0.0-1.0
            user_pitch: User-controlled pitch 0-100
            user_rate: User-controlled rate/speed 0-100
            user_volume: User-controlled volume/tone 0-100
        
        Returns:
            Dict with pitch, rate, volume as edge-tts compatible strings
        """
        base_prosody = EMOTION_PROSODY.get(emotion or "neutral", EMOTION_PROSODY["neutral"])
        
        # Scale emotion prosody by intensity
        scaled_pitch = int(base_prosody["pitch"] * intensity)
        scaled_rate = int(base_prosody["rate"] * intensity)
        scaled_volume = int(base_prosody["volume"] * intensity)
        
        # User adjustment: convert 0-100 to -25 to +25 range
        user_pitch_adj = int((user_pitch - 50) / 2)  # -25 to +25 Hz
        user_rate_adj = int((user_rate - 50) / 2)    # -25% to +25%
        user_volume_adj = int((user_volume - 50) / 2) # -25% to +25%
        
        # Combine emotion and user adjustments
        final_pitch = max(-50, min(50, scaled_pitch + user_pitch_adj))
        final_rate = max(-50, min(50, scaled_rate + user_rate_adj))
        final_volume = max(-50, min(50, scaled_volume + user_volume_adj))
        
        return {
            "pitch": _format_pitch(final_pitch),
            "rate": _format_percentage(final_rate),
            "volume": _format_percentage(final_volume),
        }

    async def synthesize_async(
        self,
        text: str,
        language: str = "English",
        emotion: Optional[str] = None,
        intensity: float = 0.5,
        pitch: int = 50,
        rate: int = 50,
        volume: int = 50,
    ) -> Optional[bytes]:
        """
        Synthesize text to speech with emotion-aware prosody.
        
        Args:
            text: Text to synthesize
            language: Target language for voice selection
            emotion: Detected emotion
            intensity: Emotion intensity 0.0-1.0
            pitch: User pitch control 0-100 (50 = neutral)
            rate: User speed control 0-100 (50 = neutral)
            volume: User tone/volume control 0-100 (50 = neutral)
        
        Returns:
            Audio data as bytes (MP3 format) or None on error
        """
        if not text or not text.strip():
            return None

        voice = self._get_voice(language)
        prosody = self._calculate_prosody(emotion, intensity, pitch, rate, volume)
        
        print(f"Synthesizing: '{text[:50]}...' | Voice: {voice} | Prosody: {prosody}")
        
        temp_file = os.path.join(self.temp_dir, f"tts_{uuid.uuid4()}.mp3")
        
        try:
            # Create communicator with prosody settings
            communicate = edge_tts.Communicate(
                text=text,
                voice=voice,
                pitch=prosody["pitch"],
                rate=prosody["rate"],
                volume=prosody["volume"],
            )
            
            # Save to temporary file
            await communicate.save(temp_file)
            
            # Read audio bytes
            with open(temp_file, "rb") as f:
                audio_data = f.read()
            
            print(f"Synthesized audio: {len(audio_data)} bytes")
            return audio_data
            
        except Exception as e:
            print(f"TTS synthesis error: {e}")
            import traceback
            traceback.print_exc()
            return None
            
        finally:
            # Cleanup
            if os.path.exists(temp_file):
                os.remove(temp_file)

    def synthesize(
        self,
        text: str,
        language: str = "English",
        emotion: Optional[str] = None,
        intensity: float = 0.5,
        pitch: int = 50,
        rate: int = 50,
        volume: int = 50,
    ) -> Optional[bytes]:
        """
        Synchronous wrapper for synthesize_async.
        """
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        if loop.is_running():
            # If we're already in an async context, create a new loop in a thread
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(
                    asyncio.run,
                    self.synthesize_async(text, language, emotion, intensity, pitch, rate, volume)
                )
                return future.result()
        else:
            return loop.run_until_complete(
                self.synthesize_async(text, language, emotion, intensity, pitch, rate, volume)
            )