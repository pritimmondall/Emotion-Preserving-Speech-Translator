# Emotion-Preserving Speech Translator

A real-time speech translation system that preserves emotional expression and speaking style through prosody-aware synthesis. The system translates speech while maintaining emotional intent through emotion detection that actively influences the generated voice output.

## Features

- ✅ **Real-time Speech Transcription**: Using Whisper (tiny model) optimized for CPU with INT8 quantization
- ✅ **Emotion Detection**: Real-time emotion analysis using wav2vec2-lg-xlsr-en-speech-emotion-recognition
- ✅ **Neural Translation**: Context-aware translation using Helsinki-NLP/opus-mt models
- ✅ **Emotion Preservation**: Punctuation, emphasis, and tone adjustments based on detected emotion
- ✅ **Prosody Controls**: User-adjustable pitch, tone, and speed settings
- ✅ **Real-time Analytics**: Live emotion tracking visualization
- ✅ **Before/After Comparison**: Toggle between normal and emotion-preserving translation

## Performance

- **Latency**: ≤2.5 seconds
- **Continuous Speech**: 30-60 seconds support
- **Noise Robustness**: Echo cancellation and noise suppression
- **CPU-Optimized**: Runs without GPU requirements

## Tech Stack

### Backend (Python/FastAPI)
- FastAPI with WebSocket support
- faster-whisper for speech transcription
- transformers for emotion detection and translation
- Helsinki-NLP models for translation

### Frontend (React/TypeScript)
- React 18 with TypeScript
- Vite for development/build
- Tailwind CSS with custom theming
- Framer Motion for animations
- Recharts for analytics visualization
- WebRTC for audio capture

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+ (or Bun)
- Modern browser with WebRTC support

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend/echosphere-ai

# Install dependencies (using bun or npm)
bun install
# or
npm install

# Start development server
bun dev
# or
npm run dev
```

### Environment Configuration

Create a `.env` file in `frontend/echosphere-ai/`:

```env
VITE_BACKEND_HOST=localhost
VITE_BACKEND_PORT=8000
```

## Usage

1. Start the backend server (runs on port 8000)
2. Start the frontend development server (runs on port 8080)
3. Open http://localhost:8080 in your browser
4. Click the microphone button to start recording
5. Speak naturally - your speech will be transcribed, emotion-analyzed, and translated in real-time
6. Use the prosody controls to adjust pitch, tone, and speed
7. Toggle emotion preservation to compare normal vs emotion-preserving translation

## API Endpoints

### WebSocket
- `ws://localhost:8000/ws/stream` - Real-time audio streaming endpoint

### REST API
- `GET /` - Health check
- `GET /health` - Service status
- `POST /translate` - Text translation endpoint

## Architecture

```
┌─────────────────┐     WebSocket      ┌─────────────────┐
│    Frontend     │◄──────────────────►│    Backend      │
│  (React/Vite)   │                    │   (FastAPI)     │
└────────┬────────┘                    └────────┬────────┘
         │                                      │
         │                              ┌───────┴───────┐
    ┌────┴────┐                         │               │
    │ WebRTC  │                    ┌────┴────┐    ┌─────┴────┐
    │  Audio  │                    │ Whisper │    │ Emotion  │
    │ Capture │                    │   STT   │    │ Detector │
    └─────────┘                    └─────────┘    └──────────┘
                                         │
                                   ┌─────┴─────┐
                                   │ Helsinki  │
                                   │ Translate │
                                   └───────────┘
```

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app with WebSocket
│   │   └── services/
│   │       ├── transcriber.py   # Whisper transcription
│   │       ├── emotion.py       # Emotion detection
│   │       └── translator.py    # Translation service
│   └── requirements.txt
├── frontend/
│   └── echosphere-ai/
│       ├── src/
│       │   ├── components/      # React components
│       │   ├── hooks/           # Custom hooks (useAudioRecorder)
│       │   ├── services/        # API services (WebSocket, Translation)
│       │   └── pages/           # Page components
│       └── package.json
└── README.md
```

## License

MIT
