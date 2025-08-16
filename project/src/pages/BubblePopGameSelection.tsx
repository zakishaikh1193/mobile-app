import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import BubblePopGame from '../components/BubblePopGame';
import { GameOption } from '../types/bubblePop';
import { GAME_OPTIONS } from '../constants/bubblePop';

const BubblePopGameSelection: React.FC = () => {
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState<GameOption | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const gameOptions: GameOption[] = GAME_OPTIONS;

  const handleGameSelect = (game: GameOption) => {
    setSelectedGame(game);
  };

  const handleStartGame = () => {
    if (selectedGame) {
      setIsPlaying(true);
    }
  };

  const handleBackToSelection = () => {
    setIsPlaying(false);
    setSelectedGame(null);
  };

  const handleGameComplete = () => {
    setIsPlaying(false);
    setSelectedGame(null);
  };

  const handleBackToMain = () => {
    navigate(-1);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isPlaying && selectedGame) {
    return (
      <BubblePopGame
        bubbleType={selectedGame.type}
        onComplete={handleGameComplete}
        onBack={handleBackToSelection}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToMain}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <span className="text-2xl">←</span>
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-800">🎈 Bubble Pop Games</h1>
            <div className="w-20"></div> {/* Spacer */}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Choose Your Bubble Pop Adventure! 🎈
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Pop bubbles to learn and have fun! Each game helps you learn something different.
            Click on a game to start your learning adventure!
          </p>
        </motion.div>

        {/* Game Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {gameOptions.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative group cursor-pointer ${
                selectedGame?.id === game.id ? 'ring-4 ring-blue-500 ring-opacity-50' : ''
              }`}
              onClick={() => handleGameSelect(game)}
            >
              <div className={`bg-gradient-to-br ${game.color} rounded-3xl p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}>
                <div className="text-center">
                  <div className="text-6xl mb-4">{game.icon}</div>
                  <h3 className="text-2xl font-bold mb-3">{game.name}</h3>
                  <p className="text-white/90 mb-4 text-sm leading-relaxed">
                    {game.description}
                  </p>
                  <div className="flex items-center justify-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(game.difficulty)}`}>
                      {game.difficulty}
                    </span>
                    {game.isActive && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Selection indicator */}
              {selectedGame?.id === game.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold"
                >
                  ✓
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Start Game Button */}
        {selectedGame && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <button
              onClick={handleStartGame}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-12 py-4 rounded-2xl text-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              🎮 Start {selectedGame.name}!
            </button>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            🎯 How to Play
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">👆</div>
              <h4 className="font-semibold text-gray-800 mb-2">1. Select a Game</h4>
              <p className="text-gray-600 text-sm">Choose from alphabet, numbers, shapes, colors, or words</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🎈</div>
              <h4 className="font-semibold text-gray-800 mb-2">2. Pop Bubbles</h4>
              <p className="text-gray-600 text-sm">Click on bubbles that match the target shown at the top</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🏆</div>
              <h4 className="font-semibold text-gray-800 mb-2">3. Score Points</h4>
              <p className="text-gray-600 text-sm">Get points for correct pops and complete the game!</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BubblePopGameSelection;
