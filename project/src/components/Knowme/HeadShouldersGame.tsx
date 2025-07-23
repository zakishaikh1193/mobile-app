import React, { useState } from 'react';
import { Play, Pause, Music, CheckCircle } from 'lucide-react';

interface HeadShouldersGameProps {
  onComplete: () => void;
}

const HeadShouldersGame: React.FC<HeadShouldersGameProps> = ({ onComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentHighlight, setCurrentHighlight] = useState<string | null>(null);
  const [hasCompleted, setHasCompleted] = useState(false);

  const bodyParts = ['head', 'shoulders', 'knees', 'toes'];
  const lyrics = [
    "Head, shoulders, knees and toes, knees and toes",
    "Head, shoulders, knees and toes, knees and toes",
    "And eyes, and ears, and mouth, and nose",
    "Head, shoulders, knees and toes, knees and toes!"
  ];

  const startSong = () => {
    setIsPlaying(true);
    let partIndex = 0;
    
    const interval = setInterval(() => {
      if (partIndex < bodyParts.length * 4) { // 4 repetitions
        setCurrentHighlight(bodyParts[partIndex % bodyParts.length]);
        partIndex++;
      } else {
        setCurrentHighlight(null);
        setIsPlaying(false);
        setHasCompleted(true);
        setTimeout(() => {
          onComplete();
        }, 2000);
        clearInterval(interval);
      }
    }, 800);
  };

  const stopSong = () => {
    setIsPlaying(false);
    setCurrentHighlight(null);
  };

  const getPartStyle = (part: string) => {
    const isHighlighted = currentHighlight === part;
    return `absolute w-16 h-16 rounded-full border-4 flex items-center justify-center text-2xl font-bold transition-all duration-300 transform ${
      isHighlighted 
        ? 'bg-yellow-300 border-yellow-500 scale-125 animate-bounce' 
        : 'bg-blue-100 border-blue-300'
    }`;
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-gray-800 mb-2 font-comic">
          Head, Shoulders, Knees and Toes! 🎵
        </h3>
        <p className="text-lg text-gray-600">
          Follow along with the song and touch each body part!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Interactive Body */}
        <div className="relative bg-gradient-to-b from-purple-100 to-pink-100 rounded-xl p-8 h-96 lg:h-[500px]">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Body figure */}
            <div className="text-8xl text-gray-400">🧑‍🦲</div>
            
            {/* Interactive body parts */}
            <div className={getPartStyle('head')} style={{ top: '10%', left: '50%', transform: 'translateX(-50%)' }}>
              👤
            </div>
            <div className={getPartStyle('shoulders')} style={{ top: '30%', left: '30%' }}>
              💪
            </div>
            <div className={getPartStyle('shoulders')} style={{ top: '30%', right: '30%' }}>
              💪
            </div>
            <div className={getPartStyle('knees')} style={{ bottom: '35%', left: '40%' }}>
              🦵
            </div>
            <div className={getPartStyle('knees')} style={{ bottom: '35%', right: '40%' }}>
              🦵
            </div>
            <div className={getPartStyle('toes')} style={{ bottom: '10%', left: '40%' }}>
              🦶
            </div>
            <div className={getPartStyle('toes')} style={{ bottom: '10%', right: '40%' }}>
              🦶
            </div>
          </div>
        </div>

        {/* Song Controls and Lyrics */}
        <div className="space-y-6">
          <div className="text-center">
            <button
              onClick={isPlaying ? stopSong : startSong}
              disabled={hasCompleted}
              className={`inline-flex items-center gap-3 px-8 py-4 rounded-full text-xl font-bold transition-all transform hover:scale-105 ${
                isPlaying 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : hasCompleted
                  ? 'bg-green-500 text-white cursor-not-allowed'
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              }`}
            >
              {hasCompleted ? (
                <>
                  <CheckCircle size={24} />
                  Great Job!
                </>
              ) : isPlaying ? (
                <>
                  <Pause size={24} />
                  Stop Song
                </>
              ) : (
                <>
                  <Play size={24} />
                  Start Song
                </>
              )}
            </button>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Music size={20} />
              Song Lyrics
            </h4>
            <div className="space-y-2">
              {lyrics.map((line, index) => (
                <p key={index} className="text-lg text-gray-700 leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-blue-800 font-semibold text-center">
              🎯 Touch each body part as it lights up!
            </p>
          </div>

          {hasCompleted && (
            <div className="bg-green-100 border-2 border-green-400 rounded-xl p-6 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h4 className="text-2xl font-bold text-green-700 mb-2">You Did It!</h4>
              <p className="text-green-600">You know the Head, Shoulders song!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeadShouldersGame;