import os
import shutil
import uuid
import subprocess
import traceback
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from app.services.transcriber import Transcriber
from app.services.emotion import EmotionDetector
from app.services.translator import Translator

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

# Pydantic models for API
class TranslationRequest(BaseModel):
    text: str
    sourceLanguage: str
    targetLanguage: str
    emotion: Optional[str] = None
    intensity: Optional[float] = None

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
    return {"status": "healthy", "services": {"transcriber": True, "emotion_detector": True, "translator": True}}

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

@app.websocket("/ws/stream")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Client connected")
    
    try:
        while True:
            # 1. Receive Audio Blob from Client
            data = await websocket.receive_bytes()
            print(f"Received audio data: {len(data)} bytes")
            
            # 2. Save as temp webm file (browser sends webm/opus format)
            temp_webm = f"temp_{uuid.uuid4()}.webm"
            temp_wav = f"temp_{uuid.uuid4()}.wav"
            
            with open(temp_webm, "wb") as f:
                f.write(data)

            try:
                # 3. Convert WebM to WAV using ffmpeg
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

                # 4. Process - Transcription
                text = transcriber.transcribe(temp_wav)
                print(f"Transcribed text: {text}")
                
                # 5. Process - Emotion (only if we have text)
                if text and text.strip():
                    emotion_data = emotion_detector.detect(temp_wav)
                    print(f"Detected emotion: {emotion_data}")

                    # 6. Send back JSON
                    response = {
                        "text": text.strip(),
                        "emotion": emotion_data["emotion"],
                        "intensity": float(emotion_data["intensity"])
                    }
                    await websocket.send_json(response)
                    print(f"Sent response: {response}")
                else:
                    print("No speech detected in audio chunk")

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