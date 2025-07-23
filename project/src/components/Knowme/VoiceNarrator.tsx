import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

interface VoiceNarratorProps {
  enabled: boolean;
}

const VoiceNarrator: React.FC<VoiceNarratorProps> = ({ enabled }) => {
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);

  const messages = [
    "Welcome to your learning adventure! 🌟",
    "Great job exploring! Keep going! 👏",
    "You're doing amazing! 🎉",
    "Can you find your nose? Touch it! 👃",
    "What's your favorite color? 🌈",
    "You're such a smart learner! ⭐"
  ];

  useEffect(() => {
    if (!enabled) return;

    const showRandomMessage = () => {
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setCurrentMessage(randomMessage);
      setIsVisible(true);
      
      setTimeout(() => {
        setIsVisible(false);
      }, 4000);
    };

    const interval = setInterval(showRandomMessage, 15000);
    
    // Show initial message
    setTimeout(showRandomMessage, 2000);

    return () => clearInterval(interval);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm"
        >
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-2xl shadow-2xl border border-white/20">
            <div className="flex items-start gap-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="bg-white/20 p-2 rounded-full"
              >
                <Volume2 size={20} />
              </motion.div>
              <div>
                <p className="font-bold text-sm mb-1">Learning Assistant</p>
                <p className="text-sm">{currentMessage}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VoiceNarrator;