import { motion } from "framer-motion";
import { Check, X, Volume2 } from "lucide-react";

interface ComparisonToggleProps {
  isEmotionPreserving: boolean;
  onToggle: () => void;
}

export const ComparisonToggle = ({ isEmotionPreserving, onToggle }: ComparisonToggleProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      <h3 className="font-display text-2xl font-semibold text-foreground mb-2">
        Experience the Difference
      </h3>
      <p className="text-muted-foreground mb-8">
        Toggle to compare normal translation vs emotion-preserving translation
      </p>

      {/* Toggle Switch */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <span className={`text-sm font-medium transition-colors ${!isEmotionPreserving ? "text-foreground" : "text-muted-foreground"}`}>
          Normal
        </span>
        
        <motion.button
          onClick={onToggle}
          className={`
            relative w-20 h-10 rounded-full p-1 transition-colors duration-300
            ${isEmotionPreserving ? "bg-primary" : "bg-secondary"}
          `}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center"
            animate={{ x: isEmotionPreserving ? 40 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {isEmotionPreserving ? (
              <Check className="w-4 h-4 text-primary" />
            ) : (
              <X className="w-4 h-4 text-muted-foreground" />
            )}
          </motion.div>
        </motion.button>

        <span className={`text-sm font-medium transition-colors ${isEmotionPreserving ? "text-foreground" : "text-muted-foreground"}`}>
          Emotion-Preserving
        </span>
      </div>

      {/* Comparison Cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <motion.div
          className={`glass-card rounded-2xl p-6 transition-all duration-300 ${
            !isEmotionPreserving ? "ring-2 ring-primary glow-primary" : "opacity-60"
          }`}
          animate={{ scale: !isEmotionPreserving ? 1 : 0.98 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <X className="w-5 h-5 text-destructive" />
            <h4 className="font-semibold text-foreground">Normal Translation</h4>
          </div>
          <div className="p-4 bg-secondary/50 rounded-xl mb-4">
            <p className="text-muted-foreground italic">
              "Hello, how are you doing today?"
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Volume2 className="w-4 h-4" />
            <span>Flat, robotic tone</span>
          </div>
        </motion.div>

        <motion.div
          className={`glass-card rounded-2xl p-6 transition-all duration-300 ${
            isEmotionPreserving ? "ring-2 ring-primary glow-primary" : "opacity-60"
          }`}
          animate={{ scale: isEmotionPreserving ? 1 : 0.98 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Check className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-foreground">Emotion-Preserving</h4>
          </div>
          <div className="p-4 bg-secondary/50 rounded-xl mb-4">
            <p className="text-foreground">
              "Hello, how are you doing today?" 
              <span className="ml-2 text-emotion-happy">😄</span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-primary">
            <Volume2 className="w-4 h-4" />
            <span>Warm, enthusiastic tone preserved</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ComparisonToggle;
