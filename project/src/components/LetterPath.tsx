import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const BADGES = [
  '/badges/B1.png',
  '/badges/B2.png',
  '/badges/B3.png',
  '/badges/B4.png',
  '/badges/B5.png',
];

const LEVELS = 5;

const getProgress = () => {
  try {
    return JSON.parse(localStorage.getItem('letterPathProgress') || '[]');
  } catch {
    return [];
  }
};

const setProgress = (progress: number[]) => {
  localStorage.setItem('letterPathProgress', JSON.stringify(progress));
};

const LetterPath: React.FC = () => {
  const navigate = useNavigate();
  const { childId } = useParams<{ childId: string }>();
  const [progress, setProgressState] = useState<number[]>(getProgress());

  useEffect(() => {
    setProgress(progress);
  }, [progress]);

  const handleStart = (level: number) => {
    navigate(`/word-match/${childId}?level=${level}`);
  };

  const handleBackToCards = () => {
    navigate(`/child-dashboard/${childId}`);
  };

  const handleRestart = (level: number) => {
    // Remove this level and all higher levels from progress
    const newProgress = progress.filter(lvl => lvl < level);
    setProgressState(newProgress);
  };

  // For demo: unlock next level after finishing one (simulate after returning from game)
  useEffect(() => {
    const url = new URL(window.location.href);
    const finishedLevel = url.searchParams.get('finishedLevel');
    if (finishedLevel) {
      const lvl = parseInt(finishedLevel, 10);
      if (!progress.includes(lvl)) {
        setProgressState([...progress, lvl]);
      }
      url.searchParams.delete('finishedLevel');
      window.history.replaceState({}, '', url.pathname);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-green-100 p-4">
      {/* 4-color linear gradient background */}
      <div className="fixed inset-0 w-full h-full z-0" style={{ background: 'linear-gradient(135deg, #bae6fd 0%, #fbcfe8 40%, #bbf7d0 80%, #fef9c3 100%)' }} />
      <div className="w-full max-w-xs flex justify-start mb-4 relative z-20">
        <button
          className="px-4 py-2 rounded-full bg-blue-500 text-white font-bold shadow hover:bg-blue-600 active:scale-95 transition z-30"
          onClick={handleBackToCards}
        >
          ← Back to Cards
        </button>
      </div>
      <h1 className="text-3xl font-extrabold text-center text-green-600 mb-8 mt-2 tracking-tight" style={{ fontFamily: 'Comic Sans MS, Comic Sans, cursive' }}>Letter Path</h1>
      <div className="flex flex-col items-center gap-8 w-full max-w-xs mx-auto">
        {[...Array(LEVELS)].map((_, idx) => {
          const level = idx + 1;
          const isUnlocked = level === 1 || progress.includes(level - 1);
          const isCompleted = progress.includes(level);
          const badgeSrc = BADGES[idx];
          return (
            <div key={level} className="relative flex flex-col items-center w-full">
              <div className="mb-2 flex flex-col items-center">
                <img
                  src={badgeSrc}
                  alt={`Level ${level} Badge`}
                  className={`w-24 h-24 rounded-full shadow-lg border-4 transition-all duration-300 ${isCompleted ? 'border-green-500 scale-110 animate-bounce' : isUnlocked ? 'border-yellow-400 grayscale' : 'border-gray-300 grayscale opacity-60'} ${isCompleted ? '' : 'hover:scale-105'}`}
                  style={{ filter: isCompleted ? 'none' : 'grayscale(100%)', background: '#fff' }}
                />
                <span className="text-lg font-bold text-gray-700 mt-2">Level {level}</span>
              </div>
              <div className="flex flex-row gap-2 items-center justify-center mt-1">
                {isCompleted ? (
                  <>
                    <div className="text-green-600 font-bold">✓ Completed</div>
                    <button
                      className="ml-2 px-3 py-1 rounded-full bg-yellow-400 text-white font-bold shadow hover:bg-yellow-500 active:scale-95 transition text-sm"
                      onClick={() => handleRestart(level)}
                    >
                      Restart
                    </button>
                  </>
                ) : isUnlocked ? (
                  <>
                    <button
                      className="px-6 py-2 rounded-full bg-green-500 text-white font-bold shadow hover:bg-green-600 active:scale-95 transition"
                      onClick={() => handleStart(level)}
                    >
                      Start
                    </button>
                    <button
                      className="ml-2 px-3 py-1 rounded-full bg-yellow-400 text-white font-bold shadow hover:bg-yellow-500 active:scale-95 transition text-sm"
                      onClick={() => handleRestart(level)}
                    >
                      Restart
                    </button>
                  </>
                ) : (
                  <div className="text-gray-400 text-2xl">🔒</div>
                )}
              </div>
              {idx < LEVELS - 1 && (
                <div className="w-2 h-12 bg-gradient-to-b from-green-300 to-blue-200 mx-auto rounded-full my-2"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LetterPath; 