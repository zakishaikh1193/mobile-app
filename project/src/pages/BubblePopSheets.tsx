import React, { useState } from 'react';
import { motion } from 'framer-motion';
import BubblePopActivitySheet from '../components/BubblePopActivitySheet';

const BubblePopSheets: React.FC = () => {
  const [selectedTheme, setSelectedTheme] = useState<'letters' | 'numbers' | 'shapes' | 'colors' | 'words'>('letters');
  const [isPrefilled, setIsPrefilled] = useState(true);
  const [showSheet, setShowSheet] = useState(false);

  const themes = [
    { key: 'letters', title: 'Alphabet', emoji: '🔤', color: 'from-blue-500 to-purple-600' },
    { key: 'numbers', title: 'Numbers', emoji: '🔢', color: 'from-green-500 to-emerald-600' },
    { key: 'shapes', title: 'Shapes', emoji: '⭐', color: 'from-orange-500 to-red-600' },
    { key: 'colors', title: 'Colors', emoji: '🎨', color: 'from-pink-500 to-rose-600' },
    { key: 'words', title: 'Words', emoji: '📚', color: 'from-indigo-500 to-blue-600' }
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {!showSheet ? (
        <div className="max-w-6xl mx-auto p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              🎈 Bubble Pop Learning Activity Sheets
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Create printable and playful learning activities for children aged 3-6. 
              Perfect for combining physical play with early learning skills!
            </p>
          </div>

          {/* Theme Selection */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Choose Your Learning Theme
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {themes.map((theme) => (
                <motion.button
                  key={theme.key}
                  onClick={() => setSelectedTheme(theme.key as typeof selectedTheme)}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    selectedTheme === theme.key
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-4xl mb-3">{theme.emoji}</div>
                  <div className="font-semibold text-gray-800">{theme.title}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Customize Your Sheet
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sheet Type
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={isPrefilled}
                        onChange={() => setIsPrefilled(true)}
                        className="mr-2"
                      />
                      <span>Pre-filled with examples (A-Z, 1-10, etc.)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={!isPrefilled}
                        onChange={() => setIsPrefilled(false)}
                        className="mr-2"
                      />
                      <span>Blank template for custom content</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Features Included:</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✅ Kid-friendly instructions</li>
                    <li>✅ Colorful bubble design</li>
                    <li>✅ Multiple learning activities</li>
                    <li>✅ Progress tracking</li>
                    <li>✅ Adult guide with variations</li>
                    <li>✅ Print-optimized layout</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Preview: {themes.find(t => t.key === selectedTheme)?.title} Theme
              </h2>
              <button
                onClick={() => setShowSheet(true)}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
              >
                🖨️ Generate & Print Sheet
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-5 gap-3">
                {themes.find(t => t.key === selectedTheme)?.key === 'letters' && 
                  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y'].map((letter, index) => (
                    <div key={index} className="aspect-square border-2 border-gray-300 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                      <span className="text-gray-800 font-bold text-lg">{letter}</span>
                    </div>
                  ))
                }
                {themes.find(t => t.key === selectedTheme)?.key === 'numbers' && 
                  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map((number, index) => (
                    <div key={index} className="aspect-square border-2 border-gray-300 rounded-full flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200">
                      <span className="text-gray-800 font-bold text-lg">{number}</span>
                    </div>
                  ))
                }
                {themes.find(t => t.key === selectedTheme)?.key === 'shapes' && 
                  ['●', '■', '▲', '◆', '★', '♦', '♥', '♠', '♣', '☺'].map((shape, index) => (
                    <div key={index} className="aspect-square border-2 border-gray-300 rounded-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
                      <span className="text-gray-800 font-bold text-lg">{shape}</span>
                    </div>
                  ))
                }
                {themes.find(t => t.key === selectedTheme)?.key === 'colors' && 
                  ['🔴', '🔵', '🟡', '🟢', '🟣', '🟠', '⚫', '⚪', '🟤', '💖'].map((color, index) => (
                    <div key={index} className="aspect-square border-2 border-gray-300 rounded-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-pink-200">
                      <span className="text-gray-800 font-bold text-lg">{color}</span>
                    </div>
                  ))
                }
                {themes.find(t => t.key === selectedTheme)?.key === 'words' && 
                  ['CAT', 'DOG', 'SUN', 'MOON', 'STAR', 'TREE', 'BOOK', 'BALL', 'CAKE', 'FISH'].map((word, index) => (
                    <div key={index} className="aspect-square border-2 border-gray-300 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-indigo-200">
                      <span className="text-gray-800 font-bold text-xs">{word}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              How to Use These Activity Sheets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="font-semibold text-gray-800 mb-2">Choose Theme</h3>
                <p className="text-sm text-gray-600">
                  Select from letters, numbers, shapes, colors, or words based on what your child is learning.
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">🖨️</div>
                <h3 className="font-semibold text-gray-800 mb-2">Print Sheet</h3>
                <p className="text-sm text-gray-600">
                  Print on A4 or Letter paper for best results. Use color printing for vibrant bubbles.
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">🎮</div>
                <h3 className="font-semibold text-gray-800 mb-2">Play & Learn</h3>
                <p className="text-sm text-gray-600">
                  Follow the instructions and try different game variations for maximum learning fun!
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <BubblePopActivitySheet
          theme={selectedTheme}
          isPrefilled={isPrefilled}
          onPrint={handlePrint}
        />
      )}

      {/* Back Button */}
      {showSheet && (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={() => setShowSheet(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← Back to Selection
          </button>
        </div>
      )}
    </div>
  );
};

export default BubblePopSheets;
