import React, { useState } from 'react';

interface BubblePopActivitySheetProps {
  theme: 'letters' | 'numbers' | 'shapes' | 'colors' | 'words';
  isPrefilled?: boolean;
  onPrint?: () => void;
}

const BubblePopActivitySheet: React.FC<BubblePopActivitySheetProps> = ({
  theme,
  isPrefilled = false,
  onPrint
}) => {
  const [customContent, setCustomContent] = useState<string>('');

  // Pre-filled content for each theme
  const prefilledContent = {
    letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
    numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    shapes: ['●', '■', '▲', '◆', '★', '♦', '♥', '♠', '♣', '☺'],
    colors: ['🔴', '🔵', '🟡', '🟢', '🟣', '🟠', '⚫', '⚪', '🟤', '💖'],
    words: ['CAT', 'DOG', 'SUN', 'MOON', 'STAR', 'TREE', 'BOOK', 'BALL', 'CAKE', 'FISH']
  };

  const themeConfigs = {
    letters: {
      title: 'Alphabet Bubble Pop',
      emoji: '🔤',
      color: 'from-blue-500 to-purple-600',
      description: 'Pop the bubbles to learn your ABCs!'
    },
    numbers: {
      title: 'Number Bubble Pop',
      emoji: '🔢',
      color: 'from-green-500 to-emerald-600',
      description: 'Pop the bubbles to learn counting!'
    },
    shapes: {
      title: 'Shape Bubble Pop',
      emoji: '⭐',
      color: 'from-orange-500 to-red-600',
      description: 'Pop the bubbles to learn shapes!'
    },
    colors: {
      title: 'Color Bubble Pop',
      emoji: '🎨',
      color: 'from-pink-500 to-rose-600',
      description: 'Pop the bubbles to learn colors!'
    },
    words: {
      title: 'Word Bubble Pop',
      emoji: '📚',
      color: 'from-indigo-500 to-blue-600',
      description: 'Pop the bubbles to learn words!'
    }
  };

  const config = themeConfigs[theme];
  const content = isPrefilled ? prefilledContent[theme] : customContent.split(',').map(item => item.trim()).filter(Boolean);

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* Print Header - Only visible when printing */}
      <div className="hidden print:block text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {config.emoji} {config.title}
        </h1>
        <p className="text-lg text-gray-600">{config.description}</p>
        <div className="border-t-2 border-gray-300 mt-4 pt-4">
          <p className="text-sm text-gray-500">
            Child's Name: _________________ Date: _________________
          </p>
        </div>
      </div>

      {/* Screen Header - Hidden when printing */}
      <div className="print:hidden">
        <div className={`bg-gradient-to-r ${config.color} rounded-2xl shadow-lg p-6 mb-6 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                {config.emoji} {config.title}
              </h1>
              <p className="text-white/90">{config.description}</p>
            </div>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white font-semibold"
            >
              🖨️ Print Sheet
            </button>
          </div>
        </div>
      </div>

      {/* Activity Sheet Content */}
      <div className="bg-white border-2 border-gray-300 rounded-lg p-8 print:p-4">
        {/* Instructions */}
        <div className="mb-8 print:mb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-3 print:text-lg">
            🎯 How to Play Bubble Pop Learning
          </h2>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg print:bg-transparent print:border-l-0 print:p-0">
            <p className="text-gray-700 font-medium mb-2">Instructions for Kids:</p>
            <ul className="text-gray-600 space-y-1 text-sm">
              <li>• Look at the bubbles below</li>
              <li>• Point to each bubble and say what's inside</li>
              <li>• Pop the bubble by coloring it in or putting a sticker on it</li>
              <li>• Try to find them in order!</li>
            </ul>
          </div>
        </div>

        {/* Custom Content Input - Only for screen */}
        {!isPrefilled && (
          <div className="mb-6 print:hidden">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter your own content (separate with commas):
            </label>
            <input
              type="text"
              value={customContent}
              onChange={(e) => setCustomContent(e.target.value)}
              placeholder="A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Bubble Grid */}
        <div className="grid grid-cols-5 gap-4 print:gap-2 mb-8">
          {content.map((item, index) => (
            <div
              key={index}
              className="relative aspect-square border-2 border-gray-300 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 transition-colors cursor-pointer print:border-gray-400"
              style={{
                minHeight: '80px',
                fontSize: theme === 'words' ? '14px' : '24px',
                fontWeight: 'bold'
              }}
            >
              <span className="text-gray-800">{item}</span>
              {/* Pop indicator */}
              <div className="absolute inset-0 rounded-full border-4 border-transparent hover:border-red-400 transition-colors opacity-0 hover:opacity-100 print:hidden"></div>
            </div>
          ))}
        </div>

        {/* Learning Activities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
          {/* Activity 1: Matching Game */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 print:bg-transparent print:border-gray-300">
            <h3 className="text-lg font-bold text-green-800 mb-2 print:text-gray-800">🎯 Matching Game</h3>
            <p className="text-green-700 text-sm print:text-gray-600 mb-3">
              Find objects around you that match the bubbles!
            </p>
            <div className="space-y-2">
              {content.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-xs font-bold text-green-800">
                    {index + 1}
                  </span>
                  <span className="text-sm text-green-700 print:text-gray-600">
                    Find something that starts with "{item}" or looks like "{item}"
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity 2: Order Challenge */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 print:bg-transparent print:border-gray-300">
            <h3 className="text-lg font-bold text-purple-800 mb-2 print:text-gray-800">🏆 Order Challenge</h3>
            <p className="text-purple-700 text-sm print:text-gray-600 mb-3">
              Put the bubbles in the correct order!
            </p>
            <div className="space-y-2">
              {content.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center text-xs font-bold text-purple-800">
                    {index + 1}
                  </span>
                  <div className="w-16 h-6 border border-purple-300 rounded bg-white print:border-gray-400"></div>
                  <span className="text-sm text-purple-700 print:text-gray-600">
                    Write "{item}" here
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Tracking */}
        <div className="mt-8 print:mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 print:bg-transparent print:border-gray-300">
          <h3 className="text-lg font-bold text-blue-800 mb-3 print:text-gray-800">📊 Progress Tracker</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:gap-2">
            <div className="text-center">
              <p className="text-sm text-blue-600 print:text-gray-600">Bubbles Found</p>
              <div className="text-2xl font-bold text-blue-800 print:text-gray-800">
                {content.length} / {content.length}
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-blue-600 print:text-gray-600">Time Taken</p>
              <div className="text-2xl font-bold text-blue-800 print:text-gray-800">
                ___ min
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-blue-600 print:text-gray-600">Accuracy</p>
              <div className="text-2xl font-bold text-blue-800 print:text-gray-800">
                ___ %
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-blue-600 print:text-gray-600">Fun Level</p>
              <div className="text-2xl font-bold text-blue-800 print:text-gray-800">
                ⭐⭐⭐⭐⭐
              </div>
            </div>
          </div>
        </div>

        {/* Adult Guide */}
        <div className="mt-8 print:mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4 print:bg-transparent print:border-gray-300">
          <h3 className="text-lg font-bold text-gray-800 mb-3">👨‍👩‍👧‍👦 Guide for Adults</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:gap-2 text-sm text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">🎮 Game Variations:</h4>
              <ul className="space-y-1">
                <li>• Shout-out Game: Call out items quickly</li>
                <li>• Memory Game: Cover and remember</li>
                <li>• Speed Challenge: Race against time</li>
                <li>• Team Game: Take turns with friends</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">🎯 Learning Goals:</h4>
              <ul className="space-y-1">
                <li>• Letter recognition</li>
                <li>• Number sequencing</li>
                <li>• Shape identification</li>
                <li>• Color vocabulary</li>
                <li>• Word building</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">💡 Tips:</h4>
              <ul className="space-y-1">
                <li>• Encourage positive reinforcement</li>
                <li>• Make it fun and playful</li>
                <li>• Adapt difficulty to child's level</li>
                <li>• Celebrate every success!</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 print:mt-6 text-center text-sm text-gray-500 border-t pt-4 print:border-gray-300">
          <p>Bubble Pop Learning Activity Sheet • Designed for ages 3-6</p>
          <p className="mt-1">Print on A4 or Letter paper for best results</p>
        </div>
      </div>
    </div>
  );
};

export default BubblePopActivitySheet;
