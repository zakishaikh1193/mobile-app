import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedButton from '../components/AnimatedButton';
import SunnyMascot, { SunnyMood } from '../components/SunnyMascot';

const CHARACTERS = [
  '🧙‍♂️', '👸', '🦄', '🐧', '🐸', '🐻', '🦊', '🐵', '🐼', '🐤',
];

const getRandomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const generateRound = () => {
  const answer = getRandomInt(1, 6);
  let options = [answer];
  while (options.length < 3) {
    const opt = getRandomInt(1, 6);
    if (!options.includes(opt)) options.push(opt);
  }
  options = options.sort(() => Math.random() - 0.5);
  return { answer, options };
};

// Simple sound effect using Web Audio API
const playSound = (type: 'correct' | 'wrong' | 'celebrate') => {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  if (type === 'correct') {
    o.type = 'triangle'; o.frequency.value = 880; g.gain.value = 0.2;
    o.start(); o.frequency.linearRampToValueAtTime(1760, ctx.currentTime + 0.2);
    o.stop(ctx.currentTime + 0.25);
  } else if (type === 'wrong') {
    o.type = 'sawtooth'; o.frequency.value = 220; g.gain.value = 0.2;
    o.start(); o.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.2);
    o.stop(ctx.currentTime + 0.25);
  } else if (type === 'celebrate') {
    o.type = 'square'; o.frequency.value = 1320; g.gain.value = 0.3;
    o.start(); o.frequency.linearRampToValueAtTime(660, ctx.currentTime + 0.4);
    o.stop(ctx.currentTime + 0.45);
  }
};

const Confetti: React.FC<{ show: boolean }> = ({ show }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {[...Array(30)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute text-3xl select-none"
            style={{
              left: `${getRandomInt(5, 95)}%`,
              top: `${getRandomInt(5, 80)}%`,
              color: `hsl(${getRandomInt(0, 360)}, 90%, 60%)`,
              zIndex: 1000,
            }}
            initial={{ y: -100, scale: 0.5, rotate: 0 }}
            animate={{ y: getRandomInt(200, 600), scale: 1, rotate: getRandomInt(-180, 180) }}
            transition={{ duration: 1.2 + Math.random(), delay: Math.random() * 0.5 }}
          >
            {['🎉', '✨', '🎊', '💫', '⭐'][i % 5]}
          </motion.span>
        ))}
      </motion.div>
    )}
  </AnimatePresence>
);

// Guide character and speech bubble
const GUIDE_EMOJI = '🦄';
const GUIDE_MESSAGES = {
  intro: "Let's play! How many dots do you see?",
  correct: ["Great job!", "Awesome!", "You got it!", "Yay!"],
  wrong: ["Try again!", "Oops, not quite!", "Give it another go!"],
  celebrate: ["You did it!", "Fantastic!", "You're a star!"],
  encouragement: ["You can do it!", "Keep going!", "Almost there!"],
};
function speakGuide(text: string) {
  if ('speechSynthesis' in window) {
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.rate = 1.1;
    utter.pitch = 1.2;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }
}

const EducationalGame: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [round, setRound] = useState(generateRound());
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [guideMsg, setGuideMsg] = useState(GUIDE_MESSAGES.intro);
  const [guideAnim, setGuideAnim] = useState<'bounce' | 'wave' | 'none'>('bounce');

  React.useEffect(() => {
    if (showCelebration) {
      const msg = GUIDE_MESSAGES.celebrate[getRandomInt(0, GUIDE_MESSAGES.celebrate.length - 1)];
      setGuideMsg(msg);
      setGuideAnim('bounce');
      speakGuide(msg);
    } else if (feedback === 'correct' && selected !== null) {
      const msg = GUIDE_MESSAGES.correct[getRandomInt(0, GUIDE_MESSAGES.correct.length - 1)];
      setGuideMsg(msg);
      setGuideAnim('bounce');
      speakGuide(msg);
    } else if (feedback === 'wrong' && selected !== null) {
      const msg = GUIDE_MESSAGES.wrong[getRandomInt(0, GUIDE_MESSAGES.wrong.length - 1)];
      setGuideMsg(msg);
      setGuideAnim('wave');
      speakGuide(msg);
    } else if (progress === 0 && !selected) {
      setGuideMsg(GUIDE_MESSAGES.intro);
      setGuideAnim('bounce');
      speakGuide(GUIDE_MESSAGES.intro);
    } else if (!showCelebration && !feedback && !selected) {
      const msg = GUIDE_MESSAGES.encouragement[getRandomInt(0, GUIDE_MESSAGES.encouragement.length - 1)];
      setGuideMsg(msg);
      setGuideAnim('bounce');
      // Don't speak encouragement every time to avoid spam
    }
    // eslint-disable-next-line
  }, [showCelebration, feedback, selected, progress]);

  const handleSelect = (num: number) => {
    if (selected !== null) return;
    setSelected(num);
    if (num === round.answer) {
      setFeedback('correct');
      playSound('correct');
      setTimeout(() => {
        setProgress((p) => p + 1);
        if (progress >= 4) {
          setShowCelebration(true);
          setConfetti(true);
          playSound('celebrate');
          setTimeout(() => setConfetti(false), 2000);
        } else {
          setRound(generateRound());
          setSelected(null);
          setFeedback(null);
        }
      }, 1200);
    } else {
      setFeedback('wrong');
      playSound('wrong');
      setTimeout(() => {
        setSelected(null);
        setFeedback(null);
      }, 1000);
    }
  };

  const handleRestart = () => {
    setProgress(0);
    setShowCelebration(false);
    setRound(generateRound());
    setSelected(null);
    setFeedback(null);
    setConfetti(false);
  };

  // Helper to map guideAnim to SunnyMood
  const guideAnimToMood = (anim: string): SunnyMood => {
    if (anim === 'bounce') return 'happy';
    if (anim === 'wave') return 'encourage';
    if (anim === 'hint') return 'hint';
    return 'idle';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-200 via-pink-100 to-orange-200 p-2">
      {/* Confetti Animation */}
      <Confetti show={confetti} />
      {/* Progress Bar */}
      <div className="w-full max-w-lg mt-4 mb-2">
        <div className="h-4 bg-gradient-to-r from-yellow-300 via-pink-200 to-orange-300 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="h-4 bg-gradient-to-r from-yellow-400 via-pink-400 to-orange-400 shadow-lg"
            initial={{ width: 0 }}
            animate={{ width: `${((progress) / 5) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="text-right text-xs text-gray-500 mt-1 font-bold">Stage {progress + 1} / 5</div>
      </div>
      {/* Characters */}
      <div className="flex justify-center gap-2 mb-2">
        {CHARACTERS.slice(0, 5).map((char, i) => (
          <motion.div
            key={i}
            className="text-4xl md:text-5xl drop-shadow-lg"
            initial={{ y: -30, opacity: 0, scale: 0.7 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * i, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.15, rotate: getRandomInt(-10, 10) }}
          >
            {char}
          </motion.div>
        ))}
      </div>
      {/* Game Area */}
      <motion.div
        className="bg-white bg-gradient-to-br from-yellow-50 via-pink-50 to-orange-50 rounded-3xl shadow-2xl p-6 flex flex-col items-center w-full max-w-md relative border-4 border-yellow-200"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <div className="text-lg font-bold text-orange-600 mb-2 drop-shadow">How many dots?</div>
        <motion.div
          className="bg-green-100 bg-gradient-to-br from-green-100 via-green-50 to-green-200 rounded-2xl p-6 mb-6 flex items-center justify-center shadow-lg border-2 border-green-200"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
        >
          <motion.span
            className="text-6xl select-none"
            initial={{ rotate: -10 }}
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >🎲</motion.span>
          <span className="ml-4 text-5xl font-extrabold text-purple-700 select-none tracking-widest">
            {Array.from({ length: round.answer }).map((_, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 * i }}
                className="inline-block"
              >• </motion.span>
            ))}
          </span>
        </motion.div>
        <div className="flex gap-6 justify-center flex-wrap mt-2">
          {round.options.map((num, i) => (
            <motion.button
              key={num}
              className={`w-24 h-24 md:w-28 md:h-28 rounded-3xl text-4xl font-bold shadow-xl border-4 transition-all duration-300
                ${selected === num
                  ? feedback === 'correct'
                    ? 'border-green-500 bg-green-100 scale-110 animate-bounce'
                    : 'border-red-500 bg-red-100 scale-110 animate-shake'
                  : 'border-yellow-300 bg-yellow-50 hover:border-orange-400 hover:bg-orange-100'}
              `}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelect(num)}
              disabled={selected !== null}
              style={{ minWidth: 80, minHeight: 80 }}
            >
              {num}
            </motion.button>
          ))}
        </div>
        {/* Feedback Animation */}
        <AnimatePresence>
          {feedback === 'correct' && selected !== null && (
            <motion.div
              key="correct"
              className="absolute top-2 left-1/2 -translate-x-1/2 text-4xl font-extrabold text-green-500 animate-bounce drop-shadow-lg"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0, scale: [1, 1.2, 1] }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              🎉 Correct!
            </motion.div>
          )}
          {feedback === 'wrong' && selected !== null && (
            <motion.div
              key="wrong"
              className="absolute top-2 left-1/2 -translate-x-1/2 text-4xl font-extrabold text-red-500 animate-shake drop-shadow-lg"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0, scale: [1, 1.1, 1] }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              ❌ Try Again!
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      {/* Celebration Modal */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div className="fixed inset-0 bg-black/40 z-50 flex flex-col items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white/90 rounded-3xl p-10 shadow-2xl flex flex-col items-center border-4 border-yellow-300" initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
              <h2 className="text-3xl font-extrabold text-orange-600 mb-4 animate-bounce">Congratulations!</h2>
              <p className="text-lg mb-4">You finished all the rounds! 🎉</p>
              <div className="flex gap-2 mb-4">
                <span className="text-5xl animate-bounce">🎲</span>
                <span className="text-5xl animate-bounce">🎉</span>
                <span className="text-5xl animate-bounce">🦄</span>
              </div>
              <AnimatedButton onClick={handleRestart}>Play Again</AnimatedButton>
              <AnimatedButton variant="secondary" onClick={() => navigate(`/child-dashboard/${childId}`)} className="mt-2">Back to Dashboard</AnimatedButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Back Button */}
      <button
        className="fixed top-4 left-4 bg-yellow-200 hover:bg-yellow-300 text-yellow-800 font-bold px-4 py-2 rounded-full shadow-lg z-50"
        onClick={() => navigate(`/child-dashboard/${childId}`)}
      >
        ← Back
      </button>
      {/* Guide Character */}
      <SunnyMascot message={guideMsg} mood={guideAnimToMood(guideAnim)} />
    </div>
  );
};

export default EducationalGame; 