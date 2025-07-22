import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedButton from '../components/AnimatedButton';

// Example body parts data (can be replaced with SVGs or images)
const BODY_PARTS = [
  { id: 'head', label: 'Head', emoji: '😀' },
  { id: 'arm', label: 'Arm', emoji: '💪' },
  { id: 'leg', label: 'Leg', emoji: '🦵' },
  { id: 'eye', label: 'Eye', emoji: '👁️' },
  { id: 'ear', label: 'Ear', emoji: '👂' },
  { id: 'hand', label: 'Hand', emoji: '🤚' },
  { id: 'foot', label: 'Foot', emoji: '🦶' },
];

const BodyPartMatchActivity: React.FC = () => {
  const [matches, setMatches] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleSelect = (id: string) => {
    setSelected(id);
  };

  const handleMatch = (id: string) => {
    if (selected === id && !matches.includes(id)) {
      setMatches([...matches, id]);
      setSelected(null);
      if (matches.length + 1 === BODY_PARTS.length) {
        setTimeout(() => setShowCelebration(true), 500);
      }
    } else {
      setSelected(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 via-blue-50 to-purple-100 p-4">
      <motion.h1 className="text-3xl md:text-5xl font-extrabold text-purple-700 mb-6" initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>Body Part Matching Game</motion.h1>
      <motion.p className="text-lg text-gray-700 mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>Match each label to the correct body part! Tap a label, then tap the matching emoji.</motion.p>
      <div className="flex flex-col md:flex-row gap-12 items-center w-full max-w-4xl">
        {/* Labels */}
        <div className="flex flex-col gap-4 items-center">
          {BODY_PARTS.map((part) => (
            <motion.button
              key={part.id}
              className={`px-6 py-3 rounded-2xl text-lg font-bold shadow-lg transition-all duration-200 focus:outline-none ${selected === part.id ? 'bg-yellow-200 ring-4 ring-yellow-400 scale-105' : matches.includes(part.id) ? 'bg-green-200 text-green-700 scale-95' : 'bg-white hover:bg-purple-100'}`}
              onClick={() => handleSelect(part.id)}
              disabled={matches.includes(part.id)}
              whileTap={{ scale: 0.95 }}
              aria-label={`Select label ${part.label}`}
            >
              {part.label}
            </motion.button>
          ))}
        </div>
        {/* Body Part Emojis */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 bg-white/70 rounded-3xl p-8 shadow-xl">
          {BODY_PARTS.map((part) => (
            <motion.button
              key={part.id}
              className={`flex flex-col items-center justify-center w-28 h-28 rounded-3xl text-5xl font-bold shadow-lg transition-all duration-200 focus:outline-none ${matches.includes(part.id) ? 'bg-green-100 ring-4 ring-green-400 scale-105' : selected && selected === part.id ? 'bg-yellow-100 ring-4 ring-yellow-400 scale-105 animate-bounce' : 'bg-blue-100 hover:bg-pink-100'}`}
              onClick={() => handleMatch(part.id)}
              disabled={matches.includes(part.id)}
              whileTap={{ scale: 0.95 }}
              aria-label={`Select body part ${part.label}`}
            >
              <span>{part.emoji}</span>
              <span className="text-base font-semibold text-purple-700 mt-2">{part.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div className="fixed inset-0 bg-black/40 z-50 flex flex-col items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white/90 rounded-3xl p-10 shadow-2xl flex flex-col items-center" initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
              <h2 className="text-3xl font-extrabold text-purple-600 mb-4">Great Job!</h2>
              <p className="text-lg mb-4">You matched all the body parts! 🎉</p>
              <div className="flex gap-2 mb-4">
                <span className="text-5xl animate-bounce">🎉</span>
                <span className="text-5xl animate-bounce">✨</span>
                <span className="text-5xl animate-bounce">🎈</span>
              </div>
              <AnimatedButton variant="fun" onClick={() => { setMatches([]); setShowCelebration(false); }}>Play Again</AnimatedButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BodyPartMatchActivity; 