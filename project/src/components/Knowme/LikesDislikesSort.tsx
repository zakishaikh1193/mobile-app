import React, { useState } from 'react';
import { Heart, X, CheckCircle } from 'lucide-react';

interface LikesDislikesSortProps {
  onComplete: () => void;
}

const LikesDislikesSort: React.FC<LikesDislikesSortProps> = ({ onComplete }) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [likes, setLikes] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const items = [
    { name: 'Chocolate', emoji: '🍫' },
    { name: 'Vegetables', emoji: '🥕' },
    { name: 'Teddy Bear', emoji: '🧸' },
    { name: 'Homework', emoji: '📝' },
    { name: 'Music', emoji: '🎵' },
    { name: 'Rain', emoji: '🌧️' },
    { name: 'Birthday Cake', emoji: '🎂' },
    { name: 'Spinach', emoji: '🥬' },
  ];

  const unplacedItems = items.filter(
    item => !likes.includes(item.name) && !dislikes.includes(item.name)
  );

  const handleDragStart = (e: React.DragEvent, itemName: string) => {
    setDraggedItem(itemName);
  };

  const handleDrop = (e: React.DragEvent, category: 'likes' | 'dislikes') => {
    e.preventDefault();
    if (draggedItem) {
      if (category === 'likes') {
        setLikes(prev => [...prev, draggedItem]);
      } else {
        setDislikes(prev => [...prev, draggedItem]);
      }
      
      if (unplacedItems.length === 1) { // This was the last item
        setTimeout(() => {
          setIsComplete(true);
          setTimeout(() => {
            onComplete();
          }, 2000);
        }, 500);
      }
    }
    setDraggedItem(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeItem = (itemName: string, from: 'likes' | 'dislikes') => {
    if (from === 'likes') {
      setLikes(prev => prev.filter(item => item !== itemName));
    } else {
      setDislikes(prev => prev.filter(item => item !== itemName));
    }
    setIsComplete(false);
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-gray-800 mb-2 font-comic">
          Sort My Things! 📊
        </h3>
        <p className="text-lg text-gray-600">
          Drag each item to either "Things I Like" or "Things I Don't Like"
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items to Sort */}
        <div className="space-y-4">
          <h4 className="text-xl font-bold text-gray-800 text-center">Things to Sort</h4>
          <div className="space-y-3">
            {unplacedItems.map((item) => (
              <div
                key={item.name}
                draggable
                onDragStart={(e) => handleDragStart(e, item.name)}
                className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-4 rounded-xl cursor-grab active:cursor-grabbing transform hover:scale-105 transition-all shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="font-bold text-lg">{item.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Things I Like */}
        <div
          className="bg-gradient-to-b from-green-100 to-green-50 rounded-xl p-6 min-h-96 border-2 border-dashed border-green-300"
          onDrop={(e) => handleDrop(e, 'likes')}
          onDragOver={handleDragOver}
        >
          <div className="text-center mb-4">
            <Heart className="text-green-600 mx-auto mb-2" size={32} />
            <h4 className="text-xl font-bold text-green-800">Things I Like</h4>
          </div>
          
          <div className="space-y-3">
            {likes.map((itemName) => {
              const item = items.find(i => i.name === itemName);
              return (
                <div
                  key={itemName}
                  className="bg-green-200 text-green-800 p-3 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item?.emoji}</span>
                    <span className="font-semibold">{itemName}</span>
                  </div>
                  <button
                    onClick={() => removeItem(itemName, 'likes')}
                    className="text-green-600 hover:text-green-800 p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              );
            })}
            {likes.length === 0 && (
              <div className="text-green-600 text-center py-8 italic">
                Drop things you like here
              </div>
            )}
          </div>
        </div>

        {/* Things I Don't Like */}
        <div
          className="bg-gradient-to-b from-red-100 to-red-50 rounded-xl p-6 min-h-96 border-2 border-dashed border-red-300"
          onDrop={(e) => handleDrop(e, 'dislikes')}
          onDragOver={handleDragOver}
        >
          <div className="text-center mb-4">
            <X className="text-red-600 mx-auto mb-2" size={32} />
            <h4 className="text-xl font-bold text-red-800">Things I Don't Like</h4>
          </div>
          
          <div className="space-y-3">
            {dislikes.map((itemName) => {
              const item = items.find(i => i.name === itemName);
              return (
                <div
                  key={itemName}
                  className="bg-red-200 text-red-800 p-3 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item?.emoji}</span>
                    <span className="font-semibold">{itemName}</span>
                  </div>
                  <button
                    onClick={() => removeItem(itemName, 'dislikes')}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              );
            })}
            {dislikes.length === 0 && (
              <div className="text-red-600 text-center py-8 italic">
                Drop things you don't like here
              </div>
            )}
          </div>
        </div>
      </div>

      {isComplete && (
        <div className="mt-8 text-center">
          <div className="bg-green-100 border-2 border-green-400 rounded-xl p-6 max-w-md mx-auto">
            <div className="text-6xl mb-4">🌟</div>
            <h4 className="text-2xl font-bold text-green-700 mb-2">Great Sorting!</h4>
            <p className="text-green-600">
              You organized all your likes and dislikes! It's okay to not like everything.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LikesDislikesSort;