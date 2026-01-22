import os
import shutil
import uuid
import subprocess
import traceback
import base64
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from app.services.transcriber import Transcriber
from app.services.emotion import EmotionDetector
from app.services.translator import Translator
from app.services.synthesizer import Synthesizer

app = FastAPI(title="Emotion-Preserving Speech Translator API")

# Configure CORS to allow frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI Services once on startup
transcriber = Transcriber()
emotion_detector = EmotionDetector()
translator = Translator()
synthesizer = Synthesizer()

# Pydantic models for API
class TranslationRequest(BaseModel):
    text: str
    sourceLanguage: str
    targetLanguage: str
    emotion: Optional[str] = None
    intensity: Optional[float] = None

class SynthesisRequest(BaseModel):
    text: str
    language: str
    emotion: Optional[str] = None
    intensity: Optional[float] = 0.5
    pitch: Optional[int] = 50
    rate: Optional[int] = 50
    volume: Optional[int] = 50

class TranslationResponse(BaseModel):
    originalText: str
    translatedText: str
    sourceLanguage: str
    targetLanguage: str

@app.get("/")
def read_root():
    return {"status": "Backend is running", "message": "Emotion-Preserving Speech Translator API"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "services": {"transcriber": True, "emotion_detector": True, "translator": True, "synthesizer": True}}

@app.post("/translate", response_model=TranslationResponse)
async def translate_text(request: TranslationRequest):
    """Translate text from source language to target language"""
    translated = translator.translate(
        text=request.text,
        source_lang=request.sourceLanguage,
        target_lang=request.targetLanguage,
        emotion=request.emotion,
        intensity=request.intensity
    )
    return TranslationResponse(
        originalText=request.text,
        translatedText=translated,
        sourceLanguage=request.sourceLanguage,
        targetLanguage=request.targetLanguage
    )

@app.post("/synthesize")
async def synthesize_speech(request: SynthesisRequest):
    """Synthesize text to speech with emotion-aware prosody"""
    audio_bytes = await synthesizer.synthesize_async(
        text=request.text,
        language=request.language,
        emotion=request.emotion,
        intensity=request.intensity,
        pitch=request.pitch,
        rate=request.rate,
        volume=request.volume,
    )
    
    if audio_bytes:
        # Return base64 encoded audio
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        return {
            "success": True,
            "audio": audio_base64,
            "format": "mp3",
            "size": len(audio_bytes)
        }
    else:
        return {"success": False, "error": "Synthesis failed"}

@app.websocket("/ws/stream")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Client connected")
    
    # Default prosody settings (can be updated by client)
    prosody_settings = {
        "pitch": 50,
        "rate": 50,
        "volume": 50,
        "targetLanguage": "Hindi",
        "sourceLanguage": "English",
        "emotionPreserving": True
    }
    
    try:
        while True:
            # Receive message from client
            message = await websocket.receive()
            
            # Handle text messages (settings updates)
            if "text" in message:
                try:
                    settings = json.loads(message["text"])
                    if settings.get("type") == "settings":
                        prosody_settings.update(settings.get("data", {}))
                        print(f"Updated prosody settings: {prosody_settings}")
                        continue
                except json.JSONDecodeError:
                    pass
            
            # Handle binary messages (audio data)
            if "bytes" not in message:
                continue
                
            data = message["bytes"]
            print(f"Received audio data: {len(data)} bytes")
            
            # Save as temp webm file (browser sends webm/opus format)
            temp_webm = f"temp_{uuid.uuid4()}.webm"
            temp_wav = f"temp_{uuid.uuid4()}.wav"
            
            with open(temp_webm, "wb") as f:
                f.write(data)

            try:
                # Convert WebM to WAV using ffmpeg
                try:
                    result = subprocess.run([
                        "ffmpeg", "-y", "-i", temp_webm,
                        "-ar", "16000",  # 16kHz sample rate for Whisper
                        "-ac", "1",      # Mono channel
                        "-f", "wav",
                        temp_wav
                    ], capture_output=True, text=True, timeout=10)
                    
                    if result.returncode != 0:
                        print(f"FFmpeg error: {result.stderr}")
                        continue
                        
                except FileNotFoundError:
                    print("FFmpeg not found. Please install ffmpeg.")
                    await websocket.send_json({"error": "FFmpeg not installed on server"})
                    continue
                except subprocess.TimeoutExpired:
                    print("FFmpeg conversion timed out")
                    continue

                # Check if WAV file was created and has content
                if not os.path.exists(temp_wav) or os.path.getsize(temp_wav) < 1000:
                    print("WAV file too small or not created, skipping...")
                    continue

                # 1. Transcription
                text = transcriber.transcribe(temp_wav)
                print(f"Transcribed text: '{text}' (length: {len(text)})")
                
                # 2. Emotion Detection & Translation (only if we have text)
                if text and text.strip():
                    emotion_data = emotion_detector.detect(temp_wav)
                    print(f"Detected emotion: {emotion_data}")
                    
                    emotion = emotion_data["emotion"]
                    intensity = float(emotion_data["intensity"])
                    
                    # 3. Translation
                    target_lang = prosody_settings.get("targetLanguage", "Hindi")
                    source_lang = prosody_settings.get("sourceLanguage", "English")
                    emotion_preserving = prosody_settings.get("emotionPreserving", True)
                    
                    translated_text = translator.translate(
                        text=text.strip(),
                        source_lang=source_lang,
                        target_lang=target_lang,
                        emotion=emotion if emotion_preserving else None,
                        intensity=intensity if emotion_preserving else None
                    )
                    print(f"Translated text: {translated_text}")
                    
                    # 4. TTS Synthesis with emotion-aware prosody
                    audio_bytes = await synthesizer.synthesize_async(
                        text=translated_text,
                        language=target_lang,
                        emotion=emotion if emotion_preserving else None,
                        intensity=intensity if emotion_preserving else 0.5,
                        pitch=prosody_settings.get("pitch", 50),
                        rate=prosody_settings.get("rate", 50),
                        volume=prosody_settings.get("volume", 50),
                    )
                    
                    # 5. Prepare response
                    response = {
                        "text": text.strip(),
                        "translatedText": translated_text,
                        "emotion": emotion,
                        "intensity": intensity,
                        "sourceLanguage": source_lang,
                        "targetLanguage": target_lang,
                    }
                    
                    # Include audio if synthesis succeeded
                    if audio_bytes:
                        response["audio"] = base64.b64encode(audio_bytes).decode('utf-8')
                        response["audioFormat"] = "mp3"
                        print(f"Audio synthesized: {len(audio_bytes)} bytes")
                    
                    print(f"Sending response to client (audio: {'yes' if audio_bytes else 'no'})")
                    await websocket.send_json(response)
                    print(f"Response sent successfully")
                else:
                    print("No speech detected in audio chunk - text was empty or whitespace only")

            except Exception as e:
                print(f"Processing error: {e}")
                traceback.print_exc()
                
            finally:
                # Cleanup: Delete temp files
                for f in [temp_webm, temp_wav]:
                    if os.path.exists(f):
                        os.remove(f)

    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
        traceback.print_exc()
        try:
            await websocket.close()
        except:
            pass