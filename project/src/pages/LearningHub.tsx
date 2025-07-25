import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Trophy, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAudio } from '../contexts/AudioContext';
import AnimatedButton from '../components/AnimatedButton';
import AudioButton from '../components/AudioButton';
import DigitalPainting from '../components/DigitalPainting';
import DigitalArtStudio from '../components/DigitalArtStudio';

// New FamilyTreeActivity: Modern, mobile-first drag-and-drop family tree builder
// NOTE: Make sure html2canvas is installed: npm install html2canvas
import html2canvas from 'html2canvas';

// Advanced FamilyTreeActivity with avatars, snapping, validation, and modal
const FAMILY_MEMBERS_ADV = [
  { key: 'grandpa', label: 'Grandpa', img: '/avatars/Grandfather.png' },
  { key: 'grandma', label: 'Grandma', img: '/avatars/Grandmother.png' },
  { key: 'dad', label: 'Dad', img: '/avatars/Father.png' },
  { key: 'mom', label: 'Mom', img: '/avatars/Mother.png' },
  { key: 'daughter', label: 'Daughter', img: '/avatars/Young%20sister.png' },
  { key: 'son', label: 'Son', img: '/avatars/Brother.png' },
];

const initialPlaced = {};

const AdvancedFamilyTreeActivity: React.FC<{ activity: any; onComplete: (score: number) => void }> = ({ activity, onComplete }) => {
  const [dragged, setDragged] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [placed, setPlaced] = useState<Record<string, string>>({ ...initialPlaced });
  const [showModal, setShowModal] = useState(false);
  const [bounce, setBounce] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // New container and node positions for larger tree
  const TREE_CONTAINER_WIDTH = 480;
  const TREE_CONTAINER_HEIGHT = 650;
  const TREE_NODES = [
    { key: 'grandpa', x: 80, y: 80 },      // top left
    { key: 'grandma', x: 320, y: 80 },    // top right
    { key: 'dad', x: 60, y: 270 },        // left
    { key: 'mom', x: 340, y: 270 },       // right
    { key: 'daughter', x: 120, y: 480 },  // bottom left
    { key: 'son', x: 280, y: 480 },       // bottom right
  ];

  // Set initial positions for draggable cards (bottom area)
  useEffect(() => {
    const startY = TREE_CONTAINER_HEIGHT + 10;
    const startX = [20, 100, 180, 260, 340, 420];
    const pos: Record<string, { x: number; y: number }> = {};
    FAMILY_MEMBERS_ADV.forEach((m, i) => {
      pos[m.key] = { x: startX[i], y: startY };
    });
    setPositions(pos);
  }, []);

  // Drag logic
  const handleDragStart = (key: string, e: React.TouchEvent | React.MouseEvent) => {
    setDragged(key);
    setBounce(null);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setOffset({
      x: clientX - positions[key].x,
      y: clientY - positions[key].y,
    });
  };
  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!dragged) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setPositions(pos => ({
      ...pos,
      [dragged]: {
        x: clientX - offset.x,
        y: clientY - offset.y,
      },
    }));
  };
  const handleDragEnd = () => {
    if (!dragged) return;
    // Snap to nearest node if close
    const card = positions[dragged];
    let snapped = false;
    for (const node of TREE_NODES) {
      const dist = Math.hypot(card.x - node.x, card.y - node.y);
      if (dist < 50 && !Object.values(placed).includes(node.key)) {
        setPositions(pos => ({ ...pos, [dragged]: { x: node.x, y: node.y } }));
        setPlaced(p => ({ ...p, [dragged]: node.key }));
        setBounce(dragged);
        snapped = true;
        break;
      }
    }
    if (!snapped) {
      // Animate back to start
      setPositions(pos => ({ ...pos, [dragged]: { x: pos[dragged].x, y: TREE_CONTAINER_HEIGHT + 10 } }));
    }
    setDragged(null);
  };

  // Validate tree
  const handleComplete = () => {
    const allPlaced = FAMILY_MEMBERS_ADV.every(m => placed[m.key]);
    if (allPlaced) {
      setShowModal(true);
      setTimeout(() => onComplete(100), 1000);
    }
  };
  const handleReset = () => {
    setPlaced({ ...initialPlaced });
    const startY = TREE_CONTAINER_HEIGHT + 10;
    const startX = [20, 100, 180, 260, 340, 420];
    const pos: Record<string, { x: number; y: number }> = {};
    FAMILY_MEMBERS_ADV.forEach((m, i) => {
      pos[m.key] = { x: startX[i], y: startY };
    });
    setPositions(pos);
    setShowModal(false);
  };

  // Draw connection lines
  const renderConnections = () => {
    const lines = [
      { from: 'grandpa', to: 'dad' },
      { from: 'grandma', to: 'mom' },
      { from: 'dad', to: 'daughter' },
      { from: 'mom', to: 'son' },
    ];
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
        {lines.map((line, i) => {
          const from = TREE_NODES.find(n => n.key === placed[line.from]);
          const to = TREE_NODES.find(n => n.key === placed[line.to]);
          if (!from || !to) return null;
          return (
            <line
              key={i}
              x1={from.x + 40}
              y1={from.y + 40}
              x2={to.x + 40}
              y2={to.y + 40}
              stroke="#a3a3a3"
              strokeWidth={3}
              strokeDasharray="8 4"
            />
          );
        })}
      </svg>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-2">
      <div className="bg-white rounded-3xl shadow-2xl border-4 border-blue-200 p-2 sm:p-6 mb-4 relative" style={{ minHeight: TREE_CONTAINER_HEIGHT + 120 }}>
        <h2 className="text-2xl font-bold text-center mb-2">{activity.title}</h2>
        <p className="text-center text-gray-600 mb-4">{activity.instruction}</p>
        <div className="flex justify-center gap-2 mb-4">
          <button onClick={handleComplete} className="px-3 py-1 rounded bg-green-500 hover:bg-green-600 text-white text-sm">Complete Tree</button>
          <button onClick={handleReset} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm">Reset</button>
        </div>
        <div
          ref={canvasRef}
          className="relative rounded-2xl shadow-lg mx-auto overflow-hidden flex items-center justify-center"
          style={{ width: TREE_CONTAINER_WIDTH, height: TREE_CONTAINER_HEIGHT, touchAction: 'none', background: 'none' }}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          {/* Tree background image */}
          <img src="/avatars/Tree.png" alt="Family Tree" className="absolute left-0 top-0 w-full h-full object-contain z-0 pointer-events-none select-none" style={{maxWidth: TREE_CONTAINER_WIDTH, maxHeight: TREE_CONTAINER_HEIGHT}} />
          {/* Tree nodes (drop targets) */}
          {TREE_NODES.map(node => {
            const placedKey = Object.entries(placed).find(([k, v]) => v === node.key)?.[0];
            const member = placedKey ? FAMILY_MEMBERS_ADV.find(m => m.key === placedKey) : null;
            return (
              <div
                key={node.key}
                className={`absolute w-24 h-24 rounded-full border-4 border-white bg-white flex items-center justify-center z-10 transition-all duration-200 shadow-lg ${placedKey ? 'ring-4 ring-green-300' : 'ring-2 ring-blue-200'}`}
                style={{ left: node.x, top: node.y }}
                aria-label={node.key}
              >
                {/* Show avatar if placed, fully visible */}
                {member && (
                  <img
                    src={member.img}
                    alt={member.label}
                    className="w-20 h-20 rounded-full object-cover shadow-lg"
                  />
                )}
              </div>
            );
          })}
          {renderConnections()}
          {/* Draggable cards */}
          {FAMILY_MEMBERS_ADV.map(member => (
            <div
              key={member.key}
              className={`absolute w-20 h-24 flex flex-col items-center justify-center rounded-2xl shadow-lg border-2 border-white bg-white text-xs font-bold transition-all duration-200 select-none ${dragged === member.key ? 'z-20 scale-105' : 'z-10'} ${bounce === member.key ? 'animate-bounce' : ''}`}
              style={{
                left: positions[member.key]?.x,
                top: positions[member.key]?.y,
                touchAction: 'none',
                cursor: dragged === member.key ? 'grabbing' : 'grab',
                opacity: placed[member.key] ? 0.5 : 1,
                pointerEvents: placed[member.key] ? 'none' : 'auto',
              }}
              onMouseDown={e => handleDragStart(member.key, e)}
              onTouchStart={e => handleDragStart(member.key, e)}
              tabIndex={0}
              aria-label={member.label}
            >
              <img src={member.img} alt={member.label} className="w-14 h-14 rounded-full object-cover mb-1" />
              <span className="font-semibold text-gray-700">{member.label}</span>
            </div>
          ))}
        </div>
        {/* Completion Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-xs w-full text-center animate-fade-in">
              <div className="text-4xl mb-2">🎉</div>
              <div className="text-xl font-bold mb-4">Family Tree Completed!</div>
              <div className="flex flex-col gap-2">
                <button onClick={handleReset} className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white font-bold">Play Again</button>
                <button onClick={() => window.location.href = '/child-dashboard'} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold">Back</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- NEW MOBILE-FIRST FAMILY TREE GAME ---
const MOBILE_TREE_WIDTH = 320;
const MOBILE_TREE_HEIGHT = 420;
const MOBILE_TREE_NODES = [
  { key: 'grandpa', x: 30, y: 30 },      // top left
  { key: 'grandma', x: 180, y: 30 },    // top right
  { key: 'dad', x: 10, y: 160 },        // left
  { key: 'mom', x: 200, y: 160 },       // right
  { key: 'daughter', x: 50, y: 320 },   // bottom left
  { key: 'son', x: 160, y: 320 },       // bottom right
];
const MOBILE_MEMBERS = [
  { key: 'grandpa', label: 'Grandpa', img: '/avatars/Grandfather.png' },
  { key: 'grandma', label: 'Grandma', img: '/avatars/Grandmother.png' },
  { key: 'dad', label: 'Dad', img: '/avatars/Father.png' },
  { key: 'mom', label: 'Mom', img: '/avatars/Mother.png' },
  { key: 'daughter', label: 'Daughter', img: '/avatars/Young%20sister.png' },
  { key: 'son', label: 'Son', img: '/avatars/Brother.png' },
];

const MobileFamilyTreeGame: React.FC<{ activity: any; onComplete: (score: number) => void }> = ({ activity, onComplete }) => {
  const [dragged, setDragged] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [showModal, setShowModal] = useState(false);
  const [bounce, setBounce] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Responsive: use window width for scaling
  const [containerWidth, setContainerWidth] = useState(MOBILE_TREE_WIDTH);
  useEffect(() => {
    const handleResize = () => {
      const w = Math.min(window.innerWidth - 24, 400);
      setContainerWidth(w);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const scale = containerWidth / MOBILE_TREE_WIDTH;

  // Set initial positions for draggable cards (bottom area)
  useEffect(() => {
    const startY = MOBILE_TREE_HEIGHT * scale + 10;
    const startX = [10, 70, 130, 190, 250, 310].map(x => x * scale);
    const pos: Record<string, { x: number; y: number }> = {};
    MOBILE_MEMBERS.forEach((m, i) => {
      pos[m.key] = { x: startX[i], y: startY };
    });
    setPositions(pos);
  }, [scale]);

  // Drag logic
  const handleDragStart = (key: string, e: React.TouchEvent | React.MouseEvent) => {
    setDragged(key);
    setBounce(null);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setOffset({
      x: clientX - positions[key].x,
      y: clientY - positions[key].y,
    });
  };
  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!dragged) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setPositions(pos => ({
      ...pos,
      [dragged]: {
        x: clientX - offset.x,
        y: clientY - offset.y,
      },
    }));
  };
  const handleDragEnd = () => {
    if (!dragged) return;
    // Snap to nearest node if close
    const card = positions[dragged];
    let snapped = false;
    for (const node of MOBILE_TREE_NODES) {
      const nodeX = node.x * scale;
      const nodeY = node.y * scale;
      const dist = Math.hypot(card.x - nodeX, card.y - nodeY);
      if (dist < 40 * scale && !Object.values(placed).includes(node.key)) {
        setPositions(pos => ({ ...pos, [dragged]: { x: nodeX, y: nodeY } }));
        setPlaced(p => ({ ...p, [dragged]: node.key }));
        setBounce(dragged);
        snapped = true;
        break;
      }
    }
    if (!snapped) {
      // Animate back to start
      setPositions(pos => ({ ...pos, [dragged]: { x: pos[dragged].x, y: MOBILE_TREE_HEIGHT * scale + 10 } }));
    }
    setDragged(null);
  };

  // Validate tree
  const handleComplete = () => {
    const allPlaced = MOBILE_MEMBERS.every(m => placed[m.key]);
    if (allPlaced) {
      setShowModal(true);
      setTimeout(() => onComplete(100), 1000);
    }
  };
  const handleReset = () => {
    setPlaced({});
    const startY = MOBILE_TREE_HEIGHT * scale + 10;
    const startX = [10, 70, 130, 190, 250, 310].map(x => x * scale);
    const pos: Record<string, { x: number; y: number }> = {};
    MOBILE_MEMBERS.forEach((m, i) => {
      pos[m.key] = { x: startX[i], y: startY };
    });
    setPositions(pos);
    setShowModal(false);
  };

  return (
    <div className="w-full flex flex-col items-center px-1 py-2">
      <div className="bg-white rounded-3xl shadow-2xl border-4 border-blue-200 p-2 mb-4 relative flex flex-col items-center justify-center" style={{ width: containerWidth, aspectRatio: '3/4', maxWidth: 400, minHeight: containerWidth * 1.3, overflow: 'hidden' }}>
        <h2 className="text-xl font-bold text-center mb-2">{activity.title}</h2>
        <p className="text-center text-gray-600 mb-2 text-sm">{activity.instruction}</p>
        <div className="flex justify-center gap-2 mb-2">
          <button onClick={handleComplete} className="px-3 py-1 rounded bg-green-500 hover:bg-green-600 text-white text-xs">Complete Tree</button>
          <button onClick={handleReset} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-xs">Reset</button>
        </div>
        <div
          ref={canvasRef}
          className="relative rounded-2xl shadow-lg mx-auto overflow-hidden flex items-center justify-center bg-white"
          style={{ width: '100%', height: '100%', maxWidth: 360, maxHeight: 480, minHeight: 320, minWidth: 240, touchAction: 'none', background: 'none', position: 'relative' }}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          {/* Tree background image */}
          <img src="/avatars/Tree.png" alt="Family Tree" 
            className="absolute left-0 top-0 w-full h-full object-contain z-0 pointer-events-none select-none"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              borderRadius: '1.5rem',
              maxWidth: '100%',
              maxHeight: '100%',
              minWidth: 0,
              minHeight: 0,
              boxSizing: 'border-box',
            }}
          />
          {/* Tree nodes (drop targets) - now invisible */}
          {/* Draggable cards */}
          {MOBILE_MEMBERS.map(member => (
            <div
              key={member.key}
              className={`absolute flex flex-col items-center justify-center rounded-2xl shadow-lg border-2 border-white bg-white text-xs font-bold transition-all duration-200 select-none ${dragged === member.key ? 'z-20 scale-105' : 'z-10'} ${bounce === member.key ? 'animate-bounce' : ''}`}
              style={{
                left: positions[member.key]?.x,
                top: positions[member.key]?.y,
                width: 56 * scale,
                height: 72 * scale,
                touchAction: 'none',
                cursor: dragged === member.key ? 'grabbing' : 'grab',
                opacity: placed[member.key] ? 0.5 : 1,
                pointerEvents: placed[member.key] ? 'none' : 'auto',
              }}
              onMouseDown={e => handleDragStart(member.key, e)}
              onTouchStart={e => handleDragStart(member.key, e)}
              tabIndex={0}
              aria-label={member.label}
            >
              <img src={member.img} alt={member.label} className="rounded-full object-cover mb-1" style={{ width: 40 * scale, height: 40 * scale }} />
              <span className="font-semibold text-gray-700" style={{ fontSize: 12 * scale }}>{member.label}</span>
            </div>
          ))}
        </div>
        {/* Completion Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-xs w-full text-center animate-fade-in">
              <div className="text-4xl mb-2">🎉</div>
              <div className="text-xl font-bold mb-4">Family Tree Completed!</div>
              <div className="flex flex-col gap-2">
                <button onClick={handleReset} className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white font-bold">Play Again</button>
                <button onClick={() => window.location.href = '/child-dashboard'} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold">Back</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const LearningHub: React.FC = () => {
  const { hubType, childId } = useParams<{ hubType: string; childId: string }>();
  const { user, updateChildProgress } = useAuth();
  const { speak, playSound } = useAudio();
  const navigate = useNavigate();
  
  const [currentActivity, setCurrentActivity] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  const child = user?.children?.find(c => c.id === childId);

  const hubContent = {
    literacy: {
      title: 'Literacy Hub',
      emoji: '📚',
      color: 'from-blue-500 to-cyan-500',
      activities: [
        {
          type: 'letter-match',
          title: 'Letter Matching',
          instruction: 'Match the letter to the picture that starts with that sound!',
          data: [
            { letter: 'A', word: 'Apple', image: '🍎', options: ['🍎', '🐱', '🐕'] },
            { letter: 'B', word: 'Ball', image: '⚽', options: ['🍎', '⚽', '🐱'] },
            { letter: 'C', word: 'Cat', image: '🐱', options: ['🐱', '🐕', '🍎'] }
          ]
        },
        {
          type: 'bubble-pop',
          title: 'Letter Bubble Pop',
          instruction: 'Pop all the bubbles with the letter A!',
          data: { targetLetter: 'A', bubbles: ['A', 'B', 'A', 'C', 'A', 'D'] }
        },
        {
          type: 'forest-letter-hunt',
          title: 'Forest Letter Hunt',
          instruction: 'Find the hidden letters peeking out from the bushes! Click the correct letter when you see it.',
          data: {}
        },
        {
          type: 'story-time',
          title: 'Story Time',
          instruction: 'Listen to this wonderful story!',
          data: {
            title: 'The Little Apple Tree',
            story: 'Once upon a time, there was a little apple tree. It grew big and strong, giving sweet apples to all the children.',
            pages: ['🌱', '🌳', '🍎', '👧👦']
          }
        }
      ]
    },
    creativity: {
      title: 'Creativity Hub',
      emoji: '🎨',
      color: 'from-pink-500 to-rose-500',
      activities: [
        {
          type: 'digital-painting',
          title: 'Creativity Hub: Digital Painting',
          instruction: 'Create your own masterpiece with our advanced digital painting tools! Try brushes, stickers, and more.',
          data: {}
        },
        {
          type: 'sticker-scene',
          title: 'Sticker Scene',
          instruction: 'Drag stickers to create your own scene!',
          data: {
            background: '🏞️',
            stickers: ['🌸', '🦋', '🐝', '☀️', '☁️', '🌈']
          }
        }
      ]
    },
    maths: {
      title: 'Maths Hub',
      emoji: '🔢',
      color: 'from-green-500 to-emerald-500',
      activities: [
        {
          type: 'counting',
          title: 'Count the Objects',
          instruction: 'Count how many objects you see!',
          data: [
            { objects: '🍎🍎🍎', count: 3, options: [2, 3, 4] },
            { objects: '⭐⭐⭐⭐⭐', count: 5, options: [4, 5, 6] }
          ]
        },
        {
          type: 'shape-match',
          title: 'Shape Matching',
          instruction: 'Match the shape to its shadow!',
          data: [
            { shape: '🔴', shadow: '⚫', options: ['🔴', '🔵', '🟡'] },
            { shape: '🔺', shadow: '⚫', options: ['🔴', '🔺', '🟢'] }
          ]
        }
      ]
    },
    emotions: {
      title: 'Emotions Hub',
      emoji: '😊',
      color: 'from-red-500 to-pink-500',
      activities: [
        {
          type: 'emotion-match',
          title: 'Match the Feeling',
          instruction: 'Match the face to the feeling!',
          data: [
            { emotion: 'Happy', face: '😊', options: ['😊', '😢', '😠'] },
            { emotion: 'Sad', face: '😢', options: ['😊', '😢', '😠'] },
            { emotion: 'Angry', face: '😠', options: ['😊', '😢', '😠'] }
          ]
        },
        {
          type: 'feeling-story',
          title: 'How Do You Feel?',
          instruction: 'Tell us about a time you felt this way!',
          data: {
            scenarios: [
              { situation: 'When you get a present', feeling: 'happy' },
              { situation: 'When you lose a toy', feeling: 'sad' },
              { situation: 'When someone takes your turn', feeling: 'frustrated' }
            ]
          }
        }
      ]
    },
    body: {
      title: 'My Body Hub',
      emoji: '🏃‍♂️',
      color: 'from-orange-500 to-yellow-500',
      activities: [
        {
          type: 'body-parts',
          title: 'Name the Body Part',
          instruction: 'Click on the correct body part!',
          data: [
            { part: 'Head', emoji: '👤', position: 'top' },
            { part: 'Arms', emoji: '💪', position: 'middle' },
            { part: 'Legs', emoji: '🦵', position: 'bottom' }
          ]
        },
        {
          type: 'movement-song',
          title: 'Movement Song',
          instruction: 'Follow along with the song!',
          data: {
            song: 'Head, Shoulders, Knees and Toes',
            movements: ['👤', '💪', '🦵', '🦶']
          }
        }
      ]
    },
    family: {
      title: 'My Family Hub',
      emoji: '👨‍👩‍👧‍👦',
      color: 'from-purple-500 to-indigo-500',
      activities: [
        {
          type: 'family-tree',
          title: 'Build Your Family Tree',
          instruction: 'Drag family members to build your family tree!',
          data: {
            members: ['👴', '👵', '👨', '👩', '👧', '👦'],
            roles: ['Grandpa', 'Grandma', 'Dad', 'Mom', 'Daughter', 'Son']
          }
        },
        {
          type: 'family-roles',
          title: 'What Do They Do?',
          instruction: 'Match the family member to what they do!',
          data: [
            { member: '👨', role: 'Dad', activity: 'Works and plays with you' },
            { member: '👩', role: 'Mom', activity: 'Cooks and reads stories' },
            { member: '👵', role: 'Grandma', activity: 'Tells stories and bakes cookies' }
          ]
        }
      ]
    }
  };

  const currentHub = hubContent[hubType as keyof typeof hubContent];

  useEffect(() => {
    if (currentHub && child) {
      speak(`Welcome to the ${currentHub.title}! Let's have fun learning together, ${child.name}!`);
    }
  }, [currentHub, child, speak]);

  const handleActivityComplete = (activityScore: number) => {
    const newScore = score + activityScore;
    setScore(newScore);
    setCompleted([...completed, currentActivity]);
    playSound('success');
    
    if (currentActivity < currentHub.activities.length - 1) {
      speak('Great job! Ready for the next activity?');
      setTimeout(() => {
        setCurrentActivity(currentActivity + 1);
      }, 2000);
    } else {
      // Hub completed
      const progressPercentage = Math.min(100, (newScore / (currentHub.activities.length * 100)) * 100);
      updateChildProgress(childId!, hubType!, progressPercentage);
      setShowCelebration(true);
      playSound('celebration');
      speak(`Fantastic work, ${child?.name}! You've completed the ${currentHub.title}!`);
    }
  };

  const renderActivity = () => {
    const activity = currentHub.activities[currentActivity];
    
    switch (activity.type) {
      case 'letter-match':
        return <LetterMatchActivity activity={activity} onComplete={handleActivityComplete} />;
      case 'bubble-pop':
        return <BubblePopActivity activity={activity} onComplete={handleActivityComplete} />;
      case 'forest-letter-hunt':
        return <ForestLetterHuntActivity activity={activity} onComplete={handleActivityComplete} />;
      case 'counting':
        return <CountingActivity activity={activity} onComplete={handleActivityComplete} />;
      case 'emotion-match':
        return <EmotionMatchActivity activity={activity} onComplete={handleActivityComplete} />;
      case 'digital-painting':
        return <DigitalPaintingActivity />;
      case 'family-tree':
        return <MobileFamilyTreeGame activity={activity} onComplete={handleActivityComplete} />;
      default:
        return <DefaultActivity activity={activity} onComplete={handleActivityComplete} />;
    }
  };

  if (!currentHub || !child) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Hub not found</h2>
          <AnimatedButton onClick={() => navigate(`/child-dashboard/${childId}`)}>
            Back to Dashboard
          </AnimatedButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
      <AudioButton />
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <AnimatedButton
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/child-dashboard/${childId}`)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </AnimatedButton>
            <div className="flex items-center space-x-2">
              <span className="text-3xl">{currentHub.emoji}</span>
              <h1 className="text-xl font-bold text-gray-800">{currentHub.title}</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="font-bold text-gray-800">{score}</span>
            </div>
            <div className="text-sm text-gray-600">
              {currentActivity + 1} / {currentHub.activities.length}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className={`bg-gradient-to-r ${currentHub.color} h-2 rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${((currentActivity + 1) / currentHub.activities.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Activity Content */}
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentActivity}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
          >
            {renderActivity()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 text-center max-w-md w-full"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Congratulations!</h3>
            <p className="text-gray-600 mb-6">
              You've completed the {currentHub.title}! Great job, {child.name}!
            </p>
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="flex items-center space-x-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                <span className="font-bold text-gray-800">{score} points</span>
              </div>
            </div>
            <AnimatedButton
              onClick={() => navigate(`/child-dashboard/${childId}`)}
              className="w-full"
            >
              Back to Dashboard
            </AnimatedButton>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Activity Components
const LetterMatchActivity: React.FC<{ activity: any; onComplete: (score: number) => void }> = ({ activity, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const { speak, playSound } = useAudio();
  
  const question = activity.data[currentQuestion];

  useEffect(() => {
    speak(`${activity.instruction} Find the picture that starts with the letter ${question.letter}.`);
  }, [currentQuestion, speak, activity.instruction, question.letter]);

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    
    if (answer === question.image) {
      playSound('success');
      speak('Correct! Well done!');
      setTimeout(() => {
        if (currentQuestion < activity.data.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setSelectedAnswer(null);
        } else {
          onComplete(100);
        }
      }, 1500);
    } else {
      playSound('click');
      speak('Try again! Think about the sound the letter makes.');
      setTimeout(() => setSelectedAnswer(null), 1000);
    }
  };

  return (
    <div className="text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-800 mb-4"
      >
        {activity.title}
      </motion.h2>
      <p className="text-lg text-gray-600 mb-8">{activity.instruction}</p>
      
      <div className="mb-8">
        <div className="text-8xl font-bold text-purple-600 mb-4">{question.letter}</div>
        <p className="text-xl text-gray-700">Find the picture that starts with "{question.letter}"</p>
      </div>
      
      <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
        {question.options.map((option: string, index: number) => (
          <motion.button
            key={index}
            onClick={() => handleAnswer(option)}
            className={`
              text-6xl p-6 rounded-2xl border-4 transition-all duration-300
              ${selectedAnswer === option 
                ? (option === question.image ? 'border-green-500 bg-green-100' : 'border-red-500 bg-red-100')
                : 'border-gray-300 hover:border-purple-500 hover:bg-purple-50'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={selectedAnswer !== null}
          >
            {option}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

const BubblePopActivity: React.FC<{ activity: any; onComplete: (score: number) => void }> = ({ activity, onComplete }) => {
  const [bubbles, setBubbles] = useState(activity.data.bubbles.map((letter: string, index: number) => ({
    id: index,
    letter,
    popped: false,
    x: Math.random() * 80 + 10,
    y: Math.random() * 60 + 20
  })));
  const { speak, playSound } = useAudio();

  useEffect(() => {
    speak(`${activity.instruction} Pop all the bubbles with the letter ${activity.data.targetLetter}!`);
  }, [speak, activity.instruction, activity.data.targetLetter]);

  const popBubble = (id: number, letter: string) => {
    if (letter === activity.data.targetLetter) {
      playSound('success');
      speak('Great pop!');
      setBubbles((prev: any[]) => prev.map((bubble: any) => 
        bubble.id === id ? { ...bubble, popped: true } : bubble
      ));
      
      // Check if all target bubbles are popped
      const targetBubbles = bubbles.filter((b: any) => b.letter === activity.data.targetLetter);
      const poppedTargets = bubbles.filter((b: any) => b.letter === activity.data.targetLetter && b.popped).length + 1;
      
      if (poppedTargets >= targetBubbles.length) {
        setTimeout(() => onComplete(100), 1000);
      }
    } else {
      playSound('click');
      speak(`That's not the letter ${activity.data.targetLetter}. Try again!`);
    }
  };

  return (
    <div className="text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-800 mb-4"
      >
        {activity.title}
      </motion.h2>
      <p className="text-lg text-gray-600 mb-4">{activity.instruction}</p>
      <p className="text-2xl font-bold text-purple-600 mb-8">Target Letter: {activity.data.targetLetter}</p>
      
      <div className="relative h-96 bg-gradient-to-b from-blue-200 to-blue-400 rounded-3xl overflow-hidden">
        {bubbles.map((bubble: any) => (
          !bubble.popped && (
            <motion.button
              key={bubble.id}
              className="absolute w-16 h-16 bg-white bg-opacity-80 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg hover:scale-110 transition-transform"
              style={{ left: `${bubble.x}%`, top: `${bubble.y}%` }}
              onClick={() => popBubble(bubble.id, bubble.letter)}
              animate={{
                y: [0, -10, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              {bubble.letter}
            </motion.button>
          )
        ))}
      </div>
    </div>
  );
};

const CountingActivity: React.FC<{ activity: any; onComplete: (score: number) => void }> = ({ activity, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const { speak, playSound } = useAudio();
  
  const question = activity.data[currentQuestion];

  useEffect(() => {
    speak(`Count the objects you see. How many are there?`);
  }, [currentQuestion, speak]);

  const handleAnswer = (answer: number) => {
    setSelectedAnswer(answer);
    
    if (answer === question.count) {
      playSound('success');
      speak(`Correct! There are ${answer} objects!`);
      setTimeout(() => {
        if (currentQuestion < activity.data.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setSelectedAnswer(null);
        } else {
          onComplete(100);
        }
      }, 1500);
    } else {
      playSound('click');
      speak('Try counting again!');
      setTimeout(() => setSelectedAnswer(null), 1000);
    }
  };

  return (
    <div className="text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-800 mb-4"
      >
        {activity.title}
      </motion.h2>
      <p className="text-lg text-gray-600 mb-8">{activity.instruction}</p>
      
      <div className="mb-8">
        <div className="text-6xl mb-6 tracking-wider">{question.objects}</div>
        <p className="text-xl text-gray-700">How many objects do you see?</p>
      </div>
      
      <div className="flex justify-center space-x-4">
        {question.options.map((option: number, index: number) => (
          <motion.button
            key={index}
            onClick={() => handleAnswer(option)}
            className={`
              text-4xl font-bold p-6 rounded-2xl border-4 w-20 h-20 transition-all duration-300
              ${selectedAnswer === option 
                ? (option === question.count ? 'border-green-500 bg-green-100' : 'border-red-500 bg-red-100')
                : 'border-gray-300 hover:border-purple-500 hover:bg-purple-50'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={selectedAnswer !== null}
          >
            {option}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

const EmotionMatchActivity: React.FC<{ activity: any; onComplete: (score: number) => void }> = ({ activity, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const { speak, playSound } = useAudio();
  
  const question = activity.data[currentQuestion];

  useEffect(() => {
    speak(`Look at the feeling word and find the matching face. The feeling is ${question.emotion}.`);
  }, [currentQuestion, speak, question.emotion]);

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    
    if (answer === question.face) {
      playSound('success');
      speak(`Correct! This face shows ${question.emotion}!`);
      setTimeout(() => {
        if (currentQuestion < activity.data.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setSelectedAnswer(null);
        } else {
          onComplete(100);
        }
      }, 1500);
    } else {
      playSound('click');
      speak(`That's not ${question.emotion}. Try again!`);
      setTimeout(() => setSelectedAnswer(null), 1000);
    }
  };

  return (
    <div className="text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-800 mb-4"
      >
        {activity.title}
      </motion.h2>
      <p className="text-lg text-gray-600 mb-8">{activity.instruction}</p>
      
      <div className="mb-8">
        <div className="text-4xl font-bold text-purple-600 mb-4">{question.emotion}</div>
        <p className="text-xl text-gray-700">Which face shows this feeling?</p>
      </div>
      
      <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
        {question.options.map((option: string, index: number) => (
          <motion.button
            key={index}
            onClick={() => handleAnswer(option)}
            className={`
              text-8xl p-6 rounded-2xl border-4 transition-all duration-300
              ${selectedAnswer === option 
                ? (option === question.face ? 'border-green-500 bg-green-100' : 'border-red-500 bg-red-100')
                : 'border-gray-300 hover:border-purple-500 hover:bg-purple-50'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={selectedAnswer !== null}
          >
            {option}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

const ColoringActivity: React.FC<{ activity: any; onComplete: (score: number) => void }> = ({ activity, onComplete }) => {
  const [selectedColor, setSelectedColor] = useState(activity.data.colors[0]);
  const [coloredAreas, setColoredAreas] = useState<string[]>([]);
  const { speak } = useAudio();

  useEffect(() => {
    speak(activity.instruction);
  }, [speak, activity.instruction]);

  const handleColorArea = (areaId: string) => {
    if (!coloredAreas.includes(areaId)) {
      setColoredAreas([...coloredAreas, areaId]);
      if (coloredAreas.length >= 4) { // Complete after coloring 5 areas
        setTimeout(() => onComplete(100), 1000);
      }
    }
  };

  return (
    <div className="text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-800 mb-4"
      >
        {activity.title}
      </motion.h2>
      <p className="text-lg text-gray-600 mb-8">{activity.instruction}</p>
      
      {/* Color Palette */}
      <div className="flex justify-center space-x-2 mb-8">
        {activity.data.colors.map((color: string, index: number) => (
          <button
            key={index}
            onClick={() => setSelectedColor(color)}
            className={`w-12 h-12 rounded-full border-4 ${
              selectedColor === color ? 'border-gray-800' : 'border-gray-300'
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      
      {/* Coloring Canvas */}
      <div className="bg-white rounded-3xl p-8 shadow-lg max-w-md mx-auto">
        <div className="text-8xl mb-4">{activity.data.image}</div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((area) => (
            <button
              key={area}
              onClick={() => handleColorArea(`area-${area}`)}
              className="w-16 h-16 border-2 border-gray-300 rounded-lg transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: coloredAreas.includes(`area-${area}`) ? selectedColor : 'white'
              }}
            />
          ))}
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mt-4">
        Colored areas: {coloredAreas.length} / 6
      </p>
    </div>
  );
};

const DefaultActivity: React.FC<{ activity: any; onComplete: (score: number) => void }> = ({ activity, onComplete }) => {
  const { speak } = useAudio();

  useEffect(() => {
    speak(activity.instruction);
  }, [speak, activity.instruction]);

  return (
    <div className="text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-800 mb-4"
      >
        {activity.title}
      </motion.h2>
      <p className="text-lg text-gray-600 mb-8">{activity.instruction}</p>
      
      <div className="bg-white rounded-3xl p-12 shadow-lg max-w-md mx-auto">
        <div className="text-8xl mb-6">🎯</div>
        <p className="text-gray-600 mb-8">This activity is coming soon!</p>
        <AnimatedButton onClick={() => onComplete(50)}>
          Continue
        </AnimatedButton>
      </div>
    </div>
  );
};

const DigitalPaintingActivity: React.FC = () => {
  return <DigitalArtStudio />;
};

const ForestLetterHuntActivity: React.FC<{ activity: any; onComplete: (score: number) => void }> = ({ activity, onComplete }) => {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-green-700 mb-4">{activity.title}</h2>
      <p className="text-lg text-gray-700 mb-8">{activity.instruction}</p>
      <div className="bg-gradient-to-b from-sky-200 to-green-200 rounded-3xl p-12 shadow-lg max-w-lg mx-auto">
        <div className="text-7xl mb-6">🌳🌲🌳</div>
        <p className="text-gray-600 mb-8">Forest Letter Hunt game coming soon!</p>
        <AnimatedButton onClick={() => onComplete(50)}>
          Continue
        </AnimatedButton>
      </div>
    </div>
  );
};

export default LearningHub;