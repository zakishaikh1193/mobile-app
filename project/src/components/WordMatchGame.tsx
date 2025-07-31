import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Draggable, Droppable, DropResult, DraggableProvided, DraggableStateSnapshot, DroppableProvided, DroppableStateSnapshot } from '@hello-pangea/dnd';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Define levels by letter groups - organized and clear
const LEVELS = [
  { 
    id: 1, 
    name: "Level 1: Letters A-E", 
    letters: "A, B, C, D, E",
    words: [
      { word: 'Apple', img: '/words/APPLE.png', letter: 'A' },
      { word: 'Ball', img: '/words/BALL.png', letter: 'B' },
      { word: 'Cat', img: '/words/CAT.png', letter: 'C' },
      { word: 'Dog', img: '/words/DOG.png', letter: 'D' },
      { word: 'Elephant', img: '/words/Elephant.png', letter: 'E' },
    ]
  },
  { 
    id: 2, 
    name: "Level 2: Letters F-J", 
    letters: "F, G, H, I, J",
    words: [
      { word: 'Fish', img: '/words/Fish.png', letter: 'F' },
      { word: 'Grapes', img: '/words/Grapes.png', letter: 'G' },
      { word: 'Hat', img: '/words/Hat.png', letter: 'H' },
      { word: 'Ice', img: '/words/Ice.png', letter: 'I' },
      { word: 'Juice', img: '/words/Juice.png', letter: 'J' },
    ]
  },
  { 
    id: 3, 
    name: "Level 3: Letters K-O", 
    letters: "K, L, M, N, O",
    words: [
      { word: 'Kite', img: '/words/Kite.png', letter: 'K' },
      { word: 'Lion', img: '/words/Lion.png', letter: 'L' },
      { word: 'Monkey', img: '/words/Monkey.png', letter: 'M' },
      { word: 'Nest', img: '/words/Nest.png', letter: 'N' },
      { word: 'Orange', img: '/words/Orange.png', letter: 'O' },
    ]
  },
  { 
    id: 4, 
    name: "Level 4: Letters P-T", 
    letters: "P, Q, R, S, T",
    words: [
      { word: 'Pig', img: '/words/PIG.png', letter: 'P' },
      { word: 'Queen', img: '/words/QUEEN.png', letter: 'Q' },
      { word: 'Rabbit', img: '/words/RABBIT.png', letter: 'R' },
      { word: 'Sun', img: '/words/SUN.png', letter: 'S' },
      { word: 'Tiger', img: '/words/TIGER.png', letter: 'T' },
    ]
  },
  { 
    id: 5, 
    name: "Level 5: Letters U-Z", 
    letters: "U, V, W, X, Y, Z",
    words: [
      { word: 'Umbrella', img: '/words/UMBRELLA.png', letter: 'U' },
      { word: 'Violin', img: '/words/VIOLIN.png', letter: 'V' },
      { word: 'Whale', img: '/words/WHALE.png', letter: 'W' },
      { word: 'Xylophone', img: '/words/XYLOPHONE.png', letter: 'X' },
      { word: 'Yoga', img: '/words/YOGA.png', letter: 'Y' },
      { word: 'Zebra', img: '/words/ZEBRA.png', letter: 'Z' },
    ]
  },
];

function shuffle<T>(arr: T[]): T[] {
  return arr.slice().sort(() => Math.random() - 0.5);
}

const speak = (text: string) => {
  if ('speechSynthesis' in window) {
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.rate = 0.8;
    window.speechSynthesis.speak(utter);
  }
};

const WordMatchGame: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  
  // Level progression state
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>([1]); // Start with only level 1 unlocked
  const [currentLevel, setCurrentLevel] = useState(1);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  
  // Game state
  const currentLevelData = LEVELS.find(level => level.id === currentLevel) || LEVELS[0];
  const [draggables, setDraggables] = useState(() => shuffle(currentLevelData.words));
  const [targets, setTargets] = useState(() => shuffle(currentLevelData.words));
  const [matches, setMatches] = useState<{ [key: string]: boolean }>({});
  const [feedback, setFeedback] = useState<{ word: string; correct: boolean } | null>(null);
  const [completed, setCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showLevelCompleteModal, setShowLevelCompleteModal] = useState(false);
  const [bgMusic, setBgMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { updateChildProgress } = useAuth();

  // Load saved progress from localStorage
  useEffect(() => {
    if (childId) {
      const savedProgress = localStorage.getItem(`wordMatchProgress_${childId}`);
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        setUnlockedLevels(progress.unlockedLevels || [1]);
        setCompletedLevels(progress.completedLevels || []);
        setCurrentLevel(progress.currentLevel || 1);
      }
    }
  }, [childId]);

  // Save progress to localStorage
  const saveProgress = React.useCallback((newUnlockedLevels: number[], newCompletedLevels: number[], newCurrentLevel: number) => {
    if (childId) {
      const progress = {
        unlockedLevels: newUnlockedLevels,
        completedLevels: newCompletedLevels,
        currentLevel: newCurrentLevel
      };
      localStorage.setItem(`wordMatchProgress_${childId}`, JSON.stringify(progress));
    }
  }, [childId]);

  // Handle level completion
  const handleLevelComplete = React.useCallback(() => {
    const newCompletedLevels = [...completedLevels];
    if (!newCompletedLevels.includes(currentLevel)) {
      newCompletedLevels.push(currentLevel);
    }

    const newUnlockedLevels = [...unlockedLevels];
    const nextLevel = currentLevel + 1;
    if (nextLevel <= LEVELS.length && !newUnlockedLevels.includes(nextLevel)) {
      newUnlockedLevels.push(nextLevel);
    }

    setCompletedLevels(newCompletedLevels);
    setUnlockedLevels(newUnlockedLevels);
    saveProgress(newUnlockedLevels, newCompletedLevels, currentLevel);

    // Show level complete modal
    setShowLevelCompleteModal(true);
  }, [completedLevels, currentLevel, unlockedLevels, saveProgress]);

  // Handle next level button
  const handleNextLevel = () => {
    const nextLevel = currentLevel + 1;
    if (nextLevel <= LEVELS.length && unlockedLevels.includes(nextLevel)) {
      // Close the popup immediately
      setShowLevelCompleteModal(false);
      // Change to next level immediately
      setCurrentLevel(nextLevel);
      // Reset completion state
      setCompleted(false);
    }
  };

  // Handle play again button
  const handlePlayAgain = () => {
    // Close the popup immediately
    setShowLevelCompleteModal(false);
    // Reset the game state immediately
    setCompleted(false);
    setMatches({});
    setFeedback(null);
    // Shuffle the words again
    const levelData = LEVELS.find(level => level.id === currentLevel) || LEVELS[0];
    setDraggables(shuffle(levelData.words));
    setTargets(shuffle(levelData.words));
  };

  // Reset game state
  const resetGame = () => {
    const levelData = LEVELS.find(level => level.id === currentLevel) || LEVELS[0];
    setDraggables(shuffle(levelData.words));
    setTargets(shuffle(levelData.words));
    setMatches({});
    setCompleted(false);
    setShowConfetti(false);
    setFeedback(null);
  };

  // Handle level selection
  const handleLevelSelect = (level: number) => {
    if (unlockedLevels.includes(level)) {
      setCurrentLevel(level);
      setShowLevelSelect(false);
      resetGame();
    }
  };

  React.useEffect(() => {
    if (audioRef.current) {
      if (bgMusic) {
        audioRef.current.volume = 0.2;
        audioRef.current.loop = true;
        audioRef.current.play();
      } else {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [bgMusic]);

  React.useEffect(() => {
    if (Object.keys(matches).length === currentLevelData.words.length) {
      setCompleted(true);
      setShowConfetti(true);
      speak('You did it!');
      setTimeout(() => setShowConfetti(false), 2500);
      handleLevelComplete();
    }
  }, [matches, currentLevelData.words.length, handleLevelComplete]);

  React.useEffect(() => {
    if (completed && childId) {
      // Calculate progress percentage based on completed levels
      const percent = Math.round((completedLevels.length / LEVELS.length) * 100);
      updateChildProgress(childId, 'word-match', percent);
    }
  }, [completed, childId, completedLevels, updateChildProgress]);

  // Reset game when currentLevel changes
  React.useEffect(() => {
    const levelData = LEVELS.find(level => level.id === currentLevel) || LEVELS[0];
    setDraggables(shuffle(levelData.words));
    setTargets(shuffle(levelData.words));
    setMatches({});
    setCompleted(false);
    setShowConfetti(false);
    setFeedback(null);
  }, [currentLevel]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const draggedWord = result.draggableId;
    const targetWord = result.destination.droppableId.replace('target-', '');
    if (draggedWord === targetWord && !matches[targetWord]) {
      setMatches((prev) => ({ ...prev, [targetWord]: true }));
      setFeedback({ word: targetWord, correct: true });
      speak('Great job!');
      setTimeout(() => setFeedback(null), 1000);
    } else if (draggedWord !== targetWord) {
      setFeedback({ word: targetWord, correct: false });
      speak('Try again!');
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  const handleBackToDashboard = () => {
    console.log('Back to Dashboard clicked, childId:', childId);
    // Close any open popups first
    setShowLevelCompleteModal(false);
    setShowLevelSelect(false);
    setCompleted(false);
    // Then navigate to dashboard using window.location for more reliable navigation
    if (childId) {
      console.log('Navigating to child dashboard:', `/child-dashboard/${childId}`);
      window.location.href = `/child-dashboard/${childId}`;
    } else {
      console.log('Navigating to parent dashboard');
      window.location.href = '/parent-dashboard';
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden select-none bg-[#f6f8fc]">
      {/* Background Music */}
      <audio ref={audioRef} src="https://cdn.pixabay.com/audio/2022/10/16/audio_12b5fa3b7b.mp3" />
      <button
        className="absolute top-3 right-3 bg-white rounded-full shadow p-2 text-lg z-30"
        onClick={() => setBgMusic((b) => !b)}
        aria-label="Toggle music"
      >
        {bgMusic ? '🔊' : '🔈'}
      </button>

      {/* Level Select Button */}
      <button
        className="absolute top-4 right-16 px-4 py-2 rounded-full bg-purple-500 text-white font-bold shadow hover:bg-purple-600 active:scale-95 transition z-50"
        onClick={() => setShowLevelSelect(true)}
      >
        📚 Levels
      </button>





      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
          >
            <span className="text-7xl animate-bounce">🎉��🎉</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back to Dashboard Button (top left corner, fixed) */}
      <button
        className="fixed top-4 left-4 px-4 py-2 rounded-full bg-blue-500 text-white font-bold shadow hover:bg-blue-600 active:scale-95 transition z-50"
        onClick={() => {
          console.log('Main Back to Dashboard clicked');
          if (childId) {
            window.location.href = `/child-dashboard/${childId}`;
          } else {
            window.location.href = '/parent-dashboard';
          }
        }}
      >
        ← Back to Dashboard
      </button>

      {/* Game Card Container with WALL2 and WALL1 as accents */}
      <div className="relative z-20 w-full max-w-2xl bg-white bg-opacity-80 rounded-3xl shadow-xl p-4 mt-8 mb-4 flex flex-col items-center border-2 border-gray-100 mx-2 md:mx-8">
        {/* WALL2 as background accent */}
        <img src="/words/WALL2.png" alt="Background Accent" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 md:w-64 opacity-20 z-10 pointer-events-none select-none" style={{userSelect:'none'}} />
        {/* WALL1 at top edge */}
        <img src="/words/WALL1.png" alt="Top Accent" className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3/4 w-24 md:w-32 z-20 pointer-events-none select-none" style={{userSelect:'none'}} />
        
        {/* Level Title */}
        <h1 className="text-2xl font-extrabold text-center text-green-600 mb-2 mt-2 tracking-tight" style={{ fontFamily: 'Comic Sans MS, Comic Sans, cursive' }}>
          {currentLevelData.name}
        </h1>
        <p className="text-lg text-center text-blue-600 mb-4 font-semibold">
          Letters: {currentLevelData.letters}
        </p>
        
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex w-full gap-8 justify-center">
            {/* Draggables */}
            <Droppable droppableId="draggables" isDropDisabled={true}>
              {(provided: DroppableProvided) => (
                <div className="flex flex-col gap-4 flex-1" ref={provided.innerRef} {...provided.droppableProps}>
                  {draggables.map(({ word, img }, idx) => (
                    <Draggable key={word} draggableId={word} index={idx} isDragDisabled={matches[word]}>
                      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`rounded-2xl bg-gradient-to-br from-green-200 to-blue-200 shadow-md flex items-center justify-center h-24 w-full border-4 transition-all duration-200 ${snapshot.isDragging ? 'scale-110 ring-4 ring-yellow-400' : ''} ${matches[word] ? 'opacity-50' : 'active:scale-95'}`}
                          style={{ fontFamily: 'Comic Sans MS, Comic Sans, cursive', ...provided.draggableProps.style }}
                          onClick={() => speak(word)}
                        >
                          <img src={img} alt={word} className="h-16 w-16 object-contain rounded-xl mr-4 bg-white" />
                          <span className="text-xl font-bold text-gray-700 drop-shadow-md">{word}</span>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            {/* Drop Targets */}
            <div className="flex flex-col gap-4 flex-1">
              {targets.map(({ word, img }) => (
                <Droppable droppableId={`target-${word}`} key={word} isDropDisabled={matches[word]}>
                  {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                    <motion.div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`rounded-2xl bg-gradient-to-br from-yellow-200 to-pink-200 shadow-md flex items-center justify-center h-24 w-full border-4 transition-all duration-200 relative ${feedback && feedback.word === word ? (feedback.correct ? 'border-green-400' : 'border-red-400') : matches[word] ? 'border-green-400 bg-green-100 animate-pulse' : snapshot.isDraggingOver ? 'border-blue-400' : 'border-transparent'} ${matches[word] ? 'opacity-50' : ''}`}
                      style={{ fontFamily: 'Comic Sans MS, Comic Sans, cursive' }}
                      onClick={() => speak(word)}
                    >
                      <img src={img} alt={word} className="h-16 w-16 object-contain rounded-xl mr-4 bg-white" />
                      <span className="text-xl font-bold text-gray-700 drop-shadow-md">{word}</span>
                      {matches[word] && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute right-3 text-green-500 text-3xl"
                        >
                          ⭐
                        </motion.span>
                      )}
                      {provided.placeholder}
                    </motion.div>
                  )}
                </Droppable>
              ))}
            </div>
          </div>
        </DragDropContext>
      </div>

      {/* Level Select Modal */}
      <AnimatePresence>
        {showLevelSelect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-3xl p-8 text-center max-w-md w-full shadow-xl relative">
              {/* Close Button (X) */}
              <button
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-lg transition-colors"
                onClick={() => setShowLevelSelect(false)}
                aria-label="Close popup"
              >
                ✕
              </button>
              
              <h2 className="text-2xl font-bold text-purple-700 mb-6">Select Level</h2>
              <div className="grid grid-cols-1 gap-4 mb-6">
                {LEVELS.map((level) => {
                  const isUnlocked = unlockedLevels.includes(level.id);
                  const isCompleted = completedLevels.includes(level.id);
                  const isCurrent = currentLevel === level.id;
                  
                  return (
                    <button
                      key={level.id}
                      onClick={() => handleLevelSelect(level.id)}
                      disabled={!isUnlocked}
                      className={`p-4 rounded-2xl font-bold text-lg transition-all text-left ${
                        isUnlocked
                          ? isCurrent
                            ? 'bg-purple-500 text-white shadow-lg'
                            : isCompleted
                            ? 'bg-green-500 text-white shadow-lg'
                            : 'bg-blue-500 text-white shadow-lg hover:bg-blue-600'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm opacity-80">
                            {isCompleted ? '✅ Completed' : isUnlocked ? '🔓 Available' : '🔒 Locked'}
                          </div>
                          <div className="text-lg font-bold">{level.name}</div>
                          <div className="text-sm opacity-80">{level.letters}</div>
                        </div>
                        <div className="text-2xl">
                          {isCompleted ? '✅' : isUnlocked ? '🔓' : '🔒'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <button
                className="w-full py-3 rounded-xl bg-gray-500 text-white font-bold text-lg shadow active:scale-95"
                onClick={() => setShowLevelSelect(false)}
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level Complete Modal */}
      <AnimatePresence>
        {showLevelCompleteModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-3xl p-8 text-center max-w-xs w-full shadow-xl relative">
              {/* Close Button (X) */}
              <button
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-lg transition-colors"
                onClick={() => setShowLevelCompleteModal(false)}
                aria-label="Close popup"
              >
                ✕
              </button>
              
              <div className="text-6xl mb-2">🎉</div>
              <h2 className="text-2xl font-bold text-green-700 mb-2">Level {currentLevel} Complete!</h2>
              <p className="text-lg text-gray-700 mb-6">Great job! You've completed {currentLevelData.name}!</p>
              
              {/* Play Again Button */}
              <button
                className="w-full py-3 rounded-xl bg-gradient-to-r from-green-400 to-blue-400 text-white font-bold text-lg mb-3 shadow active:scale-95"
                onClick={handlePlayAgain}
              >
                🔄 Play Again
              </button>
              
              {/* Next Level Button (only if not the last level) */}
              {currentLevel < LEVELS.length && (
                <button
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-400 to-pink-400 text-white font-bold text-lg mb-3 shadow active:scale-95"
                  onClick={handleNextLevel}
                >
                  ➡️ Next Level ({currentLevel + 1})
                </button>
              )}
              
              {/* Back to Dashboard Button */}
              <button
                className="w-full py-3 rounded-xl bg-gray-500 text-white font-bold text-lg shadow active:scale-95"
                onClick={handleBackToDashboard}
              >
                🏠 Back to Dashboard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final Level Complete Modal */}
      <AnimatePresence>
        {completed && currentLevel === LEVELS.length && !showLevelCompleteModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-3xl p-8 text-center max-w-xs w-full shadow-xl relative">
              {/* Close Button (X) */}
              <button
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-lg transition-colors"
                onClick={() => setCompleted(false)}
                aria-label="Close popup"
              >
                ✕
              </button>
              
              <div className="text-6xl mb-2">🏆</div>
              <h2 className="text-2xl font-bold text-green-700 mb-2">All Levels Complete!</h2>
              <p className="text-lg text-gray-700 mb-6">Congratulations! You've completed all levels!</p>
              
              {/* Play Again Button */}
              <button
                className="w-full py-3 rounded-xl bg-gradient-to-r from-green-400 to-blue-400 text-white font-bold text-lg mb-3 shadow active:scale-95"
                onClick={handlePlayAgain}
              >
                🔄 Play Again
              </button>
              
              <button
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-400 to-pink-400 text-white font-bold text-lg mb-3 shadow active:scale-95"
                onClick={() => setShowLevelSelect(true)}
              >
                🎮 Play Any Level
              </button>
              
              <button
                className="w-full py-3 rounded-xl bg-gray-500 text-white font-bold text-lg shadow active:scale-95"
                onClick={handleBackToDashboard}
              >
                🏠 Back to Dashboard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WordMatchGame; 