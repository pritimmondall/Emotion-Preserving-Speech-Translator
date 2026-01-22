import { motion } from "framer-motion";
import { Languages, Volume2, Play, Pause, RotateCcw } from "lucide-react";
import { WaveformAnimation } from "./WaveformAnimation";
import { EmotionBadge, Emotion } from "./EmotionBadge";
import { useState, useRef, useEffect } from "react";

interface TranslationPanelProps {
  isActive: boolean;
  originalText: string;
  translatedText: string;
  emotion: Emotion;
  emotionIntensity: number;
  sourceLanguage: string;
  targetLanguage: string;
  audioData?: string; // Base64 encoded audio
  audioFormat?: string; // e.g., "mp3"
}

export const TranslationPanel = ({
  isActive,
  originalText,
  translatedText,
  emotion,
  emotionIntensity,
  sourceLanguage,
  targetLanguage,
  audioData,
  audioFormat = "mp3",
}: TranslationPanelProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastAudioDataRef = useRef<string | null>(null);

  // Create audio element and handle playback
  useEffect(() => {
    if (audioData && audioData !== lastAudioDataRef.current) {
      lastAudioDataRef.current = audioData;
      
      // Create audio from base64
      const audioSrc = `data:audio/${audioFormat};base64,${audioData}`;
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audio = new Audio(audioSrc);
      audioRef.current = audio;
      
      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = (e) => {
        console.error("Audio playback error:", e);
        setIsPlaying(false);
      };
      
      // Auto-play if enabled
      if (autoPlay) {
        audio.play().catch((err) => {
          console.warn("Auto-play blocked:", err);
          // Browser may block autoplay, that's okay
        });
      }
    }
  }, [audioData, audioFormat, autoPlay]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    }
  };

  const replayAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(console.error);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid md:grid-cols-2 gap-6"
    >
      {/* Original Speech Panel */}
      <motion.div
        className="glass-card rounded-2xl p-6 relative overflow-hidden"
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold text-foreground">Original Speech</h3>
          </div>
          <span className="text-xs bg-secondary px-3 py-1 rounded-full text-muted-foreground">
            {sourceLanguage}
          </span>
        </div>

        <WaveformAnimation isActive={isActive} barCount={30} className="mb-4" />
        
        <div className="min-h-[80px] p-4 bg-secondary/50 rounded-xl">
          <motion.p 
            className="text-foreground leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={originalText}
          >
            {originalText || (
              <span className="text-muted-foreground italic">
                {isActive ? "Listening..." : "Click the microphone to start"}
              </span>
            )}
          </motion.p>
        </div>
      </motion.div>

      {/* Translated Speech Panel */}
      <motion.div
        className="glass-card rounded-2xl p-6 relative overflow-hidden"
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-accent" />
            <h3 className="font-display font-semibold text-foreground">Translated Speech</h3>
          </div>
          <span className="text-xs bg-secondary px-3 py-1 rounded-full text-muted-foreground">
            {targetLanguage}
          </span>
        </div>

        <div className="flex justify-center mb-4">
          <EmotionBadge emotion={emotion} intensity={emotionIntensity} />
        </div>
        
        <div className="min-h-[80px] p-4 bg-secondary/50 rounded-xl">
          <motion.p 
            className="text-foreground leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={translatedText}
          >
            {translatedText || (
              <span className="text-muted-foreground italic">
                Translation will appear here...
              </span>
            )}
          </motion.p>
        </div>

        {/* Audio Playback Controls */}
        {audioData && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center justify-center gap-3"
          >
            <motion.button
              onClick={togglePlayback}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm
                transition-all duration-200
                ${isPlaying 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" 
                  : "bg-secondary hover:bg-secondary/80 text-foreground"
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Play Audio</span>
                </>
              )}
            </motion.button>
            
            <motion.button
              onClick={replayAudio}
              className="p-2 rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Replay"
            >
              <RotateCcw className="w-4 h-4" />
            </motion.button>

            {/* Auto-play toggle */}
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <input 
                type="checkbox" 
                checked={autoPlay} 
                onChange={(e) => setAutoPlay(e.target.checked)}
                className="w-3 h-3 rounded border-muted-foreground accent-primary"
              />
              Auto-play
            </label>
          </motion.div>
        )}

        {/* Audio status indicator */}
        {isPlaying && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 flex justify-center"
          >
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-primary rounded-full"
                  animate={{
                    height: [8, 16, 8],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
              <span className="ml-2 text-xs text-primary">Playing...</span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default TranslationPanel;
