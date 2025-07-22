import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type SunnyMood = 'idle' | 'talking' | 'happy' | 'encourage' | 'hint' | 'sleep' | 'party';

const WAKE_UP_MESSAGE = "Hello! I'm awake and ready to help!";

function speakMessage(message: string) {
  if (!('speechSynthesis' in window) || !message) return;
  const synth = window.speechSynthesis;
  const speak = () => {
    const utter = new window.SpeechSynthesisUtterance(message);
    utter.pitch = 1.3;
    utter.rate = 1.1;
    // Pick a child-friendly English voice if available
    const voices = synth.getVoices();
    utter.voice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female')) || voices[0];
    synth.cancel();
    synth.speak(utter);
  };
  if (synth.getVoices().length === 0) {
    synth.addEventListener('voiceschanged', speak, { once: true });
  } else {
    speak();
  }
}

// Use OpenMoji SVGs for animal friends
const animalFriends = [
  { src: 'https://openmoji.org/data/color/svg/1F430.svg', alt: 'Bunny', anim: { y: [0, -10, 0] }, delay: 0 },
  { src: 'https://openmoji.org/data/color/svg/1F98A.svg', alt: 'Fox', anim: { x: [0, 10, 0] }, delay: 0.2 },
  { src: 'https://openmoji.org/data/color/svg/1F427.svg', alt: 'Penguin', anim: { rotate: [0, 10, -10, 0] }, delay: 0.4 },
];

const SunnyMascot: React.FC<{
  message: string;
  mood?: SunnyMood;
  onWakeUp?: () => void;
  showTimer?: boolean;
  timerValue?: number;
}> = ({ message, mood = 'idle', onWakeUp, showTimer = false, timerValue = 5 }) => {
  const [currentMood, setCurrentMood] = React.useState<SunnyMood>(mood);
  const [lastMessage, setLastMessage] = React.useState(message);
  const [ttsEnabled, setTtsEnabled] = React.useState(false);

  // Enable TTS after first user click
  useEffect(() => {
    const enableTts = () => {
      setTtsEnabled(true);
      window.removeEventListener('click', enableTts);
    };
    window.addEventListener('click', enableTts);
    return () => window.removeEventListener('click', enableTts);
  }, []);

  // Update mood/message from parent
  useEffect(() => {
    setCurrentMood(mood);
  }, [mood]);
  useEffect(() => {
    setLastMessage(message);
  }, [message]);

  // Robust TTS for every message, after user interaction
  useEffect(() => {
    if (ttsEnabled && lastMessage) {
      speakMessage(lastMessage);
    }
  }, [ttsEnabled, lastMessage]);

  // Animation variants for different moods
  const variants: Record<SunnyMood, any> = {
    idle: { scale: [1, 1.05, 1], rotate: [0, 2, -2, 0], transition: { repeat: Infinity, duration: 2 } },
    talking: { scale: [1, 1.1, 1], y: [0, -5, 0], transition: { repeat: Infinity, duration: 0.7 } },
    happy: { scale: [1, 1.15, 1], rotate: [0, 5, -5, 0], transition: { repeat: Infinity, duration: 1.5 } },
    encourage: { y: [0, -10, 0], transition: { repeat: Infinity, duration: 1.2 } },
    hint: { x: [0, 10, -10, 0], transition: { repeat: Infinity, duration: 1.2 } },
    sleep: { scale: [1, 1.02, 1], y: [0, 2, 0], opacity: [1, 0.7, 1], transition: { repeat: Infinity, duration: 2 } },
    party: { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0], transition: { repeat: Infinity, duration: 1 } },
  };

  // Blinking eyes
  const [blink, setBlink] = React.useState(true);
  useEffect(() => {
    if (currentMood === 'sleep') return;
    const interval = setInterval(() => setBlink(b => !b), 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [currentMood]);

  // Handle click to wake up
  const handleClick = () => {
    if (currentMood === 'sleep') {
      setCurrentMood('happy');
      setLastMessage(WAKE_UP_MESSAGE);
      if (onWakeUp) onWakeUp();
    }
  };

  // Timer bubbles (hide when answer is correct)
  const timerBubbles = showTimer
    ? Array.from({ length: timerValue }).map((_, i) => (
        <motion.div
          key={i}
          className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-blue-200 border-2 border-blue-400 mx-1 flex items-center justify-center text-blue-700 font-bold shadow"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.7, opacity: 0 }}
          transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
        >
          {timerValue - i}
        </motion.div>
      ))
    : null;

  return (
    <div className="fixed left-4 bottom-4 z-50 flex items-end gap-2 pointer-events-auto" onClick={handleClick} style={{ cursor: currentMood === 'sleep' ? 'pointer' : 'default' }}>
      {/* Animal friends as SVG images */}
      <div className="flex flex-col gap-2">
        {animalFriends.map((a, i) => (
          <motion.img
            key={a.alt}
            src={a.src}
            alt={a.alt}
            className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white shadow-lg"
            animate={a.anim}
            transition={{ repeat: Infinity, duration: 2, delay: a.delay }}
            style={{ filter: 'drop-shadow(0 2px 4px #0002)' }}
          />
        ))}
      </div>
      {/* Sunny mascot */}
      <motion.div
        className="relative w-40 h-40 md:w-56 md:h-56"
        animate={variants[currentMood]}
        style={{ filter: 'drop-shadow(0 4px 12px #FFD93B88)' }}
      >
        {/* Upgraded Sun SVG */}
        <svg viewBox="0 0 120 120" width="100%" height="100%">
          {/* Shadow */}
          <ellipse cx="60" cy="110" rx="32" ry="8" fill="#e2b400" opacity="0.3" />
          {/* Rays */}
          {[...Array(16)].map((_, i) => (
            <g key={i} transform={`rotate(${i * 22.5} 60 60)`}>
              <rect
                x="57" y="10"
                width="6" height="22"
                rx="3"
                fill="url(#rayGrad)"
                stroke="#F4B400"
                strokeWidth="1"
              />
            </g>
          ))}
          {/* Sun body with gradient */}
          <defs>
            <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fffbe7" />
              <stop offset="80%" stopColor="#FFD93B" />
              <stop offset="100%" stopColor="#F4B400" />
            </radialGradient>
            <linearGradient id="rayGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFD93B" />
              <stop offset="100%" stopColor="#F4B400" />
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r="36" fill="url(#sunGrad)" stroke="#F4B400" strokeWidth="3" />
          {/* Cheeks */}
          <ellipse cx="45" cy="75" rx="6" ry="3" fill="#FFD1A9" opacity="0.7" />
          <ellipse cx="75" cy="75" rx="6" ry="3" fill="#FFD1A9" opacity="0.7" />
          {/* Eyes */}
          {currentMood === 'sleep' ? (
            <>
              <ellipse cx="48" cy="62" rx="7" ry="3" fill="#333" />
              <ellipse cx="72" cy="62" rx="7" ry="3" fill="#333" />
            </>
          ) : (
            <>
              <ellipse cx="48" cy="58" rx="7" ry="10" fill="#fff" />
              <ellipse cx="72" cy="58" rx="7" ry="10" fill="#fff" />
              <ellipse cx="48" cy="62" rx="3" ry={blink ? 3 : 0.7} fill="#1a237e" />
              <ellipse cx="72" cy="62" rx="3" ry={blink ? 3 : 0.7} fill="#1a237e" />
              {/* Eye highlights */}
              <ellipse cx="46" cy="56" rx="1.2" ry="2" fill="#fff" opacity="0.7" />
              <ellipse cx="70" cy="56" rx="1.2" ry="2" fill="#fff" opacity="0.7" />
              {/* Eyebrows */}
              <path d="M42 52 Q48 50 54 52" stroke="#F4B400" strokeWidth="2" fill="none" />
              <path d="M66 52 Q72 50 78 52" stroke="#F4B400" strokeWidth="2" fill="none" />
            </>
          )}
          {/* Mouth (always smile when awake) */}
          {currentMood === 'sleep' ? (
            <path d="M52 80 Q60 83 68 80" stroke="#333" strokeWidth="2" fill="none" />
          ) : currentMood === 'talking' ? (
            <ellipse cx="60" cy="80" rx="10" ry="6" fill="#fff" stroke="#333" strokeWidth="2" />
          ) : (
            <path d="M52 77 Q60 88 68 77" stroke="#333" strokeWidth="2.5" fill="none" />
          )}
          {/* Shine highlight */}
          <ellipse cx="50" cy="50" rx="8" ry="4" fill="#fff" opacity="0.25" />
        </svg>
        {/* Zzz for sleep */}
        {currentMood === 'sleep' && (
          <motion.div
            className="absolute left-24 top-4 text-blue-400 text-2xl"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], y: [-5, -20, -30] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >Zzz</motion.div>
        )}
        {/* Timer bubbles (hide when answer is correct) */}
        {showTimer && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-row items-center">
            {timerBubbles}
          </div>
        )}
      </motion.div>
      {/* Speech bubble */}
      <AnimatePresence>
        {lastMessage && (
          <motion.div
            className="bg-white/90 rounded-3xl px-6 py-4 shadow-xl border-2 border-yellow-200 text-lg md:text-xl font-bold text-yellow-700 max-w-xs pointer-events-auto"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
            style={{ fontFamily: "'Comic Sans MS', 'Comic Sans', cursive" }}
          >
            {lastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SunnyMascot; 