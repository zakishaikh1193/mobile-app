import React, { useState, useRef } from 'react';
import { lineArtData } from '../data/lineArt';
import { LineArt, Tool } from '../types/lineArt';
import Canvas from './Canvas';
import Toolbar from './Toolbar';
import { Brush, Droplet, Eraser, Type, Zap, RotateCcw } from 'lucide-react';

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
  '#FFB347', '#FFD700', '#FFA07A', '#B0E0E6', '#E6E6FA', '#C1FFC1',
  '#FF69B4', '#FF6347', '#40E0D0', '#A0522D', '#8A2BE2', '#00CED1',
  '#FFDAB9', '#E0FFFF', '#F08080', '#B22222', '#228B22', '#20B2AA', '#9370DB'
];

const GRADIENTS = [
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
  'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
  'linear-gradient(135deg, #fdcbf1 0%, #e6dee9 100%)',
  'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
];

const BRUSH_STYLES = [
  { value: 'round', label: 'Round' },
  { value: 'square', label: 'Square' },
  { value: 'marker', label: 'Marker' },
  { value: 'calligraphy', label: 'Calligraphy' },
];

interface DigitalPaintingProps {
  onComplete: (score: number) => void;
  lineArt?: LineArt;
}

const DigitalPainting: React.FC<DigitalPaintingProps> = (props) => {
  const { onComplete, lineArt } = props;
  const art = lineArt || lineArtData[0];
  const [currentTool, setCurrentTool] = useState<Tool>('brush');
  const [currentColor, setCurrentColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(10);
  const [brushStyle, setBrushStyle] = useState('round');
  const [showSaved, setShowSaved] = useState(false);
  const [showStickerPanel, setShowStickerPanel] = useState(false);
  const canvasRef = useRef<any>(null);

  const handleSave = (dataUrl: string) => {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
    // Optionally, save to localStorage or backend here
  };

  // Handle toolbar actions
  const handleToolClick = (tool: Tool) => {
    setCurrentTool(tool);
    if (tool === 'sticker') {
      setShowStickerPanel(true);
    } else if (tool === 'text') {
      alert('Text tool coming soon!');
    } else if (tool === 'fx') {
      alert('FX tool coming soon!');
    }
  };

  // Undo and Save handlers (not tools)
  const handleUndo = () => {
    if (canvasRef.current?.undo) {
      canvasRef.current.undo();
    }
  };
  const handleSaveBtn = () => {
    if (canvasRef.current?.handleSave) {
      canvasRef.current.handleSave();
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 p-8">
      <div className="flex flex-col items-center">
        <img src={art.referenceImage} alt="Reference" className="w-48 h-48 object-cover rounded-2xl shadow mb-4" />
        <span className="font-bold text-lg text-purple-700">Reference</span>
      </div>
      <div className="flex-1 flex flex-col items-center">
        {/* New Tool Panel */}
        <div className="bg-orange-100 rounded-2xl shadow-xl p-4 flex flex-col items-center gap-3 mb-6 w-full max-w-xl mx-auto" style={{ border: '2px solid #f6d365' }}>
          <div className="flex flex-row gap-3 mb-2">
            <button
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow ${currentTool === 'brush' ? 'bg-white ring-4 ring-orange-300' : 'bg-orange-200 hover:bg-orange-300'}`}
              onClick={() => handleToolClick('brush')}
              aria-label="Brush"
            >
              <Brush />
            </button>
            <button
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow ${currentTool === 'fill' ? 'bg-white ring-4 ring-orange-300' : 'bg-orange-200 hover:bg-orange-300'}`}
              onClick={() => handleToolClick('fill')}
              aria-label="Fill"
            >
              <Droplet />
            </button>
            <button
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow ${currentTool === 'eraser' ? 'bg-white ring-4 ring-orange-300' : 'bg-orange-200 hover:bg-orange-300'}`}
              onClick={() => handleToolClick('eraser')}
              aria-label="Eraser"
            >
              <Eraser />
            </button>
            <button
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow ${currentTool === 'sticker' ? 'bg-white ring-4 ring-orange-300' : 'bg-orange-200 hover:bg-orange-300'}`}
              onClick={() => handleToolClick('sticker')}
              aria-label="Stickers"
            >
              <Zap />
            </button>
            <button
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow ${currentTool === 'text' ? 'bg-white ring-4 ring-orange-300' : 'bg-orange-200 hover:bg-orange-300'}`}
              onClick={() => handleToolClick('text')}
              aria-label="Text"
            >
              <Type />
            </button>
            <button
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow ${currentTool === 'fx' ? 'bg-white ring-4 ring-orange-300' : 'bg-orange-200 hover:bg-orange-300'}`}
              onClick={() => handleToolClick('fx')}
              aria-label="FX"
            >
              FX
            </button>
            <button
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow bg-orange-200 hover:bg-orange-300"
              onClick={handleUndo}
              aria-label="Undo"
            >
              <RotateCcw />
            </button>
            <button
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow bg-orange-200 hover:bg-orange-300"
              onClick={handleSaveBtn}
              aria-label="Save"
            >
              💾
            </button>
          </div>
          {/* Color Palette */}
          <div className="flex flex-wrap gap-2 justify-center mb-2">
            {COLORS.map((color) => (
              <button
                key={color}
                className={`w-10 h-10 rounded-full border-4 transition-all duration-200 ${currentColor === color ? 'border-black scale-110 shadow-lg' : 'border-white'} focus:outline-none focus:ring-4 focus:ring-blue-300`}
                style={{ background: color, minWidth: 36, minHeight: 36, touchAction: 'manipulation' }}
                onClick={() => setCurrentColor(color)}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
          {/* Brush/Eraser Size Slider */}
          <div className="flex flex-col items-center w-full mb-2">
            <label htmlFor="size-slider" className="text-sm font-medium mb-1">Size: {brushSize}</label>
            <input
              id="size-slider"
              type="range"
              min={2}
              max={60}
              value={brushSize}
              onChange={e => setBrushSize(Number(e.target.value))}
              className="w-48 accent-orange-400"
            />
            {/* Brush Style Dropdown (only when brush is selected) */}
            {currentTool === 'brush' && (
              <div className="flex flex-row items-center gap-2 mt-2">
                <label htmlFor="brush-style" className="text-sm">Style:</label>
                <select
                  id="brush-style"
                  value={brushStyle}
                  onChange={e => setBrushStyle(e.target.value)}
                  className="rounded border px-2 py-1"
                >
                  {BRUSH_STYLES.map(style => (
                    <option key={style.value} value={style.value}>{style.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {/* Gradients/Patterns Row (now selectable) */}
          <div className="flex flex-row gap-2 justify-center">
            {GRADIENTS.map((grad, idx) => {
              // Pick a representative solid color for each gradient (first color in gradient)
              const solidColor = grad.match(/#([0-9a-fA-F]{6})/g)?.[0] || '#fff7e0';
              return (
                <button
                  key={idx}
                  className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${currentColor === solidColor ? 'border-black scale-110 shadow-lg' : 'border-white'} focus:outline-none focus:ring-4 focus:ring-blue-300`}
                  style={{ background: grad }}
                  aria-label={`Gradient ${idx + 1}`}
                  onClick={() => setCurrentColor(solidColor)}
                />
              );
            })}
            <button
              className="w-8 h-8 rounded-full border-2 border-white shadow bg-gradient-to-br from-pink-400 to-blue-400 flex items-center justify-center"
              aria-label="Color Picker"
              disabled
            >
              <span className="w-4 h-4 rounded-full bg-white border border-gray-300" />
            </button>
          </div>
        </div>
        {/* Canvas or PNG coloring */}
        {art.svgContent.trim().startsWith('<svg') ? (
          <Canvas
            artwork={art}
            currentTool={currentTool}
            currentColor={currentColor}
            brushSize={brushSize}
            brushStyle={brushStyle}
            onSave={handleSave}
            ref={canvasRef}
          />
        ) : (
          <div className="relative bg-white rounded-3xl shadow-2xl p-4 max-w-full max-h-full flex items-center justify-center" style={{ width: 600, height: 600 }}>
            <img
              src={art.svgContent}
              alt="Line Art"
              className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none select-none"
              style={{ zIndex: 1 }}
            />
            <div className="absolute top-0 left-0 w-full h-full" style={{ zIndex: 2 }}>
              <Canvas
                artwork={{ ...art, svgContent: '' }}
                currentTool={currentTool}
                currentColor={currentColor}
                brushSize={brushSize}
                brushStyle={brushStyle}
                onSave={handleSave}
                ref={canvasRef}
              />
            </div>
          </div>
        )}
        {showSaved && (
          <div className="mt-4 text-green-600 font-bold text-lg animate-pulse">Artwork saved!</div>
        )}
      </div>
    </div>
  );
};

export default DigitalPainting; 