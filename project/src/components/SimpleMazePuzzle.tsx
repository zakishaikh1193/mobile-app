import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, RotateCcw, Home, Volume2, VolumeX, Eye, Lightbulb, Trophy, Target, Rocket } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAudio } from '../contexts/AudioContext';

interface MazeCell {
  x: number;
  y: number;
  isWall: boolean;
  isStart: boolean;
  isEnd: boolean;
  isVisited: boolean;
  isPath: boolean;
}

interface SimpleMazePuzzleProps {
  activityId: number;
  childId: number;
  onComplete?: (completionData: any) => void;
  onBack?: () => void;
}

const SimpleMazePuzzle: React.FC<SimpleMazePuzzleProps> = ({ activityId, childId, onComplete, onBack }) => {
  const { user } = useAuth();
  const { playSound, speak } = useAudio();
  
  // Game State
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'paused' | 'completed'>('intro');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Game Progress
  const [timeSpent, setTimeSpent] = useState(0);
  const [movesCount, setMovesCount] = useState(0);
  const [score, setScore] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  
  // Audio & UI
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Maze & Player
  const [maze, setMaze] = useState<MazeCell[][]>([]);
  const [playerPosition, setPlayerPosition] = useState({ x: 1, y: 1 });
  const [mazeSize, setMazeSize] = useState({ width: 15, height: 15 });
  const [cellSize, setCellSize] = useState(30);
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Generate simple maze
  const generateMaze = (width: number, height: number): MazeCell[][] => {
    const maze: MazeCell[][] = [];
    
    // Initialize maze with walls
    for (let y = 0; y < height; y++) {
      maze[y] = [];
      for (let x = 0; x < width; x++) {
        maze[y][x] = {
          x,
          y,
          isWall: true,
          isStart: false,
          isEnd: false,
          isVisited: false,
          isPath: false
        };
      }
    }

    // Create simple path
    for (let y = 1; y < height - 1; y += 2) {
      for (let x = 1; x < width - 1; x += 2) {
        maze[y][x] = {
          ...maze[y][x],
          isWall: false,
          isPath: true
        };
        
        // Add some horizontal and vertical paths
        if (x + 1 < width - 1 && Math.random() > 0.3) {
          maze[y][x + 1] = {
            ...maze[y][x + 1],
            isWall: false,
            isPath: true
          };
        }
        if (y + 1 < height - 1 && Math.random() > 0.3) {
          maze[y + 1][x] = {
            ...maze[y + 1][x],
            isWall: false,
            isPath: true
          };
        }
      }
    }

    // Set start and end positions
    maze[1][1] = {
      ...maze[1][1],
      isWall: false,
      isStart: true,
      isPath: true
    };

    maze[height - 2][width - 2] = {
      ...maze[height - 2][width - 2],
      isWall: false,
      isEnd: true,
      isPath: true
    };

    return maze;
  };

  // Handle player movement
  const handlePlayerMove = useCallback((dx: number, dy: number) => {
    if (gameState !== 'playing') return;
    
    const newX = playerPosition.x + dx;
    const newY = playerPosition.y + dy;
    
    // Check bounds
    if (newX < 0 || newX >= mazeSize.width || newY < 0 || newY >= mazeSize.height) {
      return;
    }
    
    const targetCell = maze[newY][newX];
    
    // Check if it's a wall
    if (targetCell.isWall) {
      playSound('click');
      return;
    }
    
    // Move player
    setPlayerPosition({ x: newX, y: newY });
    setMovesCount(prev => prev + 1);
    
    // Check for completion
    if (targetCell.isEnd) {
      handleGameCompletion();
    }
    
    playSound('click');
  }, [playerPosition, maze, mazeSize, gameState, playSound]);

  // Handle game completion
  const handleGameCompletion = () => {
    setGameState('completed');
    playSound('celebration');
    speak('Congratulations! You completed the maze!');
    
    // Calculate final score
    const timeBonus = Math.max(0, 100 - timeSpent);
    const moveBonus = Math.max(0, 50 - movesCount);
    const hintPenalty = hintsUsed * 5;
    const finalScore = score + timeBonus + moveBonus - hintPenalty;
    
    setScore(finalScore);
    
    // Call completion callback
    if (onComplete) {
      onComplete({
        score: finalScore,
        timeSpent,
        movesCount,
        hintsUsed
      });
    }
  };

  // Handle hint
  const handleHint = () => {
    if (hintsUsed >= 3) {
      speak('No more hints available!');
      return;
    }
    
    setHintsUsed(prev => prev + 1);
    setShowHint(true);
    playSound('click');
    
    // Simple hint - just point towards the end
    const endX = mazeSize.width - 2;
    const endY = mazeSize.height - 2;
    
    if (playerPosition.x < endX) {
      speak('Try moving right');
    } else if (playerPosition.x > endX) {
      speak('Try moving left');
    } else if (playerPosition.y > endY) {
      speak('Try moving up');
    } else {
      speak('Try moving down');
    }
    
    setTimeout(() => setShowHint(false), 3000);
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      
      switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          event.preventDefault();
          handlePlayerMove(0, -1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          event.preventDefault();
          handlePlayerMove(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          event.preventDefault();
          handlePlayerMove(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          event.preventDefault();
          handlePlayerMove(1, 0);
          break;
        case 'h':
        case 'H':
          event.preventDefault();
          handleHint();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handlePlayerMove, gameState]);

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
    const newMaze = generateMaze(15, 15);
    setMaze(newMaze);
    setMazeSize({ width: 15, height: 15 });
    setCellSize(isMobile ? 25 : 30);
    setPlayerPosition({ x: 1, y: 1 });
    setLoading(false);
    setGameState('playing');
  }, [isMobile]);

  // Render maze
  const renderMaze = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw maze
    for (let y = 0; y < maze.length; y++) {
      for (let x = 0; x < maze[y].length; x++) {
        const cell = maze[y][x];
        const cellX = x * cellSize;
        const cellY = y * cellSize;
        
        if (cell.isWall) {
          ctx.fillStyle = '#374151';
          ctx.fillRect(cellX, cellY, cellSize, cellSize);
        } else {
          ctx.fillStyle = '#f3f4f6';
          ctx.fillRect(cellX, cellY, cellSize, cellSize);
          
          // Draw start/end
          if (cell.isStart) {
            ctx.fillStyle = '#10b981';
            ctx.fillRect(cellX + 2, cellY + 2, cellSize - 4, cellSize - 4);
          } else if (cell.isEnd) {
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(cellX + 2, cellY + 2, cellSize - 4, cellSize - 4);
          }
        }
      }
    }
    
    // Draw player
    const playerX = playerPosition.x * cellSize;
    const playerY = playerPosition.y * cellSize;
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(playerX + 2, playerY + 2, cellSize - 4, cellSize - 4);
  };

  // Update canvas when maze or player position changes
  useEffect(() => {
    renderMaze();
  }, [maze, playerPosition, cellSize]);

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Maze...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Home className="h-6 w-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Simple Maze Puzzle</h1>
                <p className="text-gray-600">Navigate to the red square!</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {audioEnabled ? <Volume2 className="h-6 w-6 text-gray-600" /> : <VolumeX className="h-6 w-6 text-gray-600" />}
              </button>
              
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                <Trophy className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-600">{score}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-lg text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Time</p>
            <p className="text-xl font-bold text-gray-800">{formatTime(timeSpent)}</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-lg text-center">
            <div className="flex items-center justify-center mb-2">
              <Rocket className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Moves</p>
            <p className="text-xl font-bold text-gray-800">{movesCount}</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-lg text-center">
            <div className="flex items-center justify-center mb-2">
              <Lightbulb className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600">Hints</p>
            <p className="text-xl font-bold text-gray-800">{hintsUsed}/3</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-lg text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="text-xl font-bold text-gray-800">{gameState}</p>
          </div>
        </div>

        {/* Game Area */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-center mb-4">
            <div className="flex space-x-2">
              <button
                onClick={() => handlePlayerMove(-1, 0)}
                className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                ←
              </button>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => handlePlayerMove(0, -1)}
                  className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  ↑
                </button>
                <button
                  onClick={() => handlePlayerMove(0, 1)}
                  className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  ↓
                </button>
              </div>
              <button
                onClick={() => handlePlayerMove(1, 0)}
                className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                →
              </button>
            </div>
          </div>
          
          <div className="flex justify-center mb-4">
            <button
              onClick={handleHint}
              disabled={hintsUsed >= 3}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Lightbulb className="h-5 w-5 inline mr-2" />
              Hint ({3 - hintsUsed} left)
            </button>
          </div>
          
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              width={mazeSize.width * cellSize}
              height={mazeSize.height * cellSize}
              className="border-2 border-gray-300 rounded-lg"
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
                <li>• Use arrow keys or WASD to move</li>
                <li>• Click the direction buttons on mobile</li>
                <li>• Press H for a hint</li>
              </ul>
            </div>
            <div>
              <p className="mb-2"><strong>🎯 Goals:</strong></p>
              <ul className="space-y-1">
                <li>• Move the blue square to the red square</li>
                <li>• Avoid the gray walls</li>
                <li>• Complete the maze as quickly as possible</li>
                <li>• Use hints if you get stuck</li>
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
              <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Congratulations!</h2>
              <p className="text-gray-600">You completed the maze!</p>
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
                <span>Moves:</span>
                <span>{movesCount}</span>
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

export default SimpleMazePuzzle;
