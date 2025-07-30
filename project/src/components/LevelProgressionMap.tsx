import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, Lock, Trophy, ArrowLeft, Target, Zap, Heart } from 'lucide-react';
import { generateChildLevels, LevelData, zoneThemes, gameTypes } from '../data/levelData';

interface LevelProgressionMapProps {
  childId: string;
  onLevelSelect: (levelId: string) => void;
  onBack: () => void;
}

const LevelProgressionMap: React.FC<LevelProgressionMapProps> = ({
  childId,
  onLevelSelect,
  onBack
}) => {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState<LevelData | null>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  // Generate level data for this child - in real app, this would come from your backend
  const levels: LevelData[] = generateChildLevels(childId, ['L1']); // Only L1 is completed, all others locked

  const zoneColors = {
    forest: zoneThemes.forest.color,
    snow: zoneThemes.snow.color,
    river: zoneThemes.river.color,
    desert: zoneThemes.desert.color,
    castle: zoneThemes.castle.color
  };

  const zoneEmojis = {
    forest: zoneThemes.forest.emoji,
    snow: zoneThemes.snow.emoji,
    river: zoneThemes.river.emoji,
    desert: zoneThemes.desert.emoji,
    castle: zoneThemes.castle.emoji
  };

  const gameTypeIcons = {
    math: <Target className="w-4 h-4" />,
    logic: <Zap className="w-4 h-4" />,
    dragdrop: <Heart className="w-4 h-4" />,
    quiz: <Trophy className="w-4 h-4" />,
    puzzle: <Target className="w-4 h-4" />,
    coloring: <Heart className="w-4 h-4" />,
    matching: <Heart className="w-4 h-4" />,
    story: <Trophy className="w-4 h-4" />
  };

  const handleLevelClick = (level: LevelData) => {
    if (level.isLocked) return;
    
    setSelectedLevel(level);
    
    // Only L1 navigates to child dashboard, others navigate to specific activities
    if (level.id === 'L1') {
      navigate(`/child-dashboard/${childId}?level=${level.id}`);
    } else {
      // For other levels, navigate to specific learning hubs based on game type
      const gameTypeRoutes = {
        'math': 'maths',
        'logic': 'logic',
        'dragdrop': 'literacy',
        'quiz': 'quiz',
        'puzzle': 'puzzle',
        'coloring': 'creativity',
        'matching': 'matching',
        'story': 'story'
      };
      
      const route = gameTypeRoutes[level.gameType] || 'educational-game';
      navigate(`/${route}/${childId}?level=${level.id}`);
    }
    
    onLevelSelect(level.id);
  };

  const getProgressPercentage = () => {
    const completedLevels = levels.filter(level => level.isCompleted).length;
    return Math.round((completedLevels / levels.length) * 100);
  };

  const renderStars = (stars: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3].map((star) => (
          <motion.div
            key={star}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: star * 0.1 }}
          >
            <Star
              className={`w-3 h-3 ${
                star <= stars ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
            />
          </motion.div>
        ))}
      </div>
    );
  };

  const renderLevelNode = (level: LevelData, index: number) => {
    const isCompleted = level.isCompleted;
    const isLocked = level.isLocked;
    const zoneColor = zoneColors[level.zone];

    return (
      <motion.div
        key={level.id}
        className="relative"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
      >
        {/* Level Node */}
        <motion.button
          onClick={() => handleLevelClick(level)}
          className={`relative group w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl shadow-lg border-4 transition-all duration-300 ${
            isLocked
              ? 'bg-gray-400 border-gray-500 cursor-not-allowed'
              : isCompleted
              ? `bg-gradient-to-br ${zoneColor} border-yellow-400 cursor-pointer`
              : `bg-gradient-to-br ${zoneColor} border-white cursor-pointer hover:scale-110`
          }`}
          whileHover={!isLocked ? { scale: 1.1, y: -5 } : {}}
          whileTap={!isLocked ? { scale: 0.95 } : {}}
          onMouseEnter={() => setShowTooltip(level.id)}
          onMouseLeave={() => setShowTooltip(null)}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 rounded-xl opacity-20">
            <div className="w-full h-full bg-gradient-to-br from-white/30 to-transparent rounded-xl" />
          </div>

          {/* Level number */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full">
            {isLocked ? (
              <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            ) : (
              <>
                <div className="text-white font-bold text-lg sm:text-xl md:text-2xl">
                  {level.number}
                </div>
                {isCompleted && (
                  <div className="absolute -top-1 -right-1">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Stars */}
          {!isLocked && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              {renderStars(level.stars)}
            </div>
          )}

          {/* Floating particles for completed levels */}
          {isCompleted && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                  initial={{
                    x: Math.random() * 60 + 10,
                    y: Math.random() * 60 + 10,
                    scale: 0
                  }}
                  animate={{
                    y: [0, -20, 0],
                    scale: [0, 1, 0],
                    opacity: [0, 0.8, 0]
                  }}
                  transition={{
                    duration: 2,
                    delay: Math.random() * 2,
                    repeat: Infinity,
                    repeatDelay: Math.random() * 3
                  }}
                />
              ))}
            </div>
          )}
        </motion.button>

        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip === level.id && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white rounded-xl shadow-2xl border-2 border-gray-200 p-4"
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">{zoneEmojis[level.zone]}</span>
                  <h3 className="font-bold text-gray-800 text-lg">{level.title}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-3">{level.description}</p>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  {gameTypeIcons[level.gameType]}
                  <span className="capitalize">{level.gameType}</span>
                  <span>•</span>
                  <span className="capitalize">{level.difficulty}</span>
                </div>
                <div className="mt-2 text-xs text-blue-600 font-semibold">
                  {level.id === 'L1' ? 'Go to Dashboard' : 'Start Activity'}
                </div>
                {!isLocked && (
                  <div className="mt-2">
                    {renderStars(level.stars)}
                  </div>
                )}
              </div>
              {/* Tooltip arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating clouds */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-16 h-16 sm:w-20 sm:h-20 bg-white/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * 200 + 50,
              scale: 0
            }}
            animate={{
              x: [0, 100, 0],
              scale: [0, 1, 0],
              opacity: [0, 0.6, 0]
            }}
            transition={{
              duration: 8,
              delay: Math.random() * 5,
              repeat: Infinity,
              repeatDelay: Math.random() * 10
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 w-full p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.button
            onClick={onBack}
            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-gray-700 hover:bg-white transition-colors shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back</span>
          </motion.button>

          {/* Progress bar */}
          <div className="flex items-center gap-4">
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-gray-700">
                  {getProgressPercentage()}% Complete
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 py-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 mb-4">
            Learning Adventure
            <motion.span
              animate={{ rotate: [0, 20, -20, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block ml-4"
            >
              🎮
            </motion.span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">
            Complete levels to unlock new adventures!
          </p>
        </motion.div>

        {/* Level grid with winding path */}
        <div className="relative">
          {/* Winding path background */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1200 800"
            preserveAspectRatio="none"
          >
            <path
              d="M 100 400 Q 300 200 500 400 T 900 400 T 1100 400"
              stroke="url(#pathGradient)"
              strokeWidth="8"
              fill="none"
              strokeDasharray="20,10"
              strokeDashoffset="0"
            >
              <animate
                attributeName="stroke-dashoffset"
                values="0;-30"
                dur="2s"
                repeatCount="indefinite"
              />
            </path>
            <defs>
              <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="25%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="75%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
            </defs>
          </svg>

          {/* Level nodes */}
          <div className="relative grid grid-cols-5 gap-8 sm:gap-12 md:gap-16 lg:gap-20 max-w-6xl mx-auto">
            {levels.map((level, index) => (
              <div key={level.id} className="flex justify-center">
                {renderLevelNode(level, index)}
              </div>
            ))}
          </div>
        </div>

        {/* Zone indicators */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-5 gap-4 max-w-4xl mx-auto">
          {Object.entries(zoneEmojis).map(([zone, emoji]) => (
            <motion.div
              key={zone}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl mb-2">{emoji}</div>
              <div className="font-semibold text-gray-700 capitalize">{zone}</div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Level selection modal */}
      <AnimatePresence>
        {selectedLevel && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">{zoneEmojis[selectedLevel.zone]}</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {selectedLevel.title}
                </h2>
                <p className="text-gray-600 mb-6">{selectedLevel.description}</p>
                
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    {gameTypeIcons[selectedLevel.gameType]}
                    <span className="capitalize text-sm">{selectedLevel.gameType}</span>
                  </div>
                  <div className="w-px h-6 bg-gray-300" />
                  <div className="capitalize text-sm">{selectedLevel.difficulty}</div>
                </div>

                {selectedLevel.isCompleted && (
                  <div className="mb-6">
                    <div className="text-sm text-gray-500 mb-2">Stars earned:</div>
                    {renderStars(selectedLevel.stars)}
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedLevel(null)}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                                     <button
                     onClick={() => {
                       setSelectedLevel(null);
                       handleLevelClick(selectedLevel);
                     }}
                     className={`flex-1 py-3 rounded-xl font-semibold text-white transition-colors ${
                       selectedLevel.isCompleted
                         ? 'bg-green-500 hover:bg-green-600'
                         : `bg-gradient-to-r ${zoneColors[selectedLevel.zone]} hover:brightness-110`
                     }`}
                   >
                     {selectedLevel.isCompleted 
                       ? 'Replay' 
                       : selectedLevel.id === 'L1' 
                         ? 'Go to Dashboard' 
                         : 'Start Activity'
                     }
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LevelProgressionMap; 