import React from 'react';
import { Volume2, VolumeX, RotateCcw, Home } from 'lucide-react';

interface SettingsProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetProgress: () => void;
  onBackToMenu: () => void;
}

const Settings: React.FC<SettingsProps> = ({
  soundEnabled,
  onToggleSound,
  onResetProgress,
  onBackToMenu
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-2xl font-bold text-green-800 mb-6 text-center">
          Game Settings
        </h2>
        
        <div className="space-y-4">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
            <span className="text-lg font-medium text-green-800">Sound Effects</span>
            <button
              onClick={onToggleSound}
              className={`p-3 rounded-full transition-colors ${
                soundEnabled 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
            </button>
          </div>

          {/* Reset Progress */}
          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
            <span className="text-lg font-medium text-orange-800">Reset Progress</span>
            <button
              onClick={onResetProgress}
              className="p-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
            >
              <RotateCcw size={24} />
            </button>
          </div>

          {/* Back to Menu */}
          <button
            onClick={onBackToMenu}
            className="w-full flex items-center justify-center gap-3 p-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-lg font-medium"
          >
            <Home size={24} />
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;