import { motion } from "framer-motion";
import { Brain, Mic, Languages, Volume2, Waves, Sparkles } from "lucide-react";

interface TechnicalPanelProps {
  isVisible?: boolean;
}

const steps = [
  {
    icon: Mic,
    title: "Audio Capture",
    description: "Real-time microphone input captured via WebRTC with noise suppression and echo cancellation",
    tech: "MediaRecorder API, WebRTC",
  },
  {
    icon: Waves,
    title: "Speech Transcription",
    description: "Fast, accurate speech-to-text using Whisper model optimized for CPU with INT8 quantization",
    tech: "faster-whisper, Whisper base model",
  },
  {
    icon: Brain,
    title: "Emotion Detection",
    description: "Real-time emotion analysis from audio using wav2vec2 fine-tuned for speech emotion recognition",
    tech: "wav2vec2-lg-xlsr-en-speech-emotion-recognition",
  },
  {
    icon: Languages,
    title: "Neural Translation",
    description: "Many-to-many multilingual translation using M2M100 with emotion-preserving post-processing",
    tech: "facebook/m2m100_418M, transformers",
  },
  {
    icon: Sparkles,
    title: "Emotion-Aware TTS",
    description: "Text-to-speech synthesis with prosody adjustments based on detected emotion and intensity",
    tech: "edge-tts, Neural voices",
  },
  {
    icon: Volume2,
    title: "Prosody Control",
    description: "User-adjustable pitch, speed, and volume controls that influence the synthesized speech output",
    tech: "SSML prosody parameters",
  },
];

export const TechnicalPanel = ({ isVisible = true }: TechnicalPanelProps) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="glass-card rounded-2xl p-8"
    >
      <div className="text-center mb-8">
        <h3 className="font-display text-2xl font-semibold text-foreground mb-2">
          How It Works
        </h3>
        <p className="text-muted-foreground">
          Real-time emotion-preserving speech translation pipeline
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative"
          >
            <div className="p-4 bg-secondary/30 rounded-xl border border-white/5 hover:border-primary/20 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <step.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  Step {index + 1}
                </span>
              </div>
              
              <h4 className="font-semibold text-foreground mb-2">{step.title}</h4>
              <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
              
              <div className="text-xs font-mono text-primary/70 bg-primary/5 px-2 py-1 rounded">
                {step.tech}
              </div>
            </div>

            {/* Connection line */}
            {index < steps.length - 1 && index % 3 !== 2 && (
              <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-primary/30 to-transparent" />
            )}
          </motion.div>
        ))}
      </div>

      {/* Performance Metrics */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-secondary/20 rounded-lg">
            <div className="text-2xl font-bold text-primary">≤2.5s</div>
            <div className="text-xs text-muted-foreground">Latency</div>
          </div>
          <div className="text-center p-3 bg-secondary/20 rounded-lg">
            <div className="text-2xl font-bold text-primary">60s</div>
            <div className="text-xs text-muted-foreground">Continuous Speech</div>
          </div>
          <div className="text-center p-3 bg-secondary/20 rounded-lg">
            <div className="text-2xl font-bold text-primary">CPU</div>
            <div className="text-xs text-muted-foreground">Optimized</div>
          </div>
          <div className="text-center p-3 bg-secondary/20 rounded-lg">
            <div className="text-2xl font-bold text-primary">4+</div>
            <div className="text-xs text-muted-foreground">Emotions</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TechnicalPanel;
