import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, VolumeX, Star, Award, Trophy, Zap, Crown, Target } from 'lucide-react';
import clsx from 'clsx';
import { useNavigate, useParams } from 'react-router-dom';
import { useAudio } from '../contexts/AudioContext';
import AnimatedButton from '../components/AnimatedButton';

// --- Types ---
type Letter = {
  char: string;
  id: string;
};
type Picture = {
  name: string;
  emoji: string;
  id: string;
};
type Match = {
  letterId: string;
  pictureId: string;
};

// --- Data ---
const LETTERS: Letter[] = [
  { char: 'A', id: 'A' },
  { char: 'B', id: 'B' },
  { char: 'C', id: 'C' },
  { char: 'D', id: 'D' },
  { char: 'E', id: 'E' },
  { char: 'F', id: 'F' },
  { char: 'G', id: 'G' },
  { char: 'H', id: 'H' },
  { char: 'I', id: 'I' },
  { char: 'J', id: 'J' },
];
const PICTURES: Picture[] = [
  { name: 'Apple', emoji: '🍎', id: 'A' },
  { name: 'Butterfly', emoji: '🦋', id: 'B' },
  { name: 'Castle', emoji: '🏰', id: 'C' },
  { name: 'Dragon', emoji: '🐉', id: 'D' },
  { name: 'Elephant', emoji: '🐘', id: 'E' },
  { name: 'Fireworks', emoji: '🎆', id: 'F' },
  { name: 'Galaxy', emoji: '🌌', id: 'G' },
  { name: 'Helicopter', emoji: '🚁', id: 'H' },
  { name: 'Island', emoji: '🏝️', id: 'I' },
  { name: 'Jellyfish', emoji: '🪼', id: 'J' },
];

// --- Utility: Smart positioning (no overlap) ---
const getRandomPositions = (
  count: number,
  width: number,
  height: number,
  elementSize: number,
  padding: number
) => {
  const positions: { x: number; y: number }[] = [];
  let attempts = 0;
  while (positions.length < count && attempts < 1000) {
    const x = Math.random() * (width - elementSize - padding * 2) + padding;
    const y = Math.random() * (height - elementSize - padding * 2) + padding;
    const overlaps = positions.some(
      (pos) =>
        Math.abs(pos.x - x) < elementSize + padding &&
        Math.abs(pos.y - y) < elementSize + padding
    );
    if (!overlaps) {
      positions.push({ x, y });
    }
    attempts++;
  }
  return positions;
};

// --- Main Component ---
const ALL_LEVELS = [
  // Level 1: A-E
  [
    { char: 'A', id: 'A', name: 'Apple', emoji: '🍎' },
    { char: 'B', id: 'B', name: 'Butterfly', emoji: '🦋' },
    { char: 'C', id: 'C', name: 'Castle', emoji: '🏰' },
    { char: 'D', id: 'D', name: 'Dragon', emoji: '🐉' },
    { char: 'E', id: 'E', name: 'Elephant', emoji: '🐘' },
  ],
  // Level 2: F-J
  [
    { char: 'F', id: 'F', name: 'Fireworks', emoji: '🎆' },
    { char: 'G', id: 'G', name: 'Galaxy', emoji: '🌌' },
    { char: 'H', id: 'H', name: 'Helicopter', emoji: '🚁' },
    { char: 'I', id: 'I', name: 'Island', emoji: '🏝️' },
    { char: 'J', id: 'J', name: 'Jellyfish', emoji: '🪼' },
  ],
  // Level 3: K-O
  [
    { char: 'K', id: 'K', name: 'Kite', emoji: '🪁' },
    { char: 'L', id: 'L', name: 'Lion', emoji: '🦁' },
    { char: 'M', id: 'M', name: 'Monkey', emoji: '🐒' },
    { char: 'N', id: 'N', name: 'Nest', emoji: '🪺' },
    { char: 'O', id: 'O', name: 'Octopus', emoji: '🐙' },
  ],
  // Level 4: P-T
  [
    { char: 'P', id: 'P', name: 'Panda', emoji: '🐼' },
    { char: 'Q', id: 'Q', name: 'Queen', emoji: '👸' },
    { char: 'R', id: 'R', name: 'Rocket', emoji: '🚀' },
    { char: 'S', id: 'S', name: 'Sun', emoji: '☀️' },
    { char: 'T', id: 'T', name: 'Tiger', emoji: '🐯' },
  ],
  // Level 5: U-Y
  [
    { char: 'U', id: 'U', name: 'Umbrella', emoji: '☂️' },
    { char: 'V', id: 'V', name: 'Violin', emoji: '🎻' },
    { char: 'W', id: 'W', name: 'Whale', emoji: '🐋' },
    { char: 'X', id: 'X', name: 'Xylophone', emoji: '🎶' },
    { char: 'Y', id: 'Y', name: 'Yacht', emoji: '🛥️' },
  ],
  // Level 6: Z + fun extras
  [
    { char: 'Z', id: 'Z', name: 'Zebra', emoji: '🦓' },
    { char: 'A1', id: 'A1', name: 'Airplane', emoji: '✈️' },
    { char: 'B1', id: 'B1', name: 'Balloon', emoji: '🎈' },
    { char: 'C1', id: 'C1', name: 'Camera', emoji: '📷' },
    { char: 'D1', id: 'D1', name: 'Drum', emoji: '🥁' },
  ],
];

const LetterMatchingGame: React.FC = () => {
  const navigate = useNavigate();
  const { childId } = useParams<{ childId: string }>();
  const { playSound, speak } = useAudio();
  const [level, setLevel] = useState(0); // 0-based index
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [completed, setCompleted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [positions, setPositions] = useState<{ letters: any[]; pictures: any[] }>({ letters: [], pictures: [] });
  const [attempts, setAttempts] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [accuracy, setAccuracy] = useState(100);
  const [progress, setProgress] = useState(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [hintLetter, setHintLetter] = useState<string | null>(null);

  // --- Letters and Pictures for current level ---
  const currentSet = ALL_LEVELS[level] || [];
  const LETTERS = currentSet.map(l => ({ char: l.char, id: l.id }));
  const PICTURES = currentSet.map(l => ({ name: l.name, emoji: l.emoji, id: l.id }));
  const totalPairs = currentSet.length;
  const isLastLevel = level === ALL_LEVELS.length - 1;
  const setIsValid = LETTERS.length === PICTURES.length;

  // --- Positioning ---
  useEffect(() => {
    if (gameAreaRef.current && setIsValid) {
      const width = gameAreaRef.current.offsetWidth;
      const height = gameAreaRef.current.offsetHeight;
      const letterPositions = getRandomPositions(totalPairs, width * 0.4, height, 90, 30);
      const picturePositions = getRandomPositions(totalPairs, width * 0.4, height, 110, 30);
      setPositions({
        letters: letterPositions.map((pos) => ({ ...pos, x: pos.x + 0 })),
        pictures: picturePositions.map((pos) => ({ ...pos, x: pos.x + width * 0.6 })),
      });
    }
  }, [gameAreaRef.current, level, setIsValid]);

  // --- Handle Matching ---
  const handleLetterClick = (id: string) => {
    if (matches.length === totalPairs) return;
    playSound('click');
    setSelectedLetter(id);
    setHintLetter(null); // Remove hint after any manual interaction
  };
  const handlePictureClick = (id: string) => {
    if (matches.length === totalPairs) return;
    setAttempts(a => a + 1);
    if (selectedLetter && id === selectedLetter) {
      playSound('success');
      speak('Great job!');
      setMatches((prev) => {
        const newMatches = [...prev, { letterId: selectedLetter, pictureId: id }];
        // If this was the last match in the set
        if (newMatches.length === totalPairs) {
          setTimeout(() => {
            if (isLastLevel) {
              playSound('celebration');
              speak('Congratulations! You finished all levels!');
              setCompleted(true);
              setShowCelebration(true);
              setShowSummary(false);
              console.log('Show celebration overlay (last set)');
            } else {
              setShowSummary(true);
              setShowCelebration(false);
              console.log('Show summary overlay (not last set)');
            }
          }, 600);
        }
        return newMatches;
      });
      setStreak(s => {
        const newStreak = s + 1;
        setMaxStreak(ms => Math.max(ms, newStreak));
        return newStreak;
      });
      setSelectedLetter(null);
      setHintLetter(null); // Remove hint after a correct match
      setProgress((matches.length + 1) / totalPairs * 100);
    } else {
      playSound('click');
      speak('Try again!');
      setStreak(0);
      setSelectedLetter(null);
      setHintLetter(null); // Remove hint after a wrong attempt
    }
    // Update accuracy
    setAccuracy(Math.round(((matches.length + 1) / (attempts + 1)) * 100));
  };

  // --- Play Again (current set) ---
  const handlePlayAgainSet = () => {
    playSound('celebration');
    setMatches([]);
    setSelectedLetter(null);
    setAttempts(0);
    setStreak(0);
    setAccuracy(100);
    setProgress(0);
    setShowSummary(false);
    setShowCelebration(false);
    setCompleted(false);
    setHintLetter(null);
    console.log('Play Again: reset current set');
  };

  // --- Next Set ---
  const handleNextSet = () => {
    playSound('success');
    setLevel(l => l + 1);
    setMatches([]);
    setSelectedLetter(null);
    setAttempts(0);
    setStreak(0);
    setAccuracy(100);
    setProgress(0);
    setShowSummary(false);
    setShowCelebration(false);
    setCompleted(false);
    setHintLetter(null);
    console.log('Next: advance to next set');
  };

  // --- Play Again (whole game) ---
  const handlePlayAgainGame = () => {
    playSound('celebration');
    setLevel(0);
    setMatches([]);
    setCompleted(false);
    setShowCelebration(false);
    setSelectedLetter(null);
    setAttempts(0);
    setStreak(0);
    setAccuracy(100);
    setProgress(0);
    setMaxStreak(0);
    setAchievements([]);
    setShowSummary(false);
    setHintLetter(null);
    console.log('Play Again: reset whole game');
  };

  // --- Achievements (simple example) ---
  useEffect(() => {
    const newAchievements: string[] = [];
    if (accuracy === 100 && matches.length === totalPairs) newAchievements.push('Perfect Accuracy!');
    if (maxStreak >= totalPairs) newAchievements.push('Streak Master!');
    if (isLastLevel && completed) newAchievements.push('Alphabet Champion!');
    setAchievements(newAchievements);
  }, [accuracy, matches.length, maxStreak, completed, isLastLevel, totalPairs]);

  // --- Handle Help (Hint) ---
  const handleHelp = () => {
    if (matches.length === totalPairs) return;
    // Find the first unmatched letter and its correct image
    for (let i = 0; i < LETTERS.length; i++) {
      const letter = LETTERS[i];
      const alreadyMatched = matches.some(m => m.letterId === letter.id);
      if (!alreadyMatched) {
        setHintLetter(letter.id);
        setSelectedLetter(null); // Only highlight hint, not select
        break;
      }
    }
  };

  // --- Render ---
  if (!setIsValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error: Mismatched Letters and Images</h2>
          <p className="text-lg text-gray-700 mb-4">This set has {LETTERS.length} letters and {PICTURES.length} images. Please fix the data for this level.</p>
          <AnimatedButton onClick={handlePlayAgainGame}>Restart Game</AnimatedButton>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 relative overflow-hidden">
      {/* Floating Particles (placeholder) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Add particle animation here */}
      </div>
      {/* Header */}
      <div className="w-full flex flex-col items-center pt-6 pb-2 z-10 relative">
        {/* Back Button */}
        <div className="absolute left-4 top-4">
          <AnimatedButton variant="secondary" size="sm" onClick={() => navigate(`/child-dashboard/${childId}`)}>
            <span className="flex items-center"><ArrowLeft className="h-4 w-4 mr-1" />Back</span>
          </AnimatedButton>
        </div>
        <motion.h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent drop-shadow-lg mb-2 tracking-wide" initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.7 }}>
          🌟 Fun Letter Matching Adventure! 🌟
        </motion.h1>
        <motion.p className="text-lg md:text-2xl font-semibold text-purple-700 mb-4 flex items-center gap-2">
          Match Letters with Pictures - It's Super Fun! <span role="img" aria-label="game">🎮✨</span>
        </motion.p>
        <div className="flex gap-2 mb-4 items-center">
          <span className="text-base font-bold text-purple-600 bg-white/70 rounded-full px-4 py-1 shadow">Level {level + 1} / {ALL_LEVELS.length}</span>
          <span className="text-base font-bold text-blue-600 bg-white/70 rounded-full px-4 py-1 shadow">Matched {matches.length}/{totalPairs}</span>
          <AnimatedButton variant="fun" size="sm" onClick={handleHelp} disabled={matches.length === totalPairs}>
            Help
          </AnimatedButton>
          <button onClick={() => setSoundOn((s) => !s)} className={clsx("rounded-full p-2 bg-white/70 shadow backdrop-blur hover:scale-110 transition", soundOn ? "ring-2 ring-green-400" : "ring-2 ring-gray-300")}>{soundOn ? <Volume2 className="text-green-500" /> : <VolumeX className="text-gray-400" />}</button>
        </div>
      </div>
      {/* Analytics Dashboard */}
      <div className="flex justify-center gap-3 mb-4 z-10 relative">
        <motion.div layout className="glass-card flex flex-col items-center px-4 py-2">
          <Target className="text-green-500 mb-1" />
          <motion.span layout className="font-bold text-green-700" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}>{accuracy}%</motion.span>
          <span className="text-xs text-gray-500">Accuracy</span>
        </motion.div>
        <motion.div layout className="glass-card flex flex-col items-center px-4 py-2">
          <Zap className="text-blue-500 mb-1" />
          <motion.span layout className="font-bold text-blue-700" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}>{streak}</motion.span>
          <span className="text-xs text-gray-500">Streak</span>
        </motion.div>
        <motion.div layout className="glass-card flex flex-col items-center px-4 py-2">
          <Crown className="text-purple-500 mb-1" />
          <motion.span layout className="font-bold text-purple-700" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}>L{level + 1}</motion.span>
          <span className="text-xs text-gray-500">Level</span>
        </motion.div>
        <motion.div layout className="glass-card flex flex-col items-center px-4 py-2">
          <Trophy className="text-yellow-500 mb-1" />
          <motion.span layout className="font-bold text-yellow-700" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}>{matches.length}/{totalPairs}</motion.span>
          <span className="text-xs text-gray-500">Progress</span>
        </motion.div>
        <motion.div layout className="glass-card flex flex-col items-center px-4 py-2">
          <Award className="text-pink-500 mb-1" />
          <motion.span layout className="font-bold text-pink-700" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}>{achievements.length}</motion.span>
          <span className="text-xs text-gray-500">Achievements</span>
        </motion.div>
      </div>
      {/* Game Area */}
      <div ref={gameAreaRef} className="relative mx-auto bg-white/60 rounded-3xl shadow-xl backdrop-blur-lg w-[95vw] max-w-5xl h-[60vh] min-h-[400px] mb-8 z-10 overflow-visible">
        {/* SVG Lines */}
        <svg className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
          {matches.map((match, i) => {
            const letterPos = positions.letters[LETTERS.findIndex(l => l.id === match.letterId)];
            const picPos = positions.pictures[PICTURES.findIndex(p => p.id === match.pictureId)];
            if (!letterPos || !picPos) return null;
            return (
              <motion.line
                key={match.letterId}
                x1={letterPos.x + 45}
                y1={letterPos.y + 45}
                x2={picPos.x + 55}
                y2={picPos.y + 55}
                stroke="url(#gradient)"
                strokeWidth="8"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                strokeLinecap="round"
                filter="url(#glow)"
              />
            );
          })}
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>
        {/* Letters */}
        {positions.letters.map((pos, i) => {
          const letter = LETTERS[i];
          const matched = matches.some(m => m.letterId === letter.id);
          const disabled = matches.length === totalPairs;
          // Highlight if this is the hint target
          const isHintTarget = hintLetter === letter.id && !matched;
          return (
            <motion.div
              key={letter.id}
              className={clsx(
                "absolute flex items-center justify-center w-[90px] h-[90px] rounded-2xl font-extrabold text-4xl cursor-pointer select-none shadow-lg transition-all",
                matched ? "bg-gradient-to-br from-green-200 to-green-400 ring-4 ring-green-400 scale-105" :
                isHintTarget ? "bg-gradient-to-br from-yellow-200 to-yellow-400 ring-4 ring-yellow-400 animate-bounce" :
                selectedLetter === letter.id ? "bg-gradient-to-br from-yellow-200 to-yellow-400 ring-4 ring-yellow-400 animate-bounce" :
                "bg-gradient-to-br from-purple-200 to-blue-200 hover:scale-110 hover:shadow-2xl",
                disabled && "opacity-60 cursor-not-allowed"
              )}
              style={{ left: pos.x, top: pos.y, zIndex: 2 }}
              onClick={() => !matched && !disabled && handleLetterClick(letter.id)}
              tabIndex={0}
              aria-label={`Letter ${letter.char}`}
            >
              {letter.char}
              {matched && <Star className="absolute -top-2 -right-2 text-yellow-400 animate-ping" size={28} />}
            </motion.div>
          );
        })}
        {/* Pictures */}
        {positions.pictures.map((pos, i) => {
          const pic = PICTURES[i];
          const matched = matches.some(m => m.pictureId === pic.id);
          const disabled = matches.length === totalPairs;
          // Highlight if this is the hint target
          const isHintTarget = hintLetter && !matched && pic.id === hintLetter;
          return (
            <motion.div
              key={pic.id}
              className={clsx(
                "absolute flex flex-col items-center justify-center w-[110px] h-[110px] rounded-3xl font-bold text-lg cursor-pointer select-none shadow-lg transition-all border-2 border-white",
                matched ? "bg-gradient-to-br from-pink-200 to-pink-400 ring-4 ring-pink-400 scale-105" :
                isHintTarget ? "bg-gradient-to-br from-yellow-200 to-yellow-400 ring-4 ring-yellow-400 animate-bounce" :
                "bg-gradient-to-br from-blue-100 to-pink-100 hover:scale-110 hover:shadow-2xl",
                disabled && "opacity-60 cursor-not-allowed"
              )}
              style={{ left: pos.x, top: pos.y, zIndex: 2 }}
              onClick={() => !matched && !disabled && handlePictureClick(pic.id)}
              tabIndex={0}
              aria-label={`Picture ${pic.name}`}
            >
              <span className="text-4xl mb-1 drop-shadow-lg">{pic.emoji}</span>
              <span className="text-base font-extrabold text-purple-700 bg-white/70 rounded px-2 py-0.5 mt-1 shadow">{pic.name}</span>
              {matched && <Star className="absolute -top-2 -right-2 text-yellow-400 animate-ping" size={28} />}
            </motion.div>
          );
        })}
      </div>
      {/* Performance Insights, Recommendations, Next Adventure */}
      <div className="flex flex-wrap justify-center gap-4 mb-8 z-10 relative">
        <div className="glass-card w-64 h-24 flex flex-col items-center justify-center text-purple-700 font-bold">
          Performance Insights
          <span className="text-xs font-normal mt-2">(Coming soon: Real analytics based on your gameplay!)</span>
        </div>
        <div className="glass-card w-64 h-24 flex flex-col items-center justify-center text-blue-700 font-bold">
          Smart Recommendations
          <span className="text-xs font-normal mt-2">(Coming soon: Personalized tips and next steps!)</span>
        </div>
        <div className="glass-card w-64 h-24 flex flex-col items-center justify-center text-pink-700 font-bold">Next Adventure<br /><span className="text-xs font-normal">{level < ALL_LEVELS.length - 1 ? `Complete this level to unlock: Letters ${ALL_LEVELS[level + 1].map(l => l.char).join('-')} Challenge!` : 'You finished all levels!'}</span></div>
      </div>
      {/* Summary Overlay (after each set except last) */}
      <AnimatePresence>
        {showSummary && !isLastLevel && (
          <motion.div className="fixed inset-0 bg-black/40 z-50 flex flex-col items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white/90 rounded-3xl p-10 shadow-2xl flex flex-col items-center" initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
              <h2 className="text-3xl font-extrabold text-purple-600 mb-4">Great Job!</h2>
              <p className="text-lg mb-4">You finished this set!</p>
              <div className="flex gap-4 mb-4">
                <div className="flex flex-col items-center"><Target className="text-green-500 mb-1" /><span className="font-bold text-green-700">{accuracy}%</span><span className="text-xs text-gray-500">Accuracy</span></div>
                <div className="flex flex-col items-center"><Zap className="text-blue-500 mb-1" /><span className="font-bold text-blue-700">{maxStreak}</span><span className="text-xs text-gray-500">Max Streak</span></div>
                <div className="flex flex-col items-center"><Trophy className="text-yellow-500 mb-1" /><span className="font-bold text-yellow-700">{matches.length}/{totalPairs}</span><span className="text-xs text-gray-500">Progress</span></div>
              </div>
              <div className="flex gap-4">
                <AnimatedButton variant="fun" onClick={handlePlayAgainSet}>Play Again</AnimatedButton>
                <AnimatedButton variant="success" onClick={handleNextSet}>Next</AnimatedButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Celebration Overlay (after last set) */}
      <AnimatePresence>
        {showCelebration && isLastLevel && (
          <motion.div className="fixed inset-0 bg-black/40 z-50 flex flex-col items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white/90 rounded-3xl p-10 shadow-2xl flex flex-col items-center" initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
              <h2 className="text-3xl font-extrabold text-purple-600 mb-4">Congratulations!</h2>
              <p className="text-lg mb-4">You matched all the letters! 🌟</p>
              <div className="flex gap-2 mb-4">
                <Star className="text-yellow-400 animate-bounce" size={40} />
                <Star className="text-pink-400 animate-bounce" size={40} />
                <Star className="text-blue-400 animate-bounce" size={40} />
              </div>
              <div className="mb-4">
                {achievements.map((ach, i) => (
                  <div key={i} className="inline-block bg-gradient-to-r from-yellow-200 to-pink-200 text-yellow-800 font-bold px-4 py-2 rounded-2xl shadow mx-2 animate-pulse">{ach}</div>
                ))}
              </div>
              <AnimatedButton variant="fun" onClick={handlePlayAgainGame}>Play Again</AnimatedButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Glass-morphism card style */}
      <style>{`
        .glass-card {
          background: rgba(255,255,255,0.7);
          border-radius: 1.5rem;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.18);
        }
      `}</style>
    </div>
  );
};

export default LetterMatchingGame; 