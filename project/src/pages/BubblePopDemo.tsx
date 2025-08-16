import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BubblePopGame from '../components/BubblePopGame';

const BubblePopDemo: React.FC = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<'alphabet' | 'number' | 'shape' | 'color' | 'word'>('alphabet');
  const [isPlaying, setIsPlaying] = useState(false);

  const gameTypes = [
    { type: 'alphabet' as const, name: 'Alphabet', icon: '🔤', color: 'from-blue-500 to-cyan-500' },
    { type: 'number' as const, name: 'Numbers', icon: '🔢', color: 'from-green-500 to-emerald-500' },
    { type: 'shape' as const, name: 'Shapes', icon: '🔷', color: 'from-purple-500 to-pink-500' },
    { type: 'color' as const, name: 'Colors', icon: '🎨', color: 'from-orange-500 to-red-500' },
    { type: 'word' as const, name: 'Words', icon: '📝', color: 'from-indigo-500 to-purple-500' }
  ];

  const handleStartGame = () => {
    setIsPlaying(true);
  };

  const handleGameComplete = () => {
    setIsPlaying(false);
  };

  const handleBack = () => {
    setIsPlaying(false);
  };

  if (isPlaying) {
    return (
      <BubblePopGame
        bubbleType={selectedType}
        onComplete={handleGameComplete}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎈 Enhanced Bubble Pop Demo
          </h1>
          <p className="text-xl text-gray-600">
            Test the new bubble pop game with different learning types!
          </p>
        </div>

        {/* Game Type Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Choose Game Type
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gameTypes.map((gameType) => (
              <button
                key={gameType.type}
                onClick={() => setSelectedType(gameType.type)}
                className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                  selectedType === gameType.type
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className={`bg-gradient-to-br ${gameType.color} rounded-lg p-4 mb-4 text-white text-center`}>
                  <div className="text-4xl mb-2">{gameType.icon}</div>
                  <h3 className="text-xl font-bold">{gameType.name}</h3>
                </div>
                <p className="text-gray-600 text-sm text-center">
                  {selectedType === gameType.type ? '✓ Selected' : 'Click to select'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center mb-8">
          <button
            onClick={handleStartGame}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-12 py-4 rounded-2xl text-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            🎮 Start {gameTypes.find(g => g.type === selectedType)?.name} Bubble Pop!
          </button>
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            🚀 Game Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🎯</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Target-Based Learning</h4>
                  <p className="text-gray-600 text-sm">Students must find and pop specific targets shown at the top</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🎈</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Bottom-to-Top Animation</h4>
                  <p className="text-gray-600 text-sm">Bubbles float up from bottom with smooth animations</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🏆</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Scoring System</h4>
                  <p className="text-gray-600 text-sm">Points for correct pops, penalties for wrong ones</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🎨</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Multiple Learning Types</h4>
                  <p className="text-gray-600 text-sm">Alphabet, numbers, shapes, colors, and words</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-2xl">⚙️</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Admin Management</h4>
                  <p className="text-gray-600 text-sm">Teachers can enable/disable game types</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🎉</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Completion Rewards</h4>
                  <p className="text-gray-600 text-sm">Celebration when all targets are found</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/bubble-pop-games')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors mr-4"
          >
            Go to Full Game Selection
          </button>
          <button
            onClick={() => navigate('/admin/bubble-pop-management')}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Admin Management
          </button>
        </div>
      </div>
    </div>
  );
};

export default BubblePopDemo;
