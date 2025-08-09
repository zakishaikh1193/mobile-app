import React, { useState, useRef } from 'react';
import { lineArtData } from '../data/lineArt';
import { LineArt, Tool } from '../types/lineArt';
import Canvas from './Canvas';
import Toolbar from './Toolbar';
import { Brush, Droplet, Eraser, Type, Zap, RotateCcw } from 'lucide-react';
import api from '../services/api';

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
  'linear-gradient(135deg,rgb(255, 255, 255) 0%,rgb(0, 0, 0) 100%)',
];

const BRUSH_STYLES = [
  { value: 'round', label: 'Round' },
  { value: 'square', label: 'Square' },
  { value: 'marker', label: 'Marker' },
  { value: 'calligraphy', label: 'Calligraphy' },
];

interface DigitalPaintingWithCompletionProps {
  onComplete: (score: number) => void;
  lineArt?: LineArt;
  activityId?: number;
  childId?: string;
}

const DigitalPaintingWithCompletion: React.FC<DigitalPaintingWithCompletionProps> = (props) => {
  const { onComplete, lineArt, activityId, childId } = props;
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
    // Use the Canvas component's save method which properly composites layers
    if (canvasRef.current) {
      canvasRef.current.handleSave();
    } else {
      alert('❌ Could not save artwork. Please try again.');
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

  const handleUndo = () => {
    if (canvasRef.current) {
      canvasRef.current.undo();
    }
  };

  const handleCompleteActivity = async () => {
    if (!activityId || !childId) {
      onComplete(100);
      return;
    }
  
    try {
      // Get the composite canvas from the Canvas component
      if (!canvasRef.current) {
        alert('❌ Could not access canvas. Please try again.');
        return;
      }

      // Use the Canvas component's composite functionality
      const compositeCanvas = canvasRef.current.compositeLayers ? canvasRef.current.compositeLayers() : null;
      
      if (!compositeCanvas) {
        alert('❌ Could not create composite image. Please try again.');
        return;
      }

      console.log('Composite canvas created, dimensions:', compositeCanvas.width, 'x', compositeCanvas.height);

      // Convert composite canvas to blob
      compositeCanvas.toBlob(async (blob: Blob | null) => {
        if (!blob) {
          alert('❌ Could not capture your artwork. Please try again.');
          return;
        }

        console.log('Artwork blob created, size:', blob.size);

        // Create a file from the blob
        const file = new File([blob], 'completed-activity.png', { type: 'image/png' });

        const formData = new FormData();
        formData.append('child_id', childId);
        formData.append('activity_id', activityId.toString());
        formData.append('time_spent_seconds', '180');
        formData.append('completed_file', file);

        const config = {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        };

        try {
          const response = await api.post('/activities/complete', formData, config);
          
          if (response.data.success) {
            alert('🎉 Activity completed successfully! Your work has been submitted for teacher review.');
            onComplete(100);
          } else {
            alert(`❌ ${response.data.message || 'Failed to complete activity. Please try again.'}`);
          }
        } catch (error: any) {
          console.error('API Error:', error.response?.data || error.message);
          alert(`❌ Error: ${error.response?.data?.message || 'Failed to complete activity. Please try again.'}`);
        }
      }, 'image/png', 0.9);
  
    } catch (error) {
      console.error('Error in handleCompleteActivity:', error);
      alert('❌ An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="digital-painting-container flex flex-col lg:flex-row h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50">
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
            <button
              className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center shadow bg-blue-200 hover:bg-blue-300 transition-all"
              onClick={handleCompleteActivity}
              aria-label="Complete Activity"
            >
              ✅
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
        </div>
        
        {showSaved && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-green-600 font-bold text-sm sm:text-base animate-pulse bg-white/80 px-4 py-2 rounded-full shadow-lg">
            Artwork saved!
          </div>
        )}
      </div>
    </div>
  );
};

export default DigitalPaintingWithCompletion; 
