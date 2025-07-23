import React, { useState } from 'react';
import { Check, X, CheckCircle } from 'lucide-react';

interface FavoriteFruitsProps {
  onComplete: () => void;
}

const FavoriteFruits: React.FC<FavoriteFruitsProps> = ({ onComplete }) => {
  const [likedFruits, setLikedFruits] = useState<string[]>([]);
  const [dislikedFruits, setDislikedFruits] = useState<string[]>([]);
  const [draggedFruit, setDraggedFruit] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const fruits = [
    { name: 'Apple', emoji: '🍎' },
    { name: 'Banana', emoji: '🍌' },
    { name: 'Orange', emoji: '🍊' },
    { name: 'Grapes', emoji: '🍇' },
    { name: 'Strawberry', emoji: '🍓' },
    { name: 'Watermelon', emoji: '🍉' },
    { name: 'Pineapple', emoji: '🍍' },
    { name: 'Cherry', emoji: '🍒' },
  ];

  const handleFruitClick = (fruitName: string, liked: boolean) => {
    if (liked) {
      if (!likedFruits.includes(fruitName)) {
        setLikedFruits(prev => [...prev, fruitName]);
        setDislikedFruits(prev => prev.filter(f => f !== fruitName));
      }
    } else {
      if (!dislikedFruits.includes(fruitName)) {
        setDislikedFruits(prev => [...prev, fruitName]);
        setLikedFruits(prev => prev.filter(f => f !== fruitName));
      }
    }
    
    // Check if we have 2 likes and 2 dislikes
    const newLiked = liked && !likedFruits.includes(fruitName) 
      ? [...likedFruits, fruitName] 
      : liked ? likedFruits : likedFruits.filter(f => f !== fruitName);
    const newDisliked = !liked && !dislikedFruits.includes(fruitName)
      ? [...dislikedFruits, fruitName]
      : !liked ? dislikedFruits : dislikedFruits.filter(f => f !== fruitName);
    
    if (newLiked.length >= 2 && newDisliked.length >= 2) {
      setTimeout(() => {
        setIsComplete(true);
        setTimeout(() => {
          onComplete();
        }, 2000);
      }, 1000);
    }
  };

  const handleDragStart = (e: React.DragEvent, fruitName: string) => {
    setDraggedFruit(fruitName);
  };

  const handleDrop = (e: React.DragEvent, category: 'like' | 'dislike') => {
    e.preventDefault();
    if (draggedFruit) {
      handleFruitClick(draggedFruit, category === 'like');
    }
    setDraggedFruit(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getFruitStatus = (fruitName: string) => {
    if (likedFruits.includes(fruitName)) return 'liked';
    if (dislikedFruits.includes(fruitName)) return 'disliked';
    return 'unselected';
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-gray-800 mb-2 font-comic">
          My Favorite Fruits! 🍎
        </h3>
        <p className="text-lg text-gray-600">
          Pick 2 fruits you LOVE and 2 fruits you don't like so much!
        </p>
        <div className="mt-4 flex justify-center gap-8">
          <div className="flex items-center gap-2">
            <Check className="text-green-500" size={20} />
            <span className="font-semibold text-green-700">Love: {likedFruits.length}/2</span>
          </div>
          <div className="flex items-center gap-2">
            <X className="text-red-500" size={20} />
            <span className="font-semibold text-red-700">Don't Like: {dislikedFruits.length}/2</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Fruits Grid */}
        <div className="lg:col-span-1">
          <h4 className="text-xl font-bold text-gray-800 mb-4 text-center">Choose Your Fruits</h4>
          <div className="grid grid-cols-2 gap-3">
            {fruits.map((fruit) => {
              const status = getFruitStatus(fruit.name);
              return (
                <div
                  key={fruit.name}
                  draggable
                  onDragStart={(e) => handleDragStart(e, fruit.name)}
                  className={`p-4 rounded-xl cursor-grab active:cursor-grabbing text-center transition-all transform hover:scale-105 ${
                    status === 'liked'
                      ? 'bg-green-200 border-2 border-green-400'
                      : status === 'disliked'
                      ? 'bg-red-200 border-2 border-red-400'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-3xl mb-2">{fruit.emoji}</div>
                  <div className="font-bold text-sm">{fruit.name}</div>
                  {status === 'liked' && <Check className="text-green-600 mx-auto mt-1" size={16} />}
                  {status === 'disliked' && <X className="text-red-600 mx-auto mt-1" size={16} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Drop Zones */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Love Zone */}
          <div
            className="bg-gradient-to-b from-green-100 to-green-50 rounded-xl p-6 border-2 border-dashed border-green-400 min-h-64"
            onDrop={(e) => handleDrop(e, 'like')}
            onDragOver={handleDragOver}
          >
            <div className="text-center mb-4">
              <Check className="text-green-600 mx-auto mb-2" size={32} />
              <h4 className="text-xl font-bold text-green-800">Fruits I Love!</h4>
              <p className="text-green-600">Need {Math.max(0, 2 - likedFruits.length)} more</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {likedFruits.map((fruitName) => {
                const fruit = fruits.find(f => f.name === fruitName);
                return (
                  <div
                    key={fruitName}
                    className="bg-green-200 p-3 rounded-lg text-center"
                  >
                    <div className="text-2xl mb-1">{fruit?.emoji}</div>
                    <div className="font-semibold text-green-800 text-sm">{fruitName}</div>
                  </div>
                );
              })}
              {likedFruits.length < 2 && (
                <div className="border-2 border-dashed border-green-300 p-3 rounded-lg text-center text-green-600 italic">
                  Drop here or click above
                </div>
              )}
            </div>
          </div>

          {/* Don't Like Zone */}
          <div
            className="bg-gradient-to-b from-red-100 to-red-50 rounded-xl p-6 border-2 border-dashed border-red-400 min-h-64"
            onDrop={(e) => handleDrop(e, 'dislike')}
            onDragOver={handleDragOver}
          >
            <div className="text-center mb-4">
              <X className="text-red-600 mx-auto mb-2" size={32} />
              <h4 className="text-xl font-bold text-red-800">Not My Favorites</h4>
              <p className="text-red-600">Need {Math.max(0, 2 - dislikedFruits.length)} more</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {dislikedFruits.map((fruitName) => {
                const fruit = fruits.find(f => f.name === fruitName);
                return (
                  <div
                    key={fruitName}
                    className="bg-red-200 p-3 rounded-lg text-center"
                  >
                    <div className="text-2xl mb-1">{fruit?.emoji}</div>
                    <div className="font-semibold text-red-800 text-sm">{fruitName}</div>
                  </div>
                );
              })}
              {dislikedFruits.length < 2 && (
                <div className="border-2 border-dashed border-red-300 p-3 rounded-lg text-center text-red-600 italic">
                  Drop here or click above
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click Instructions */}
      <div className="mt-6 bg-blue-50 rounded-xl p-4">
        <p className="text-blue-800 text-center font-semibold">
          💡 Tip: Click a fruit, then click the ✓ (love it) or ✗ (don't like it) button, or drag and drop!
        </p>
        <div className="flex justify-center gap-4 mt-3">
          <button
            onClick={() => draggedFruit && handleFruitClick(draggedFruit, true)}
            disabled={!draggedFruit || likedFruits.length >= 2}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full font-bold flex items-center gap-2"
          >
            <Check size={16} />
            Love It!
          </button>
          <button
            onClick={() => draggedFruit && handleFruitClick(draggedFruit, false)}
            disabled={!draggedFruit || dislikedFruits.length >= 2}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full font-bold flex items-center gap-2"
          >
            <X size={16} />
            Not for Me
          </button>
        </div>
      </div>

      {isComplete && (
        <div className="mt-8 text-center">
          <div className="bg-green-100 border-2 border-green-400 rounded-xl p-6 max-w-md mx-auto">
            <div className="text-6xl mb-4">🎉</div>
            <h4 className="text-2xl font-bold text-green-700 mb-2">Perfect Choices!</h4>
            <p className="text-green-600 mb-4">
              You picked your favorite fruits and the ones you don't like. Everyone has different tastes, and that's perfectly okay!
            </p>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="text-green-500" size={24} />
              <span className="font-bold text-green-700">Activity Complete!</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoriteFruits;