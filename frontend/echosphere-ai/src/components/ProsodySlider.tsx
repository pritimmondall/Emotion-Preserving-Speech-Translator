import { motion } from "framer-motion";
import { useState } from "react";

interface ProsodySliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  icon: React.ReactNode;
  min?: number;
  max?: number;
}

export const ProsodySlider = ({ 
  label, 
  value, 
  onChange, 
  icon,
  min = 0,
  max = 100 
}: ProsodySliderProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <motion.div
      className="glass-card rounded-xl p-4"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <div className="flex items-center gap-3 mb-3">
        <motion.div 
          className="text-primary"
          animate={{ scale: isHovered ? 1.1 : 1 }}
        >
          {icon}
        </motion.div>
        <span className="font-medium text-foreground">{label}</span>
        <span className="ml-auto text-sm text-primary font-semibold">{value}%</span>
      </div>
      
      <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-accent"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{
            boxShadow: isHovered ? "0 0 20px hsl(var(--primary) / 0.6)" : "none"
          }}
        />
        
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-primary shadow-lg"
          style={{ left: `calc(${percentage}% - 10px)` }}
          animate={{ 
            scale: isHovered ? 1.2 : 1,
            boxShadow: isHovered 
              ? "0 0 15px hsl(var(--primary) / 0.8)" 
              : "0 2px 8px rgba(0,0,0,0.3)"
          }}
        />
      </div>
    </motion.div>
  );
};

export default ProsodySlider;
