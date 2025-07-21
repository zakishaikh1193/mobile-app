import React from 'react';
import { X } from 'lucide-react';
import { Sticker } from '../types/lineArt';

interface StickerPanelProps {
  onStickerSelect: (sticker: Sticker) => void;
  onClose: () => void;
}

const StickerPanel: React.FC<StickerPanelProps> = ({ onStickerSelect, onClose }) => {
  const stickers: Sticker[] = [
    { id: '1', emoji: '⭐', name: 'Star', category: 'shapes' },
    { id: '2', emoji: '❤️', name: 'Heart', category: 'shapes' },
    { id: '3', emoji: '😊', name: 'Happy Face', category: 'faces' },
    { id: '4', emoji: '🌟', name: 'Sparkle', category: 'shapes' },
    { id: '5', emoji: '🌈', name: 'Rainbow', category: 'nature' },
    { id: '6', emoji: '🦋', name: 'Butterfly', category: 'animals' },
    { id: '7', emoji: '🌸', name: 'Flower', category: 'nature' },
    { id: '8', emoji: '🎈', name: 'Balloon', category: 'fun' },
    { id: '9', emoji: '🌙', name: 'Moon', category: 'space' },
    { id: '10', emoji: '☀️', name: 'Sun', category: 'nature' },
    { id: '11', emoji: '🐱', name: 'Cat', category: 'animals' },
    { id: '12', emoji: '🐶', name: 'Dog', category: 'animals' },
    { id: '13', emoji: '🚀', name: 'Rocket', category: 'space' },
    { id: '14', emoji: '🎨', name: 'Palette', category: 'art' },
    { id: '15', emoji: '🍎', name: 'Apple', category: 'food' },
    { id: '16', emoji: '🌺', name: 'Hibiscus', category: 'nature' },
    { id: '17', emoji: '🎭', name: 'Mask', category: 'fun' },
    { id: '18', emoji: '🎪', name: 'Circus', category: 'fun' },
  ];

  const categories = Array.from(new Set(stickers.map(s => s.category)));

  return (
    <div className="absolute top-0 right-0 bg-white rounded-3xl shadow-2xl border-4 border-purple-200 p-6 max-w-sm z-50 animate-bounce-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-purple-600">✨ Fun Stickers</h3>
        <button
          onClick={onClose}
          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transform hover:scale-110 transition-all duration-200"
          aria-label="Close sticker panel"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Instructions */}
      <p className="text-purple-500 text-sm mb-4">
        Click a sticker to add it to your drawing!
      </p>

      {/* Sticker Grid */}
      <div className="max-h-80 overflow-y-auto">
        {categories.map(category => (
          <div key={category} className="mb-6">
            <h4 className="text-purple-600 font-medium mb-2 capitalize">
              {category}
            </h4>
            <div className="grid grid-cols-4 gap-3">
              {stickers
                .filter(sticker => sticker.category === category)
                .map(sticker => (
                  <button
                    key={sticker.id}
                    onClick={() => onStickerSelect(sticker)}
                    className="bg-purple-50 hover:bg-purple-100 p-3 rounded-2xl shadow-md transform hover:scale-125 transition-all duration-200 text-2xl"
                    title={sticker.name}
                    aria-label={`Add ${sticker.name} sticker`}
                  >
                    {sticker.emoji}
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Fun Message */}
      <div className="mt-4 text-center bg-gradient-to-r from-purple-100 to-pink-100 p-3 rounded-2xl">
        <span className="text-purple-600 text-sm font-medium">
          🎉 Make your art even more special! 🎉
        </span>
      </div>
    </div>
  );
};

export default StickerPanel; 