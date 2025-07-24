import React, { useEffect, useState, useRef } from 'react';

interface AnimatedFrogProps {
  className?: string;
  style?: React.CSSProperties;
  leafPositionPercent?: number; // 0 (left) to 100 (right), default 50
}

const frames = [
  'C1.png', 'C2.png', 'C3.png', 'C4.png', 'C5.png', 'C6.png'
];
const frameCount = frames.length;
const frameRate = 220; // ms per frame (slower)
const jumpDuration = frameCount * frameRate; // total jump time
const pauseAtLeaf = 5000; // ms pause on leaf
const pauseAtStart = 1000; // ms pause at start

const frogSound = '/bushes/frog-small.mp3';

const AnimatedFrog: React.FC<AnimatedFrogProps> = ({ className = '', style, leafPositionPercent = 50 }) => {
  const [frame, setFrame] = useState(0);
  const [progress, setProgress] = useState(0); // 0 to 1
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [paused, setPaused] = useState(false);
  const [landed, setLanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play frog sound when landing on the leaf (forward direction)
  useEffect(() => {
    if (landed && direction === 'forward' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  }, [landed, direction]);

  // Frame animation
  useEffect(() => {
    if (paused) return;
    const frameInterval = setInterval(() => {
      setFrame((prev) => {
        if (direction === 'forward') {
          if (prev < frameCount - 1) return prev + 1;
          return prev;
        } else {
          if (prev > 0) return prev - 1;
          return prev;
        }
      });
    }, frameRate);
    return () => clearInterval(frameInterval);
  }, [paused, direction]);

  // Progress animation
  useEffect(() => {
    if (paused) return;
    let start: number | null = null;
    let raf: number;
    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      let t = Math.min((elapsed / jumpDuration), 1); // 0 to 1, clamp at 1
      setProgress(direction === 'forward' ? t : 1 - t);
      if (t < 1) {
        raf = requestAnimationFrame(animate);
      } else {
        setPaused(true);
        setLanded(true);
        setTimeout(() => {
          setLanded(false);
          setDirection((d) => (d === 'forward' ? 'backward' : 'forward'));
          setPaused(false);
        }, direction === 'forward' ? pauseAtLeaf : pauseAtStart);
      }
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [paused, direction]);

  // Set audio volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.2;
    }
  }, []);

  // Calculate horizontal (left to leaf and back) and vertical (parabolic) position
  // Offset starting point by -48px (about 3 inches on most screens)
  const startOffset = -48; // px
  const left = landed
    ? (direction === 'forward' ? `calc(${leafPositionPercent}%)` : `0%`)
    : `calc(${progress * leafPositionPercent}% + ${progress === 0 ? startOffset : 0}px)`;
  const maxY = -80; // jump height in px
  const translateY = landed ? 0 : 4 * maxY * progress * (1 - progress);

  // When landed, show last frame and keep frog at leaf or start
  const imageSrc = landed
    ? `/bushes/${direction === 'forward' ? 'C6.png' : 'C1.png'}`
    : `/bushes/${frames[frame]}`;
  const isFlipped = direction === 'backward';

  return (
    <>
      <img
        src={imageSrc}
        alt="Animated Frog"
        className={className}
        style={{
          position: 'absolute',
          left,
          bottom: '10%',
          width: '60px',
          height: 'auto',
          transform: `translateY(${translateY}px) scaleX(${isFlipped ? -1 : 1})`,
          zIndex: 3,
          ...style,
        }}
        draggable={false}
      />
      {/* Hidden audio element for frog sound */}
      <audio ref={audioRef} src={frogSound} preload="auto" />
    </>
  );
};

export default AnimatedFrog; 