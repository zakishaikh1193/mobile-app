import React from 'react';
import { motion } from 'framer-motion';
import { useAudio } from '../contexts/AudioContext';
import { useAuth } from '../contexts/AuthContext';
import { avatars } from '../assets/avatars';

interface AvatarSelectorProps {
  onSelect: (avatar: string) => void;
}

const AvatarSelector: React.FC<AvatarSelectorProps> = ({ onSelect }) => {
  const { speak } = useAudio();
  
  const handleSelect = (avatar: string) => {
    speak(`You've selected an avatar! Let's start learning!`);
    onSelect(avatar);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        className="bg-white rounded-2xl p-6 w-full max-w-md"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Choose Your Avatar</h2>
        <p className="text-center mb-6 text-gray-600">Select an avatar to represent you in your learning journey!</p>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[...avatars.boy, ...avatars.girl].map((avatar, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelect(avatar)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <img 
                src={avatar} 
                alt={`Avatar ${index + 1}`} 
                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover mx-auto"
              />
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AvatarSelector;
