import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BubbleType, BubblePopGameProps } from '../types/bubblePop';
import { GAME_CONTENT } from '../constants/bubblePop';
import './BubblePopGame.css';

const BubblePopGame: React.FC<BubblePopGameProps> = ({ 
  bubbleType, 
  onComplete, 
  onBack,
  difficulty = 'easy'
}) => {
  // State
  const [bubbles, setBubbles] = useState<BubbleType[]>([]);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [poppedBubbles, setPoppedBubbles] = useState<string[]>([]);
  const [currentTarget, setCurrentTarget] = useState<string>('');
  const [gameAreaSize, setGameAreaSize] = useState({ width: 0, height: 0 });
  const [time, setTime] = useState(0);
  const [poppedCount, setPoppedCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [comboPosition, setComboPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [wrongClicks, setWrongClicks] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  // Refs
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef<NodeJS.Timeout>();

  // Game content
  const content = GAME_CONTENT[bubbleType];

  // Initialize game state
  useEffect(() => {
    setGameActive(true);
  }, []);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Difficulty-based speed settings (mobile optimized)
  const getSpeedRange = (difficulty: string, mobile: boolean) => {
    const mobileMultiplier = mobile ? 0.8 : 1; // Increased mobile speed
    switch (difficulty) {
      case 'easy':
        return { min: 0.3 * mobileMultiplier, max: 0.6 * mobileMultiplier }; // Slow for easy
      case 'medium':
        return { min: 0.8 * mobileMultiplier, max: 1.5 * mobileMultiplier }; // Medium speed
      case 'hard':
        return { min: 1.5 * mobileMultiplier, max: 2.5 * mobileMultiplier }; // Fast for hard
      default:
        return { min: 0.3 * mobileMultiplier, max: 0.6 * mobileMultiplier };
    }
  };

  const getBubbleCount = (difficulty: string, mobile: boolean) => {
    const mobileMultiplier = mobile ? 0.8 : 1; // Slightly fewer on mobile
    switch (difficulty) {
      case 'easy':
        return Math.floor(3 * mobileMultiplier); // Fewer bubbles for easy (3)
      case 'medium':
        return Math.floor(5 * mobileMultiplier); // Medium bubbles for medium (5)
      case 'hard':
        return Math.floor(7 * mobileMultiplier); // More bubbles for hard (7)
      default:
        return Math.floor(3 * mobileMultiplier);
    }
  };

  const speedRange = getSpeedRange(difficulty, isMobile);
  const maxBubbles = getBubbleCount(difficulty, isMobile);

  // Update game area size with mobile optimization
  useEffect(() => {
    const updateSize = () => {
      if (gameAreaRef.current) {
        const rect = gameAreaRef.current.getBoundingClientRect();
        // Ensure minimum size for mobile
        const minWidth = isMobile ? 300 : 800;
        const minHeight = isMobile ? 400 : 600;
        setGameAreaSize({ 
          width: Math.max(rect.width, minWidth), 
          height: Math.max(rect.height, minHeight) 
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    // Multiple timeouts to ensure proper sizing on mobile
    const timer1 = setTimeout(updateSize, 100);
    const timer2 = setTimeout(updateSize, 500);
    const timer3 = setTimeout(updateSize, 1000);
    
    return () => {
      window.removeEventListener('resize', updateSize);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isMobile]);

  // Timer effect
  useEffect(() => {
    if (!gameActive) return;

    const updateTimer = () => {
      setTime(prev => prev + 1);
      timeRef.current = setTimeout(updateTimer, 1000);
    };

    timeRef.current = setTimeout(updateTimer, 1000);

    return () => {
      if (timeRef.current) {
        clearTimeout(timeRef.current);
      }
    };
  }, [gameActive]);

  // Initialize game with mobile-optimized animation
  useEffect(() => {
    if (!gameActive) return;

    // Set initial target
    const initialTarget = content.values[Math.floor(Math.random() * content.values.length)];
    setCurrentTarget(initialTarget);

    // Force a small delay to ensure game area is properly rendered
    const timer = setTimeout(() => {
      // Get actual game area dimensions
      const getGameAreaDimensions = () => {
        if (gameAreaRef.current) {
          const rect = gameAreaRef.current.getBoundingClientRect();
          return {
            width: Math.max(rect.width, 300),
            height: Math.max(rect.height, 400)
          };
        }
        return {
          width: isMobile ? 300 : 800,
          height: isMobile ? 400 : 600
        };
      };

      const { width: effectiveWidth, height: effectiveHeight } = getGameAreaDimensions();
      
      // Add initial bubbles starting from bottom
      const initialBubbles: BubbleType[] = [];
      for (let i = 0; i < maxBubbles; i++) {
        const value = content.values[Math.floor(Math.random() * content.values.length)];
        const color = content.colors[Math.floor(Math.random() * content.colors.length)];
        const x = Math.random() * (effectiveWidth - 100);
        const speed = speedRange.min + Math.random() * (speedRange.max - speedRange.min);
        const size = isMobile ? (40 + Math.random() * 20) : (60 + Math.random() * 40);
        const angle = Math.random() * Math.PI * 2;
        
        const bubble: BubbleType = {
          id: `${Date.now()}-${Math.random()}`,
          value,
          type: bubbleType,
          x,
          y: effectiveHeight - 100 + Math.random() * 50, // Start from bottom of game area
          speed,
          size,
          color,
          angle,
          wobble: Math.random() * 0.03,
          isNearTop: false
        };
        initialBubbles.push(bubble);
      }
      
      setBubbles(initialBubbles);

      // Enhanced animation loop with proper bottom-to-top movement
      const animate = () => {
        setBubbles(prevBubbles => {
          const { width: effectiveWidth, height: effectiveHeight } = getGameAreaDimensions();
          
          // Move bubbles upward smoothly
          const updatedBubbles = prevBubbles
            .map(bubble => {
              const newY = bubble.y - bubble.speed;
              const wobbleX = bubble.x + Math.sin(Date.now() * 0.001 + bubble.angle) * bubble.wobble;
              
              return {
                ...bubble,
                x: wobbleX,
                y: newY,
                isNearTop: newY < 80 // Mark bubbles near top for fade effect
              };
            })
            .filter(bubble => bubble.y > -bubble.size) // Remove bubbles that go above the top
            .concat(
              // Add new bubbles at the bottom if needed
              prevBubbles.length < maxBubbles && Math.random() < 0.02
                ? (() => {
                    const value = content.values[Math.floor(Math.random() * content.values.length)];
                    const color = content.colors[Math.floor(Math.random() * content.colors.length)];
                    const x = Math.random() * (effectiveWidth - 100);
                    const speed = speedRange.min + Math.random() * (speedRange.max - speedRange.min);
                    const size = isMobile ? (40 + Math.random() * 20) : (60 + Math.random() * 40);
                    const angle = Math.random() * Math.PI * 2;
                    
                    return {
                      id: `${Date.now()}-${Math.random()}`,
                      value,
                      type: bubbleType,
                      x,
                      y: effectiveHeight - 80 + Math.random() * 40, // Start new bubbles from bottom
                      speed,
                      size,
                      color,
                      angle,
                      wobble: Math.random() * 0.03,
                      isNearTop: false
                    };
                  })()
                : []
            );

          return updatedBubbles;
        });

        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameActive, content, bubbleType, difficulty, isMobile, gameAreaSize.width, gameAreaSize.height]);

  // Handle bubble pop with mobile-optimized feedback
  const handleBubblePop = (bubble: BubbleType, event: React.MouseEvent | React.TouchEvent) => {
    if (!gameActive || gameOver) return;

    // Handle touch events properly without preventDefault
    if ('touches' in event) {
      // For touch events, don't call preventDefault to avoid passive listener error
      event.stopPropagation();
    } else {
      // For mouse events, we can use preventDefault
      event.preventDefault();
      event.stopPropagation();
    }

    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (rect) {
      // Handle both mouse and touch events
      let clientX, clientY;
      if ('touches' in event) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else {
        clientX = event.clientX;
        clientY = event.clientY;
      }

      setComboPosition({
        x: clientX - rect.left,
        y: clientY - rect.top
      });
    }

    setCombo(prev => prev + 1);
    setShowCombo(true);
    setTimeout(() => setShowCombo(false), 1000);

    if (bubble.value === currentTarget) {
      const points = 10 + (combo * 5);
      setScore(prev => prev + points);
      setPoppedBubbles(prev => [...prev, bubble.value]);
      setPoppedCount(prev => prev + 1);
      
      // Set new target
      const newTarget = content.values[Math.floor(Math.random() * content.values.length)];
      setCurrentTarget(newTarget);
    } else {
      setCombo(0);
      const newWrongClicks = wrongClicks + 1;
      setWrongClicks(newWrongClicks);
      
      if (newWrongClicks >= 3) {
        setGameOver(true);
        setGameActive(false);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      }
    }

    // Remove the popped bubble
    setBubbles(prev => prev.filter(b => b.id !== bubble.id));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bubble-pop-game">
      {/* Header */}
      <div className="game-header">
        <button onClick={onBack} className="back-button">
          ← Back to Activities
        </button>
        
        <div className="game-title">
          <h1>Bubble Pop Learning</h1>
          <p>Pop the target bubbles to learn!</p>
        </div>
        
        <div className="score-display">
          <span className="score-label">Score</span>
          <span className="score-value">{score}</span>
        </div>
      </div>

      {/* Game Stats */}
      <div className="game-stats">
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-label">Time</div>
            <div className="stat-value">{formatTime(time)}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-label">Target</div>
            <div className="stat-value target-value">{currentTarget}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💥</div>
          <div className="stat-content">
            <div className="stat-label">Popped</div>
            <div className="stat-value">{poppedCount}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <div className="stat-label">Combo</div>
            <div className="stat-value">{combo}</div>
          </div>
        </div>
        
        <div className="stat-card difficulty-card" data-difficulty={difficulty}>
          <div className="stat-icon">
            {difficulty === 'easy' ? '😊' : difficulty === 'medium' ? '😐' : '😰'}
          </div>
          <div className="stat-content">
            <div className="stat-label">Difficulty</div>
            <div className="stat-value difficulty-value">{difficulty.toUpperCase()}</div>
          </div>
        </div>
        
        <div className={`stat-card ${wrongClicks >= 3 ? 'warning' : ''}`}>
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <div className="stat-label">Wrong Clicks</div>
            <div className="stat-value">{wrongClicks}/3</div>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div ref={gameAreaRef} className="game-area relative w-full h-96 overflow-hidden" style={{ minHeight: '384px' }}>
        {/* Combo Display */}
        {showCombo && (
          <div 
            className="combo-display"
            style={{
              left: comboPosition.x,
              top: comboPosition.y
            }}
          >
            +{combo * 5} COMBO!
          </div>
        )}

        {bubbles.map(bubble => (
          <div
            key={bubble.id}
            className={`bubble absolute cursor-pointer select-none ${bubble.isNearTop ? 'fade-out' : ''}`}
            style={{
              left: `${bubble.x}px`,
              top: `${bubble.y}px`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              minWidth: '40px',
              minHeight: '40px',
              backgroundColor: bubble.color,
              transform: `translate(-50%, -50%)`,
              zIndex: Math.floor(bubble.y)
            }}
            onClick={(e) => handleBubblePop(bubble, e)}
            onTouchStart={(e) => {
              e.stopPropagation();
              handleBubblePop(bubble, e);
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
            }}
          >
            <div 
              className="bubble-content flex items-center justify-center text-white font-bold select-none"
              style={{
                fontSize: `${Math.max(bubble.size * 0.4, isMobile ? 12 : 16)}px`,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              {bubble.value}
            </div>
            <div className="bubble-glow"></div>
          </div>
        ))}
      </div>

      {/* Game Over Screen */}
      {gameOver && (
        <div className="game-over-screen">
          <h2>Game Over!</h2>
          <p>Your final score: {score}</p>
          <p>You made {wrongClicks} wrong clicks.</p>
          <button onClick={onBack} className="back-button">
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default BubblePopGame;
