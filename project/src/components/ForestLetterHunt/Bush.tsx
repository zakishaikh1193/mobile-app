import React, { useState, useEffect } from 'react';

interface BushProps {
  letter: string;
  isRevealed: boolean;
  onClick: () => void;
  bushImageIndex: number;
  feedback?: 'correct' | 'incorrect' | null;
}

const Bush: React.FC<BushProps> = ({ letter, isRevealed, onClick, bushImageIndex, feedback }) => {
  const [isPeeking, setIsPeeking] = useState(false);

  const bushImages = [
    '/bushes/Adobe Express - file.png',
    '/bushes/acf0205c-f209-484f-9fb8-7747ded0488a_removalai_preview.png',
    '/bushes/1f430756-5d5b-4150-abcc-74dc4f3b30f1_removalai_preview.png',
    '/bushes/82d55837-8265-4ba8-891f-96f90d2bda29_removalai_preview.png',
    '/bushes/f2a23559-dfe4-4d92-ae35-4828f2fd4fa9_removalai_preview.png'
  ];

  const selectedBushImage = bushImages[bushImageIndex % bushImages.length];

  // Hide and seek animation - peek every 2 seconds
  useEffect(() => {
    if (isRevealed) return; // Stop peeking if already revealed

    const interval = setInterval(() => {
      setIsPeeking(true);
      // Hide again after 8 seconds
      setTimeout(() => {
        setIsPeeking(false);
      }, 8000);
    }, 12000); // 4 seconds hidden + 8 seconds visible = 12 second cycle

    return () => clearInterval(interval);
  }, [isRevealed]);

  let feedbackClass = '';
  if (feedback === 'correct') feedbackClass = 'ring-4 ring-green-400';
  if (feedback === 'incorrect') feedbackClass = 'ring-4 ring-red-400';

  return (
    <div 
      className={`relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 cursor-pointer transition-transform hover:scale-105 ${feedbackClass}`}
      onClick={onClick}
    >
      {/* Bush Image */}
      <img 
        src={selectedBushImage}
        alt="Forest bush"
        className="w-full h-full object-contain relative z-10"
      />
      {/* Letter - completely hidden behind bush, peeks out every 2 seconds */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span 
          className={`text-4xl md:text-5xl lg:text-6xl font-bold text-white transition-all duration-500 ${
            isRevealed ? 'animate-bounce z-20' : 'z-0'
          }`}
          style={{
            textShadow: '4px 4px 8px rgba(0,0,0,1), 0 0 15px rgba(255,255,255,0.8), 2px 2px 4px rgba(0,0,0,0.8)',
            WebkitTextStroke: '2px black',
            transform: isRevealed 
              ? 'translateY(-30px) scale(1.6)' 
              : isPeeking 
                ? `translateX(${bushImageIndex % 2 === 0 ? '40px' : '-40px'}) translateY(0px) scale(1.3)` 
                : `translateX(${bushImageIndex % 2 === 0 ? '80px' : '-80px'}) translateY(80px) scale(0.6)`,
            opacity: isRevealed ? 1 : isPeeking ? 1 : 0,
            transition: 'all 1.5s ease-in-out'
          }}
        >
          {letter}
        </span>
      </div>
      {/* Sparkle effect when revealed */}
      {isRevealed && (
        <div className="absolute inset-0 pointer-events-none z-30">
          <div className="absolute top-2 right-2 text-yellow-400 animate-ping">✨</div>
          <div className="absolute bottom-2 left-2 text-yellow-400 animate-ping delay-200">✨</div>
          <div className="absolute top-1/2 left-2 text-yellow-400 animate-ping delay-400">⭐</div>
          <div className="absolute top-4 left-1/2 text-yellow-400 animate-ping delay-600">✨</div>
        </div>
      )}
      {/* Peek indicator - subtle glow when letter is peeking */}
      {isPeeking && !isRevealed && (
        <div className={`absolute top-1/2 ${bushImageIndex % 2 === 0 ? 'right-0' : 'left-0'} w-20 h-20 bg-yellow-300/60 rounded-full animate-pulse z-5 transform -translate-y-1/2 border-4 border-yellow-400/80`} />
      )}
    </div>
  );
};

export default Bush;