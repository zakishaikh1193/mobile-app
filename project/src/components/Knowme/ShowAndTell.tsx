import React, { useState } from 'react';
import { Mic, Star, CheckCircle } from 'lucide-react';
// @ts-ignore
import confetti from 'canvas-confetti';

interface ShowAndTellProps {
  onComplete: () => void;
}

const ShowAndTell: React.FC<ShowAndTellProps> = ({ onComplete }) => {
  const [selectedFavorites, setSelectedFavorites] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [hasShared, setHasShared] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [canPlayback, setCanPlayback] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const favoriteThings = [
    { name: 'My Family', image: '/favorites/family.png', emoji: '👨‍👩‍👧‍👦', description: 'The people who love me most!' },
    { name: 'My Pet', image: '/favorites/pet.png', emoji: '🐕', description: 'My furry best friend!' },
    { name: 'Playing Games', image: '/favorites/games.png', emoji: '🎮', description: 'So much fun to play!' },
    { name: 'Ice Cream', image: '/favorites/icecream.png', emoji: '🍦', description: 'Sweet and delicious!' },
    { name: 'Bedtime Stories', image: '/favorites/stories.png', emoji: '📚', description: 'Adventures before sleep!' },
    { name: 'Drawing', image: '/favorites/drawing.png', emoji: '🎨', description: 'Creating colorful pictures!' },
    { name: 'Music', image: '/favorites/music.png', emoji: '🎵', description: 'Songs that make me happy!' },
    { name: 'Playing Outside', image: '/favorites/outside.png', emoji: '🌞', description: 'Fresh air and fun!' },
  ];

  const toggleFavorite = (name: string) => {
    setSelectedFavorites(prev => 
      prev.includes(name) 
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  const startRecording = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setHasShared(true);
      setCanPlayback(true);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => {
        setIsComplete(true);
        setTimeout(() => {
          onComplete();
        }, 2000);
      }, 1000);
    }, 3000);
  };

  const handlePlayback = () => {
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 2500);
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-gray-800 mb-2 font-comic">
          Show & Tell Time! 🎤
        </h3>
        <p className="text-lg text-gray-600">
          Choose your favorite things and share why you love them!
        </p>
      </div>

      {!hasShared ? (
        <div className="space-y-8">
          <div>
            <h4 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Pick 3 of your favorite things:
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {favoriteThings.map((item) => {
                const isSelected = selectedFavorites.includes(item.name);
                return (
                  <button
                    key={item.name}
                    onClick={() => toggleFavorite(item.name)}
                    disabled={!isSelected && selectedFavorites.length >= 3}
                    className={`p-4 rounded-xl transition-all transform hover:scale-105 ${
                      isSelected
                        ? 'bg-purple-200 text-purple-800 ring-4 ring-purple-400'
                        : selectedFavorites.length >= 3
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-50'
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-contain drop-shadow-lg"
                        onError={e => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const parent = (e.target as HTMLImageElement).parentElement;
                          if (parent && !parent.querySelector('.img-placeholder')) {
                            const placeholder = document.createElement('div');
                            placeholder.className = 'img-placeholder w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl text-gray-500';
                            placeholder.innerText = '?';
                            parent.appendChild(placeholder);
                          }
                        }}
                      />
                    </div>
                    <div className="font-bold text-sm mb-1">{item.name}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                    {isSelected && (
                      <div className="mt-2">
                        <Star className="text-yellow-500 fill-yellow-500 mx-auto" size={16} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="text-center mt-4">
              <p className="text-lg text-gray-600">
                Selected: {selectedFavorites.length}/3
              </p>
            </div>
          </div>

          {selectedFavorites.length === 3 && (
            <div className="text-center">
              <div className="bg-purple-50 rounded-xl p-6 mb-6">
                <h4 className="text-xl font-bold text-purple-800 mb-4">
                  Your Favorite Things:
                </h4>
                <div className="flex justify-center gap-4">
                  {selectedFavorites.map((name) => {
                    const item = favoriteThings.find(i => i.name === name);
                    return (
                      <div key={name} className="text-center">
                        <div className="mb-1 flex items-center justify-center">
                          <img
                            src={item?.image}
                            alt={item?.name}
                            className="w-8 h-8 object-contain drop-shadow-lg"
                            onError={e => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const parent = (e.target as HTMLImageElement).parentElement;
                              if (parent && !parent.querySelector('.img-placeholder')) {
                                const placeholder = document.createElement('div');
                                placeholder.className = 'img-placeholder w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-lg text-gray-500';
                                placeholder.innerText = '?';
                                parent.appendChild(placeholder);
                              }
                            }}
                          />
                        </div>
                        <div className="text-sm font-semibold text-purple-700">{name}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={startRecording}
                disabled={isRecording}
                className={`inline-flex items-center gap-3 px-8 py-4 rounded-full text-xl font-bold transition-all transform hover:scale-105 ${
                  isRecording
                    ? 'bg-red-500 text-white cursor-not-allowed animate-pulse'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                <Mic size={32} className={isRecording ? 'animate-bounce' : ''} />
                {isRecording ? 'Recording...' : 'Share Your Favorites!'}
              </button>
              {canPlayback && (
                <button
                  onClick={handlePlayback}
                  disabled={isPlaying}
                  className={`ml-4 inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-bold transition-all transform hover:scale-105 bg-blue-500 hover:bg-blue-600 text-white ${isPlaying ? 'opacity-50' : ''}`}
                >
                  <span role="img" aria-label="play">▶️</span>
                  {isPlaying ? 'Playing...' : 'Playback'}
                </button>
              )}
              
              {isRecording && (
                <div className="mt-4">
                  <p className="text-red-600 font-semibold animate-pulse">
                    🎤 Tell us why you love these things!
                  </p>
                  <div className="bg-red-100 rounded-lg p-4 mt-2 max-w-md mx-auto">
                    <p className="text-red-700 text-sm">
                      "I love my family because they take care of me. Ice cream is my favorite treat because it tastes so good! Playing games is fun because..."
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center">
          <div className="bg-green-100 border-2 border-green-400 rounded-xl p-8 max-w-lg mx-auto">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h4 className="text-2xl font-bold text-green-700 mb-2">
              {isComplete ? 'Wonderful Sharing!' : 'Great Job!'}
            </h4>
            <p className="text-green-600 mb-4">
              Thank you for sharing your favorite things with us! Your favorites are special because they're yours.
            </p>
            <div className="bg-white rounded-lg p-4 mb-4">
              <h5 className="font-bold text-gray-800 mb-2">What you shared:</h5>
              <div className="flex justify-center gap-4">
                {selectedFavorites.map((name) => {
                  const item = favoriteThings.find(i => i.name === name);
                  return (
                    <div key={name} className="text-center">
                      <div className="mb-1 flex items-center justify-center">
                        <img
                          src={item?.image}
                          alt={item?.name}
                          className="w-6 h-6 object-contain drop-shadow-lg"
                          onError={e => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            const parent = (e.target as HTMLImageElement).parentElement;
                            if (parent && !parent.querySelector('.img-placeholder')) {
                              const placeholder = document.createElement('div');
                              placeholder.className = 'img-placeholder w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-base text-gray-500';
                              placeholder.innerText = '?';
                              parent.appendChild(placeholder);
                            }
                          }}
                        />
                      </div>
                      <div className="text-xs font-semibold text-gray-700">{name}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            {isComplete && (
              <div className="flex items-center justify-center gap-2 animate-pulse">
                <CheckCircle className="text-green-500" size={24} />
                <span className="font-bold text-green-700">Complete!</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowAndTell;