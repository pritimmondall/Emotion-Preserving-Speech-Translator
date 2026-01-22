import { motion } from "framer-motion";

interface WaveformAnimationProps {
  isActive?: boolean;
  barCount?: number;
  className?: string;
}

export const WaveformAnimation = ({ 
  isActive = false, 
  barCount = 40,
  className = ""
}: WaveformAnimationProps) => {
  return (
    <div className={`flex items-center justify-center gap-[3px] h-16 ${className}`}>
      {Array.from({ length: barCount }).map((_, i) => {
        const delay = i * 0.05;
        const baseHeight = Math.sin((i / barCount) * Math.PI) * 100;
        
        return (
          <motion.div
            key={i}
            className="w-1 rounded-full bg-gradient-to-t from-primary to-accent"
            initial={{ height: 4 }}
            animate={isActive ? {
              height: [8, baseHeight * 0.6 + 10, 8],
              opacity: [0.5, 1, 0.5],
            } : { height: 4, opacity: 0.3 }}
            transition={{
              duration: 0.5 + Math.random() * 0.3,
              repeat: isActive ? Infinity : 0,
              repeatType: "reverse",
              delay: delay,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
};

export default WaveformAnimation;
