import React, { useState, useRef, useEffect, useCallback } from 'react';

interface BubblePopLearningProps {
  activityId: number;
  childId: number;
  onComplete?: (completionData: any) => void;
  onBack?: () => void;
}

interface Bubble {
  id: number;
  x: number;
  y: number;
  content: string;
  type: 'letter' | 'number' | 'shape' | 'color' | 'word';
  isPopped: boolean;
  color: string;
}

const BubblePopLearning: React.FC<BubblePopLearningProps> = ({ 
  activityId, 
  childId, 
  onComplete, 
  onBack 
}) => {
  
  // Game State
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing');
  const [timeSpent, setTimeSpent] = useState(0);
  const [score, setScore] = useState(0);
  const [poppedBubbles, setPoppedBubbles] = useState<number[]>([]);
  const [currentTheme, setCurrentTheme] = useState<'letters' | 'numbers' | 'shapes' | 'colors' | 'words'>('letters');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  
  // Bubbles
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Theme configurations
  const themeConfigs = {
    letters: {
      title: 'Alphabet Bubble Pop',
      emoji: '🔤',
      color: 'from-blue-500 to-purple-600',
      content: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
      learningObjective: 'Pop bubbles to learn the alphabet!'
    },
    numbers: {
      title: 'Number Bubble Pop',
      emoji: '🔢',
      color: 'from-green-500 to-emerald-600',
      content: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      learningObjective: 'Pop bubbles to learn counting!'
    },
    shapes: {
      title: 'Shape Bubble Pop',
      emoji: '⭐',
      color: 'from-orange-500 to-red-600',
      content: ['●', '■', '▲', '◆', '★', '♦', '♥', '♠', '♣', '☺'],
      learningObjective: 'Pop bubbles to learn shapes!'
    },
    colors: {
      title: 'Color Bubble Pop',
      emoji: '🎨',
      color: 'from-pink-500 to-rose-600',
      content: ['🔴', '🔵', '🟡', '🟢', '🟣', '🟠', '⚫', '⚪', '🟤', '💖'],
      learningObjective: 'Pop bubbles to learn colors!'
    },
    words: {
      title: 'Word Bubble Pop',
      emoji: '📚',
      color: 'from-indigo-500 to-blue-600',
      content: ['CAT', 'DOG', 'SUN', 'MOON', 'STAR', 'TREE', 'BOOK', 'BALL', 'CAKE', 'FISH'],
      learningObjective: 'Pop bubbles to learn words!'
    }
  };

  // Generate bubbles based on theme and difficulty
  const generateBubbles = useCallback(() => {
    const config = themeConfigs[currentTheme];
    const bubbleCount = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 10 : 15;
    const availableContent = [...config.content];
    
    const newBubbles: Bubble[] = [];
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];
    
    for (let i = 0; i < bubbleCount; i++) {
      const randomIndex = Math.floor(Math.random() * availableContent.length);
      const content = availableContent.splice(randomIndex, 1)[0];
      
      newBubbles.push({
        id: i,
        x: Math.random() * 0.8 + 0.1, // 10% to 90% of canvas width
        y: Math.random() * 0.6 + 0.2, // 20% to 80% of canvas height
        content,
        type: currentTheme === 'letters' ? 'letter' : 
              currentTheme === 'numbers' ? 'number' : 
              currentTheme === 'shapes' ? 'shape' : 
              currentTheme === 'colors' ? 'color' : 'word',
        isPopped: false,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    
    setBubbles(newBubbles);
    setPoppedBubbles([]);
  }, [currentTheme, difficulty]);

  // Handle bubble pop
  const handleBubblePop = useCallback((bubbleId: number) => {
    if (gameState !== 'playing') return;
    
    setBubbles(prev => prev.map(bubble => 
      bubble.id === bubbleId ? { ...bubble, isPopped: true } : bubble
    ));
    
    setPoppedBubbles(prev => [...prev, bubbleId]);
    setScore(prev => prev + 10);
    
    // Check if all bubbles are popped
    const updatedBubbles = bubbles.map(bubble => 
      bubble.id === bubbleId ? { ...bubble, isPopped: true } : bubble
    );
    
    if (updatedBubbles.every(bubble => bubble.isPopped)) {
      handleGameCompletion();
    }
  }, [bubbles, gameState]);

  // Handle game completion
  const handleGameCompletion = () => {
    setGameState('completed');
    
    // Calculate final score
    const timeBonus = Math.max(0, 100 - timeSpent);
    const finalScore = score + timeBonus;
    
    setScore(finalScore);
    
    // Call completion callback
    if (onComplete) {
      onComplete({
        score: finalScore,
        timeSpent,
        poppedBubbles: poppedBubbles.length,
        theme: currentTheme,
        learningObjective: themeConfigs[currentTheme].learningObjective
      });
    }
  };

  // Handle canvas click
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    
    // Check if click is within any bubble
    bubbles.forEach(bubble => {
      if (!bubble.isPopped) {
        const distance = Math.sqrt((x - bubble.x) ** 2 + (y - bubble.y) ** 2);
        if (distance < 0.08) { // Bubble radius
          handleBubblePop(bubble.id);
        }
      }
    });
  }, [bubbles, gameState, handleBubblePop]);

  // Render bubbles
  const renderBubbles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#E0F2FE');
    gradient.addColorStop(1, '#F0F9FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw bubbles
    bubbles.forEach(bubble => {
      if (!bubble.isPopped) {
        const centerX = bubble.x * canvas.width;
        const centerY = bubble.y * canvas.height;
        const radius = 40;
        
        // Draw bubble shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Draw bubble
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = bubble.color;
        ctx.fill();
        
        // Draw bubble highlight
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        ctx.beginPath();
        ctx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.4, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();
        
        // Draw content
        ctx.fillStyle = '#1F2937';
        ctx.font = `bold ${currentTheme === 'words' ? 16 : 24}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bubble.content, centerX, centerY);
      }
    });
  }, [bubbles, currentTheme]);

  // Timer
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState]);

  // Initialize game
  useEffect(() => {
    generateBubbles();
  }, [generateBubbles]);

  // Update canvas when bubbles change
  useEffect(() => {
    renderBubbles();
  }, [renderBubbles]);

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Change theme
  const changeTheme = (newTheme: typeof currentTheme) => {
    setCurrentTheme(newTheme);
    setScore(0);
    setTimeSpent(0);
    setGameState('playing');
  };

  const config = themeConfigs[currentTheme];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className={`bg-gradient-to-r ${config.color} rounded-2xl shadow-lg p-6 mb-6 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  {config.emoji} {config.title}
                </h1>
                <p className="text-white/90">{config.learningObjective}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full">
              <span className="font-semibold text-white">Score: {score}</span>
            </div>
          </div>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-lg text-center">
            <p className="text-sm text-gray-600">Time</p>
            <p className="text-xl font-bold text-gray-800">{formatTime(timeSpent)}</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-lg text-center">
            <p className="text-sm text-gray-600">Popped</p>
            <p className="text-xl font-bold text-gray-800">{poppedBubbles.length}</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-lg text-center">
            <p className="text-sm text-gray-600">Status</p>
            <p className="text-xl font-bold text-gray-800">{gameState}</p>
          </div>
        </div>

        {/* Theme Selector */}
        <div className="bg-white rounded-xl p-4 shadow-lg mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Choose Your Learning Theme:</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(themeConfigs).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => changeTheme(key as typeof currentTheme)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  currentTheme === key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="text-2xl mb-1">{theme.emoji}</div>
                <div className="font-semibold text-sm">{theme.title.split(' ')[0]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Game Area */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-center mb-4">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-700 mb-2">
                Click the bubbles to pop them!
              </p>
              <p className="text-sm text-gray-600">
                {poppedBubbles.length} of {bubbles.length} bubbles popped
              </p>
            </div>
          </div>
          
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              onClick={handleCanvasClick}
              className="border-2 border-gray-300 rounded-lg cursor-pointer"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">How to Play</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p className="mb-2"><strong>🎮 Controls:</strong></p>
              <ul className="space-y-1">
                <li>• Click on bubbles to pop them</li>
                <li>• Pop all bubbles to complete the level</li>
                <li>• Try to be fast for bonus points!</li>
              </ul>
            </div>
            <div>
              <p className="mb-2"><strong>🎯 Learning Goals:</strong></p>
              <ul className="space-y-1">
                <li>• Learn letters, numbers, shapes, or colors</li>
                <li>• Practice hand-eye coordination</li>
                <li>• Improve reaction time</li>
                <li>• Have fun while learning!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {gameState === 'completed' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <div className="text-4xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Bubble Master!</h2>
              <p className="text-gray-600">You popped all the bubbles!</p>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Final Score:</span>
                <span className="font-bold text-blue-600">{score}</span>
              </div>
              <div className="flex justify-between">
                <span>Time:</span>
                <span>{formatTime(timeSpent)}</span>
              </div>
              <div className="flex justify-between">
                <span>Bubbles Popped:</span>
                <span>{poppedBubbles.length}</span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Play Again
              </button>
              <button
                onClick={onBack}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BubblePopLearning;
