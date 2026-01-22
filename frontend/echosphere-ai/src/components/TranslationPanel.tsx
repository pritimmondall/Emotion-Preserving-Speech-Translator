import { motion } from "framer-motion";
import { Languages, Volume2 } from "lucide-react";
import { WaveformAnimation } from "./WaveformAnimation";
import { EmotionBadge, Emotion } from "./EmotionBadge";

interface TranslationPanelProps {
  isActive: boolean;
  originalText: string;
  translatedText: string;
  emotion: Emotion;
  emotionIntensity: number;
  sourceLanguage: string;
  targetLanguage: string;
}

export const TranslationPanel = ({
  isActive,
  originalText,
  translatedText,
  emotion,
  emotionIntensity,
  sourceLanguage,
  targetLanguage,
}: TranslationPanelProps) => {
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
      </motion.div>
    </motion.div>
  );
};

export default TranslationPanel;
