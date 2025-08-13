import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, RotateCcw, Home, Volume2, VolumeX, Eye, Lightbulb, Trophy, Target, Rocket, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface MazeCell {
  x: number;
  y: number;
  isWall: boolean;
  isStart: boolean;
  isEnd: boolean;
  isVisited: boolean;
  isPath: boolean;
}

interface MazePuzzleProps {
  activityId: number;
  childId: number;
  onComplete?: (completionData: any) => void;
  onBack?: () => void;
}

const MazePuzzle: React.FC<MazePuzzleProps> = ({ activityId, childId, onComplete, onBack }) => {
  const { user } = useAuth();
  const [puzzle, setPuzzle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [movesCount, setMovesCount] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [isMobile, setIsMobile] = useState(false);
  const [playerPosition, setPlayerPosition] = useState({ x: 1, y: 8 }); // Will be updated when game starts
  const [maze, setMaze] = useState<MazeCell[][]>([]);
  const [mazeSize, setMazeSize] = useState({ width: 15, height: 15 });
  const [cellSize, setCellSize] = useState(30);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Difficulty configuration
  const difficultyConfig = {
    easy: { width: 10, height: 10, cellSize: isMobile ? 35 : 40, maxHints: 3 },
    medium: { width: 15, height: 15, cellSize: isMobile ? 30 : 35, maxHints: 3 },
    hard: { width: 20, height: 20, cellSize: isMobile ? 25 : 30, maxHints: 3 }
  };

  // Initialize puzzle data
  useEffect(() => {
    setLoading(true);
    // Create a mock puzzle object since we don't need API data for maze
    const mockPuzzle = {
      id: activityId,
      title: 'Rocket to Earth Maze',
      type: 'maze',
      difficulty: 'easy',
      description: 'Navigate the rocket through the maze to reach Earth!'
    };
    setPuzzle(mockPuzzle);
    setLoading(false);
  }, [activityId]);

  // Generate maze
  useEffect(() => {
    if (!gameStarted) return;
    
    const config = difficultyConfig[difficulty];
    const newMaze = generateMaze(config.width, config.height);
    setMaze(newMaze);
    setMazeSize({ width: config.width, height: config.height });
    setCellSize(config.cellSize);
    setPlayerPosition({ x: 1, y: config.height - 2 }); // Start at bottom-left
  }, [gameStarted, difficulty, isMobile]);

  // Generate maze using recursive backtracking
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

    // Start position (bottom-left)
    const startX = 1;
    const startY = height - 2;
    maze[startY][startX] = {
      ...maze[startY][startX],
      isWall: false,
      isStart: true,
      isPath: true
    };

    // End position (top-center)
    const endX = Math.floor(width / 2);
    const endY = 1;
    maze[endY][endX] = {
      ...maze[endY][endX],
      isWall: false,
      isEnd: true,
      isPath: true
    };

    // Generate maze using recursive backtracking
    const stack: [number, number][] = [[startX, startY]];
    const visited = new Set<string>();
    visited.add(`${startX},${startY}`);

    while (stack.length > 0) {
      const [currentX, currentY] = stack[stack.length - 1];
      const neighbors = getUnvisitedNeighbors(currentX, currentY, width, height, visited);

      if (neighbors.length === 0) {
        stack.pop();
        continue;
      }

      const [nextX, nextY] = neighbors[Math.floor(Math.random() * neighbors.length)];
      const wallX = currentX + (nextX - currentX) / 2;
      const wallY = currentY + (nextY - currentY) / 2;

      // Carve path
      maze[wallY][wallX] = {
        ...maze[wallY][wallX],
        isWall: false,
        isPath: true
      };
      maze[nextY][nextX] = {
        ...maze[nextY][nextX],
        isWall: false,
        isPath: true
      };

      visited.add(`${nextX},${nextY}`);
      stack.push([nextX, nextY]);
    }

    return maze;
  };

  const getUnvisitedNeighbors = (x: number, y: number, width: number, height: number, visited: Set<string>): [number, number][] => {
    const neighbors: [number, number][] = [];
    const directions = [[0, -2], [2, 0], [0, 2], [-2, 0]]; // Up, Right, Down, Left

    for (const [dx, dy] of directions) {
      const newX = x + dx;
      const newY = y + dy;
      
      if (newX > 0 && newX < width - 1 && newY > 0 && newY < height - 1 && 
          !visited.has(`${newX},${newY}`)) {
        neighbors.push([newX, newY]);
      }
    }

    return neighbors;
  };

  // Timer
  useEffect(() => {
    if (gameStarted && !gameCompleted) {
      timerRef.current = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameStarted, gameCompleted]);

  // Check completion
  useEffect(() => {
    if (maze.length > 0 && playerPosition.x === Math.floor(mazeSize.width / 2) && playerPosition.y === 1) {
      setGameCompleted(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      const baseScore = 100;
      const timeBonus = Math.max(0, 300 - timeSpent);
      const hintPenalty = hintsUsed * 10;
      const finalScore = Math.max(0, baseScore + timeBonus - hintPenalty);
      setScore(finalScore);
      
      if (audioEnabled) {
        playSound('success');
      }
    }
  }, [playerPosition, maze, audioEnabled, timeSpent, hintsUsed, mazeSize]);

  const playSound = (type: string) => {
    const audio = new Audio();
    if (type === 'success') {
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
    }
    audio.play().catch(() => {});
  };

  // Handle player movement
  const movePlayer = useCallback((dx: number, dy: number) => {
    const newX = playerPosition.x + dx;
    const newY = playerPosition.y + dy;

    if (newX >= 0 && newX < mazeSize.width && newY >= 0 && newY < mazeSize.height) {
      const targetCell = maze[newY][newX];
      if (!targetCell.isWall) {
        setPlayerPosition({ x: newX, y: newY });
        setMovesCount(prev => prev + 1);
        
        // Mark cell as visited
        setMaze(prev => prev.map(row => 
          row.map(cell => 
            cell.x === newX && cell.y === newY 
              ? { ...cell, isVisited: true }
              : cell
          )
        ));
      }
    }
  }, [playerPosition, maze, mazeSize]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted || gameCompleted) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          movePlayer(0, -1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          movePlayer(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          movePlayer(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          movePlayer(1, 0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePlayer, gameStarted, gameCompleted]);

  // Draw maze on canvas
  useEffect(() => {
    if (!canvasRef.current || maze.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const config = difficultyConfig[difficulty];
    canvas.width = config.width * config.cellSize;
    canvas.height = config.height * config.cellSize;

    // Clear canvas
    ctx.fillStyle = '#3B82F6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw maze
    for (let y = 0; y < maze.length; y++) {
      for (let x = 0; x < maze[y].length; x++) {
        const cell = maze[y][x];
        const cellX = x * config.cellSize;
        const cellY = y * config.cellSize;

        if (cell.isWall) {
          ctx.fillStyle = '#1E293B';
          ctx.fillRect(cellX, cellY, config.cellSize, config.cellSize);
        } else if (cell.isStart) {
          ctx.fillStyle = '#F59E0B';
          ctx.fillRect(cellX, cellY, config.cellSize, config.cellSize);
        } else if (cell.isEnd) {
          ctx.fillStyle = '#10B981';
          ctx.fillRect(cellX, cellY, config.cellSize, config.cellSize);
        } else if (cell.isVisited) {
          ctx.fillStyle = '#E0E7FF';
          ctx.fillRect(cellX, cellY, config.cellSize, config.cellSize);
        } else {
          ctx.fillStyle = '#F3F4F6';
          ctx.fillRect(cellX, cellY, config.cellSize, config.cellSize);
        }

        // Draw cell border
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 1;
        ctx.strokeRect(cellX, cellY, config.cellSize, config.cellSize);
      }
    }

    // Draw player (rocket)
    const playerX = playerPosition.x * config.cellSize + config.cellSize / 2;
    const playerY = playerPosition.y * config.cellSize + config.cellSize / 2;
    
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(playerX, playerY, config.cellSize / 3, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw rocket details
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(playerX, playerY, config.cellSize / 6, 0, 2 * Math.PI);
    ctx.fill();

    // Draw end goal (Earth)
    const endX = Math.floor(mazeSize.width / 2) * config.cellSize + config.cellSize / 2;
    const endY = config.cellSize / 2;
    
    ctx.fillStyle = '#3B82F6';
    ctx.beginPath();
    ctx.arc(endX, endY, config.cellSize / 3, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(endX, endY, config.cellSize / 6, 0, 2 * Math.PI);
    ctx.fill();

  }, [maze, playerPosition, difficulty, mazeSize, isMobile]);

  const startGame = () => {
    setGameStarted(true);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameCompleted(false);
    setTimeSpent(0);
    setMovesCount(0);
    setHintsUsed(0);
    setScore(0);
    setShowHint(false);
    setPlayerPosition({ x: 1, y: difficultyConfig[difficulty].height - 2 }); // Reset to bottom-left
  };

  const useHint = () => {
    if (hintsUsed < difficultyConfig[difficulty].maxHints) {
      setHintsUsed(prev => prev + 1);
      setShowHint(true);
      setTimeout(() => setShowHint(false), 2000);
    }
  };

  const handleComplete = async () => {
    if (!onComplete) return;

    const completionData = {
      timeSpentSeconds: timeSpent,
      movesCount,
      score,
      hintsUsed,
      accuracy: 100,
      gameMetrics: {
        mazeSize: mazeSize.width * mazeSize.height,
        hintsUsed,
        completionTime: timeSpent,
        finalScore: score
      }
    };

    onComplete(completionData);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading maze puzzle...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Oops! Something went wrong</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden"
      style={{
        touchAction: 'none',
        overscrollBehavior: 'none',
        WebkitOverflowScrolling: 'auto'
      }}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Home className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">{puzzle?.title || 'Maze Puzzle'}</h1>
              <p className="text-sm text-gray-500">
                Maze • {difficulty} • {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {gameStarted && (
              <div className="bg-yellow-100 px-3 py-1 rounded-full">
                <span className="text-sm font-semibold text-yellow-800">Score: {score}</span>
              </div>
            )}
            
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              {audioEnabled ? <Volume2 className="w-5 h-5 text-gray-600" /> : <VolumeX className="w-5 h-5 text-gray-600" />}
            </button>
            
            <button
              onClick={resetGame}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div 
        ref={gameAreaRef}
        className="relative w-full h-screen pt-20 pb-24"
        style={{ 
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          zIndex: 1
        }}
      >
        {/* Start Screen */}
        {!gameStarted && (
          <div className="absolute inset-0 flex items-center justify-center z-40">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 shadow-xl max-w-sm mx-4"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Rocket className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Maze Puzzle</h2>
                <p className="text-gray-600 mb-4">
                  Navigate the rocket through the maze to reach Earth! Use arrow keys or WASD to move.
                </p>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty:</label>
                  <div className="flex space-x-2">
                    {(['easy', 'medium', 'hard'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          difficulty === level
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={startGame}
                  className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                >
                  Start Maze
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Game Layout */}
        {gameStarted && !gameCompleted && (
          <div className="flex flex-col h-full">
            {/* Maze Display */}
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className="border-4 border-gray-300 rounded-xl shadow-2xl"
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
                
                {/* Controls Info */}
                <div className="text-center mt-4">
                  <div className="inline-flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-full">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Use Arrow Keys or WASD to Move</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Game Controls */}
            <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Rocket className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-gray-600">Rocket</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-600">Earth (Goal)</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="p-3 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors flex items-center space-x-2"
                    title="Show maze solution"
                  >
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Solution</span>
                  </button>
                  
                  <button
                    onClick={useHint}
                    disabled={hintsUsed >= difficultyConfig[difficulty].maxHints}
                    className={`p-3 rounded-lg transition-colors flex items-center space-x-2 ${
                      hintsUsed >= difficultyConfig[difficulty].maxHints
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-yellow-100 hover:bg-yellow-200'
                    }`}
                    title={`Use hint (${hintsUsed}/${difficultyConfig[difficulty].maxHints})`}
                  >
                    <Lightbulb className={`w-4 h-4 ${hintsUsed >= difficultyConfig[difficulty].maxHints ? 'text-gray-500' : 'text-yellow-600'}`} />
                    <span className={`text-sm font-medium ${hintsUsed >= difficultyConfig[difficulty].maxHints ? 'text-gray-500' : 'text-yellow-800'}`}>
                      Hint ({hintsUsed}/{difficultyConfig[difficulty].maxHints})
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hint Overlay */}
        {showHint && (
          <div className="absolute inset-0 z-20 bg-yellow-100/80 flex items-center justify-center">
            <div className="bg-yellow-500 text-white px-6 py-3 rounded-full shadow-lg">
              <p className="text-lg font-semibold">💡 Hint: Try to find the shortest path to Earth!</p>
            </div>
          </div>
        )}

        {/* Completion Screen */}
        {gameCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center z-50 bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 shadow-xl max-w-sm mx-4 text-center"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Maze Complete!</h2>
              <p className="text-gray-600 mb-4">
                Great job! You reached Earth in {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
              </p>
              
              {/* Score Display */}
              <div className="bg-yellow-100 rounded-lg p-4 mb-4">
                <div className="text-2xl font-bold text-yellow-800">Score: {score}</div>
                <div className="text-sm text-yellow-600">
                  Time: {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')} • 
                  Moves: {movesCount} • 
                  Hints: {hintsUsed}
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={resetGame}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Play Again
                </button>
                <button
                  onClick={handleComplete}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Complete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MazePuzzle;
