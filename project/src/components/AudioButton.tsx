import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';

const AudioButton: React.FC = () => {
  const { isMuted, toggleMute } = useAudio();

  return (
    <button
      onClick={toggleMute}
      className={`fixed top-4 right-4 z-50 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 ${
        isMuted 
          ? 'bg-red-100 border-2 border-red-300' 
          : 'bg-green-100 border-2 border-green-300'
      }`}
      aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
      title={isMuted ? 'Click to unmute' : 'Click to mute'}
    >
      {isMuted ? (
        <VolumeX className="h-6 w-6 text-red-600" />
      ) : (
        <Volume2 className="h-6 w-6 text-green-600" />
      )}
    </button>
  );
};

export default AudioButton;