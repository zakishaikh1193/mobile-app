import React, { useEffect, useState, useRef } from 'react';

interface AnimatedMonkeyProps {
  className?: string;
  style?: React.CSSProperties;
  topPercent?: number; // 0 (top) to 100 (bottom), default 60
}

const frames = [
  'D1.png', 'D2.png', 'D3.png', 'D4.png', 'D5.png', 'D6.png', 'D7.png', 'D8.png', 'D9.png'
];
const frameCount = frames.length;
const frameRate = 300; // ms per frame (slower)

const monkeySound = '/bushes/monkey-small.mp3';

const AnimatedMonkey: React.FC<AnimatedMonkeyProps> = ({ className = '', style, topPercent = 60 }) => {
  const [frame, setFrame] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => {
        const next = (prev + 1) % frameCount;
        // Play sound when looping back to first frame
        if (next === 0 && audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }
        return next;
      });
    }, frameRate);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.2;
    }
  }, []);

  const imageSrc = `/bushes/${frames[frame]}`;

  return (
    <>
      <img
        src={imageSrc}
        alt="Animated Monkey"
        className={className}
        style={{
          position: 'absolute',
          left: '50%',
          top: `${topPercent}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: 2,
          ...style,
        }}
        draggable={false}
      />
      {/* Monkey sound removed */}
    </>
  );
};

export default AnimatedMonkey; 