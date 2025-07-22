import React, { useState } from 'react';
import { lineArtData } from '../data/lineArt';
import { LineArt, Tool } from '../types/lineArt';
import Canvas from './Canvas';
import Toolbar from './Toolbar';

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
  '#FFB347', '#FFD700', '#FFA07A', '#B0E0E6', '#E6E6FA', '#C1FFC1',
  '#FF69B4', '#FF6347', '#40E0D0', '#A0522D', '#8A2BE2', '#00CED1',
  '#FFDAB9', '#E0FFFF', '#F08080', '#B22222', '#228B22', '#20B2AA', '#9370DB'
];

interface DigitalPaintingProps {
  onComplete: (score: number) => void;
  lineArt?: LineArt;
}

const DigitalPainting: React.FC<DigitalPaintingProps> = ({ onComplete, lineArt }) => {
  const art = lineArt || lineArtData[0];
  const [currentTool, setCurrentTool] = useState<Tool>('brush');
  const [currentColor, setCurrentColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(10);
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = (dataUrl: string) => {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
    // Optionally, save to localStorage or backend here
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 p-8">
      <div className="flex flex-col items-center">
        <img src={art.referenceImage} alt="Reference" className="w-48 h-48 object-cover rounded-2xl shadow mb-4" />
        <span className="font-bold text-lg text-purple-700">Reference</span>
      </div>
      <div className="flex-1 flex flex-col items-center">
        {/* Toolbar */}
        <Toolbar
          currentTool={currentTool}
          onToolChange={setCurrentTool}
          brushSize={brushSize}
          onBrushSizeChange={setBrushSize}
        />
        {/* Color Palette */}
        <div className="flex gap-2 mb-4 flex-wrap justify-center">
          {COLORS.map((color) => (
            <button
              key={color}
              className={`w-8 h-8 rounded-full border-2 ${currentColor === color ? 'border-black' : 'border-white'}`}
              style={{ backgroundColor: color }}
              onClick={() => setCurrentColor(color)}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
        {/* Canvas or PNG coloring */}
        {art.svgContent.trim().startsWith('<svg') ? (
          <Canvas
            artwork={art}
            currentTool={currentTool}
            currentColor={currentColor}
            brushSize={brushSize}
            onSave={handleSave}
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
                onSave={handleSave}
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