import React, { useEffect, useState } from 'react';

interface AnimatedA2Props {
  className?: string;
  style?: React.CSSProperties;
}

// Only use the frames that exist, skipping A6.png
const frames = [
  'A1.png', 'A2.png', 'A3.png', 'A4.png', 'A5.png',
  'A7.png', 'A8.png', 'A9.png', 'A10.png'
];
const frameCount = frames.length;
const frameRate = 120; // ms per frame (slower)

const AnimatedA2: React.FC<AnimatedA2Props> = ({ className = '', style }) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % frameCount);
    }, frameRate);
    return () => clearInterval(interval);
  }, []);

  const imageSrc = `/bushes/${frames[frame]}`;

  return (
    <img
      src={imageSrc}
      alt="Animated Animal A2"
      className={className}
      style={style}
      draggable={false}
    />
  );
};

export default AnimatedA2; 