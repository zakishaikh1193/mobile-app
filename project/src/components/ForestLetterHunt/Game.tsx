import React, { useState, useEffect, useCallback } from 'react';
import { getRandomLetters, getPhonicsPrompt, getLevelTheme } from './utils/gameLogic';
import { useAudio } from './useAudio';
import { Star, Trophy, Heart } from 'lucide-react';
import Bush from './Bush';

export interface GameSettings {
  audioEnabled: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  gameMode: 'letters' | 'phonics' | 'sightWords';
  letterCase: 'uppercase' | 'lowercase' | 'mixed';
}

export interface GameProgress {
  level: number;
  totalStars: number;
  lettersLearned: string[];
  accuracy: number;
  gamesPlayed: number;
}

interface GameProps {
  settings: GameSettings;
  progress: GameProgress;
  onProgressUpdate: (progress: GameProgress) => void;
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const Game: React.FC<GameProps> = ({ settings, progress, onProgressUpdate }) => {
  const [bushLetters, setBushLetters] = useState<string[]>([]);
  const [foundIndexes, setFoundIndexes] = useState<number[]>([]);
  const [currentTargetIndex, setCurrentTargetIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ index: number; type: 'correct' | 'incorrect' | null } | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [gamePhase, setGamePhase] = useState<'playing' | 'levelComplete'>('playing');
  const [lives, setLives] = useState(3);
  const [totalGuesses, setTotalGuesses] = useState(0);
  const [correctGuesses, setCorrectGuesses] = useState(0);

  const { playSound, speak } = useAudio(settings.audioEnabled);
  const levelTheme = getLevelTheme(progress.level);

  // Start a new level
  const startLevel = useCallback(() => {
    const letters = getRandomLetters(settings.difficulty, settings.letterCase);
    setBushLetters(letters);
    setFoundIndexes([]);
    setFeedback(null);
    setCorrectGuesses(0);
    setTotalGuesses(0);
    setLives(3);
    // Pick a random target from all
    const idx = Math.floor(Math.random() * letters.length);
    setCurrentTargetIndex(idx);
    // Announce
    if (settings.audioEnabled) {
      let prompt = '';
      if (settings.gameMode === 'letters') {
        prompt = `Find the letter ${letters[idx].toUpperCase()}`;
      } else if (settings.gameMode === 'phonics') {
        prompt = getPhonicsPrompt(letters[idx]);
      }
      setTimeout(() => speak(prompt), 500);
    }
  }, [settings, speak]);

  useEffect(() => {
    startLevel();
  }, [startLevel]);

  // Helper: get available (not found) indexes
  const getAvailableIndexes = () => bushLetters.map((_, i) => i).filter(i => !foundIndexes.includes(i));

  // Handle bush click
  const handleBushClick = (letter: string, bushIndex: number) => {
    if (foundIndexes.includes(bushIndex) || currentTargetIndex === null) return;
    setTotalGuesses(prev => prev + 1);
    if (bushIndex === currentTargetIndex) {
      // Correct
      setFeedback({ index: bushIndex, type: 'correct' });
      playSound('correct');
      speak('Great job!');
      setCorrectGuesses(prev => prev + 1);
      const newFound = [...foundIndexes, bushIndex];
      setFoundIndexes(newFound);
      setTimeout(() => {
        setFeedback(null);
        // If all found, level complete
        if (newFound.length === bushLetters.length) {
          setShowCelebration(true);
          setGamePhase('levelComplete');
          // Update progress
          const newProgress = {
            ...progress,
            level: progress.level + 1,
            totalStars: progress.totalStars + 3,
            lettersLearned: [...new Set([...progress.lettersLearned, ...bushLetters])],
            accuracy: Math.round(((correctGuesses + 1) / (totalGuesses + 1)) * 100),
            gamesPlayed: progress.gamesPlayed + 1
          };
          onProgressUpdate(newProgress);
          speak('Level complete! Amazing work!');
          setTimeout(() => {
            setShowCelebration(false);
            setGamePhase('playing');
            startLevel();
          }, 3000);
        } else {
          // Shuffle remaining
          const available = getAvailableIndexes().filter(i => i !== bushIndex);
          const shuffled = shuffle(available);
          // Reorder bushLetters so found stay in place, others shuffle
          const newBushLetters = [...bushLetters];
          const unfoundLetters = available.map(i => bushLetters[i]);
          shuffled.forEach((shufIdx, i) => {
            newBushLetters[available[i]] = bushLetters[shufIdx];
          });
          setBushLetters(newBushLetters);
          // Pick new target from remaining
          const nextIndexes = getAvailableIndexes().filter(i => i !== bushIndex);
          if (nextIndexes.length > 0) {
            const nextTarget = nextIndexes[Math.floor(Math.random() * nextIndexes.length)];
            setCurrentTargetIndex(nextTarget);
            // Announce
            if (settings.audioEnabled) {
              let prompt = '';
              if (settings.gameMode === 'letters') {
                prompt = `Find the letter ${newBushLetters[nextTarget].toUpperCase()}`;
              } else if (settings.gameMode === 'phonics') {
                prompt = getPhonicsPrompt(newBushLetters[nextTarget]);
              }
              setTimeout(() => speak(prompt), 500);
            }
          }
        }
      }, 1200);
    } else {
      // Incorrect
      setFeedback({ index: bushIndex, type: 'incorrect' });
      playSound('incorrect');
      speak('Oops, try again!');
      setTimeout(() => setFeedback(null), 1000);
      setLives(prev => prev - 1);
      if (lives <= 1) {
        setTimeout(() => startLevel(), 1200);
      }
    }
  };

  const getCurrentPrompt = () => {
    if (currentTargetIndex === null) return '';
    if (settings.gameMode === 'letters') {
      return `Find the letter ${bushLetters[currentTargetIndex].toUpperCase()}`;
    } else if (settings.gameMode === 'phonics') {
      return getPhonicsPrompt(bushLetters[currentTargetIndex]);
    }
    return `Find the letter ${bushLetters[currentTargetIndex].toUpperCase()}`;
  };

  // Estimated bush positions (adjust as needed to match your background)
  const bushPositions = [
    { left: '8%', top: '47%' },   // B1 (leftmost)
    { left: '22%', top: '80%' }, // B2
    { left: '40%', top: '48%' }, // B3
    { left: '80%', top: '48%' }, // B4
    { left: '80%', top: '90%' }  // B5 (rightmost, moved further down)
  ];

  // Responsive bush/monkey size
  const bushSize = 'clamp(60px, 12vw, 110px)';
  const monkeySize = 'clamp(70px, 14vw, 120px)';

  // Monkey walk animation: from B1 to B5
  const walkStart = bushPositions[0];
  const walkEnd = bushPositions[4];

  // Only animate on first render of the level
  const [walk, setWalk] = useState(true);
  useEffect(() => {
    setWalk(true);
    const timeout = setTimeout(() => setWalk(false), 2500); // 2.5s walk duration
    return () => clearTimeout(timeout);
  }, [progress.level]);

  // Monkey position: at the current target bush (or first bush if null)
  const monkeyIndex = currentTargetIndex !== null ? currentTargetIndex : 0;
  const monkeyPos = bushPositions[monkeyIndex];

  return (
    <div className="max-w-6xl mx-auto w-full">
      {/* Game Status */}
      <div className="flex flex-wrap justify-between items-center mb-6 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="text-lg font-bold text-green-800">
            Level {progress.level} • {levelTheme.name}
          </div>
          <div className="flex gap-1">
            {Array.from({ length: lives }).map((_, i) => (
              <Heart key={i} className="text-red-500 fill-current" size={20} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Star className="text-yellow-500 fill-current" size={20} />
            <span className="font-bold text-yellow-700">{progress.totalStars}</span>
          </div>
          <div className="text-sm text-gray-600">
            Progress: {foundIndexes.length}/5
          </div>
        </div>
      </div>
      {/* Current Challenge */}
      <div className="text-center mb-8">
        <div 
          className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-4 p-6 rounded-xl shadow-lg ${levelTheme.colors.prompt}`}
        >
          {getCurrentPrompt()}
        </div>
        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                i < foundIndexes.length 
                  ? 'bg-green-500 scale-110' 
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
      {/* Game Board */}
      <div className="relative w-full" style={{ height: 'min(60vw, 420px)', minHeight: '320px', marginTop: '3rem' }}>
        {/* Bushes */}
        {bushLetters.map((letter, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: bushPositions[index].left,
              top: bushPositions[index].top,
              width: bushSize,
              height: bushSize,
              transform: 'translate(-50%, -50%)',
              zIndex: 20
            }}
          >
            <Bush
              letter={letter}
              isRevealed={foundIndexes.includes(index)}
              onClick={() => handleBushClick(letter, index)}
              bushImageIndex={index}
              feedback={feedback && feedback.index === index ? feedback.type : null}
            />
          </div>
        ))}
      </div>
      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-yellow-300 to-orange-300 p-8 rounded-3xl shadow-2xl text-center animate-bounce">
            <Trophy className="mx-auto text-yellow-700 mb-4" size={64} />
            <h2 className="text-4xl font-bold text-yellow-800 mb-2">
              Level Complete!
            </h2>
            <p className="text-xl text-yellow-700 mb-4">
              You earned 3 stars! 🌟🌟🌟
            </p>
            <div className="flex justify-center gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Star 
                  key={i} 
                  className="text-yellow-500 fill-current animate-pulse" 
                  size={32}
                  style={{ animationDelay: `${i * 200}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;