import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Draggable, Droppable, DropResult, DraggableProvided, DraggableStateSnapshot, DroppableProvided, DroppableStateSnapshot } from '@hello-pangea/dnd';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

// Define unique words/images for each level
const LEVEL_WORDS = [
  [ // Level 1: A-E
    { word: 'Apple', img: '/words/APPLE.png', letter: 'A' },
    { word: 'Ball', img: '/words/BALL.png', letter: 'B' },
    { word: 'Cat', img: '/words/CAT.png', letter: 'C' },
    { word: 'Dog', img: '/words/DOG.png', letter: 'D' },
    { word: 'Elephant', img: '/words/Elephant.png', letter: 'E' },
  ],
  [ // Level 2: F-J
    { word: 'Fish', img: '/words/Fish.png', letter: 'F' },
    { word: 'Grapes', img: '/words/Grapes.png', letter: 'G' },
    { word: 'Hat', img: '/words/Hat.png', letter: 'H' },
    { word: 'Ice', img: '/words/Ice.png', letter: 'I' },
    { word: 'Juice', img: '/words/Juice.png', letter: 'J' },
  ],
  [ // Level 3: K-O
    { word: 'Kite', img: '/words/Kite.png', letter: 'K' },
    { word: 'Lion', img: '/words/Lion.png', letter: 'L' },
    { word: 'Monkey', img: '/words/Monkey.png', letter: 'M' },
    { word: 'Nest', img: '/words/Nest.png', letter: 'N' },
    { word: 'Orange', img: '/words/Orange.png', letter: 'O' },
  ],
  [ // Level 4: P-T
    { word: 'Pig', img: '/words/PIG.png', letter: 'P' },
    { word: 'Queen', img: '/words/QUEEN.png', letter: 'Q' },
    { word: 'Rabbit', img: '/words/RABBIT.png', letter: 'R' },
    { word: 'Sun', img: '/words/SUN.png', letter: 'S' },
    { word: 'Tiger', img: '/words/TIGER.png', letter: 'T' },
  ],
  [ // Level 5: U-Z
    { word: 'Umbrella', img: '/words/UMBRELLA.png', letter: 'U' },
    { word: 'Violin', img: '/words/VIOLIN.png', letter: 'V' },
    { word: 'Whale', img: '/words/WHALE.png', letter: 'W' },
    { word: 'Xylophone', img: '/words/XYLOPHONE.png', letter: 'X' },
    { word: 'Yoga', img: '/words/YOGA.png', letter: 'Y' },
    { word: 'Zebra', img: '/words/ZEBRA.png', letter: 'Z' },
  ],
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
  const navigate = useNavigate();
  const { childId } = useParams<{ childId: string }>();
  const [searchParams] = useSearchParams();
  const levelParam = parseInt(searchParams.get('level') || '1', 10);
  const level = isNaN(levelParam) ? 1 : Math.max(1, Math.min(levelParam, LEVEL_WORDS.length));
  const levelWords = LEVEL_WORDS[level - 1];
  const [draggables, setDraggables] = useState(() => shuffle(levelWords));
  const [targets, setTargets] = useState(() => shuffle(levelWords));
  const [matches, setMatches] = useState<{ [key: string]: boolean }>({});
  const [feedback, setFeedback] = useState<{ word: string; correct: boolean } | null>(null);
  const [completed, setCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [bgMusic, setBgMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

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
    if (Object.keys(matches).length === levelWords.length) {
      setCompleted(true);
      setShowConfetti(true);
      speak('You did it!');
      setTimeout(() => setShowConfetti(false), 2500);
    }
  }, [matches, levelWords.length]);

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

  const handleTryAgain = () => {
    setDraggables(shuffle(levelWords));
    setTargets(shuffle(levelWords));
    setMatches({});
    setCompleted(false);
    setShowConfetti(false);
    setFeedback(null);
  };

  const handleBackToPath = () => {
    navigate(`/letter-path/${childId}?finishedLevel=${level}`);
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
      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
          >
            <span className="text-7xl animate-bounce">🎉🎉🎉</span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Back to Path Button (top left corner, fixed) */}
      <button
        className="fixed top-4 left-4 px-4 py-2 rounded-full bg-blue-500 text-white font-bold shadow hover:bg-blue-600 active:scale-95 transition z-50"
        onClick={() => navigate(`/letter-path/${childId}`)}
      >
        ← Back
      </button>
      {/* Game Card Container with WALL2 and WALL1 as accents */}
      <div className="relative z-20 w-full max-w-2xl bg-white bg-opacity-80 rounded-3xl shadow-xl p-4 mt-8 mb-4 flex flex-col items-center border-2 border-gray-100 mx-2 md:mx-8">
        {/* WALL2 as background accent */}
        <img src="/words/WALL2.png" alt="Background Accent" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 md:w-64 opacity-20 z-10 pointer-events-none select-none" style={{userSelect:'none'}} />
        {/* WALL1 at top edge */}
        <img src="/words/WALL1.png" alt="Top Accent" className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3/4 w-24 md:w-32 z-20 pointer-events-none select-none" style={{userSelect:'none'}} />
        <h1 className="text-2xl font-extrabold text-center text-green-600 mb-4 mt-2 tracking-tight" style={{ fontFamily: 'Comic Sans MS, Comic Sans, cursive' }}>Word Match - Level {level}</h1>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex w-full gap-8 justify-center">
            {/* Draggables */}
            <Droppable droppableId="draggables" isDropDisabled={true}>
              {(provided: DroppableProvided) => (
                <div className="flex flex-col gap-4 flex-1" ref={provided.innerRef} {...provided.droppableProps}>
                  {draggables.map(({ word, img }, idx) => (
                    <Draggable key={word} draggableId={word} index={idx} isDragDisabled={matches[word]}>
                      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                        <motion.div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`rounded-2xl bg-gradient-to-br from-green-200 to-blue-200 shadow-md flex items-center justify-center h-24 w-full border-4 transition-all duration-200 ${snapshot.isDragging ? 'scale-110 ring-4 ring-yellow-400' : ''} ${matches[word] ? 'opacity-50' : 'active:scale-95'}`}
                          style={{ fontFamily: 'Comic Sans MS, Comic Sans, cursive', ...provided.draggableProps.style }}
                          onClick={() => speak(word)}
                        >
                          <img src={img} alt={word} className="h-16 w-16 object-contain rounded-xl mr-4 bg-white" />
                          <span className="text-xl font-bold text-gray-700 drop-shadow-md">{word}</span>
                        </motion.div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            {/* Drop Targets */}
            <div className="flex flex-col gap-4 flex-1">
              {targets.map(({ word, img }, idx) => (
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
      {/* Game Complete Modal */}
      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-3xl p-8 text-center max-w-xs w-full shadow-xl">
              <div className="text-6xl mb-2">🎉</div>
              <h2 className="text-2xl font-bold text-green-700 mb-2">You did it!</h2>
              <p className="text-lg text-gray-700 mb-6">All matches complete!</p>
              <button
                className="w-full py-3 rounded-xl bg-gradient-to-r from-green-400 to-blue-400 text-white font-bold text-lg mb-3 shadow active:scale-95"
                onClick={handleTryAgain}
              >
                Play Again
              </button>
              <button
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-400 to-yellow-400 text-white font-bold text-lg shadow active:scale-95"
                onClick={handleBackToPath}
              >
                Back
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WordMatchGame; 