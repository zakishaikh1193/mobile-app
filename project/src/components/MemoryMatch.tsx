import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, RotateCcw, Eye, Lightbulb, Star, Clock } from 'lucide-react';

interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
  imageUrl: string;
}

interface MemoryMatchProps {
  activity: any;
  onComplete?: (score: number, timeSpent: number) => void;
  onClose?: () => void;
}

const MemoryMatch: React.FC<MemoryMatchProps> = ({ activity, onComplete, onClose }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [isComplete, setIsComplete] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [canFlip, setCanFlip] = useState<boolean>(true);
  
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Difficulty configurations
  const difficultyConfig = {
    easy: { pairs: 6, gridCols: 4, gridRows: 3 },
    medium: { pairs: 8, gridCols: 4, gridRows: 4 },
    hard: { pairs: 12, gridCols: 6, gridRows: 4 }
  };

  // Sample card images for different themes
  const cardThemes = {
    animals: [
      '/elephant.png',
      '/words/CAT.png',
      '/words/DOG.png',
      '/words/LION.png',
      '/words/MONKEY.png',
      '/words/PIG.png',
      '/words/RABBIT.png',
      '/words/TIGER.png',
      '/words/ZEBRA.png',
      '/words/FISH.png',
      '/words/BIRD.png',
      '/words/HORSE.png'
    ],
    fruits: [
      '/words/APPLE.png',
      '/words/GRAPES.png',
      '/words/ORANGE.png',
      '/words/BANANA.png',
      '/words/STRAWBERRY.png',
      '/words/CHERRY.png',
      '/words/LEMON.png',
      '/words/PEACH.png',
      '/words/PLUM.png',
      '/words/PINEAPPLE.png',
      '/words/MANGO.png',
      '/words/KIWI.png'
    ],
    objects: [
      '/words/BALL.png',
      '/words/CAR.png',
      '/words/HAT.png',
      '/words/KITE.png',
      '/words/UMBRELLA.png',
      '/words/VIOLIN.png',
      '/words/XYLOPHONE.png',
      '/words/YOGA.png',
      '/words/WALL1.png',
      '/words/WALL2.png',
      '/words/ICE.png',
      '/words/JUICE.png'
    ]
  };

  useEffect(() => {
    if (activity?.data?.difficulty) {
      setDifficulty(activity.data.difficulty);
    }
    initializeGame();
    setStartTime(Date.now());
  }, [activity]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const initializeGame = () => {
    const config = difficultyConfig[difficulty];
    const theme = activity?.data?.theme || 'animals';
    const themeImages = cardThemes[theme as keyof typeof cardThemes] || cardThemes.animals;
    
    // Select random images for the game
    const selectedImages = themeImages.slice(0, config.pairs);
    
    // Create pairs of cards
    const cardPairs: Card[] = [];
    selectedImages.forEach((imageUrl, index) => {
      // Add two cards for each image (pair)
      cardPairs.push({
        id: index * 2,
        value: imageUrl,
        isFlipped: false,
        isMatched: false,
        imageUrl: imageUrl
      });
      cardPairs.push({
        id: index * 2 + 1,
        value: imageUrl,
        isFlipped: false,
        isMatched: false,
        imageUrl: imageUrl
      });
    });

    // Shuffle the cards
    const shuffledCards = cardPairs.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setIsComplete(false);
    setScore(0);
    setHintsUsed(0);
  };

  const handleCardClick = (cardId: number) => {
    if (!canFlip || cards.find(c => c.id === cardId)?.isMatched || 
        cards.find(c => c.id === cardId)?.isFlipped) {
      return;
    }

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Flip the card
    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, isFlipped: true } : card
    ));

    // If two cards are flipped, check for match
    if (newFlippedCards.length === 2) {
      setCanFlip(false);
      setMoves(prev => prev + 1);

      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard && secondCard && firstCard.value === secondCard.value) {
        // Match found
        setCards(prev => prev.map(card => 
          card.id === firstId || card.id === secondId 
            ? { ...card, isMatched: true }
            : card
        ));
        setFlippedCards([]);
        setCanFlip(true);

        // Check if game is complete
        const updatedCards = cards.map(card => 
          card.id === firstId || card.id === secondId 
            ? { ...card, isMatched: true }
            : card
        );
        
        if (updatedCards.every(card => card.isMatched)) {
          handleGameComplete();
        }
      } else {
        // No match, flip cards back after delay
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === firstId || card.id === secondId 
              ? { ...card, isFlipped: false }
              : card
          ));
          setFlippedCards([]);
          setCanFlip(true);
        }, 1000);
      }
    }
  };

  const handleGameComplete = () => {
    setIsComplete(true);
    const finalTime = Math.floor((Date.now() - startTime) / 1000);
    setTimeSpent(finalTime);
    
    // Calculate score based on time, moves, and hints used
    const baseScore = 100;
    const timeBonus = Math.max(0, 300 - finalTime); // Bonus for completing quickly
    const moveBonus = Math.max(0, 100 - moves * 2); // Bonus for fewer moves
    const hintPenalty = hintsUsed * 15; // Penalty for using hints
    const finalScore = Math.max(0, baseScore + timeBonus + moveBonus - hintPenalty);
    
    setScore(finalScore);
    
    if (onComplete) {
      onComplete(finalScore, finalTime);
    }
  };

  const handleHint = () => {
    setHintsUsed(prev => prev + 1);
    setShowHint(true);
    
    // Find first unmatched card and show its pair
    const unmatchedCard = cards.find(c => !c.isMatched && !c.isFlipped);
    if (unmatchedCard) {
      const matchingCard = cards.find(c => 
        c.value === unmatchedCard.value && c.id !== unmatchedCard.id && !c.isMatched
      );
      
      if (matchingCard) {
        // Temporarily flip both cards
        setCards(prev => prev.map(card => 
          card.id === unmatchedCard.id || card.id === matchingCard.id
            ? { ...card, isFlipped: true }
            : card
        ));
        
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === unmatchedCard.id || card.id === matchingCard.id
              ? { ...card, isFlipped: false }
              : card
          ));
          setShowHint(false);
        }, 2000);
      }
    }
  };

  const handleReset = () => {
    setIsComplete(false);
    setScore(0);
    setHintsUsed(0);
    setTimeSpent(0);
    setStartTime(Date.now());
    initializeGame();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const config = difficultyConfig[difficulty];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800 font-comic">
              🧠 Memory Match
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-blue-100 px-3 py-2 rounded-full">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-blue-800">{score}</span>
              </div>
              <div className="flex items-center gap-2 bg-green-100 px-3 py-2 rounded-full">
                <Clock className="w-4 h-4 text-green-600" />
                <span className="font-bold text-green-800">{formatTime(timeSpent)}</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-100 px-3 py-2 rounded-full">
                <span className="font-bold text-purple-800">{moves} moves</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleHint}
              disabled={hintsUsed >= 3}
              className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-full font-bold disabled:opacity-50"
            >
              <Lightbulb className="w-5 h-5" />
              Hint ({3 - hintsUsed})
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full font-bold"
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </motion.button>
          </div>

          {/* Difficulty Selector */}
          <div className="flex items-center justify-center gap-4 mb-6">
            {(['easy', 'medium', 'hard'] as const).map((level) => (
              <motion.button
                key={level}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setDifficulty(level);
                  setTimeout(initializeGame, 100);
                }}
                className={`px-6 py-3 rounded-full font-bold text-lg ${
                  difficulty === level
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
                <span className="block text-sm">
                  {difficultyConfig[level].pairs} pairs
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Memory Grid */}
          <div 
            ref={gameContainerRef}
            className="grid gap-4 mx-auto"
            style={{ 
              gridTemplateColumns: `repeat(${config.gridCols}, 1fr)`,
              maxWidth: `${config.gridCols * 120}px`
            }}
          >
            {cards.map((card) => (
              <motion.div
                key={card.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCardClick(card.id)}
                className={`
                  aspect-square rounded-xl shadow-lg cursor-pointer border-2 border-white
                  ${card.isMatched ? 'opacity-50' : ''}
                  ${!canFlip && flippedCards.includes(card.id) ? 'cursor-not-allowed' : ''}
                `}
                style={{
                  background: card.isFlipped || card.isMatched 
                    ? `url(${card.imageUrl}) center/cover`
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              >
                {!card.isFlipped && !card.isMatched && (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">?</span>
                  </div>
                )}
                {card.isMatched && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1"
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Instructions */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 font-comic text-lg">
              🎯 Find matching pairs by flipping cards! Remember their positions!
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Use hints if you're stuck, and try to complete with fewer moves for a higher score!
            </p>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4 font-comic">
                Memory Match Complete!
              </h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-bold text-blue-600">{formatTime(timeSpent)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Moves:</span>
                  <span className="font-bold text-purple-600">{moves}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Score:</span>
                  <span className="font-bold text-green-600">{score}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Hints Used:</span>
                  <span className="font-bold text-orange-600">{hintsUsed}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-full font-bold"
                >
                  Play Again
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-full font-bold"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MemoryMatch;
