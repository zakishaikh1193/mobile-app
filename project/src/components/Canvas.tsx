import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
// Removed unused imports
import { LineArt, Tool } from '../types/lineArt';
import StickerPanel from './StickerPanel';
import { useAudio } from '../contexts/AudioContext';

interface CanvasProps {
  artwork: LineArt;
  currentTool: Tool;
  currentColor: string;
  brushSize: number;
  brushStyle: string;
  onSave: (canvasData: string) => void;
  onChange?: () => void;
}

const Canvas = forwardRef<any, CanvasProps>(({ artwork, currentTool, currentColor, brushSize, brushStyle, onSave, onChange }, ref) => {
  // Refs to always have latest tool/color/size
  const toolRef = useRef(currentTool);
  const colorRef = useRef(currentColor);
  const sizeRef = useRef(brushSize);
  React.useEffect(() => { toolRef.current = currentTool; }, [currentTool]);
  React.useEffect(() => { colorRef.current = currentColor; }, [currentColor]);
  React.useEffect(() => { sizeRef.current = brushSize; }, [brushSize]);
  
  // Multi-layer canvas approach
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null); // Background image + line art (never erased)
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null); // User's drawing layer (can be erased)
  const compositeCanvasRef = useRef<HTMLCanvasElement>(null); // Final composite for export
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [, setCanUndo] = useState(false);
  const [, setCanRedo] = useState(false);
  const undoStackRef = useRef<ImageData[]>([]);
  const redoStackRef = useRef<ImageData[]>([]);

  // Sticker state
  const [stickers, setStickers] = useState<Array<{ id: number, emoji: string, x: number, y: number, size: number }>>([]);
  const stickerIdRef = useRef(0);
  const [draggingSticker, setDraggingSticker] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [resizingSticker, setResizingSticker] = useState<number | null>(null);

  // Audio context
  const { playSound: playAudioSound } = useAudio();

  // Sound effects
  const playSound = useCallback((type: 'paint' | 'fill' | 'save' | 'celebrate') => {
    switch (type) {
      case 'paint':
        playAudioSound('click');
        break;
      case 'fill':
        playAudioSound('success');
        break;
      case 'save':
        playAudioSound('success');
        break;
      case 'celebrate':
        playAudioSound('celebration');
        break;
    }
  }, [playAudioSound]);

  useEffect(() => {
    const backgroundCanvas = backgroundCanvasRef.current;
    const drawingCanvas = drawingCanvasRef.current;
    const compositeCanvas = compositeCanvasRef.current;
    
    if (!backgroundCanvas || !drawingCanvas || !compositeCanvas) return;

    // Set canvas sizes
    [backgroundCanvas, drawingCanvas, compositeCanvas].forEach(canvas => {
      canvas.width = 600;
      canvas.height = 600;
    });

    const backgroundCtx = backgroundCanvas.getContext('2d');
    const drawingCtx = drawingCanvas.getContext('2d');
    
    if (!backgroundCtx || !drawingCtx) return;

    // Set up drawing canvas context
    drawingCtx.lineCap = 'round';
    drawingCtx.lineJoin = 'round';
    
    // Clear the drawing canvas to be fully transparent
    drawingCtx.clearRect(0, 0, 600, 600);

    // Clear and set up background canvas with white background
    backgroundCtx.fillStyle = 'white';
    backgroundCtx.fillRect(0, 0, 600, 600);

    // Draw the background image/line art on background canvas
    if (artwork.svgContent.trim().startsWith('<svg')) {
      // Handle SVG content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = artwork.svgContent;
      const svg = tempDiv.querySelector('svg');
      if (svg) {
        svg.setAttribute('width', '600');
        svg.setAttribute('height', '600');
        const data = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        img.onload = () => {
          backgroundCtx.drawImage(img, 0, 0);
          saveState();
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(data);
      }
    } else if (artwork.svgContent) {
      // Handle image URL
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Calculate dimensions to fit the image properly
        const maxSize = 600;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        const width = img.width * scale;
        const height = img.height * scale;
        const x = (600 - width) / 2;
        const y = (600 - height) / 2;
        
        backgroundCtx.drawImage(img, x, y, width, height);
        saveState();
      };
      img.onerror = () => {
        console.error('Failed to load background image');
        saveState();
      };
      img.src = artwork.svgContent;
    } else {
      saveState();
    }
  }, [artwork.id, artwork.svgContent]);

  const saveState = useCallback(() => {
    const drawingCanvas = drawingCanvasRef.current;
    if (!drawingCanvas) return;

    const ctx = drawingCanvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height);
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

    const drawingCanvas = drawingCanvasRef.current;
    if (!drawingCanvas) return;

    const ctx = drawingCanvas.getContext('2d');
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

    const drawingCanvas = drawingCanvasRef.current;
    if (!drawingCanvas) return;

    const ctx = drawingCanvas.getContext('2d');
    if (!ctx) return;

    const nextState = redoStackRef.current.pop()!;
    undoStackRef.current.push(nextState);
    ctx.putImageData(nextState, 0, 0);

    setCanUndo(true);
    setCanRedo(redoStackRef.current.length > 0);
  }, []);

  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const drawingCanvas = drawingCanvasRef.current;
    if (!drawingCanvas) return { x: 0, y: 0 };

    const rect = drawingCanvas.getBoundingClientRect();
    const scaleX = drawingCanvas.width / rect.width;
    const scaleY = drawingCanvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }, []);

  const getTouchPos = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const drawingCanvas = drawingCanvasRef.current;
    if (!drawingCanvas) return { x: 0, y: 0 };

    const rect = drawingCanvas.getBoundingClientRect();
    const scaleX = drawingCanvas.width / rect.width;
    const scaleY = drawingCanvas.height / rect.height;
    const touch = e.touches[0];

    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY
    };
  }, []);

  // Function to composite all layers for saving
  const compositeLayers = useCallback(() => {
    const backgroundCanvas = backgroundCanvasRef.current;
    const drawingCanvas = drawingCanvasRef.current;
    const compositeCanvas = compositeCanvasRef.current;
    
    if (!backgroundCanvas || !drawingCanvas || !compositeCanvas) return null;

    const compositeCtx = compositeCanvas.getContext('2d');
    if (!compositeCtx) return null;

    // Clear composite canvas and set white background
    compositeCtx.fillStyle = 'white';
    compositeCtx.fillRect(0, 0, 600, 600);
    
    // Draw background layer first (background + line art)
    compositeCtx.drawImage(backgroundCanvas, 0, 0);
    
    // Draw user's drawing layer on top
    compositeCtx.globalCompositeOperation = 'source-over';
    compositeCtx.drawImage(drawingCanvas, 0, 0);
    
    // Lightly overlay the line art to ensure edges are visible in saved image
    // This ensures teachers can see boundaries without making them too dark
    compositeCtx.globalCompositeOperation = 'source-over';
    compositeCtx.globalAlpha = 0.4; // Slightly more visible in saved image
    compositeCtx.drawImage(backgroundCanvas, 0, 0);
    
    // Reset composite operation and alpha
    compositeCtx.globalCompositeOperation = 'source-over';
    compositeCtx.globalAlpha = 1.0;
    
    console.log('Composite layers created - Background:', backgroundCanvas.width, 'x', backgroundCanvas.height, 'Drawing:', drawingCanvas.width, 'x', drawingCanvas.height);
    
    return compositeCanvas;
  }, []);

  const floodFill = useCallback((startX: number, startY: number, fillColor: string, tolerance: number = 32) => {
    const drawingCanvas = drawingCanvasRef.current;
    if (!drawingCanvas) return;

    const ctx = drawingCanvas.getContext('2d');
    if (!ctx) return;

    // Get the drawing canvas data only
    const imageData = ctx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height);
    const data = imageData.data;
    
    const startPos = (Math.floor(startY) * drawingCanvas.width + Math.floor(startX)) * 4;
    const startR = data[startPos];
    const startG = data[startPos + 1];
    const startB = data[startPos + 2];
    const startA = data[startPos + 3];

    // Prevent filling on transparent areas
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
      if (x < 0 || y < 0 || x >= drawingCanvas.width || y >= drawingCanvas.height) continue;

      const pos = (y * drawingCanvas.width + x) * 4;
      if (colorMatch(pos) && !isAlreadyFilled(pos) && fillColorRgb) {
        data[pos] = fillColorRgb.r;
        data[pos + 1] = fillColorRgb.g;
        data[pos + 2] = fillColorRgb.b;
        data[pos + 3] = 255;

        pixelStack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      }
    }

    ctx.putImageData(imageData, 0, 0);
    
    // After filling, lightly overlay the line art to keep edges visible
    const backgroundCanvas = backgroundCanvasRef.current;
    if (backgroundCanvas) {
      ctx.save();
      ctx.globalCompositeOperation = 'darken'; // Use darken to only show the dark lines
      ctx.globalAlpha = 0.3; // Light overlay for visible edges
      ctx.drawImage(backgroundCanvas, 0, 0);
      ctx.restore();
    }
    
    playSound('fill');
    
    // Notify parent component of changes
    if (onChange) {
      onChange();
    }
  }, [currentColor, playSound, onChange]);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const startDrawing = useCallback((pos: { x: number, y: number }) => {
    const drawingCanvas = drawingCanvasRef.current;
    if (!drawingCanvas) return;

    const ctx = drawingCanvas.getContext('2d');
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
      // Eraser only affects the drawing layer, not the background
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

    const drawingCanvas = drawingCanvasRef.current;
    const backgroundCanvas = backgroundCanvasRef.current;
    if (!drawingCanvas || !backgroundCanvas) return;

    const ctx = drawingCanvas.getContext('2d');
    if (!ctx) return;

    if (toolRef.current === 'eraser') {
      // Eraser only affects the drawing layer, background is preserved
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.lineWidth = sizeRef.current * 2;
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      playSound('paint');
    } else if (toolRef.current === 'brush') {
      // First draw the brush stroke
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = colorRef.current;
      ctx.lineWidth = sizeRef.current;
      
      // Make brush strokes semi-transparent so line art from background canvas shows through
      if (brushStyle === 'round') {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = 0.6; // Semi-transparent so background lines show through
      } else if (brushStyle === 'square') {
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'miter';
        ctx.globalAlpha = 0.6; 
      } else if (brushStyle === 'marker') {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = 0.5; // Marker more transparent
      } else if (brushStyle === 'calligraphy') {
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'bevel';
        ctx.globalAlpha = 0.7; // Calligraphy slightly more opaque
        ctx.setLineDash([sizeRef.current * 2, sizeRef.current]);
      } else {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = 0.6; // Default semi-transparent
      }
      if (brushStyle !== 'calligraphy') ctx.setLineDash([]);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      
      // After drawing the brush stroke, lightly overlay the line art from background canvas
      // This ensures line art edges are always visible while drawing
      const backgroundCanvas = backgroundCanvasRef.current;
      if (backgroundCanvas) {
        ctx.save();
        ctx.globalCompositeOperation = 'darken'; // Use darken to only show the dark lines
        ctx.globalAlpha = 0.3; // Light overlay for visible edges
        ctx.drawImage(backgroundCanvas, 0, 0);
        ctx.restore();
      }
      
      playSound('paint');
    }
    
    // Notify parent component of changes
    if (onChange) {
      onChange();
    }
  }, [isDrawing, playSound, onChange, brushStyle]);

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
    // Removed localStorage storage of large base64 images
    // Art gallery should be handled via backend storage/database
    console.log('Artwork saved (should be handled via backend API)', { dataUrl: dataUrl.substring(0, 50) + '...' });
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
    console.log('Saving artwork with background image included...');

    // Debug: Check canvas content
    const backgroundCanvas = backgroundCanvasRef.current;
    const drawingCanvas = drawingCanvasRef.current;
    
    if (backgroundCanvas && drawingCanvas) {
      console.log('Background canvas:', backgroundCanvas.width, 'x', backgroundCanvas.height);
      console.log('Drawing canvas:', drawingCanvas.width, 'x', drawingCanvas.height);
      
      // Create debug images
      const bgDataURL = backgroundCanvas.toDataURL('image/png');
      const drawingDataURL = drawingCanvas.toDataURL('image/png');
      console.log('Background canvas data length:', bgDataURL.length);
      console.log('Drawing canvas data length:', drawingDataURL.length);
    }

    // Composite all layers for saving
    const compositeCanvas = compositeLayers();
    if (!compositeCanvas) {
      console.error('Could not composite layers for saving');
      return;
    }

    const dataURL = compositeCanvas.toDataURL('image/png');
    console.log('Composite image data length:', dataURL.length);
    console.log('Image saved with background and drawings included');
    onSave(dataURL);
    playSound('celebrate');
    saveToGallery(dataURL);
    downloadImage(dataURL, 'my-art.png');
  };

  const handleClear = () => {
    const drawingCanvas = drawingCanvasRef.current;
    if (!drawingCanvas) return;

    const ctx = drawingCanvas.getContext('2d');
    if (!ctx) return;

    saveState();
    
    // Clear only the drawing layer, background stays intact
    ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
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
    redo,
    handleSave,
    handleClear,
    compositeLayers
  }));

  return (
    <div className="flex flex-col h-full">
      {/* Canvas Container */}
      <div className="flex-1 flex items-center justify-center relative w-full h-full" style={{ minHeight: 600, minWidth: 600 }}>
        {/* Background Canvas (Line art + background image) */}
        <canvas
          ref={backgroundCanvasRef}
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          style={{ zIndex: 1, width: 600, height: 600, pointerEvents: 'none' }}
          width={600}
          height={600}
          aria-label="Background Canvas"
        />
        
        {/* Drawing Canvas (User's drawings) */}
        <canvas
          ref={drawingCanvasRef}
          className="absolute top-0 left-0 w-full h-full rounded-lg cursor-crosshair touch-none"
          style={{ zIndex: 2, width: 600, height: 600, touchAction: 'none' }}
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
        
        {/* Hidden Composite Canvas for exporting */}
        <canvas
          ref={compositeCanvasRef}
          className="hidden"
          width={600}
          height={600}
          aria-label="Composite Canvas"
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
