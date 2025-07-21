import React from 'react';
import { Paintbrush, Droplets, Eraser, Sparkles, Minus, Plus } from 'lucide-react';
import { Tool } from '../types/lineArt';

interface ToolbarProps {
  currentTool: Tool;
  onToolChange: (tool: Tool) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  onToolChange,
  brushSize,
  onBrushSizeChange
}) => {
  const tools = [
    { id: 'brush' as Tool, icon: Paintbrush, label: 'Brush', color: 'blue' },
    { id: 'bucket' as Tool, icon: Droplets, label: 'Fill', color: 'green' },
    { id: 'eraser' as Tool, icon: Eraser, label: 'Eraser', color: 'red' },
    { id: 'sticker' as Tool, icon: Sparkles, label: 'Stickers', color: 'purple' },
  ];

  const getToolColor = (toolColor: string, isActive: boolean) => {
    const baseColors = {
      blue: isActive ? 'bg-blue-600' : 'bg-blue-500 hover:bg-blue-600',
      green: isActive ? 'bg-green-600' : 'bg-green-500 hover:bg-green-600',
      red: isActive ? 'bg-red-600' : 'bg-red-500 hover:bg-red-600',
      purple: isActive ? 'bg-purple-600' : 'bg-purple-500 hover:bg-purple-600',
    };
    return baseColors[toolColor as keyof typeof baseColors];
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Tools */}
      <div className="flex items-center space-x-3">
        <div className="text-purple-600 font-medium">Tools:</div>
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={`${getToolColor(tool.color, currentTool === tool.id)} text-white p-4 rounded-2xl shadow-lg transform hover:scale-110 transition-all duration-200 flex flex-col items-center space-y-1 min-w-[80px]`}
            aria-label={tool.label}
            aria-pressed={currentTool === tool.id}
          >
            <tool.icon className="h-6 w-6" />
            <span className="text-xs font-medium">{tool.label}</span>
          </button>
        ))}
      </div>

      {/* Brush Size Control */}
      {(currentTool === 'brush' || currentTool === 'eraser') && (
        <div className="flex items-center space-x-3">
          <div className="text-purple-600 font-medium">Size:</div>
          
          <button
            onClick={() => onBrushSizeChange(Math.max(2, brushSize - 2))}
            disabled={brushSize <= 2}
            className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white p-2 rounded-full shadow-lg transform hover:scale-110 transition-all duration-200 disabled:transform-none"
            aria-label="Decrease brush size"
          >
            <Minus className="h-4 w-4" />
          </button>

          <div className="flex items-center justify-center w-20">
            <div
              className="bg-purple-500 rounded-full shadow-lg"
              style={{
                width: `${Math.min(brushSize, 30)}px`,
                height: `${Math.min(brushSize, 30)}px`
              }}
              aria-hidden="true"
            />
          </div>
          
          <span className="text-purple-600 font-medium min-w-[30px] text-center">
            {brushSize}
          </span>

          <button
            onClick={() => onBrushSizeChange(Math.min(50, brushSize + 2))}
            disabled={brushSize >= 50}
            className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white p-2 rounded-full shadow-lg transform hover:scale-110 transition-all duration-200 disabled:transform-none"
            aria-label="Increase brush size"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tool Tips */}
      <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-md">
        {currentTool === 'brush' && '🎨 Paint away!'}
        {currentTool === 'bucket' && '🪣 Click to fill areas!'}
        {currentTool === 'eraser' && '🧹 Clean up mistakes!'}
        {currentTool === 'sticker' && '✨ Add fun stickers!'}
      </div>
    </div>
  );
};

export default Toolbar; 