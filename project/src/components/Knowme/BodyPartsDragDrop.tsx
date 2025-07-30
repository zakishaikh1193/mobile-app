import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, GripVertical } from 'lucide-react';
import { useAudio } from '../../contexts/AudioContext';
import { useAuth } from '../../contexts/AuthContext';
import Confetti from 'react-confetti';

// Import images
import bodyImg from '../../source/body.png';
import b2Img from '../../source/D1.png';

interface BodyPartsDragDropProps {
  onActivityComplete: () => void;
  completedActivities: string[];
}

const BodyPartsDragDrop: React.FC<BodyPartsDragDropProps> = ({ 
  onActivityComplete, 
  completedActivities 
}) => {
  const { speak, playSound } = useAudio();
  const { updateChildProgress } = useAuth();
  const [placed, setPlaced] = useState<{ [key: number]: string }>({});
  const [feedback, setFeedback] = useState<{ [key: number]: 'correct' | 'incorrect' | undefined }>({});
  const [draggedLabel, setDraggedLabel] = useState<string | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Update window size on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate responsive dimensions
  const isMobile = windowSize.width < 768;
  const isTablet = windowSize.width >= 768 && windowSize.width < 1024;
  const isLargeScreen = windowSize.width >= 1200;
  
  // Responsive sizing based on viewport
  const CONTAINER_WIDTH = Math.min(windowSize.width * 0.98, isLargeScreen ? 1000 : 800);
  const CONTAINER_HEIGHT = Math.min(windowSize.height * 0.65, isLargeScreen ? 700 : 600);
  const BODY_IMG_WIDTH = Math.min(CONTAINER_WIDTH * (isMobile ? 0.6 : 0.45), isLargeScreen ? 300 : 250);
  const BODY_IMG_HEIGHT = Math.min(CONTAINER_HEIGHT * (isMobile ? 0.75 : 0.8), isLargeScreen ? 500 : 400);

  // Responsive drop zone sizing
  const DROP_ZONE_WIDTH = isMobile ? 90 : isTablet ? 110 : isLargeScreen ? 140 : 120;
  const DROP_ZONE_HEIGHT = isMobile ? 35 : isTablet ? 40 : isLargeScreen ? 50 : 45;
  const DROP_ZONE_FONT_SIZE = isMobile ? '0.75rem' : isTablet ? '0.9rem' : isLargeScreen ? '1rem' : '0.85rem';

  // Responsive label sizing
  const LABEL_MIN_WIDTH = isMobile ? 70 : isTablet ? 85 : isLargeScreen ? 100 : 90;
  const LABEL_HEIGHT = isMobile ? 40 : isTablet ? 45 : isLargeScreen ? 50 : 48;
  const LABEL_FONT_SIZE = isMobile ? '0.8rem' : isTablet ? '0.9rem' : isLargeScreen ? '1rem' : '0.95rem';

  // Debug viewport information
  const viewportInfo = {
    width: windowSize.width,
    height: windowSize.height,
    deviceType: isMobile ? 'Mobile' : isTablet ? 'Tablet' : isLargeScreen ? 'Large Screen' : 'Desktop',
    containerWidth: CONTAINER_WIDTH,
    containerHeight: CONTAINER_HEIGHT,
    bodyImgWidth: BODY_IMG_WIDTH,
    bodyImgHeight: BODY_IMG_HEIGHT
  };

  // List of body parts with improved responsive coordinates
  const PARTS = [
    // Left side - adjusted for better positioning
    { label: 'Hair', side: 'left', dot: { x: BODY_IMG_WIDTH * 0.5, y: BODY_IMG_HEIGHT * 0.05 }, box: { x: 15, y: CONTAINER_HEIGHT * 0.08 } },
    { label: 'Eye', side: 'left', dot: { x: BODY_IMG_WIDTH * 0.45, y: BODY_IMG_HEIGHT * 0.15 }, box: { x: 15, y: CONTAINER_HEIGHT * 0.18 } },
    { label: 'Ear', side: 'left', dot: { x: BODY_IMG_WIDTH * 0.3, y: BODY_IMG_HEIGHT * 0.18 }, box: { x: 15, y: CONTAINER_HEIGHT * 0.28 } },
    { label: 'Neck', side: 'left', dot: { x: BODY_IMG_WIDTH * 0.5, y: BODY_IMG_HEIGHT * 0.28 }, box: { x: 15, y: CONTAINER_HEIGHT * 0.38 } },
    { label: 'Shoulder', side: 'left', dot: { x: BODY_IMG_WIDTH * 0.325, y: BODY_IMG_HEIGHT * 0.35 }, box: { x: 15, y: CONTAINER_HEIGHT * 0.48 } },
    { label: 'Hand', side: 'left', dot: { x: BODY_IMG_WIDTH * 0.125, y: BODY_IMG_HEIGHT * 0.55 }, box: { x: 15, y: CONTAINER_HEIGHT * 0.58 } },
    { label: 'Foot', side: 'left', dot: { x: BODY_IMG_WIDTH * 0.35, y: BODY_IMG_HEIGHT * 0.85 }, box: { x: 15, y: CONTAINER_HEIGHT * 0.68 } },
    // Right side - adjusted for better positioning
    { label: 'Eyebrow', side: 'right', dot: { x: BODY_IMG_WIDTH * 0.5, y: BODY_IMG_HEIGHT * 0.12 }, box: { x: CONTAINER_WIDTH - DROP_ZONE_WIDTH - 15, y: CONTAINER_HEIGHT * 0.08 } },
    { label: 'Nose', side: 'right', dot: { x: BODY_IMG_WIDTH * 0.5, y: BODY_IMG_HEIGHT * 0.2 }, box: { x: CONTAINER_WIDTH - DROP_ZONE_WIDTH - 15, y: CONTAINER_HEIGHT * 0.18 } },
    { label: 'Mouth', side: 'right', dot: { x: BODY_IMG_WIDTH * 0.5, y: BODY_IMG_HEIGHT * 0.26 }, box: { x: CONTAINER_WIDTH - DROP_ZONE_WIDTH - 15, y: CONTAINER_HEIGHT * 0.28 } },
    { label: 'Chest', side: 'right', dot: { x: BODY_IMG_WIDTH * 0.5, y: BODY_IMG_HEIGHT * 0.4 }, box: { x: CONTAINER_WIDTH - DROP_ZONE_WIDTH - 15, y: CONTAINER_HEIGHT * 0.38 } },
    { label: 'Abdomen', side: 'right', dot: { x: BODY_IMG_WIDTH * 0.5, y: BODY_IMG_HEIGHT * 0.52 }, box: { x: CONTAINER_WIDTH - DROP_ZONE_WIDTH - 15, y: CONTAINER_HEIGHT * 0.48 } },
    { label: 'Hip', side: 'right', dot: { x: BODY_IMG_WIDTH * 0.5, y: BODY_IMG_HEIGHT * 0.64 }, box: { x: CONTAINER_WIDTH - DROP_ZONE_WIDTH - 15, y: CONTAINER_HEIGHT * 0.58 } },
    { label: 'Leg', side: 'right', dot: { x: BODY_IMG_WIDTH * 0.55, y: BODY_IMG_HEIGHT * 0.75 }, box: { x: CONTAINER_WIDTH - DROP_ZONE_WIDTH - 15, y: CONTAINER_HEIGHT * 0.68 } },
  ];

  const availableLabels = PARTS.map(p => p.label).filter(label => !Object.values(placed).includes(label));
  const progress = Math.round((Object.keys(placed).length / PARTS.length) * 100);
  const allCorrect = Object.keys(placed).length === PARTS.length;

  // Mobile touch handlers
  const handleLabelSelect = (label: string) => {
    if (isMobile) {
      setSelectedLabel(label);
      speak(`Selected ${label.toLowerCase()}`);
    }
  };

  const handleDropZoneTap = (index: number) => {
    if (isMobile && selectedLabel) {
      const part = PARTS[index];
      const isCorrect = selectedLabel === part.label;
      
      if (isCorrect) {
        setPlaced(prev => ({ ...prev, [index]: selectedLabel }));
        setFeedback(prev => ({ ...prev, [index]: 'correct' }));
        playSound('success');
      } else {
        setFeedback(prev => ({ ...prev, [index]: 'incorrect' }));
        playSound('click');
      }
      
      handleDropFeedback(isCorrect, selectedLabel);
      setTimeout(() => setFeedback(prev => ({ ...prev, [index]: undefined })), 1200);
      setSelectedLabel(null);
    }
  };

  const handleDropFeedback = (isCorrect: boolean, label: string) => {
    if (isCorrect) {
      speak(`Great job! That's the ${label.toLowerCase()}`);
      if (Object.keys(placed).length + 1 === PARTS.length) {
        setTimeout(() => {
          setShowConfetti(true);
          setShowCelebration(true);
          speak("Congratulations! You labeled all the body parts correctly!");
          onActivityComplete();
        }, 500);
      }
    } else {
      speak("Try again! That's not quite right.");
    }
  };

  // Desktop drag handlers
  const handleDragStart = (label: string) => {
    if (!isMobile) {
      setDraggedLabel(label);
      setIsDragging(true);
    }
  };

  const handleDragEnd = () => {
    if (!isMobile) {
      setDraggedLabel(null);
      setIsDragging(false);
      setHoveredIdx(null);
    }
  };

  const runDemo = () => {
    speak("Let me show you how to play! " + (isMobile ? "Tap a label, then tap the correct body part!" : "Drag the labels to the correct body parts!"));
    const demoLabels = ['Hair', 'Eye', 'Ear', 'Mouth'];
    let demoIndex = 0;

    const demoStep = () => {
      if (demoIndex >= demoLabels.length) {
        speak("Now you try! " + (isMobile ? "Tap labels and body parts!" : "Drag the labels to the correct spots!"));
        return;
      }

      const label = demoLabels[demoIndex];
      const partIndex = PARTS.findIndex(p => p.label === label);
      
      if (partIndex !== -1) {
        setTimeout(() => {
          setPlaced(prev => ({ ...prev, [partIndex]: label }));
          setFeedback(prev => ({ ...prev, [partIndex]: 'correct' }));
          speak(`This is the ${label.toLowerCase()}`);
          setTimeout(() => {
            setFeedback(prev => ({ ...prev, [partIndex]: undefined }));
            demoIndex++;
            demoStep();
          }, 1500);
        }, 1000);
      }
    };

    demoStep();
  };

  const resetGame = () => {
    setPlaced({});
    setFeedback({});
    setShowConfetti(false);
    setShowCelebration(false);
    setDraggedLabel(null);
    setSelectedLabel(null);
    setHoveredIdx(null);
    setIsDragging(false);
    speak("Let's play again! " + (isMobile ? "Tap labels and body parts!" : "Drag the labels to the correct body parts!"));
  };

  const goBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-x-hidden p-2 sm:p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6 lg:mb-8">
        <button
          onClick={goBack}
          className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 bg-blue-200 text-blue-900 rounded-full font-bold shadow hover:bg-blue-300 transition text-xs sm:text-sm md:text-base lg:text-lg touch-manipulation min-h-[40px] sm:min-h-[44px]"
        >
          ← Back
        </button>
        <div className="text-center flex-1 mx-2 sm:mx-4">
          <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 mb-1">
            Label My Body
          </h1>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600">
            {isMobile ? "Tap labels and body parts!" : "Drag the labels to the correct body parts!"}
          </p>
        </div>
        <button
          onClick={resetGame}
          className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 bg-green-200 text-green-900 rounded-full font-bold shadow hover:bg-green-300 transition text-xs sm:text-sm md:text-base lg:text-lg touch-manipulation min-h-[40px] sm:min-h-[44px]"
        >
          Reset
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 md:h-4 mb-3 sm:mb-4 md:mb-6">
        <div 
          className="bg-gradient-to-r from-green-400 to-blue-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Viewport Debug Info - Remove this in production */}
      <div className="bg-blue-100 border border-blue-300 rounded-lg p-2 mb-3 text-xs sm:text-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div><strong>Device:</strong> {viewportInfo.deviceType}</div>
          <div><strong>Viewport:</strong> {viewportInfo.width}×{viewportInfo.height}</div>
          <div><strong>Container:</strong> {Math.round(viewportInfo.containerWidth)}×{Math.round(viewportInfo.containerHeight)}</div>
          <div><strong>Body Image:</strong> {Math.round(viewportInfo.bodyImgWidth)}×{Math.round(viewportInfo.bodyImgHeight)}</div>
        </div>
      </div>

      {/* Main activity area */}
      <div className="relative flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto">
        <div 
          className="relative flex items-center justify-center"
          style={{ 
            width: CONTAINER_WIDTH, 
            height: CONTAINER_HEIGHT, 
            minWidth: isMobile ? 300 : 400,
            minHeight: isMobile ? 400 : 500
          }}
        >
          {/* Central body image */}
          <img
            src={allCorrect ? b2Img : bodyImg}
            alt="Body"
            style={{ 
              width: BODY_IMG_WIDTH, 
              height: BODY_IMG_HEIGHT, 
              position: 'absolute', 
              left: '50%', 
              top: '50%', 
              transform: 'translate(-50%, -50%)', 
              userSelect: 'none', 
              touchAction: 'none',
              maxWidth: '100%',
              maxHeight: '100%'
            }}
            draggable={false}
            className="object-contain"
          />

          {/* Highlight dot on body part when dragging over drop zone */}
          {hoveredIdx !== null && !isMobile && (
            <div
              className="absolute rounded-full bg-yellow-400 border-4 border-yellow-300 shadow-lg animate-pulse"
              style={{
                left: PARTS[hoveredIdx].dot.x - 12,
                top: PARTS[hoveredIdx].dot.y - 12,
                width: 24,
                height: 24,
                zIndex: 30,
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Lines and drop zones */}
          {PARTS.map((part, i) => {
            const scaledDotX = part.dot.x;
            const scaledDotY = part.dot.y;
            const scaledBoxX = part.box.x;
            const scaledBoxY = part.box.y;
            
            return (
              <React.Fragment key={part.label}>
                <svg style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }} width={CONTAINER_WIDTH} height={CONTAINER_HEIGHT}>
                  <line
                    x1={scaledDotX}
                    y1={scaledDotY}
                    x2={scaledBoxX + DROP_ZONE_WIDTH / 2}
                    y2={scaledBoxY + DROP_ZONE_HEIGHT / 2}
                    stroke="#b2b2b2"
                    strokeWidth={isMobile ? "1.5" : "2"}
                  />
                </svg>
                <div
                  className={`absolute rounded-lg flex items-center justify-center shadow font-bold select-none transition-all duration-300 touch-manipulation
                    ${feedback[i] === 'correct' ? 'bg-green-300 border-green-600 text-green-900' :
                      feedback[i] === 'incorrect' ? 'bg-red-300 border-red-600 text-red-900' :
                      selectedLabel === part.label ? 'bg-yellow-200 border-yellow-500 text-yellow-900 scale-105' :
                      'bg-green-200 border-green-400 text-green-900 hover:bg-green-300'}`}
                  style={{ 
                    left: scaledBoxX, 
                    top: scaledBoxY, 
                    width: DROP_ZONE_WIDTH, 
                    height: DROP_ZONE_HEIGHT, 
                    zIndex: 10, 
                    borderWidth: 2, 
                    borderStyle: 'solid', 
                    cursor: placed[i] ? 'default' : 'pointer', 
                    fontSize: DROP_ZONE_FONT_SIZE, 
                    touchAction: 'none',
                    minWidth: DROP_ZONE_WIDTH,
                    minHeight: DROP_ZONE_HEIGHT
                  }}
                  onDragOver={e => { 
                    if (!isMobile) {
                      e.preventDefault(); 
                      setHoveredIdx(i); 
                    }
                  }}
                  onDragLeave={() => {
                    if (!isMobile) setHoveredIdx(null);
                  }}
                  onDrop={e => {
                    if (!isMobile) {
                      e.preventDefault();
                      setHoveredIdx(null);
                      if (!draggedLabel) return;
                      const isCorrect = draggedLabel === part.label;
                      if (isCorrect) {
                        setPlaced(prev => ({ ...prev, [i]: draggedLabel }));
                        setFeedback(prev => ({ ...prev, [i]: 'correct' }));
                      } else {
                        setFeedback(prev => ({ ...prev, [i]: 'incorrect' }));
                      }
                      handleDropFeedback(isCorrect, draggedLabel);
                      setTimeout(() => setFeedback(prev => ({ ...prev, [i]: undefined })), 1200);
                      setDraggedLabel(null);
                    }
                  }}
                  onClick={() => handleDropZoneTap(i)}
                >
                  {placed[i]
                    ? (feedback[i] === 'correct' ? 'Correct!' : placed[i])
                    : (feedback[i] === 'incorrect' ? 'Try again!' : 
                       selectedLabel === part.label ? 'Tap here!' : '')}
                </div>
              </React.Fragment>
            );
          })}

          {/* Help button */}
          <div className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-20">
            <button
              className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 bg-blue-200 text-blue-900 rounded-full font-bold shadow hover:bg-blue-300 transition text-xs sm:text-sm md:text-base lg:text-lg touch-manipulation min-h-[40px] sm:min-h-[44px]"
              onClick={runDemo}
              type="button"
            >
              Help
            </button>
          </div>
        </div>
      </div>

      {/* Labels section */}
      <div className="mt-3 sm:mt-4 md:mt-6 lg:mt-8">
        <h3 className="text-center text-xs sm:text-sm md:text-base lg:text-lg font-bold text-gray-700 mb-2 sm:mb-3 md:mb-4">
          {isMobile ? "Tap a label, then tap the correct body part:" : "Drag these labels to the correct body parts:"}
        </h3>
        
        {/* Draggable labels */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-5 px-2 sm:px-4 md:px-6 lg:px-8">
          {availableLabels.map((label) => (
            <motion.div
              key={label}
              draggable={!isMobile}
              onDragStart={() => handleDragStart(label)}
              onDragEnd={handleDragEnd}
              onClick={() => handleLabelSelect(label)}
              className={`px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 border-2 rounded-lg shadow-md font-bold touch-manipulation flex items-center justify-center transition-all duration-200
                ${selectedLabel === label 
                  ? 'bg-yellow-300 border-yellow-500 text-yellow-900 scale-105' 
                  : 'bg-white border-blue-300 text-blue-900 hover:bg-blue-50'}`}
              style={{ 
                fontSize: LABEL_FONT_SIZE,
                minWidth: LABEL_MIN_WIDTH,
                minHeight: LABEL_HEIGHT,
                maxWidth: LABEL_MIN_WIDTH * 1.5
              }}
              whileHover={{ scale: isMobile ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {!isMobile && <GripVertical className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />}
              <span className="text-center">{label}</span>
            </motion.div>
          ))}
        </div>

        {/* Mobile instructions */}
        {isMobile && selectedLabel && (
          <div className="text-center mt-3 sm:mt-4 p-3 bg-blue-100 rounded-lg mx-2 sm:mx-4 md:mx-6">
            <p className="text-xs sm:text-sm font-bold text-blue-800">
              Selected: <span className="text-blue-600">{selectedLabel}</span>
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Now tap the correct body part on the image!
            </p>
          </div>
        )}
      </div>

      {/* Celebration popup */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 text-center max-w-xs sm:max-w-sm md:max-w-md shadow-2xl">
              <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-green-500 mx-auto mb-3 sm:mb-4" />
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4">
                Excellent!
              </h2>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 mb-3 sm:mb-4 md:mb-6">
                You've labeled all the body parts correctly!
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
                <button
                  onClick={resetGame}
                  className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition min-h-[40px] sm:min-h-[44px] text-sm sm:text-base"
                >
                  Play Again
                </button>
                <button
                  onClick={goBack}
                  className="px-3 sm:px-4 py-2 bg-gray-500 text-white rounded-lg font-bold hover:bg-gray-600 transition min-h-[40px] sm:min-h-[44px] text-sm sm:text-base"
                >
                  Back to Menu
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          onConfettiComplete={() => setShowConfetti(false)}
        />
      )}
    </div>
  );
};

export default BodyPartsDragDrop;