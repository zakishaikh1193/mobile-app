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

  // Responsive horizontal/vertical path at 1143px breakpoint
  if (typeof window !== 'undefined') {
    const style = document.createElement('style');
    style.innerHTML = `@media (min-width: 1143px) { .custom1143\\:flex-row { flex-direction: row !important; } }`;
    document.head.appendChild(style);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-green-100 px-2 sm:px-4 md:px-8 py-4 sm:py-8">
      {/* Blurred BG.png image as the only background */}
      <img
        src="/words/BG.png"
        alt="Background"
        className="fixed inset-0 w-full h-full object-cover z-0 opacity-60"
        style={{ minHeight: '100vh', minWidth: '100vw', objectFit: 'cover', zIndex: 0 }}
      />
      {/* Responsive Back Button */}
      <div className="w-full flex justify-center md:justify-start mb-4 relative z-20 mx-auto">
        <button
          className="w-full sm:w-48 md:w-auto px-4 py-2 rounded-full bg-blue-500 text-white font-bold shadow hover:bg-blue-600 active:scale-95 transition z-30 md:fixed md:top-4 md:left-4"
          onClick={handleBackToCards}
        >
          ← Back to Cards
        </button>
      </div>
      <h1 className="text-3xl font-extrabold text-center text-green-600 mb-8 mt-2 tracking-tight" style={{ fontFamily: 'Comic Sans MS, Comic Sans, cursive' }}>Letter Path</h1>
      <div className="relative flex flex-col custom1143:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-8 w-full px-2 sm:px-4 md:px-8">
        {/* Horizontal connecting line (road) for desktop */}
        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-2 z-10" style={{ transform: 'translateY(-50%)' }}>
          <div className="w-full h-full bg-gradient-to-r from-blue-300 via-pink-200 via-40% to-green-200 to-90% rounded-full opacity-70" />
        </div>
        {[...Array(LEVELS)].map((_, idx) => {
          const level = idx + 1;
          const isUnlocked = level === 1 || progress.includes(level - 1);
          const isCompleted = progress.includes(level);
          const badgeSrc = BADGES[idx];
          return (
            <div key={level} className="relative flex flex-col items-center w-full md:w-auto mx-0 md:mx-2 my-2 md:my-0 z-20">
              <div className="mb-2 flex flex-col items-center">
                <img
                  src={badgeSrc}
                  alt={`Level ${level} Badge`}
                  className={`w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 rounded-full shadow-lg border-4 transition-all duration-300 ${isCompleted ? 'border-green-500 scale-110 animate-bounce' : isUnlocked ? 'border-yellow-400 grayscale' : 'border-gray-300 grayscale opacity-60'} ${isCompleted ? '' : 'hover:scale-105'}`}
                  style={{ filter: isCompleted ? 'none' : 'grayscale(100%)', background: '#fff' }}
                />
                <span className="text-base sm:text-lg md:text-xl font-bold text-gray-700 mt-2">Level {level}</span>
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
              {/* Vertical line below each badge (road post) */}
              {idx < LEVELS - 1 && (
                <div className="h-8 w-1 bg-gradient-to-b from-green-300 to-blue-200 mx-auto rounded-full my-2 md:hidden"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LetterPath; 