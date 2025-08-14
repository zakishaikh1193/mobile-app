import React, { useState, useRef, useEffect, useCallback } from 'react';

interface MazeCell {
  x: number;
  y: number;
  isWall: boolean;
  isStart: boolean;
  isEnd: boolean;
  isCollectible?: boolean;
  collectibleType?: 'star' | 'letter' | 'number' | 'color';
  collectibleValue?: string;
  isObstacle?: boolean;
  obstacleType?: 'water' | 'fire' | 'ice';
}

interface EducationalTheme {
  name: string;
  emoji: string;
  color: string;
  collectibles: string[];
  learningObjective: string;
}

interface WorkingMazePuzzleProps {
  activityId: number;
  childId: number;
  onComplete?: (completionData: any) => void;
  onBack?: () => void;
}

const WorkingMazePuzzle: React.FC<WorkingMazePuzzleProps> = ({ 
  activityId, 
  childId, 
  onComplete, 
  onBack 
}) => {
  
  // Game State
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing');
  const [timeSpent, setTimeSpent] = useState(0);
  const [movesCount, setMovesCount] = useState(0);
  const [score, setScore] = useState(0);
  const [collectedItems, setCollectedItems] = useState<string[]>([]);
  const [currentTheme, setCurrentTheme] = useState<EducationalTheme>({
    name: 'Alphabet Adventure',
    emoji: '🔤',
    color: 'from-blue-500 to-purple-600',
    collectibles: ['A', 'B', 'C', 'D', 'E'],
    learningObjective: 'Collect letters to learn the alphabet!'
  });
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  
  // Maze & Player
  const [maze, setMaze] = useState<MazeCell[][]>([]);
  const [playerPosition, setPlayerPosition] = useState({ x: 1, y: 1 });
  const [mazeSize, setMazeSize] = useState({ width: 10, height: 10 });
  const [cellSize, setCellSize] = useState(40);
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate educational maze with collectibles
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
          isEnd: false
        };
      }
    }

    // Create paths using recursive backtracking for better maze structure
    const createPath = (x: number, y: number) => {
      maze[y][x].isWall = false;
      
      const directions = [
        [0, -2], [2, 0], [0, 2], [-2, 0] // up, right, down, left
      ];
      
      // Shuffle directions for randomness
      for (let i = directions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [directions[i], directions[j]] = [directions[j], directions[i]];
      }
      
      for (const [dx, dy] of directions) {
        const newX = x + dx;
        const newY = y + dy;
        
        if (newX > 0 && newX < width - 1 && newY > 0 && newY < height - 1 && maze[newY][newX].isWall) {
          maze[y + dy/2][x + dx/2].isWall = false; // Remove wall between cells
          createPath(newX, newY);
        }
      }
    };

    // Set start and end positions first
    maze[1][1] = {
      ...maze[1][1],
      isWall: false,
      isStart: true
    };

    maze[height - 2][width - 2] = {
      ...maze[height - 2][width - 2],
      isWall: false,
      isEnd: true
    };

    // Start maze generation from start position to ensure connectivity
    createPath(1, 1);

    // Add collectibles based on theme
    const availablePositions: {x: number, y: number}[] = [];
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        if (!maze[y][x].isWall && !maze[y][x].isStart && !maze[y][x].isEnd) {
          availablePositions.push({x, y});
        }
      }
    }

    // Shuffle and place collectibles
    for (let i = availablePositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availablePositions[i], availablePositions[j]] = [availablePositions[j], availablePositions[i]];
    }

    const collectiblesToPlace = Math.min(currentTheme.collectibles.length, Math.floor(availablePositions.length / 3));
    for (let i = 0; i < collectiblesToPlace; i++) {
      const pos = availablePositions[i];
      maze[pos.y][pos.x] = {
        ...maze[pos.y][pos.x],
        isCollectible: true,
        collectibleType: 'letter',
        collectibleValue: currentTheme.collectibles[i]
      };
    }

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
      return;
    }
    
    // Move player
    setPlayerPosition({ x: newX, y: newY });
    setMovesCount(prev => prev + 1);
    
    // Check for collectibles
    if (targetCell.isCollectible && targetCell.collectibleValue) {
      setCollectedItems(prev => [...prev, targetCell.collectibleValue!]);
      setScore(prev => prev + 10);
      // Remove collectible from maze
      const newMaze = maze.map(row => row.map(cell => 
        cell.x === newX && cell.y === newY 
          ? { ...cell, isCollectible: false, collectibleValue: undefined }
          : cell
      ));
      setMaze(newMaze);
    }
    
    // Check for completion
    if (targetCell.isEnd) {
      handleGameCompletion();
    }
  }, [playerPosition, maze, mazeSize, gameState]);

  // Handle game completion
  const handleGameCompletion = () => {
    setGameState('completed');
    
    // Calculate final score
    const timeBonus = Math.max(0, 100 - timeSpent);
    const moveBonus = Math.max(0, 50 - movesCount);
    const collectibleBonus = collectedItems.length * 20;
    const finalScore = score + timeBonus + moveBonus + collectibleBonus;
    
    setScore(finalScore);
    
    // Call completion callback
    if (onComplete) {
      onComplete({
        score: finalScore,
        timeSpent,
        movesCount,
        collectedItems,
        learningObjective: currentTheme.learningObjective
      });
    }
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
    console.log('Generating new maze for theme:', currentTheme.name);
    const newMaze = generateMaze(10, 10);
    console.log('Maze generated:', newMaze.length, 'x', newMaze[0]?.length);
    setMaze(newMaze);
    setMazeSize({ width: 10, height: 10 });
    setCellSize(40);
    setPlayerPosition({ x: 1, y: 1 });
  }, [currentTheme]);

  // Function to change theme
  const changeTheme = (newTheme: EducationalTheme) => {
    setCurrentTheme(newTheme);
    setCollectedItems([]);
    setScore(0);
    setMovesCount(0);
    setTimeSpent(0);
    setGameState('playing');
  };

  // Render maze
  const renderMaze = () => {
    if (!canvasRef.current) {
      console.log('Canvas ref not available');
      return;
    }
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('Canvas context not available');
      return;
    }
    
    console.log('Rendering maze, size:', maze.length, 'x', maze[0]?.length);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw maze
    for (let y = 0; y < maze.length; y++) {
      for (let x = 0; x < maze[y].length; x++) {
        const cell = maze[y][x];
        const cellX = x * cellSize;
        const cellY = y * cellSize;
        
        if (cell.isWall) {
          // Draw walls with gradient
          const gradient = ctx.createLinearGradient(cellX, cellY, cellX + cellSize, cellY + cellSize);
          gradient.addColorStop(0, '#374151');
          gradient.addColorStop(1, '#1f2937');
          ctx.fillStyle = gradient;
          ctx.fillRect(cellX, cellY, cellSize, cellSize);
        } else {
          // Draw path with subtle pattern
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(cellX, cellY, cellSize, cellSize);
          
          // Draw start/end
          if (cell.isStart) {
            const gradient = ctx.createRadialGradient(
              cellX + cellSize/2, cellY + cellSize/2, 0,
              cellX + cellSize/2, cellY + cellSize/2, cellSize/2
            );
            gradient.addColorStop(0, '#10b981');
            gradient.addColorStop(1, '#059669');
            ctx.fillStyle = gradient;
            ctx.fillRect(cellX + 2, cellY + 2, cellSize - 4, cellSize - 4);
          } else if (cell.isEnd) {
            const gradient = ctx.createRadialGradient(
              cellX + cellSize/2, cellY + cellSize/2, 0,
              cellX + cellSize/2, cellY + cellSize/2, cellSize/2
            );
            gradient.addColorStop(0, '#ef4444');
            gradient.addColorStop(1, '#dc2626');
            ctx.fillStyle = gradient;
            ctx.fillRect(cellX + 2, cellY + 2, cellSize - 4, cellSize - 4);
          }
          
          // Draw collectibles
          if (cell.isCollectible && cell.collectibleValue) {
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(cellX + cellSize/2, cellY + cellSize/2, cellSize/3, 0, 2 * Math.PI);
            ctx.fill();
            
            // Draw letter
            ctx.fillStyle = '#92400e';
            ctx.font = `bold ${cellSize/2}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(cell.collectibleValue, cellX + cellSize/2, cellY + cellSize/2);
          }
        }
      }
    }
    
    // Draw player with animation
    const playerX = playerPosition.x * cellSize;
    const playerY = playerPosition.y * cellSize;
    const gradient = ctx.createRadialGradient(
      playerX + cellSize/2, playerY + cellSize/2, 0,
      playerX + cellSize/2, playerY + cellSize/2, cellSize/2
    );
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(1, '#1d4ed8');
    ctx.fillStyle = gradient;
    ctx.fillRect(playerX + 2, playerY + 2, cellSize - 4, cellSize - 4);
    
    // Add player glow effect
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 10;
    ctx.fillRect(playerX + 2, playerY + 2, cellSize - 4, cellSize - 4);
    ctx.shadowBlur = 0;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className={`bg-gradient-to-r ${currentTheme.color} rounded-2xl shadow-lg p-6 mb-6 text-white`}>
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
                  {currentTheme.emoji} {currentTheme.name}
                </h1>
                <p className="text-white/90">{currentTheme.learningObjective}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full">
              <span className="font-semibold text-white">Score: {score}</span>
            </div>
          </div>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-lg text-center">
            <p className="text-sm text-gray-600">Time</p>
            <p className="text-xl font-bold text-gray-800">{formatTime(timeSpent)}</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-lg text-center">
            <p className="text-sm text-gray-600">Moves</p>
            <p className="text-xl font-bold text-gray-800">{movesCount}</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-lg text-center">
            <p className="text-sm text-gray-600">Collected</p>
            <p className="text-xl font-bold text-yellow-600">{collectedItems.length}</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-lg text-center">
            <p className="text-sm text-gray-600">Status</p>
            <p className="text-xl font-bold text-gray-800">{gameState}</p>
          </div>
        </div>

        {/* Theme Selector */}
        <div className="bg-white rounded-xl p-4 shadow-lg mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Choose Your Learning Theme:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => changeTheme({
                name: 'Alphabet Adventure',
                emoji: '🔤',
                color: 'from-blue-500 to-purple-600',
                collectibles: ['A', 'B', 'C', 'D', 'E'],
                learningObjective: 'Collect letters to learn the alphabet!'
              })}
              className={`p-3 rounded-lg border-2 transition-all ${
                currentTheme.name === 'Alphabet Adventure'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="text-2xl mb-1">🔤</div>
              <div className="font-semibold text-sm">Alphabet</div>
            </button>
            
            <button
              onClick={() => changeTheme({
                name: 'Number Quest',
                emoji: '🔢',
                color: 'from-green-500 to-emerald-600',
                collectibles: ['1', '2', '3', '4', '5'],
                learningObjective: 'Collect numbers to learn counting!'
              })}
              className={`p-3 rounded-lg border-2 transition-all ${
                currentTheme.name === 'Number Quest'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="text-2xl mb-1">🔢</div>
              <div className="font-semibold text-sm">Numbers</div>
            </button>
            
            <button
              onClick={() => changeTheme({
                name: 'Color Hunt',
                emoji: '🎨',
                color: 'from-pink-500 to-rose-600',
                collectibles: ['🔴', '🔵', '🟡', '🟢', '🟣'],
                learningObjective: 'Collect colors to learn color names!'
              })}
              className={`p-3 rounded-lg border-2 transition-all ${
                currentTheme.name === 'Color Hunt'
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-200 hover:border-pink-300'
              }`}
            >
              <div className="text-2xl mb-1">🎨</div>
              <div className="font-semibold text-sm">Colors</div>
            </button>
          </div>
        </div>

        {/* Collected Items Display */}
        {collectedItems.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-lg mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Collected Items:</h3>
            <div className="flex flex-wrap gap-2">
              {collectedItems.map((item, index) => (
                <div key={index} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-bold">
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}

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
              </ul>
            </div>
            <div>
              <p className="mb-2"><strong>🎯 Goals:</strong></p>
              <ul className="space-y-1">
                <li>• Move the blue circle to the red circle</li>
                <li>• Collect yellow letters along the way</li>
                <li>• Avoid the gray walls</li>
                <li>• Complete the maze as quickly as possible</li>
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
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Excellent Work!</h2>
              <p className="text-gray-600">You completed the {currentTheme.name}!</p>
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
              <div className="flex justify-between">
                <span>Letters Collected:</span>
                <span className="font-bold text-yellow-600">{collectedItems.length}</span>
              </div>
            </div>

            {collectedItems.length > 0 && (
              <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-2">Letters You Learned:</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {collectedItems.map((item, index) => (
                    <div key={index} className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full font-bold text-lg">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
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

export default WorkingMazePuzzle;
