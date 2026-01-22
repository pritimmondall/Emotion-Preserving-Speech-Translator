import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Music, Gauge, Zap, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { HeroSection } from "@/components/HeroSection";
import { TranslationPanel } from "@/components/TranslationPanel";
import { MicrophoneButton } from "@/components/MicrophoneButton";
import { ProsodySlider } from "@/components/ProsodySlider";
import { ComparisonToggle } from "@/components/ComparisonToggle";
import { EmotionAnalytics } from "@/components/EmotionAnalytics";
import { TechnicalPanel } from "@/components/TechnicalPanel";
import { Footer } from "@/components/Footer";
import { Emotion } from "@/components/EmotionBadge";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { translationApi } from "@/services/translationApi";
import { useToast } from "@/hooks/use-toast";

// Map backend emotion labels to frontend emotion types
const mapEmotion = (emotion: string): Emotion => {
  const emotionMap: Record<string, Emotion> = {
    "happy": "happy",
    "sad": "sad",
    "angry": "angry",
    "neutral": "neutral",
    "fear": "sad",
    "disgust": "angry",
    "surprise": "happy",
  };
  return emotionMap[emotion.toLowerCase()] || "neutral";
};

const generateEmotionData = () => {
  return Array.from({ length: 10 }, (_, i) => ({
    time: `${i}s`,
    happy: Math.floor(Math.random() * 40) + 20,
    sad: Math.floor(Math.random() * 30) + 10,
    angry: Math.floor(Math.random() * 20) + 5,
    neutral: Math.floor(Math.random() * 30) + 20,
  }));
};

// Available languages for translation
const LANGUAGES = [
  "English", "Spanish", "French", "German", "Italian", 
  "Portuguese", "Russian", "Chinese", "Japanese", "Korean"
];

const Index = () => {
  const { toast } = useToast();
  const [originalText, setOriginalText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>("neutral");
  const [emotionIntensity, setEmotionIntensity] = useState(50);
  const [pitch, setPitch] = useState(65);
  const [tone, setTone] = useState(50);
  const [speed, setSpeed] = useState(75);
  const [isEmotionPreserving, setIsEmotionPreserving] = useState(true);
  const [emotionData, setEmotionData] = useState(generateEmotionData());
  const [sourceLanguage, setSourceLanguage] = useState("English");
  const [targetLanguage, setTargetLanguage] = useState("Spanish");
  const [emotionHistory, setEmotionHistory] = useState<Array<{emotion: string, intensity: number, timestamp: number}>>([]);
  const translationRef = useRef<HTMLDivElement>(null);

  // Handle transcription results from the backend
  const handleTranscription = useCallback(async (result: { text: string; emotion: string; intensity: number }) => {
    console.log("Received transcription:", result);
    
    // Update original text (what was said)
    setOriginalText(result.text);
    
    // Update emotion
    const mappedEmotion = mapEmotion(result.emotion);
    setCurrentEmotion(mappedEmotion);
    setEmotionIntensity(Math.round(result.intensity * 100));

    // Add to emotion history for analytics
    setEmotionHistory(prev => [...prev.slice(-20), {
      emotion: result.emotion,
      intensity: result.intensity,
      timestamp: Date.now()
    }]);

    // Update emotion analytics data
    setEmotionData(prev => {
      const newData = [...prev.slice(1)];
      newData.push({
        time: `${newData.length}s`,
        happy: mappedEmotion === "happy" ? Math.round(result.intensity * 100) : Math.max(10, prev[prev.length - 1]?.happy - 5 || 20),
        sad: mappedEmotion === "sad" ? Math.round(result.intensity * 100) : Math.max(10, prev[prev.length - 1]?.sad - 5 || 15),
        angry: mappedEmotion === "angry" ? Math.round(result.intensity * 100) : Math.max(5, prev[prev.length - 1]?.angry - 5 || 10),
        neutral: mappedEmotion === "neutral" ? Math.round(result.intensity * 100) : Math.max(20, prev[prev.length - 1]?.neutral - 5 || 25),
      });
      return newData;
    });

    // Translate the text
    if (result.text && result.text.trim()) {
      try {
        const translation = await translationApi.translate({
          text: result.text,
          sourceLanguage,
          targetLanguage,
          emotion: isEmotionPreserving ? result.emotion : undefined,
          intensity: isEmotionPreserving ? result.intensity : undefined,
        });
        setTranslatedText(translation.translatedText);
      } catch (error) {
        console.error("Translation error:", error);
        // Fallback: show original text with note
        setTranslatedText(`[Translation pending] ${result.text}`);
      }
    }
  }, [sourceLanguage, targetLanguage, isEmotionPreserving]);

  // Handle recording errors
  const handleError = useCallback((error: Error) => {
    console.error("Recording error:", error);
    toast({
      title: "Error",
      description: error.message || "An error occurred while recording",
      variant: "destructive",
    });
  }, [toast]);

  // Use the audio recorder hook
  const { isRecording, isConnected, startRecording, stopRecording, error } = useAudioRecorder({
    onTranscription: handleTranscription,
    onError: handleError,
    recordingDuration: 3000, // Record 3-second segments for real-time processing
  });

  const handleStartTranslation = () => {
    translationRef.current?.scrollIntoView({ behavior: "smooth" });
    setTimeout(async () => {
      try {
        await startRecording();
      } catch (err) {
        console.error("Failed to start recording:", err);
      }
    }, 500);
  };

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
      toast({
        title: "Recording stopped",
        description: "Microphone has been turned off",
      });
    } else {
      try {
        await startRecording();
        toast({
          title: "Recording started",
          description: "Speak now - your speech will be transcribed and translated",
        });
      } catch (err) {
        console.error("Failed to start recording:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section */}
      <HeroSection onStartTranslation={handleStartTranslation} />

      {/* Live Translation Section */}
      <section ref={translationRef} className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Live Translation Panel
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Speak naturally and watch your words transform across languages while preserving your emotional expression
            </p>
          </motion.div>

          {/* Connection Status */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center mb-4"
          >
            <div className={`
              flex items-center gap-2 px-3 py-1.5 rounded-full text-xs
              ${isConnected 
                ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
              }
            `}>
              {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span>{isConnected ? "Connected to backend" : "Connecting..."}</span>
            </div>
          </motion.div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center mb-4"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-destructive/20 text-destructive rounded-lg border border-destructive/30">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error.message}</span>
              </div>
            </motion.div>
          )}

          {/* Microphone Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center mb-12"
          >
            <MicrophoneButton isRecording={isRecording} onClick={toggleRecording} />
          </motion.div>

          {/* Status Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center mb-8"
          >
            <div className={`
              flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-lg border
              ${isRecording 
                ? "bg-primary/10 border-primary/30 text-primary" 
                : "bg-secondary/50 border-white/10 text-muted-foreground"
              }
            `}>
              <span className={`w-2 h-2 rounded-full ${isRecording ? "bg-primary animate-pulse" : "bg-muted-foreground"}`} />
              <span className="text-sm font-medium">
                {isRecording ? "Listening & Translating..." : "Click microphone to start"}
              </span>
            </div>
          </motion.div>

          {/* Translation Panels */}
          <TranslationPanel
            isActive={isRecording}
            originalText={originalText}
            translatedText={translatedText}
            emotion={currentEmotion}
            emotionIntensity={emotionIntensity}
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
          />
        </div>
      </section>

      {/* Prosody Controls Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-secondary/20 to-transparent">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Prosody Controls
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Fine-tune the vocal characteristics of your translated speech
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <ProsodySlider
                label="Pitch"
                value={pitch}
                onChange={setPitch}
                icon={<Music className="w-5 h-5" />}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ProsodySlider
                label="Tone"
                value={tone}
                onChange={setTone}
                icon={<Gauge className="w-5 h-5" />}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <ProsodySlider
                label="Speed"
                value={speed}
                onChange={setSpeed}
                icon={<Zap className="w-5 h-5" />}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <ComparisonToggle
            isEmotionPreserving={isEmotionPreserving}
            onToggle={() => setIsEmotionPreserving(!isEmotionPreserving)}
          />
        </div>
      </section>

      {/* Analytics Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Real-Time Analytics
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Track emotional patterns and intensity fluctuations throughout your conversation
            </p>
          </motion.div>

          <EmotionAnalytics data={emotionData} />
        </div>
      </section>

      {/* Technical Explanation Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-secondary/20 to-transparent">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Technical Deep Dive
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Understand the AI pipeline powering emotion-preserving speech translation
            </p>
          </motion.div>

          <TechnicalPanel />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
