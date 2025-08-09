import React, { useState, useRef } from 'react';
import { lineArtData } from '../data/lineArt';
import { LineArt, Tool } from '../types/lineArt';
import Canvas from './Canvas';
import Toolbar from './Toolbar';
import ActivityCompletionButton from './ActivityCompletionButton';
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
  const [showMyArts, setShowMyArts] = useState(false);
  const [savedArts, setSavedArts] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const canvasRef = useRef<any>(null);

  const handleSave = (dataUrl: string) => {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
    setHasUnsavedChanges(false);
    
    // Add to saved arts in memory only
    setSavedArts(prev => [dataUrl, ...prev.slice(0, 9)]); // Keep only 10 most recent
    
    // Removed localStorage storage of large base64 images
    // Art gallery should be handled via backend storage/database
    console.log('Artwork saved to session gallery (not persisted)');
  };

  const handleCanvasChange = () => {
    setHasUnsavedChanges(true);
  };

  const saveEntireContainer = () => {
    // Use html2canvas to capture the entire container
    const container = document.querySelector('.digital-painting-container');
    if (container) {
      import('html2canvas').then(({ default: html2canvas }) => {
        html2canvas(container as HTMLElement, {
          backgroundColor: '#ffffff',
          scale: 2, // Higher quality
          useCORS: true,
          allowTaint: true
        }).then(canvas => {
          const dataURL = canvas.toDataURL('image/png');
          handleSave(dataURL);
        });
      });
    }
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

  // Removed localStorage loading of saved arts
  // Art gallery should be loaded from backend/database
  React.useEffect(() => {
    // Start with empty gallery - should load from backend API
    setSavedArts([]);
  }, []);

  // Undo handler
  const handleUndo = () => {
    if (canvasRef.current?.undo) {
      canvasRef.current.undo();
    }
  };

  return (
    <div className="digital-painting-container flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-4 p-2 lg:p-4 h-screen bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden">
      <div className="flex flex-col items-center mb-2 lg:mb-0 lg:w-48 flex-shrink-0">
        <img src={art.referenceImage} alt="Reference" className="w-16 h-16 sm:w-20 sm:h-20 lg:w-48 lg:h-48 object-cover rounded-2xl shadow-lg border-2 border-purple-200" />
        <span className="font-bold text-xs sm:text-sm lg:text-lg text-purple-700 mt-1 lg:mt-2">Reference</span>
      </div>
      <div className="flex-1 flex flex-col items-center w-full max-w-full lg:max-w-4xl h-full">
        {/* Tool Panel - Responsive */}
        <div className="bg-orange-100 rounded-2xl shadow-xl p-2 sm:p-3 flex flex-col items-center gap-2 mb-2 lg:mb-4 w-full max-w-sm mx-auto" style={{ border: '2px solid #f6d365' }}>
          <div className="grid grid-cols-4 gap-1 sm:gap-2 mb-2 w-full">
            <button
              className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center shadow transition-all ${currentTool === 'brush' ? 'bg-white ring-2 ring-orange-300' : 'bg-orange-200 hover:bg-orange-300'}`}
              onClick={() => handleToolClick('brush')}
              aria-label="Brush"
            >
              <Brush className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            </button>
            <button
              className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center shadow transition-all ${currentTool === 'fill' ? 'bg-white ring-2 ring-orange-300' : 'bg-orange-200 hover:bg-orange-300'}`}
              onClick={() => handleToolClick('fill')}
              aria-label="Fill"
            >
              <Droplet className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            </button>
            <button
              className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center shadow transition-all ${currentTool === 'eraser' ? 'bg-white ring-2 ring-orange-300' : 'bg-orange-200 hover:bg-orange-300'}`}
              onClick={() => handleToolClick('eraser')}
              aria-label="Eraser"
            >
              <Eraser className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            </button>
            <button
              className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center shadow transition-all ${currentTool === 'sticker' ? 'bg-white ring-2 ring-orange-300' : 'bg-orange-200 hover:bg-orange-300'}`}
              onClick={() => handleToolClick('sticker')}
              aria-label="Stickers"
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            </button>
            <button
              className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center shadow transition-all ${currentTool === 'text' ? 'bg-white ring-2 ring-orange-300' : 'bg-orange-200 hover:bg-orange-300'}`}
              onClick={() => handleToolClick('text')}
              aria-label="Text"
            >
              <Type className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            </button>
            <button
              className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center text-xs shadow transition-all ${currentTool === 'fx' ? 'bg-white ring-2 ring-orange-300' : 'bg-orange-200 hover:bg-orange-300'}`}
              onClick={() => handleToolClick('fx')}
              aria-label="FX"
            >
              FX
            </button>
            <button
              className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center shadow bg-orange-200 hover:bg-orange-300 transition-all"
              onClick={handleUndo}
              aria-label="Undo"
            >
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            </button>
            <button
              className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center shadow bg-orange-200 hover:bg-orange-300 transition-all"
              onClick={() => setShowMyArts(!showMyArts)}
              aria-label="My Arts"
            >
              🎨
            </button>
            <button
              className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center shadow bg-green-200 hover:bg-green-300 transition-all"
              onClick={saveEntireContainer}
              aria-label="Save Artwork"
            >
              💾
            </button>
          </div>
          {/* Color Palette - Responsive Grid */}
          <div className="grid grid-cols-5 gap-1 sm:gap-2 justify-center mb-2 w-full">
            {COLORS.slice(0, 15).map((color) => (
              <button
                key={color}
                className={`w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full border-2 transition-all duration-200 ${currentColor === color ? 'border-black scale-110 shadow-lg' : 'border-white'} focus:outline-none focus:ring-2 focus:ring-blue-300`}
                style={{ background: color, minWidth: 24, minHeight: 24, touchAction: 'manipulation' }}
                onClick={() => setCurrentColor(color)}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
          {/* Brush/Eraser Size Slider - Responsive */}
          <div className="flex flex-col items-center w-full mb-2">
            <label htmlFor="size-slider" className="text-xs sm:text-sm font-medium mb-1">Size: {brushSize}</label>
            <input
              id="size-slider"
              type="range"
              min={2}
              max={60}
              value={brushSize}
              onChange={e => setBrushSize(Number(e.target.value))}
              className="w-24 sm:w-32 lg:w-40 accent-orange-400"
            />
            {/* Brush Style Dropdown - Responsive (Always visible to prevent layout shift) */}
            <div className="flex flex-row items-center gap-1 sm:gap-2 mt-1">
              <label htmlFor="brush-style" className="text-xs sm:text-sm">Style:</label>
              <select
                id="brush-style"
                value={brushStyle}
                onChange={e => setBrushStyle(e.target.value)}
                className="rounded border px-1 sm:px-2 py-1 text-xs sm:text-sm"
              >
                {BRUSH_STYLES.map(style => (
                  <option key={style.value} value={style.value}>{style.label}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Gradients/Patterns Row - Responsive */}
          <div className="grid grid-cols-5 gap-1 sm:gap-2 justify-center w-full">
            {GRADIENTS.map((grad, idx) => {
              // Pick a representative solid color for each gradient (first color in gradient)
              const solidColor = grad.match(/#([0-9a-fA-F]{6})/g)?.[0] || '#fff7e0';
              return (
                <button
                  key={idx}
                  className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 rounded-full border-2 transition-all duration-200 ${currentColor === solidColor ? 'border-black scale-110 shadow-lg' : 'border-white'} focus:outline-none focus:ring-2 focus:ring-blue-300`}
                  style={{ background: grad }}
                  aria-label={`Gradient ${idx + 1}`}
                  onClick={() => setCurrentColor(solidColor)}
                />
              );
            })}
            <button
              className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 rounded-full border-2 border-white shadow bg-gradient-to-br from-pink-400 to-blue-400 flex items-center justify-center"
              aria-label="Color Picker"
              disabled
            >
              <span className="w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 rounded-full bg-white border border-gray-300" />
            </button>
          </div>
        </div>
        {/* Canvas - Responsive */}
        <div className="flex-1 w-full flex items-center justify-center">
          {art.svgContent.trim().startsWith('<svg') ? (
            <div className="w-full max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-4rem)] lg:max-w-[500px] h-full max-h-[calc(100vh-200px)]">
              <Canvas
                artwork={art}
                currentTool={currentTool}
                currentColor={currentColor}
                brushSize={brushSize}
                brushStyle={brushStyle}
                onSave={handleSave}
                onChange={handleCanvasChange}
                ref={canvasRef}
              />
            </div>
          ) : (
            <div className="relative bg-white rounded-3xl shadow-2xl p-2 sm:p-3 w-full max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-4rem)] lg:max-w-[500px] h-full max-h-[calc(100vh-200px)] aspect-square">
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
        </div>
        
        {/* My Arts Section */}
        {showMyArts && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-purple-700">My Arts Gallery</h2>
                <button
                  onClick={() => setShowMyArts(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              
              {savedArts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg">No saved artworks yet!</p>
                  <p className="text-sm">Start painting and your artworks will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {savedArts.map((art, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={art}
                        alt={`Saved Art ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 hover:border-purple-300 transition-all"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = art;
                            link.download = `my-art-${index + 1}.png`;
                            link.click();
                          }}
                          className="bg-white text-purple-600 px-3 py-1 rounded-full text-sm font-medium hover:bg-purple-50"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {showSaved && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-green-600 font-bold text-sm sm:text-base animate-pulse bg-white/80 px-4 py-2 rounded-full shadow-lg">
            Artwork saved!
          </div>
        )}
      </div>
    </div>
  );
};

export default DigitalPainting; 