import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, RotateCcw, Home, Volume2, VolumeX, Eye, Lightbulb, Trophy, Target, Grid3X3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface JigsawPiece {
  id: number;
  x: number;
  y: number;
  correctX: number;
  correctY: number;
  width: number;
  height: number;
  imageData: string;
  isPlaced: boolean;
  originalX: number;
  originalY: number;
  // Jigsaw specific properties
  row: number;
  col: number;
  totalRows: number;
  totalCols: number;
  // Connection points for interlocking
  topConnector: 'male' | 'female' | 'flat';
  bottomConnector: 'male' | 'female' | 'flat';
  leftConnector: 'male' | 'female' | 'flat';
  rightConnector: 'male' | 'female' | 'flat';
}

interface JigsawPuzzleProps {
  activityId: number;
  childId: number;
  onComplete?: (completionData: any) => void;
  onBack?: () => void;
}

const JigsawPuzzle: React.FC<JigsawPuzzleProps> = ({ activityId, childId, onComplete, onBack }) => {
  console.log('JigsawPuzzle rendering...');
  

  
  const { user } = useAuth();
  const [puzzle, setPuzzle] = useState<any>(() => null);
  const [pieces, setPieces] = useState<JigsawPiece[]>(() => []);
  const [loading, setLoading] = useState(() => true);
  const [error, setError] = useState<string | null>(() => null);
  const [gameStarted, setGameStarted] = useState(() => false);
  const [gameCompleted, setGameCompleted] = useState(() => false);
  const [timeSpent, setTimeSpent] = useState(() => 0);
  const [movesCount, setMovesCount] = useState(() => 0);
  const [audioEnabled, setAudioEnabled] = useState(() => true);
  const [draggedPiece, setDraggedPiece] = useState<number | null>(() => null);
  const [showHint, setShowHint] = useState(() => false);
  const [hintsUsed, setHintsUsed] = useState(() => 0);
  const [showPreview, setShowPreview] = useState(() => false);
  const [score, setScore] = useState(() => 0);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(() => 'easy');
  const [puzzleBoardSize, setPuzzleBoardSize] = useState(() => ({ width: 400, height: 300 }));
  const [isMobile, setIsMobile] = useState(() => false);
  const [dragOffset, setDragOffset] = useState(() => ({ x: 0, y: 0 }));

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const puzzleBoardRef = useRef<HTMLDivElement>(null);
  const piecesContainerRef = useRef<HTMLDivElement>(null);
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
    easy: { rows: 2, cols: 2, pieceSize: isMobile ? 120 : 150, maxHints: 3 },
    medium: { rows: 3, cols: 4, pieceSize: isMobile ? 100 : 120, maxHints: 3 },
    hard: { rows: 4, cols: 6, pieceSize: isMobile ? 80 : 100, maxHints: 3 }
  };

  // Generate jigsaw connectors for interlocking pieces
  const generateConnectors = (row: number, col: number, totalRows: number, totalCols: number) => {
    // Create more complex interlocking pattern
    const rowPattern = row % 3;
    const colPattern = col % 3;
    
    return {
      topConnector: (row === 0 ? 'flat' : (rowPattern === 0 ? 'male' : rowPattern === 1 ? 'female' : 'male')) as 'male' | 'female' | 'flat',
      bottomConnector: (row === totalRows - 1 ? 'flat' : (rowPattern === 0 ? 'female' : rowPattern === 1 ? 'male' : 'female')) as 'male' | 'female' | 'flat',
      leftConnector: (col === 0 ? 'flat' : (colPattern === 0 ? 'male' : colPattern === 1 ? 'female' : 'male')) as 'male' | 'female' | 'flat',
      rightConnector: (col === totalCols - 1 ? 'flat' : (colPattern === 0 ? 'female' : colPattern === 1 ? 'male' : 'female')) as 'male' | 'female' | 'flat'
    };
  };

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
        
        if (data.puzzle?.config?.difficulty) {
          setDifficulty(data.puzzle.config.difficulty);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load puzzle');
      } finally {
        setLoading(false);
      }
    };

    fetchPuzzle();
  }, [activityId]);

  // Generate jigsaw puzzle pieces
  useEffect(() => {
    if (!puzzle || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const config = difficultyConfig[difficulty];
      const { rows, cols } = config;
      
      // Calculate piece dimensions
      const pieceWidth = puzzleBoardSize.width / cols;
      const pieceHeight = puzzleBoardSize.height / rows;
      
      // Create jigsaw pieces
      const newPieces: JigsawPiece[] = [];
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const id = row * cols + col;
          
          // Create piece canvas with jigsaw edges
          const pieceCanvas = document.createElement('canvas');
          const pieceCtx = pieceCanvas.getContext('2d');
          
          // Add extra space for jigsaw connectors
          const connectorSize = 15;
          pieceCanvas.width = pieceWidth + connectorSize * 2;
          pieceCanvas.height = pieceHeight + connectorSize * 2;
          
          if (pieceCtx) {
            // Generate connectors for this piece
            const connectors = generateConnectors(row, col, rows, cols);
            
            // Draw the image portion with jigsaw edges
            drawJigsawPiece(pieceCtx, img, row, col, rows, cols, pieceWidth, pieceHeight, connectors, connectorSize);
          }
          
          const imageData = pieceCanvas.toDataURL();
          
          // Calculate random position in pieces container
          const piecesContainer = piecesContainerRef.current?.getBoundingClientRect();
          const maxX = piecesContainer ? piecesContainer.width - pieceWidth - 40 : 300;
          const maxY = piecesContainer ? piecesContainer.height - pieceHeight - 40 : 200;
          
          const randomX = Math.random() * Math.max(20, maxX) + 20;
          const randomY = Math.random() * Math.max(20, maxY) + 20;
          
          newPieces.push({
            id,
            x: randomX,
            y: randomY,
            originalX: randomX,
            originalY: randomY,
            correctX: col * pieceWidth,
            correctY: row * pieceHeight,
            width: pieceWidth + connectorSize * 2,
            height: pieceHeight + connectorSize * 2,
            imageData,
            isPlaced: false,
            row,
            col,
            totalRows: rows,
            totalCols: cols,
            ...generateConnectors(row, col, rows, cols)
          });
        }
      }
      
      setPieces(newPieces);
    };

    img.onerror = () => {
      setError('Failed to load puzzle image');
    };

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const fullImageUrl = `${API_URL}/${puzzle.imageUrl}`;
    img.src = fullImageUrl;
  }, [puzzle, difficulty, puzzleBoardSize, isMobile]);

  // Draw jigsaw piece with interlocking edges
  const drawJigsawPiece = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    row: number,
    col: number,
    totalRows: number,
    totalCols: number,
    pieceWidth: number,
    pieceHeight: number,
    connectors: any,
    connectorSize: number
  ) => {
    const imgPieceWidth = img.width / totalCols;
    const imgPieceHeight = img.height / totalRows;
    
    // Create path for jigsaw piece
    ctx.beginPath();
    
    // Start from top-left
    ctx.moveTo(connectorSize, connectorSize);
    
    // Top edge with connector
    if (connectors.topConnector === 'male') {
      ctx.lineTo(pieceWidth * 0.25 + connectorSize, connectorSize);
      ctx.quadraticCurveTo(pieceWidth * 0.35 + connectorSize, connectorSize - connectorSize, pieceWidth * 0.5 + connectorSize, connectorSize);
      ctx.quadraticCurveTo(pieceWidth * 0.65 + connectorSize, connectorSize - connectorSize, pieceWidth * 0.75 + connectorSize, connectorSize);
    } else if (connectors.topConnector === 'female') {
      ctx.lineTo(pieceWidth * 0.25 + connectorSize, connectorSize);
      ctx.quadraticCurveTo(pieceWidth * 0.35 + connectorSize, connectorSize + connectorSize, pieceWidth * 0.5 + connectorSize, connectorSize);
      ctx.quadraticCurveTo(pieceWidth * 0.65 + connectorSize, connectorSize + connectorSize, pieceWidth * 0.75 + connectorSize, connectorSize);
    }
    ctx.lineTo(pieceWidth + connectorSize, connectorSize);
    
    // Right edge with connector
    if (connectors.rightConnector === 'male') {
      ctx.lineTo(pieceWidth + connectorSize, pieceHeight * 0.25 + connectorSize);
      ctx.quadraticCurveTo(pieceWidth + connectorSize + connectorSize, pieceHeight * 0.35 + connectorSize, pieceWidth + connectorSize, pieceHeight * 0.5 + connectorSize);
      ctx.quadraticCurveTo(pieceWidth + connectorSize + connectorSize, pieceHeight * 0.65 + connectorSize, pieceWidth + connectorSize, pieceHeight * 0.75 + connectorSize);
    } else if (connectors.rightConnector === 'female') {
      ctx.lineTo(pieceWidth + connectorSize, pieceHeight * 0.25 + connectorSize);
      ctx.quadraticCurveTo(pieceWidth + connectorSize - connectorSize, pieceHeight * 0.35 + connectorSize, pieceWidth + connectorSize, pieceHeight * 0.5 + connectorSize);
      ctx.quadraticCurveTo(pieceWidth + connectorSize - connectorSize, pieceHeight * 0.65 + connectorSize, pieceWidth + connectorSize, pieceHeight * 0.75 + connectorSize);
    }
    ctx.lineTo(pieceWidth + connectorSize, pieceHeight + connectorSize);
    
    // Bottom edge with connector
    if (connectors.bottomConnector === 'male') {
      ctx.lineTo(pieceWidth * 0.75 + connectorSize, pieceHeight + connectorSize);
      ctx.quadraticCurveTo(pieceWidth * 0.65 + connectorSize, pieceHeight + connectorSize + connectorSize, pieceWidth * 0.5 + connectorSize, pieceHeight + connectorSize);
      ctx.quadraticCurveTo(pieceWidth * 0.35 + connectorSize, pieceHeight + connectorSize + connectorSize, pieceWidth * 0.25 + connectorSize, pieceHeight + connectorSize);
    } else if (connectors.bottomConnector === 'female') {
      ctx.lineTo(pieceWidth * 0.75 + connectorSize, pieceHeight + connectorSize);
      ctx.quadraticCurveTo(pieceWidth * 0.65 + connectorSize, pieceHeight + connectorSize - connectorSize, pieceWidth * 0.5 + connectorSize, pieceHeight + connectorSize);
      ctx.quadraticCurveTo(pieceWidth * 0.35 + connectorSize, pieceHeight + connectorSize - connectorSize, pieceWidth * 0.25 + connectorSize, pieceHeight + connectorSize);
    }
    ctx.lineTo(connectorSize, pieceHeight + connectorSize);
    
    // Left edge with connector
    if (connectors.leftConnector === 'male') {
      ctx.lineTo(connectorSize, pieceHeight * 0.75 + connectorSize);
      ctx.quadraticCurveTo(connectorSize - connectorSize, pieceHeight * 0.65 + connectorSize, connectorSize, pieceHeight * 0.5 + connectorSize);
      ctx.quadraticCurveTo(connectorSize - connectorSize, pieceHeight * 0.35 + connectorSize, connectorSize, pieceHeight * 0.25 + connectorSize);
    } else if (connectors.leftConnector === 'female') {
      ctx.lineTo(connectorSize, pieceHeight * 0.75 + connectorSize);
      ctx.quadraticCurveTo(connectorSize + connectorSize, pieceHeight * 0.65 + connectorSize, connectorSize, pieceHeight * 0.5 + connectorSize);
      ctx.quadraticCurveTo(connectorSize + connectorSize, pieceHeight * 0.35 + connectorSize, connectorSize, pieceHeight * 0.25 + connectorSize);
    }
    ctx.lineTo(connectorSize, connectorSize);
    
    ctx.closePath();
    
    // Create clipping path
    ctx.save();
    ctx.clip();
    
    // Draw the image portion
    ctx.drawImage(
      img,
      col * imgPieceWidth, row * imgPieceHeight, 
      imgPieceWidth, imgPieceHeight,
      0, 0, pieceWidth + connectorSize * 2, pieceHeight + connectorSize * 2
    );
    
    ctx.restore();
    
    // Add jigsaw border
    ctx.strokeStyle = '#1E40AF';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // Add shadow effect for better visibility
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.stroke();
    ctx.shadowColor = 'transparent';
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
      
      const baseScore = 100;
      const timeBonus = Math.max(0, 300 - timeSpent);
      const hintPenalty = hintsUsed * 10;
      const finalScore = Math.max(0, baseScore + timeBonus - hintPenalty);
      setScore(finalScore);
      
      if (audioEnabled) {
        playSound('success');
      }
    }
  }, [pieces, audioEnabled, timeSpent, hintsUsed]);

  const playSound = (type: string) => {
    const audio = new Audio();
    if (type === 'success') {
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
    }
    audio.play().catch(() => {});
  };

  // Enhanced drag and drop handlers
  const handlePieceDrag = useCallback((pieceId: number, x: number, y: number) => {
    setPieces(prev => prev.map(piece => {
      if (piece.id === pieceId) {
        return { ...piece, x, y };
      }
      return piece;
    }));
  }, []);

  const handlePieceDrop = useCallback((pieceId: number, clientX: number, clientY: number) => {
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece) return;

    const puzzleBoard = puzzleBoardRef.current?.getBoundingClientRect();
    if (puzzleBoard) {
      const boardX = clientX - puzzleBoard.left;
      const boardY = clientY - puzzleBoard.top;
      
      // Smaller tolerance for jigsaw pieces
      const tolerance = isMobile ? 25 : 20;
      
      const isWithinBoard = boardX >= -tolerance && boardY >= -tolerance && 
                           boardX <= puzzleBoard.width + tolerance && 
                           boardY <= puzzleBoard.height + tolerance;
      
      if (isWithinBoard) {
        const isCorrectPosition = 
          Math.abs(boardX - piece.correctX) < tolerance && 
          Math.abs(boardY - piece.correctY) < tolerance;

        if (isCorrectPosition) {
          setPieces(prev => prev.map(p => {
            if (p.id === pieceId) {
              return { 
                ...p, 
                x: piece.correctX, 
                y: piece.correctY, 
                isPlaced: true 
              };
            }
            return p;
          }));
          
          setMovesCount(prev => prev + 1);
          
          if (audioEnabled) {
            playSound('success');
          }
        } else {
          // Return piece to original position with animation
          setPieces(prev => prev.map(p => {
            if (p.id === pieceId) {
              return { 
                ...p, 
                x: p.originalX, 
                y: p.originalY 
              };
            }
            return p;
          }));
        }
      } else {
        // Return piece to original position
        setPieces(prev => prev.map(p => {
          if (p.id === pieceId) {
            return { 
              ...p, 
              x: p.originalX, 
              y: p.originalY 
            };
          }
          return p;
        }));
      }
    }
  }, [pieces, audioEnabled, isMobile]);

  // Touch and mouse event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent, pieceId: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.touches[0];
    const piecesContainer = piecesContainerRef.current?.getBoundingClientRect();
    if (piecesContainer) {
      const x = touch.clientX - piecesContainer.left;
      const y = touch.clientY - piecesContainer.top;
      const piece = pieces.find(p => p.id === pieceId);
      if (piece) {
        setDraggedPiece(pieceId);
        setDragOffset({ 
          x: x - piece.x, 
          y: y - piece.y 
        });
      }
    }
  }, [pieces]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedPiece !== null) {
      const touch = e.touches[0];
      const piecesContainer = piecesContainerRef.current?.getBoundingClientRect();
      if (piecesContainer) {
        const x = touch.clientX - piecesContainer.left - dragOffset.x;
        const y = touch.clientY - piecesContainer.top - dragOffset.y;
        handlePieceDrag(draggedPiece, x, y);
      }
    }
  }, [draggedPiece, dragOffset, handlePieceDrag]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedPiece !== null) {
      const touch = e.changedTouches[0];
      handlePieceDrop(draggedPiece, touch.clientX, touch.clientY);
      setDraggedPiece(null);
      setDragOffset({ x: 0, y: 0 });
    }
  }, [draggedPiece, handlePieceDrop]);

  const handleMouseDown = useCallback((e: React.MouseEvent, pieceId: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const piecesContainer = piecesContainerRef.current?.getBoundingClientRect();
    if (piecesContainer) {
      const x = e.clientX - piecesContainer.left;
      const y = e.clientY - piecesContainer.top;
      const piece = pieces.find(p => p.id === pieceId);
      if (piece) {
        setDraggedPiece(pieceId);
        setDragOffset({ 
          x: x - piece.x, 
          y: y - piece.y 
        });
      }
    }
  }, [pieces]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedPiece !== null) {
      const piecesContainer = piecesContainerRef.current?.getBoundingClientRect();
      if (piecesContainer) {
        const x = e.clientX - piecesContainer.left - dragOffset.x;
        const y = e.clientY - piecesContainer.top - dragOffset.y;
        handlePieceDrag(draggedPiece, x, y);
      }
    }
  }, [draggedPiece, dragOffset, handlePieceDrag]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedPiece !== null) {
      handlePieceDrop(draggedPiece, e.clientX, e.clientY);
      setDraggedPiece(null);
      setDragOffset({ x: 0, y: 0 });
    }
  }, [draggedPiece, handlePieceDrop]);

  // Global event listeners
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (draggedPiece !== null) {
        e.preventDefault();
        e.stopPropagation();
        
        const piecesContainer = piecesContainerRef.current?.getBoundingClientRect();
        if (piecesContainer) {
          const x = e.clientX - piecesContainer.left - dragOffset.x;
          const y = e.clientY - piecesContainer.top - dragOffset.y;
          handlePieceDrag(draggedPiece, x, y);
        }
      }
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (draggedPiece !== null) {
        e.preventDefault();
        e.stopPropagation();
        handlePieceDrop(draggedPiece, e.clientX, e.clientY);
        setDraggedPiece(null);
        setDragOffset({ x: 0, y: 0 });
      }
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (draggedPiece !== null) {
        e.preventDefault();
        e.stopPropagation();
        const touch = e.touches[0];
        
        const piecesContainer = piecesContainerRef.current?.getBoundingClientRect();
        if (piecesContainer) {
          const x = touch.clientX - piecesContainer.left - dragOffset.x;
          const y = touch.clientY - piecesContainer.top - dragOffset.y;
          handlePieceDrag(draggedPiece, x, y);
        }
      }
    };

    const handleGlobalTouchEnd = (e: TouchEvent) => {
      if (draggedPiece !== null) {
        e.preventDefault();
        e.stopPropagation();
        const touch = e.changedTouches[0];
        handlePieceDrop(draggedPiece, touch.clientX, touch.clientY);
        setDraggedPiece(null);
        setDragOffset({ x: 0, y: 0 });
      }
    };

    if (draggedPiece !== null) {
      document.addEventListener('mousemove', handleGlobalMouseMove, { passive: false });
      document.addEventListener('mouseup', handleGlobalMouseUp, { passive: false });
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
      document.addEventListener('touchend', handleGlobalTouchEnd, { passive: false });
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [draggedPiece, dragOffset, handlePieceDrag, handlePieceDrop]);

  const startGame = () => {
    setGameStarted(true);
  };

  const resetGame = () => {
    setPieces(prev => prev.map(piece => ({
      ...piece,
      x: piece.originalX,
      y: piece.originalY,
      isPlaced: false
    })));
    setTimeSpent(0);
    setMovesCount(0);
    setHintsUsed(0);
    setScore(0);
    setGameCompleted(false);
    setShowHint(false);
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
        piecesPlaced: pieces.length,
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
          <p className="text-lg text-gray-600">Loading jigsaw puzzle...</p>
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
                Jigsaw • {difficulty} • {pieces.length} pieces • {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
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
                  <span className="text-3xl">🧩</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Jigsaw Puzzle</h2>
                <p className="text-gray-600 mb-4">
                  {isMobile ? 'Tap and drag interlocking pieces to complete the puzzle!' : 'Drag interlocking pieces to complete the jigsaw puzzle!'}
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
                  Start Jigsaw
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Game Layout */}
        {gameStarted && !gameCompleted && (
          <div className={`flex h-full ${isMobile ? 'flex-col' : ''}`}>
            {/* Left Side - Puzzle Board */}
            <div className={`${isMobile ? 'flex-1' : 'flex-1'} flex items-center justify-center p-6`}>
              <div className="relative">
                <div
                  ref={puzzleBoardRef}
                  className="relative bg-white rounded-xl shadow-2xl border-4 border-dashed border-gray-300 overflow-hidden"
                  style={{
                    width: isMobile ? Math.min(puzzleBoardSize.width, window.innerWidth - 40) : puzzleBoardSize.width,
                    height: isMobile ? Math.min(puzzleBoardSize.height, window.innerHeight * 0.4) : puzzleBoardSize.height,
                    backgroundImage: 'radial-gradient(circle, #f3f4f6 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    zIndex: 5
                  }}
                >
                  {/* Grid overlay for guidance */}
                  <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: difficultyConfig[difficulty].rows }).map((_, row) =>
                      Array.from({ length: difficultyConfig[difficulty].cols }).map((_, col) => {
                        const isOccupied = pieces.some(p => 
                          p.isPlaced && 
                          Math.abs(p.correctX - (col * (puzzleBoardSize.width / difficultyConfig[difficulty].cols))) < 5 &&
                          Math.abs(p.correctY - (row * (puzzleBoardSize.height / difficultyConfig[difficulty].rows))) < 5
                        );
                        
                        return (
                          <div
                            key={`${row}-${col}`}
                            className={`absolute border-2 transition-all duration-300 ${
                              isOccupied 
                                ? 'border-green-400 bg-green-50/30' 
                                : 'border-blue-300/50 bg-blue-50/20 hover:bg-blue-100/30'
                            }`}
                            style={{
                              left: `${(col / difficultyConfig[difficulty].cols) * 100}%`,
                              top: `${(row / difficultyConfig[difficulty].rows) * 100}%`,
                              width: `${100 / difficultyConfig[difficulty].cols}%`,
                              height: `${100 / difficultyConfig[difficulty].rows}%`
                            }}
                          >
                            {!isOccupied && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-4 h-4 border-2 border-dashed border-blue-400/50 rounded"></div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Placed pieces */}
                  {pieces.filter(p => p.isPlaced).map((piece) => (
                    <motion.div
                      key={piece.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute"
                      style={{
                        left: piece.correctX,
                        top: piece.correctY,
                        width: piece.width,
                        height: piece.height
                      }}
                    >
                      <img
                        src={piece.imageData}
                        alt={`Jigsaw piece ${piece.id}`}
                        className="w-full h-full object-cover shadow-lg"
                        style={{
                          border: '2px solid #10B981',
                          borderRadius: '4px'
                        }}
                      />
                    </motion.div>
                  ))}
                </div>

                <div className="text-center mt-4">
                  <div className="inline-flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-full">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Jigsaw Board</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Pieces Container */}
            <div className={`${isMobile ? 'h-1/2' : 'w-80'} bg-white/80 backdrop-blur-sm border-l border-gray-200 p-4`}>
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Grid3X3 className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-800">Jigsaw Pieces</h3>
                  </div>
                  <span className="text-sm text-gray-500">
                    {pieces.filter(p => !p.isPlaced).length} remaining
                  </span>
                </div>

                <div
                  ref={piecesContainerRef}
                  className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-dashed border-blue-300 p-4 relative"
                  style={{ 
                    minHeight: isMobile ? '200px' : '400px',
                    touchAction: 'none',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none',
                    zIndex: 10
                  }}
                >
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                      backgroundImage: 'radial-gradient(circle, #3B82F6 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                    }}></div>
                  </div>
                  
                  {pieces.filter(p => !p.isPlaced).map((piece) => (
                    <motion.div
                      key={piece.id}
                      data-piece-id={piece.id}
                      initial={{ scale: 0, rotate: 180 }}
                      animate={{ 
                        scale: 1, 
                        rotate: 0,
                        x: piece.x,
                        y: piece.y
                      }}
                      exit={{ scale: 0, rotate: -180 }}
                      className="absolute cursor-grab active:cursor-grabbing"
                      style={{
                        width: piece.width,
                        height: piece.height,
                        touchAction: 'none',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none',
                        zIndex: draggedPiece === piece.id ? 50 : 20
                      }}
                      onMouseDown={(e) => handleMouseDown(e, piece.id)}
                      onTouchStart={(e) => {
                        e.nativeEvent.preventDefault();
                        e.nativeEvent.stopPropagation();
                        handleTouchStart(e, piece.id);
                      }}
                      onTouchMove={(e) => {
                        e.nativeEvent.preventDefault();
                        e.nativeEvent.stopPropagation();
                        handleTouchMove(e);
                      }}
                      onTouchEnd={(e) => {
                        e.nativeEvent.preventDefault();
                        e.nativeEvent.stopPropagation();
                        handleTouchEnd(e);
                      }}
                    >
                      <img
                        src={piece.imageData}
                        alt={`Jigsaw piece ${piece.id}`}
                        className="w-full h-full object-cover shadow-lg rounded-sm hover:shadow-xl transition-shadow"
                        style={{
                          border: '2px solid #E5E7EB',
                          pointerEvents: 'none',
                          userSelect: 'none',
                          WebkitUserSelect: 'none',
                          MozUserSelect: 'none',
                          msUserSelect: 'none'
                        }}
                        draggable={false}
                      />
                    </motion.div>
                  ))}

                  {pieces.filter(p => !p.isPlaced).length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-sm">All pieces placed!</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex-1 p-3 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    title="Preview complete image"
                  >
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Preview</span>
                  </button>
                  
                  <button
                    onClick={useHint}
                    disabled={hintsUsed >= difficultyConfig[difficulty].maxHints}
                    className={`flex-1 p-3 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
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

        {/* Preview Overlay */}
        {showPreview && puzzle && (
          <div className="absolute inset-0 z-20 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-6 max-w-2xl mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Complete Image</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <img
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/${puzzle.imageUrl}`}
                alt="Complete puzzle"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Hint Overlay */}
        {showHint && (
          <div className="absolute inset-0 z-20 bg-yellow-100/80 flex items-center justify-center">
            <div className="bg-yellow-500 text-white px-6 py-3 rounded-full shadow-lg">
              <p className="text-lg font-semibold">💡 Hint: Look for matching interlocking edges!</p>
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
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Jigsaw Complete!</h2>
              <p className="text-gray-600 mb-4">
                Great job! You solved the jigsaw puzzle in {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
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

export default JigsawPuzzle;
        