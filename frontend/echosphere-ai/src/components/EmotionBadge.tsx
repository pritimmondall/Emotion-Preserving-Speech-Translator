import { motion, AnimatePresence } from "framer-motion";

export type Emotion = "happy" | "sad" | "angry" | "neutral";

interface EmotionBadgeProps {
  emotion: Emotion;
  intensity?: number;
  showIntensity?: boolean;
}

const emotionConfig = {
  happy: {
    emoji: "😄",
    label: "Happy",
    className: "emotion-happy",
  },
  sad: {
    emoji: "😢",
    label: "Sad",
    className: "emotion-sad",
  },
  angry: {
    emoji: "😡",
    label: "Angry",
    className: "emotion-angry",
  },
  neutral: {
    emoji: "😐",
    label: "Neutral",
    className: "emotion-neutral",
  },
};

export const EmotionBadge = ({ 
  emotion, 
  intensity = 75,
  showIntensity = true 
}: EmotionBadgeProps) => {
  const config = emotionConfig[emotion];

  return (
    <div className="flex flex-col items-center gap-3">
      <AnimatePresence mode="wait">
        <motion.div
          key={emotion}
          initial={{ scale: 0.8, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: -10 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`emotion-badge ${config.className}`}
        >
          <motion.span 
            className="text-xl"
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {config.emoji}
          </motion.span>
          <span>{config.label}</span>
        </motion.div>
      </AnimatePresence>

      {showIntensity && (
        <div className="w-full max-w-[120px]">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Intensity</span>
            <span>{intensity}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                emotion === "happy" ? "bg-emotion-happy" :
                emotion === "sad" ? "bg-emotion-sad" :
                emotion === "angry" ? "bg-emotion-angry" :
                "bg-emotion-neutral"
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${intensity}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EmotionBadge;
