import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, GripVertical } from 'lucide-react';
import Confetti from 'react-confetti';
import bodyImg from '../../source/body.png';
import b2Img from '../../source/B2.png';

interface BodyPartsDragDropProps {
  onComplete?: () => void;
}

interface Slot {
  label: string;
  dot: { x: number; y: number };
  slot: { x: number; y: number };
  side: 'left' | 'right';
}

const SLOTS: Slot[] = [
  { label: 'HEAD', dot: { x: 100, y: 70 }, slot: { x: 10, y: 60 }, side: 'left' },
  { label: 'EYE', dot: { x: 90, y: 55 }, slot: { x: 10, y: 120 }, side: 'left' },
  { label: 'ARM', dot: { x: 40, y: 150 }, slot: { x: 10, y: 200 }, side: 'left' },
  { label: 'LEG', dot: { x: 70, y: 300 }, slot: { x: 10, y: 320 }, side: 'left' },
  { label: 'EAR', dot: { x: 60, y: 65 }, slot: { x: 10, y: 260 }, side: 'left' },
  { label: 'EYEBROW', dot: { x: 100, y: 45 }, slot: { x: 210, y: 60 }, side: 'right' },
  { label: 'NOSE', dot: { x: 100, y: 70 }, slot: { x: 210, y: 120 }, side: 'right' },
  { label: 'MOUTH', dot: { x: 100, y: 90 }, slot: { x: 210, y: 200 }, side: 'right' },
  { label: 'HAND', dot: { x: 25, y: 190 }, slot: { x: 10, y: 380 }, side: 'left' },
  { label: 'LIP', dot: { x: 100, y: 85 }, slot: { x: 210, y: 260 }, side: 'right' },
  { label: 'TONGUE', dot: { x: 100, y: 95 }, slot: { x: 210, y: 320 }, side: 'right' },
  { label: 'FOOT', dot: { x: 70, y: 320 }, slot: { x: 210, y: 380 }, side: 'right' },
];

const UNIQUE_LABELS = SLOTS.map(s => s.label);

const cartoonChildSVG = (
  <svg viewBox="0 0 220 400" width="220" height="400" className="mx-auto block">
    {/* Head */}
    <ellipse cx="100" cy="60" rx="40" ry="45" fill="#ffe0b2" stroke="#b08860" strokeWidth="2" />
    {/* Body */}
    <ellipse cx="100" cy="160" rx="35" ry="60" fill="#ffe0b2" stroke="#b08860" strokeWidth="2" />
    {/* Arms */}
    <rect x="25" y="110" width="25" height="80" rx="15" fill="#ffe0b2" stroke="#b08860" strokeWidth="2" />
    <rect x="150" y="110" width="25" height="80" rx="15" fill="#ffe0b2" stroke="#b08860" strokeWidth="2" />
    {/* Legs */}
    <rect x="70" y="220" width="20" height="90" rx="10" fill="#ffe0b2" stroke="#b08860" strokeWidth="2" />
    <rect x="110" y="220" width="20" height="90" rx="10" fill="#ffe0b2" stroke="#b08860" strokeWidth="2" />
    {/* Feet */}
    <ellipse cx="80" cy="320" rx="15" ry="8" fill="#ffe0b2" stroke="#b08860" strokeWidth="2" />
    <ellipse cx="120" cy="320" rx="15" ry="8" fill="#ffe0b2" stroke="#b08860" strokeWidth="2" />
    {/* Face features (simple) */}
    <ellipse cx="100" cy="60" rx="30" ry="35" fill="none" stroke="#b08860" strokeWidth="1.5" />
    <ellipse cx="90" cy="55" rx="5" ry="7" fill="#fff" />
    <ellipse cx="110" cy="55" rx="5" ry="7" fill="#fff" />
    <ellipse cx="90" cy="55" rx="2" ry="3" fill="#333" />
    <ellipse cx="110" cy="55" rx="2" ry="3" fill="#333" />
    <ellipse cx="100" cy="75" rx="8" ry="4" fill="#e57373" />
    {/* Eyebrows */}
    <rect x="83" y="45" width="10" height="2" rx="1" fill="#b08860" />
    <rect x="107" y="45" width="10" height="2" rx="1" fill="#b08860" />
    {/* Ears */}
    <ellipse cx="60" cy="65" rx="7" ry="12" fill="#ffe0b2" stroke="#b08860" strokeWidth="2" />
    <ellipse cx="140" cy="65" rx="7" ry="12" fill="#ffe0b2" stroke="#b08860" strokeWidth="2" />
    {/* Mouth */}
    <ellipse cx="100" cy="85" rx="10" ry="4" fill="#e57373" />
    {/* Tongue */}
    <ellipse cx="100" cy="89" rx="5" ry="2" fill="#d84315" />
  </svg>
);

// List of body parts with side and dot coordinates (best-guess, adjust as needed)
const PARTS = [
  // Left side
  { label: 'Hair', side: 'left', dot: { x: 220, y: 70 }, box: { x: 40, y: 40 } },
  { label: 'Eye', side: 'left', dot: { x: 290, y: 120 }, box: { x: 30, y: 90 } },
  { label: 'Ear', side: 'left', dot: { x: 210, y: 150 }, box: { x: 40, y: 140 } },
  { label: 'Neck', side: 'left', dot: { x: 330, y: 230 }, box: { x: 40, y: 200 } },
  { label: 'Shoulder', side: 'left', dot: { x: 240, y: 250 }, box: { x: 40, y: 260 } },
  { label: 'Hand', side: 'left', dot: { x: 160, y: 340 }, box: { x: 40, y: 370 } },
  { label: 'Foot', side: 'left', dot: { x: 230, y: 480 }, box: { x: 40, y: 470 } },
  // Right side
  { label: 'Eyebrow', side: 'right', dot: { x: 380, y: 100 }, box: { x: 610, y: 50 } },
  { label: 'Nose', side: 'right', dot: { x: 340, y: 160 }, box: { x: 610, y: 110 } },
  { label: 'Mouth', side: 'right', dot: { x: 340, y: 200 }, box: { x: 610, y: 160 } },
  { label: 'Chest', side: 'right', dot: { x: 340, y: 250 }, box: { x: 610, y: 210 } },
  { label: 'Abdomen', side: 'right', dot: { x: 340, y: 300 }, box: { x: 610, y: 260 } },
  { label: 'Hip', side: 'right', dot: { x: 340, y: 350 }, box: { x: 610, y: 310 } },
  { label: 'Leg', side: 'right', dot: { x: 420, y: 440 }, box: { x: 610, y: 400 } },
  // Removed 14th part (Knee/Foot on right)
];

const BODY_IMG_WIDTH = 400;
const BODY_IMG_HEIGHT = 550;

// Helper for TTS with slower, child-friendly rate
function speakSunny(message: string) {
  if (!('speechSynthesis' in window) || !message) return;
  const synth = window.speechSynthesis;
  const utter = new window.SpeechSynthesisUtterance(message);
  utter.pitch = 1.2;
  utter.rate = 0.8; // slower for children
  utter.volume = 1;
  utter.lang = 'en-US';
  // Prefer a child-friendly voice if available
  const voices = synth.getVoices();
  utter.voice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female')) || voices[0];
  synth.cancel();
  synth.speak(utter);
}

const BodyPartsDragDrop: React.FC<BodyPartsDragDropProps> = ({ onComplete }) => {
  // Track which label is being dragged
  const [draggedLabel, setDraggedLabel] = useState<string | null>(null);
  // Track which label is placed in each box (by index)
  const [placed, setPlaced] = useState<{ [idx: number]: string }>(() => ({}));
  // Track feedback for each box
  const [feedback, setFeedback] = useState<{ [idx: number]: 'correct' | 'incorrect' | undefined }>({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [sunnyMessage, setSunnyMessage] = useState('Drag the correct name to each body part!');
  const [sunnyMood, setSunnyMood] = useState<'encourage' | 'party' | 'hint'>('encourage');
  const demoTimeoutRef = useRef<number | null>(null);
  // Track which drop zone is being hovered for highlight
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Add a state to track if all are correct
  const allCorrect = Object.keys(placed).length === PARTS.length && Object.entries(placed).every(([idx, label]) => PARTS[Number(idx)].label === label);

  // Only show labels that are not placed
  const availableLabels = PARTS.map(p => p.label).filter(label => !Object.values(placed).includes(label));

  const handleDragStart = (label: string) => setDraggedLabel(label);
  const handleDragEnd = () => setDraggedLabel(null);

  // Feedback handler for correct/wrong
  const handleDropFeedback = (isCorrect: boolean, label: string) => {
    if (isCorrect) {
      setSunnyMessage(`Great job! ${label} is correct!`);
      setSunnyMood('party');
      speakSunny(`Great job! ${label} is correct!`);
    } else {
      setSunnyMessage('Try again!');
      setSunnyMood('hint');
      speakSunny('Try again!');
    }
  };

  // Demo mode (auto drag-drop)
  const runDemo = () => {
    setSunnyMessage('Watch how to play!');
    setSunnyMood('hint');
    speakSunny('Watch how to play!');
    let i = 0;
    const demoStep = () => {
      if (i >= PARTS.length) {
        setTimeout(() => {
          setPlaced({});
          setSunnyMessage('Now it\'s your turn! Drag the correct name to each body part!');
          setSunnyMood('encourage');
          speakSunny('Now it\'s your turn! Drag the correct name to each body part!');
        }, 1200);
        return;
      }
      setPlaced(prev => ({ ...prev, [i]: PARTS[i].label }));
      setSunnyMessage(`This is the ${PARTS[i].label}`);
      setSunnyMood('hint');
      speakSunny(`This is the ${PARTS[i].label}`);
      i++;
      demoTimeoutRef.current = setTimeout(demoStep, 1200);
    };
    setPlaced({});
    if (demoTimeoutRef.current) clearTimeout(demoTimeoutRef.current);
    demoTimeoutRef.current = setTimeout(demoStep, 1000);
  };

  // Show celebration popup when all correct
  React.useEffect(() => {
    if (allCorrect) {
      setTimeout(() => setShowCelebration(true), 800);
    }
  }, [allCorrect]);

  // Progress bar calculation
  const progress = Math.round((Object.keys(placed).length / PARTS.length) * 100);

  // Play again handler
  const handlePlayAgain = () => {
    setPlaced({});
    setShowCelebration(false);
    setSunnyMessage('Drag the correct name to each body part!');
    setSunnyMood('encourage');
    speakSunny('Let’s play again! Drag the correct name to each body part!');
  };

  // Back to dashboard handler (calls onComplete if provided)
  const handleBack = () => {
    if (onComplete) onComplete();
  };

  // Group slots by side and sort by dot.y
  const leftSlots = SLOTS.map((s, i) => ({...s, idx: i})).filter(s => s.side === 'left').sort((a, b) => a.dot.y - b.dot.y);
  const rightSlots = SLOTS.map((s, i) => ({...s, idx: i})).filter(s => s.side === 'right').sort((a, b) => a.dot.y - b.dot.y);
  const boxSpacing = 60;

  return (
    <div className="min-h-[700px] flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 via-purple-100 to-pink-100 rounded-3xl p-2 md:p-8 shadow-2xl">
      {/* Progress Bar */}
      <div className="w-full max-w-2xl mx-auto mt-2 mb-4">
        <div className="h-4 bg-white/70 rounded-full overflow-hidden shadow-inner border border-blue-200">
          <div
            className="h-4 bg-gradient-to-r from-green-400 to-blue-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-center text-xs text-blue-700 font-bold mt-1">Progress: {progress}%</div>
      </div>
      <div className="w-full flex flex-col md:flex-row items-center justify-center gap-4">
        {/* Main activity area */}
        <div className="relative flex items-center justify-center p-2 md:p-8" style={{ width: 700, height: BODY_IMG_HEIGHT, minWidth: 320 }}>
          {/* Central body image: grayscale or colored if all correct */}
          <img
            src={allCorrect ? b2Img : bodyImg}
            alt="Body"
            style={{ width: BODY_IMG_WIDTH, height: BODY_IMG_HEIGHT, position: 'absolute', left: '50%', top: 0, transform: 'translateX(-50%)', userSelect: 'none', touchAction: 'none' }}
            draggable={false}
          />
          {/* Highlight dot on body part when dragging over drop zone */}
          {hoveredIdx !== null && (
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
          {/* Lines and green drop zones */}
          {PARTS.map((part, i) => (
            <React.Fragment key={part.label}>
              <svg style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }} width={700} height={BODY_IMG_HEIGHT}>
                <line
                  x1={part.dot.x}
                  y1={part.dot.y}
                  x2={part.box.x + 48 / 2}
                  y2={part.box.y + 16}
                  stroke="#b2b2b2"
                  strokeWidth="2"
                />
              </svg>
              <div
                className={`absolute rounded-lg flex items-center justify-center shadow text-lg font-bold select-none transition-colors duration-300
                  ${feedback[i] === 'correct' ? 'bg-green-300 border-green-600 text-green-900' :
                    feedback[i] === 'incorrect' ? 'bg-red-300 border-red-600 text-red-900' :
                    'bg-green-200 border-green-400 text-green-900'}`}
                style={{ left: part.box.x, top: part.box.y, width: 130, height: 48, zIndex: 10, borderWidth: 2, borderStyle: 'solid', cursor: placed[i] ? 'default' : 'pointer', fontSize: '1.1rem', touchAction: 'none' }}
                onDragOver={e => { e.preventDefault(); setHoveredIdx(i); }}
                onDragLeave={() => setHoveredIdx(null)}
                onDrop={e => {
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
                }}
              >
                {placed[i]
                  ? (feedback[i] === 'correct' ? 'Correct!' : placed[i])
                  : (feedback[i] === 'incorrect' ? 'Try again!' : '')}
              </div>
            </React.Fragment>
          ))}
          {/* Celebration Popup */}
          <AnimatePresence>
            {showCelebration && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="fixed inset-0 flex items-center justify-center z-50"
                style={{ background: 'rgba(0,0,0,0.15)' }}
              >
                <div className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-yellow-300 flex flex-col items-center max-w-xs w-full mx-2">
                  <div className="text-5xl mb-2">🥳🏆🌞👏🎈⭐</div>
                  <h3 className="text-3xl font-bold text-yellow-700 mb-2 font-comic text-center">Congratulations!</h3>
                  <p className="text-lg text-gray-700 mb-4 text-center">You labeled all the body parts correctly!</p>
                  <div className="flex gap-4 mt-2 w-full">
                    <button
                      className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-full font-bold shadow-lg hover:bg-purple-600 transition text-lg"
                      onClick={handlePlayAgain}
                    >
                      Play Again
                    </button>
                    <button
                      className="flex-1 px-4 py-2 bg-blue-400 text-white rounded-full font-bold shadow-lg hover:bg-blue-500 transition text-lg"
                      onClick={handleBack}
                    >
                      Back to Dashboard
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Help button on the right side of the activity area */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20">
          <button
            className="px-6 py-2 bg-blue-200 text-blue-900 rounded-full font-bold shadow hover:bg-blue-300 transition text-base md:text-lg"
            onClick={runDemo}
            type="button"
          >
            Help
          </button>
        </div>
      </div>
      {/* Draggable labels row at the bottom */}
      <div className="flex flex-row flex-wrap gap-4 items-center justify-center mt-8 w-full px-2">
        {availableLabels.map(label => (
          <div
            key={label}
            className="px-4 py-3 rounded-full shadow bg-gradient-to-r from-yellow-300 to-orange-400 text-blue-900 font-bold font-comic border-2 border-white text-lg cursor-grab select-none"
            draggable
            onDragStart={() => setDraggedLabel(label)}
            onDragEnd={() => setDraggedLabel(null)}
            style={{ opacity: draggedLabel && draggedLabel !== label ? 0.5 : 1, minWidth: 110, minHeight: 48, touchAction: 'none', fontSize: '1.1rem' }}
          >
            {label}
          </div>
        ))}
      </div>
      {/* Confetti and Congratulations popup */}
      <AnimatePresence>
        {showConfetti && (
          <>
            <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={300} gravity={0.3} />
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              className="fixed inset-0 flex items-center justify-center z-50"
            >
              <div className="bg-white rounded-3xl shadow-2xl p-12 border-4 border-green-400 flex flex-col items-center">
                <CheckCircle className="text-green-500 mb-4" size={64} />
                <h3 className="text-3xl font-bold text-green-700 mb-2 font-comic">Congratulations!</h3>
                <p className="text-lg text-gray-700 mb-4">You labeled all the body parts correctly!</p>
                <button
                  className="mt-2 px-6 py-2 bg-green-500 text-white rounded-full font-bold shadow-lg hover:bg-green-600 transition"
                  onClick={() => setShowConfetti(false)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BodyPartsDragDrop;