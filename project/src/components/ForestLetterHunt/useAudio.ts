import { useCallback, useRef } from 'react';

export const useAudio = (enabled: boolean) => {
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech synthesis
  if (typeof window !== 'undefined' && !synthRef.current) {
    synthRef.current = window.speechSynthesis;
  }

  const speak = useCallback((text: string) => {
    if (!enabled || !synthRef.current) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1.2;
    utterance.volume = 0.8;

    // Try to use a child-friendly voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Female') ||
      voice.name.includes('Woman')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    synthRef.current.speak(utterance);
  }, [enabled]);

  const playSound = useCallback((type: 'correct' | 'incorrect' | 'celebration') => {
    if (!enabled) return;

    // Create audio context for sound effects
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const createBeep = (frequency: number, duration: number, volume: number = 0.3) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    };

    switch (type) {
      case 'correct':
        // Happy ascending tones
        createBeep(523.25, 0.15); // C5
        setTimeout(() => createBeep(659.25, 0.15), 100); // E5
        setTimeout(() => createBeep(783.99, 0.2), 200); // G5
        break;
      
      case 'incorrect':
        // Gentle descending tone
        createBeep(392, 0.3); // G4
        setTimeout(() => createBeep(349.23, 0.3), 150); // F4
        break;
      
      case 'celebration':
        // Celebratory melody
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((note, index) => {
          setTimeout(() => createBeep(note, 0.25), index * 100);
        });
        break;
    }
  }, [enabled]);

  return { speak, playSound };
}; 