import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AudioContextType {
  isMuted: boolean;
  toggleMute: () => void;
  speak: (text: string) => void;
  playSound: (soundType: 'success' | 'click' | 'celebration') => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);

  const speak = (text: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;
    
    // Try to use a child-friendly voice
    const voices = speechSynthesis.getVoices();
    const childVoice = voices.find(voice => 
      voice.name.includes('Female') || voice.name.includes('Woman')
    );
    if (childVoice) {
      utterance.voice = childVoice;
    }
    
    speechSynthesis.speak(utterance);
  };

  const playSound = (soundType: 'success' | 'click' | 'celebration') => {
    if (isMuted) return;
    
    // Create audio context for sound effects
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    };

    switch (soundType) {
      case 'success':
        playTone(523.25, 0.2); // C5
        setTimeout(() => playTone(659.25, 0.2), 100); // E5
        setTimeout(() => playTone(783.99, 0.3), 200); // G5
        break;
      case 'click':
        playTone(800, 0.1, 'square');
        break;
      case 'celebration':
        // Play a happy melody
        const melody = [523.25, 587.33, 659.25, 698.46, 783.99];
        melody.forEach((freq, index) => {
          setTimeout(() => playTone(freq, 0.2), index * 150);
        });
        break;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const value = {
    isMuted,
    toggleMute,
    speak,
    playSound
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};