import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BubblePopGame from '../components/BubblePopGame';
import { GAME_OPTIONS } from '../constants/bubblePop';

const BubblePopTest: React.FC = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<'alphabet' | 'number' | 'shape' | 'color' | 'word'>('alphabet');
  const [isPlaying, setIsPlaying] = useState(false);

  const gameTypes = GAME_OPTIONS.map(option => ({
    type: option.type,
    name: option.name.replace(' Bubble Pop', ''),
    icon: option.icon,
    color: option.color
  }));

  const handleStartGame = () => {
    setIsPlaying(true);
  };

  const handleGameComplete = () => {
    setIsPlaying(false);
    alert('Game completed! Great job!');
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
            🎈 Bubble Pop Test
          </h1>
          <p className="text-xl text-gray-600">
            Test the bubble pop game functionality
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

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            🎯 How to Play
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">👆</div>
              <h4 className="font-semibold text-gray-800 mb-2">1. Select Game Type</h4>
              <p className="text-gray-600 text-sm">Choose from alphabet, numbers, shapes, colors, or words</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🎈</div>
              <h4 className="font-semibold text-gray-800 mb-2">2. Pop Bubbles</h4>
              <p className="text-gray-600 text-sm">Click on bubbles that match the target shown at the top</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🏆</div>
              <h4 className="font-semibold text-gray-800 mb-2">3. Complete Game</h4>
              <p className="text-gray-600 text-sm">Find all targets to complete the game and see your score!</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default BubblePopTest;
