import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Save, Download, Sparkles, Volume2 } from 'lucide-react';
import { LineArt, Tool } from '../types/lineArt';
import StickerPanel from './StickerPanel';

interface CanvasProps {
  artwork: LineArt;
  currentTool: Tool;
  currentColor: string;
  brushSize: number;
  brushStyle: string;
  onSave: (canvasData: string) => void;
}

const Canvas = forwardRef<any, CanvasProps>(({ artwork, currentTool, currentColor, brushSize, brushStyle, onSave }, ref) => {
  // Refs to always have latest tool/color/size
  const toolRef = useRef(currentTool);
  const colorRef = useRef(currentColor);
  const sizeRef = useRef(brushSize);
  React.useEffect(() => { toolRef.current = currentTool; }, [currentTool]);
  React.useEffect(() => { colorRef.current = currentColor; }, [currentColor]);
  React.useEffect(() => { sizeRef.current = brushSize; }, [brushSize]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const undoStackRef = useRef<ImageData[]>([]);
  const redoStackRef = useRef<ImageData[]>([]);

  // Sticker state
  const [stickers, setStickers] = useState<Array<{ id: number, emoji: string, x: number, y: number, size: number }>>([]);
  const stickerIdRef = useRef(0);
  const [draggingSticker, setDraggingSticker] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [resizingSticker, setResizingSticker] = useState<number | null>(null);

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

    // Draw the line art on overlay canvas AND main canvas for fill boundaries
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = artwork.svgContent;
    const svg = tempDiv.querySelector('svg');
    if (svg) {
      svg.setAttribute('width', '600');
      svg.setAttribute('height', '600');
      const data = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      img.onload = () => {
        overlayCtx.clearRect(0, 0, 600, 600);
        overlayCtx.drawImage(img, 0, 0);
        ctx.drawImage(img, 0, 0); // Draw on main canvas for fill boundaries
        saveState();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(data);
    }

    // Set up canvas context
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [artwork.id]);

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

  const floodFill = useCallback((startX: number, startY: number, fillColor: string, tolerance: number = 32) => {
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

    // Prevent filling on transparent/line areas
    if (startA === 0) return;

    const fillColorRgb = hexToRgb(fillColor);
    if (!fillColorRgb) return;

    // Helper to check if a pixel matches the start color within tolerance
    function colorMatch(idx: number) {
      return (
        Math.abs(data[idx] - startR) <= tolerance &&
        Math.abs(data[idx + 1] - startG) <= tolerance &&
        Math.abs(data[idx + 2] - startB) <= tolerance &&
        Math.abs(data[idx + 3] - startA) <= tolerance
      );
    }

    // Helper to check if a pixel is already filled
    function isAlreadyFilled(idx: number) {
      if (!fillColorRgb) return false;
      return (
        data[idx] === fillColorRgb.r &&
        data[idx + 1] === fillColorRgb.g &&
        data[idx + 2] === fillColorRgb.b &&
        data[idx + 3] === 255
      );
    }

    const pixelStack = [[Math.floor(startX), Math.floor(startY)]];

    while (pixelStack.length) {
      const [x, y] = pixelStack.pop()!;
      if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) continue;

      const pos = (y * canvas.width + x) * 4;
      if (colorMatch(pos) && !isAlreadyFilled(pos) && fillColorRgb) {
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

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Always reset to default before setting tool-specific mode
    ctx.globalCompositeOperation = 'source-over';

    if (toolRef.current === 'fill') {
      saveState();
      floodFill(pos.x, pos.y, colorRef.current);
      return;
    }

    setIsDrawing(true);

    if (toolRef.current === 'brush') {
      ctx.strokeStyle = colorRef.current;
      ctx.lineWidth = sizeRef.current;
    } else if (toolRef.current === 'eraser') {
      // We'll implement color eraser logic in draw
      ctx.strokeStyle = 'rgba(0,0,0,0)'; // transparent, but logic will be in draw
      ctx.lineWidth = sizeRef.current * 2;
    }
    // Stickers and other tools do not draw

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, [floodFill, saveState]);

  const draw = useCallback((pos: { x: number, y: number }) => {
    if (!isDrawing) return;
    if (toolRef.current === 'fill' || toolRef.current === 'sticker') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (toolRef.current === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.lineWidth = sizeRef.current * 2;
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      playSound('paint');
    } else if (toolRef.current === 'brush') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = colorRef.current;
      ctx.lineWidth = sizeRef.current;
      // Brush style logic
      if (brushStyle === 'round') {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = 1.0;
      } else if (brushStyle === 'square') {
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'miter';
        ctx.globalAlpha = 1.0;
      } else if (brushStyle === 'marker') {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = 0.4;
      } else if (brushStyle === 'calligraphy') {
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'bevel';
        ctx.globalAlpha = 1.0;
        ctx.setLineDash([sizeRef.current * 2, sizeRef.current]);
      } else {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = 1.0;
      }
      if (brushStyle !== 'calligraphy') ctx.setLineDash([]);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      playSound('paint');
    }
  }, [isDrawing, playSound]);

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

  const saveToGallery = (dataUrl: string) => {
    const key = 'my_arts_gallery';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const newArt = { dataUrl, date: Date.now() };
    localStorage.setItem(key, JSON.stringify([newArt, ...existing]));
  };

  const downloadImage = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL('image/png');
    onSave(dataURL);
    playSound('celebrate');
    saveToGallery(dataURL);
    downloadImage(dataURL, 'my-art.png');
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    saveState();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Add sticker handler
  const handleAddSticker = (sticker: { emoji: string }) => {
    const newId = stickerIdRef.current++;
    setStickers(prev => [
      ...prev,
      { id: newId, emoji: sticker.emoji, x: 300, y: 300, size: 48 }
    ]);
    setShowStickers(false);
  };

  // Drag sticker handlers
  const handleStickerMouseDown = (id: number, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    let clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    let clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const sticker = stickers.find(s => s.id === id);
    if (!sticker) return;
    setDraggingSticker(id);
    setDragOffset({ x: clientX - sticker.x, y: clientY - sticker.y });
  };

  const handleStickerMouseMove = (e: MouseEvent | TouchEvent) => {
    if (draggingSticker === null) return;
    let clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    let clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    setStickers(prev => prev.map(s =>
      s.id === draggingSticker ? { ...s, x: clientX - dragOffset.x, y: clientY - dragOffset.y } : s
    ));
  };

  const handleStickerMouseUp = () => {
    setDraggingSticker(null);
  };

  // Resize sticker handlers
  const handleResizeMouseDown = (id: number, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setResizingSticker(id);
  };
  const handleResizeMouseMove = (e: MouseEvent | TouchEvent) => {
    if (resizingSticker === null) return;
    let clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    let clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    setStickers(prev => prev.map(s =>
      s.id === resizingSticker ? { ...s, size: Math.max(24, Math.min(120, s.size + (clientX - s.x) / 10)) } : s
    ));
  };
  const handleResizeMouseUp = () => {
    setResizingSticker(null);
  };

  useEffect(() => {
    if (draggingSticker !== null) {
      window.addEventListener('mousemove', handleStickerMouseMove);
      window.addEventListener('touchmove', handleStickerMouseMove);
      window.addEventListener('mouseup', handleStickerMouseUp);
      window.addEventListener('touchend', handleStickerMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleStickerMouseMove);
        window.removeEventListener('touchmove', handleStickerMouseMove);
        window.removeEventListener('mouseup', handleStickerMouseUp);
        window.removeEventListener('touchend', handleStickerMouseUp);
      };
    }
    if (resizingSticker !== null) {
      window.addEventListener('mousemove', handleResizeMouseMove);
      window.addEventListener('touchmove', handleResizeMouseMove);
      window.addEventListener('mouseup', handleResizeMouseUp);
      window.addEventListener('touchend', handleResizeMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleResizeMouseMove);
        window.removeEventListener('touchmove', handleResizeMouseMove);
        window.removeEventListener('mouseup', handleResizeMouseUp);
        window.removeEventListener('touchend', handleResizeMouseUp);
      };
    }
  }, [draggingSticker, resizingSticker]);

  useImperativeHandle(ref, () => ({
    undo,
    handleSave
  }));

  return (
    <div className="flex flex-col h-full">
      {/* Canvas Container */}
      <div className="flex-1 flex items-center justify-center relative w-full h-full" style={{ minHeight: 600, minWidth: 600 }}>
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full rounded-lg cursor-crosshair touch-none bg-transparent"
          style={{ zIndex: 2, background: 'transparent', width: 600, height: 600, touchAction: 'none' }}
          width={600}
          height={600}
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
          className="absolute top-0 left-0 w-full h-full rounded-lg pointer-events-none opacity-30"
          style={{ zIndex: 1, background: 'transparent', width: 600, height: 600 }}
          width={600}
          height={600}
          aria-hidden="true"
        />
        {/* Sticker Panel */}
        {showStickers && (
          <StickerPanel
            onStickerSelect={handleAddSticker}
            onClose={() => setShowStickers(false)}
          />
        )}
        {/* Render stickers as draggable/resizable overlays */}
        {stickers.map(sticker => (
          <div
            key={sticker.id}
            className="absolute"
            style={{ left: sticker.x, top: sticker.y, zIndex: 10, touchAction: 'none', userSelect: 'none' }}
            onMouseDown={e => handleStickerMouseDown(sticker.id, e)}
            onTouchStart={e => handleStickerMouseDown(sticker.id, e)}
          >
            <span style={{ fontSize: sticker.size, cursor: 'move', display: 'inline-block' }}>{sticker.emoji}</span>
            <span
              className="inline-block ml-1 bg-gray-200 rounded-full p-1 cursor-ew-resize"
              style={{ fontSize: 16 }}
              onMouseDown={e => handleResizeMouseDown(sticker.id, e)}
              onTouchStart={e => handleResizeMouseDown(sticker.id, e)}
            >↔️</span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default Canvas; 