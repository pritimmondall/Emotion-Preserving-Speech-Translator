import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export const Footer = () => {
  const techIcons = [
    { name: "React", icon: "⚛️" },
    { name: "TensorFlow", icon: "🧠" },
    { name: "WebRTC", icon: "📡" },
    { name: "Whisper", icon: "🎙️" },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="border-t border-white/5 mt-20"
    >
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center gap-6">
          {/* Powered by AI */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm">Powered by Advanced AI</span>
          </motion.div>

          {/* Tech Stack Icons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-6"
          >
            {techIcons.map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.1, y: -2 }}
                className="flex flex-col items-center gap-1 cursor-default"
              >
                <span className="text-2xl">{tech.icon}</span>
                <span className="text-xs text-muted-foreground">{tech.name}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Copyright */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-xs text-muted-foreground/60 mt-4"
          >
            © 2024 Emotion-Preserving Speech Translation. All rights reserved.
          </motion.p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
