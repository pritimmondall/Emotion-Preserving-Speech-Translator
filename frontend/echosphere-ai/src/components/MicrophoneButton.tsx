import { motion } from "framer-motion";
import { Mic, MicOff } from "lucide-react";

interface MicrophoneButtonProps {
  isRecording: boolean;
  onClick: () => void;
}

export const MicrophoneButton = ({ isRecording, onClick }: MicrophoneButtonProps) => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Pulse rings when recording */}
      {isRecording && (
        <>
          <motion.div
            className="absolute w-20 h-20 rounded-full bg-destructive/30"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.div
            className="absolute w-20 h-20 rounded-full bg-destructive/30"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
          />
        </>
      )}
      
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          relative z-10 w-20 h-20 rounded-full flex items-center justify-center
          transition-all duration-300
          ${isRecording 
            ? "bg-destructive" 
            : "bg-primary"
          }
        `}
        style={{
          boxShadow: isRecording 
            ? "0 0 40px hsl(0 85% 55% / 0.5)" 
            : "0 0 30px hsl(195 90% 55% / 0.4)"
        }}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isRecording ? 0 : 0 }}
        >
          {isRecording ? (
            <MicOff className="w-8 h-8 text-white" />
          ) : (
            <Mic className="w-8 h-8 text-primary-foreground" />
          )}
        </motion.div>
      </motion.button>
    </div>
  );
};

export default MicrophoneButton;
