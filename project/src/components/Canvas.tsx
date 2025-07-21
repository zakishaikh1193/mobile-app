import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Save, Download, Sparkles, Volume2 } from 'lucide-react';
import { LineArt, Tool } from '../types/lineArt';
import StickerPanel from './StickerPanel';

interface CanvasProps {
  artwork: LineArt;
  currentTool: Tool;
  currentColor: string;
  brushSize: number;
  onSave: (canvasData: string) => void;
}

const Canvas: React.FC<CanvasProps> = ({
  artwork,
  currentTool,
  currentColor,
  brushSize,
  onSave
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const undoStackRef = useRef<ImageData[]>([]);
  const redoStackRef = useRef<ImageData[]>([]);

  // Sound effects
  const playSound = useCallback((type: 'paint' | 'fill' | 'save' | 'celebrate') => {
    // In a real app, you'd play actual audio files
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
      case 'paint':
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        break;
      case 'fill':
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        break;
      case 'save':
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        break;
      case 'celebrate':
        oscillator.frequency.setValueAtTime(1046.50, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
        break;
    }
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!canvas || !overlayCanvas) return;

    const ctx = canvas.getContext('2d');
    const overlayCtx = overlayCanvas.getContext('2d');
    if (!ctx || !overlayCtx) return;

    // Set canvas size
    canvas.width = 600;
    canvas.height = 600;
    overlayCanvas.width = 600;
    overlayCanvas.height = 600;

    // Draw the line art on overlay canvas
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = artwork.svgContent;
    const svg = tempDiv.querySelector('svg');
    if (svg) {
      svg.setAttribute('width', '600');
      svg.setAttribute('height', '600');
      
      const data = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      img.onload = () => {
        overlayCtx.drawImage(img, 0, 0);
        saveState();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(data);
    }

    // Set up canvas context
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [artwork]);

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStackRef.current.push(imageData);
    
    if (undoStackRef.current.length > 20) {
      undoStackRef.current.shift();
    }
    
    redoStackRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, []);

  const undo = useCallback(() => {
    if (undoStackRef.current.length <= 1) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentState = undoStackRef.current.pop()!;
    redoStackRef.current.push(currentState);

    const previousState = undoStackRef.current[undoStackRef.current.length - 1];
    ctx.putImageData(previousState, 0, 0);

    setCanUndo(undoStackRef.current.length > 1);
    setCanRedo(true);
  }, []);

  const redo = useCallback(() => {
    if (redoStackRef.current.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nextState = redoStackRef.current.pop()!;
    undoStackRef.current.push(nextState);
    ctx.putImageData(nextState, 0, 0);

    setCanUndo(true);
    setCanRedo(redoStackRef.current.length > 0);
  }, []);

  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }, []);

  const getTouchPos = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const touch = e.touches[0];

    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY
    };
  }, []);

  const floodFill = useCallback((startX: number, startY: number, fillColor: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    const startPos = (Math.floor(startY) * canvas.width + Math.floor(startX)) * 4;
    const startR = data[startPos];
    const startG = data[startPos + 1];
    const startB = data[startPos + 2];
    const startA = data[startPos + 3];

    const fillColorRgb = hexToRgb(fillColor);
    if (!fillColorRgb) return;

    if (
      startR === fillColorRgb.r &&
      startG === fillColorRgb.g &&
      startB === fillColorRgb.b
    ) return;

    const pixelStack = [[Math.floor(startX), Math.floor(startY)]];

    while (pixelStack.length) {
      const [x, y] = pixelStack.pop()!;
      if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) continue;

      const pos = (y * canvas.width + x) * 4;
      
      if (
        data[pos] === startR &&
        data[pos + 1] === startG &&
        data[pos + 2] === startB &&
        data[pos + 3] === startA
      ) {
        data[pos] = fillColorRgb.r;
        data[pos + 1] = fillColorRgb.g;
        data[pos + 2] = fillColorRgb.b;
        data[pos + 3] = 255;

        pixelStack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      }
    }

    ctx.putImageData(imageData, 0, 0);
    playSound('fill');
  }, [currentColor, playSound]);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const startDrawing = useCallback((pos: { x: number, y: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (currentTool === 'bucket') {
      saveState();
      floodFill(pos.x, pos.y, currentColor);
      return;
    }

    setIsDrawing(true);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = currentTool === 'eraser' ? '#FFFFFF' : currentColor;
    ctx.globalCompositeOperation = currentTool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.lineWidth = currentTool === 'eraser' ? brushSize * 2 : brushSize;
    
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, [currentTool, currentColor, brushSize, floodFill, saveState]);

  const draw = useCallback((pos: { x: number, y: number }) => {
    if (!isDrawing || currentTool === 'bucket' || currentTool === 'sticker') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    playSound('paint');
  }, [isDrawing, currentTool, playSound]);

  const stopDrawing = useCallback(() => {
    if (isDrawing) {
      saveState();
    }
    setIsDrawing(false);
  }, [isDrawing, saveState]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    startDrawing(pos);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    draw(pos);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const pos = getTouchPos(e);
    startDrawing(pos);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const pos = getTouchPos(e);
    draw(pos);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL('image/png');
    onSave(dataURL);
    playSound('celebrate');
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    saveState();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Canvas Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-3 rounded-full shadow-lg transform hover:scale-110 transition-all duration-200 disabled:transform-none"
            aria-label="Undo"
          >
            ↶
          </button>
          
          <button
            onClick={redo}
            disabled={!canRedo}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-3 rounded-full shadow-lg transform hover:scale-110 transition-all duration-200 disabled:transform-none"
            aria-label="Redo"
          >
            ↷
          </button>

          <button
            onClick={handleClear}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-full shadow-lg transform hover:scale-110 transition-all duration-200"
            aria-label="Clear Canvas"
          >
            🗑️ Clear
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowStickers(!showStickers)}
            className={`$${
              currentTool === 'sticker' ? 'bg-purple-600' : 'bg-purple-500 hover:bg-purple-600'
            } text-white p-3 rounded-full shadow-lg transform hover:scale-110 transition-all duration-200`}
            aria-label="Toggle Stickers"
          >
            <Sparkles className="h-6 w-6" />
          </button>

          <button
            onClick={handleSave}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full shadow-lg transform hover:scale-110 transition-all duration-200 flex items-center space-x-2"
            aria-label="Save Artwork"
          >
            <Save className="h-5 w-5" />
            <span>Save Art!</span>
          </button>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 flex items-center justify-center relative">
        <div className="relative bg-white rounded-2xl shadow-2xl p-4 max-w-full max-h-full">
          <canvas
            ref={canvasRef}
            className="absolute top-4 left-4 rounded-lg cursor-crosshair touch-none"
            style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 300px)' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={stopDrawing}
            aria-label="Drawing Canvas"
          />
          <canvas
            ref={overlayCanvasRef}
            className="relative rounded-lg pointer-events-none opacity-30"
            style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 300px)' }}
            aria-hidden="true"
          />
        </div>

        {/* Sticker Panel */}
        {showStickers && (
          <StickerPanel
            onStickerSelect={(sticker) => {
              // Add sticker to canvas
              const canvas = canvasRef.current;
              if (!canvas) return;
              const ctx = canvas.getContext('2d');
              if (!ctx) return;
              saveState();
              ctx.font = '48px Arial';
              ctx.fillText(sticker.emoji, Math.random() * 400, Math.random() * 400 + 50);
            }}
            onClose={() => setShowStickers(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Canvas; 