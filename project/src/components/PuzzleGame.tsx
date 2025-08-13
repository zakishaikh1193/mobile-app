import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface PuzzlePiece {
  id: number;
  x: number;
  y: number;
  correctX: number;
  correctY: number;
  width: number;
  height: number;
  imageData: string;
  isPlaced: boolean;
}

interface PuzzleGameProps {
  activityId: number;
  childId: number;
  onComplete?: (completionData: any) => void;
  onBack?: () => void;
}

const PuzzleGame: React.FC<PuzzleGameProps> = ({ activityId, childId, onComplete, onBack }) => {
  const { user } = useAuth();
  const [puzzle, setPuzzle] = useState<any>(null);
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [movesCount, setMovesCount] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [draggedPiece, setDraggedPiece] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch puzzle data
  useEffect(() => {
    const fetchPuzzle = async () => {
      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${API_URL}/api/activities/puzzle/${activityId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch puzzle');
        }

        const data = await response.json();
        setPuzzle(data.puzzle);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load puzzle');
      } finally {
        setLoading(false);
      }
    };

    fetchPuzzle();
  }, [activityId]);

  // Generate puzzle pieces
  useEffect(() => {
    if (!puzzle || !canvasRef.current) return;

    console.log('Puzzle data:', puzzle);
    console.log('Image URL:', puzzle.imageUrl);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      console.log('Image loaded successfully, dimensions:', img.width, 'x', img.height);
      const { pieceCount, gridSize } = puzzle.config;
      
      // Calculate base piece dimensions
      const basePieceWidth = img.width / gridSize;
      const basePieceHeight = img.height / gridSize;
      
      // Create irregular jigsaw pieces
      const newPieces: PuzzlePiece[] = [];
      
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          const id = row * gridSize + col;
          
          // Create irregular piece path
          const piecePath = createIrregularPiecePath(row, col, gridSize, basePieceWidth, basePieceHeight);
          
          // Create piece canvas
          const pieceCanvas = document.createElement('canvas');
          const pieceCtx = pieceCanvas.getContext('2d');
          
          // Calculate piece bounds
          const bounds = getPieceBounds(piecePath);
          pieceCanvas.width = bounds.width;
          pieceCanvas.height = bounds.height;
          
          if (pieceCtx) {
            // Clear canvas
            pieceCtx.clearRect(0, 0, bounds.width, bounds.height);
            
            // Create clipping path for irregular shape
            pieceCtx.save();
            pieceCtx.beginPath();
            
            // Offset the path to fit in the canvas
            piecePath.forEach((point, index) => {
              const x = point.x - bounds.x;
              const y = point.y - bounds.y;
              if (index === 0) {
                pieceCtx.moveTo(x, y);
              } else {
                pieceCtx.lineTo(x, y);
              }
            });
            pieceCtx.closePath();
            pieceCtx.clip();
            
            // Draw the image portion
            pieceCtx.drawImage(
              img,
              col * basePieceWidth, row * basePieceHeight, basePieceWidth, basePieceHeight,
              0, 0, bounds.width, bounds.height
            );
            
            pieceCtx.restore();
          }
          
          const imageData = pieceCanvas.toDataURL();
          
          newPieces.push({
            id,
            x: Math.random() * (window.innerWidth - bounds.width - 100) + 50,
            y: Math.random() * (window.innerHeight - bounds.height - 200) + 100,
            correctX: col * basePieceWidth,
            correctY: row * basePieceHeight,
            width: bounds.width,
            height: bounds.height,
            imageData,
            isPlaced: false
          });
        }
      }
      
      console.log('Generated pieces:', newPieces.length);
      setPieces(newPieces);
    };

    img.onerror = (error) => {
      console.error('Error loading image:', error);
      console.error('Image URL that failed:', puzzle.imageUrl);
      setError('Failed to load puzzle image');
    };

    // Construct full image URL
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const fullImageUrl = `${API_URL}/${puzzle.imageUrl}`;
    console.log('Full image URL:', fullImageUrl);
    img.src = fullImageUrl;
  }, [puzzle]);

  // Create irregular jigsaw piece path
  const createIrregularPiecePath = (
    row: number, 
    col: number, 
    gridSize: number, 
    baseWidth: number, 
    baseHeight: number
  ) => {
    const points: { x: number; y: number }[] = [];
    const tabSize = Math.min(baseWidth, baseHeight) * 0.15;
    
    // Start from top-left
    points.push({ x: col * baseWidth, y: row * baseHeight });
    
    // Top edge
    if (row > 0) {
      // Add indent on top
      points.push({ x: col * baseWidth + baseWidth * 0.3, y: row * baseHeight });
      points.push({ x: col * baseWidth + baseWidth * 0.4, y: row * baseHeight - tabSize });
      points.push({ x: col * baseWidth + baseWidth * 0.6, y: row * baseHeight - tabSize });
      points.push({ x: col * baseWidth + baseWidth * 0.7, y: row * baseHeight });
    }
    points.push({ x: (col + 1) * baseWidth, y: row * baseHeight });
    
    // Right edge
    if (col < gridSize - 1) {
      // Add tab on right
      points.push({ x: (col + 1) * baseWidth, y: row * baseHeight + baseHeight * 0.3 });
      points.push({ x: (col + 1) * baseWidth + tabSize, y: row * baseHeight + baseHeight * 0.4 });
      points.push({ x: (col + 1) * baseWidth + tabSize, y: row * baseHeight + baseHeight * 0.6 });
      points.push({ x: (col + 1) * baseWidth, y: row * baseHeight + baseHeight * 0.7 });
    }
    points.push({ x: (col + 1) * baseWidth, y: (row + 1) * baseHeight });
    
    // Bottom edge
    if (row < gridSize - 1) {
      // Add tab on bottom
      points.push({ x: (col + 1) * baseWidth - baseWidth * 0.3, y: (row + 1) * baseHeight });
      points.push({ x: (col + 1) * baseWidth - baseWidth * 0.4, y: (row + 1) * baseHeight + tabSize });
      points.push({ x: (col + 1) * baseWidth - baseWidth * 0.6, y: (row + 1) * baseHeight + tabSize });
      points.push({ x: (col + 1) * baseWidth - baseWidth * 0.7, y: (row + 1) * baseHeight });
    }
    points.push({ x: col * baseWidth, y: (row + 1) * baseHeight });
    
    // Left edge
    if (col > 0) {
      // Add indent on left
      points.push({ x: col * baseWidth, y: (row + 1) * baseHeight - baseHeight * 0.3 });
      points.push({ x: col * baseWidth - tabSize, y: (row + 1) * baseHeight - baseHeight * 0.4 });
      points.push({ x: col * baseWidth - tabSize, y: (row + 1) * baseHeight - baseHeight * 0.6 });
      points.push({ x: col * baseWidth, y: (row + 1) * baseHeight - baseHeight * 0.7 });
    }
    
    return points;
  };

  // Get bounds of irregular piece
  const getPieceBounds = (points: { x: number; y: number }[]) => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    points.forEach(point => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
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
    if (pieces.length > 0 && pieces.every(piece => piece.isPlaced)) {
      setGameCompleted(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Play completion sound
      if (audioEnabled) {
        playSound('success');
      }
    }
  }, [pieces, audioEnabled]);



  const playSound = (type: string) => {
    // Simple sound feedback - you can enhance this
    const audio = new Audio();
    if (type === 'success') {
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
    }
    audio.play().catch(() => {}); // Ignore errors
  };

  const handlePieceDrag = useCallback((pieceId: number, x: number, y: number) => {
    setPieces(prev => prev.map(piece => {
      if (piece.id === pieceId) {
        return { ...piece, x, y };
      }
      return piece;
    }));
    setMovesCount(prev => prev + 1);
  }, []);

  const handlePieceDrop = useCallback((pieceId: number, x: number, y: number) => {
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece) return;

    const tolerance = 30; // Snap tolerance
    const isCorrectPosition = 
      Math.abs(x - piece.correctX) < tolerance && 
      Math.abs(y - piece.correctY) < tolerance;

    if (isCorrectPosition) {
      setPieces(prev => prev.map(p => {
        if (p.id === pieceId) {
          return { 
            ...p, 
            x: p.correctX, 
            y: p.correctY, 
            isPlaced: true 
          };
        }
        return p;
      }));
      
      if (audioEnabled) {
        playSound('success');
      }
    }
  }, [pieces, audioEnabled]);

  const startGame = () => {
    setGameStarted(true);
  };

  const resetGame = () => {
    setPieces(prev => prev.map(piece => ({
      ...piece,
      x: Math.random() * (window.innerWidth - piece.width - 100) + 50,
      y: Math.random() * (window.innerHeight - piece.height - 200) + 100,
      isPlaced: false
    })));
    setTimeSpent(0);
    setMovesCount(0);
    setGameCompleted(false);
  };

  const handleComplete = async () => {
    if (!onComplete) return;

    const completionData = {
      timeSpentSeconds: timeSpent,
      movesCount,
      accuracy: 100, // All pieces placed correctly
      gameMetrics: {
        piecesPlaced: pieces.length,
        hintsUsed: 0,
        completionTime: timeSpent
      }
    };

    onComplete(completionData);
  };

  // Global mouse event listeners for dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (draggedPiece !== null) {
        e.preventDefault();
        const rect = gameAreaRef.current?.getBoundingClientRect();
        if (rect) {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          handlePieceDrag(draggedPiece, x, y);
        }
      }
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (draggedPiece !== null) {
        const rect = gameAreaRef.current?.getBoundingClientRect();
        if (rect) {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          handlePieceDrop(draggedPiece, x, y);
        }
        setDraggedPiece(null);
      }
    };

    if (draggedPiece !== null) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [draggedPiece, handlePieceDrag, handlePieceDrop]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading puzzle...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
      
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
              <h1 className="text-lg font-semibold text-gray-800">{puzzle?.title}</h1>
              <p className="text-sm text-gray-500">
                {puzzle?.config?.pieceCount} pieces • {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
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
        style={{ touchAction: 'none' }}
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
                  <span className="text-3xl">🧩</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Puzzle Challenge</h2>
                <p className="text-gray-600 mb-6">
                  Complete the puzzle by dragging pieces to their correct positions!
                </p>
                <button
                  onClick={startGame}
                  className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                >
                  Start Puzzle
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Puzzle Pieces */}
        <AnimatePresence>
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{ scale: 0, rotate: 180 }}
              animate={{ 
                scale: 1, 
                rotate: 0,
                x: piece.x,
                y: piece.y
              }}
              exit={{ scale: 0, rotate: -180 }}
              className={`absolute cursor-grab active:cursor-grabbing ${
                piece.isPlaced ? 'z-10' : 'z-20'
              }`}
              style={{
                width: piece.width,
                height: piece.height,
                touchAction: 'none'
              }}
                             draggable
               onMouseDown={(e) => {
                 setDraggedPiece(piece.id);
                 e.preventDefault();
               }}
               onMouseMove={(e) => {
                 if (draggedPiece === piece.id) {
                   e.preventDefault();
                   const rect = gameAreaRef.current?.getBoundingClientRect();
                   if (rect) {
                     const x = e.clientX - rect.left;
                     const y = e.clientY - rect.top;
                     handlePieceDrag(piece.id, x, y);
                   }
                 }
               }}
               onMouseUp={(e) => {
                 if (draggedPiece === piece.id) {
                   const rect = gameAreaRef.current?.getBoundingClientRect();
                   if (rect) {
                     const x = e.clientX - rect.left;
                     const y = e.clientY - rect.top;
                     handlePieceDrop(piece.id, x, y);
                   }
                   setDraggedPiece(null);
                 }
               }}
               onTouchStart={(e) => {
                 setDraggedPiece(piece.id);
               }}
               onTouchMove={(e) => {
                 if (draggedPiece === piece.id) {
                   e.preventDefault();
                   const touch = e.touches[0];
                   const rect = gameAreaRef.current?.getBoundingClientRect();
                   if (rect) {
                     const x = touch.clientX - rect.left;
                     const y = touch.clientY - rect.top;
                     handlePieceDrag(piece.id, x, y);
                   }
                 }
               }}
               onTouchEnd={(e) => {
                 if (draggedPiece === piece.id) {
                   const touch = e.changedTouches[0];
                   const rect = gameAreaRef.current?.getBoundingClientRect();
                   if (rect) {
                     const x = touch.clientX - rect.left;
                     const y = touch.clientY - rect.top;
                     handlePieceDrop(piece.id, x, y);
                   }
                   setDraggedPiece(null);
                 }
               }}
            >
                             <img
                 src={piece.imageData}
                 alt={`Puzzle piece ${piece.id}`}
                 className="w-full h-full object-cover shadow-lg"
                 style={{
                   opacity: piece.isPlaced ? 0.8 : 1,
                   transform: piece.isPlaced ? 'scale(0.95)' : 'scale(1)',
                   transition: 'all 0.3s ease'
                 }}
               />
            </motion.div>
          ))}
        </AnimatePresence>

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
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Puzzle Complete!</h2>
              <p className="text-gray-600 mb-4">
                Great job! You solved the puzzle in {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
              </p>
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

export default PuzzleGame;
