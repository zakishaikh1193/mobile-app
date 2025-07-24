import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- IMAGE REQUIRED ---
// You will need an image for the sun and the speech bubble.
// Create and place `sun.png` and `speech-bubble.png` in your public folder.

const sunVariants = {
  hidden: { opacity: 0, y: -200, x: '-50%', scale: 0.5 },
  center: {
    opacity: 1,
    y: '5vh',
    x: '-50%',
    scale: 1.2,
    transition: {
      type: 'spring',
      stiffness: 50,
      damping: 10,
      duration: 1.5
    }
  },
  topRight: {
    opacity: 1,
    y: '2vh',
    x: 'calc(50vw - 120px)',
    scale: 0.8,
    transition: {
      type: 'spring',
      stiffness: 80,
      damping: 15,
      duration: 1.5
    }
  }
} as const;

const SpeechBubble: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.8 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 20, scale: 0.8 }}
    transition={{ duration: 0.4, ease: 'easeOut' }}
    className="absolute top-full mt-2 w-64 p-4"
  >
    {/* Use an image for the speech bubble for best results */}
    <img src="/speech.png" alt="Speech bubble" />
    <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-xl font-bold text-gray-700 w-full px-4">
      Welcome, kids! Let's learn!
    </p>
  </motion.div>
);

const SpeakingSun: React.FC<{ animate: string; showSpeechBubble: boolean }> = ({ animate, showSpeechBubble }) => {
  return (
    <motion.div
      className="absolute top-0 left-1/2 z-30"
      variants={sunVariants}
      initial="hidden"
      animate={animate}
    >
      <motion.img
        src="/sunny-mascot.png" // <-- ADD YOUR SUN CARTOON IMAGE HERE
        alt="A friendly, smiling cartoon sun"
        className="w-40 h-40"
        // This makes the sun gently pulse when it's idle in the corner
        animate={{
          scale: animate === 'topRight' ? [0.8, 0.85, 0.8] : 1.2,
          rotate: animate === 'topRight' ? [0, 5, 0, -5, 0] : 0,
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <AnimatePresence>
        {showSpeechBubble && <SpeechBubble />}
      </AnimatePresence>
    </motion.div>
  );
};

export default SpeakingSun;