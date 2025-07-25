import React from 'react';
import { motion } from 'framer-motion';

// --- IMAGES REQUIRED ---
// Ensure this image exists in your `public` folder
const cloudImages = ['/cloud1.png'];

// Interface for cloud properties
interface Cloud {
  id: number;
  src: string;
  initialY: string; // Vertical position from top
  scale: number;    // Size of the cloud
  duration: number; // Animation duration
  delay: number;    // Animation delay
}

const FloatingClouds: React.FC<{ count: number }> = ({ count }) => {
  
  const clouds: Cloud[] = React.useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      // Speed is kept fast as per your last change
      const duration = 10 + Math.random() * 10;

      return {
        id: i,
        src: cloudImages[i % cloudImages.length],
        
        // --- CHANGE 1: MOVED CLOUDS HIGHER ---
        // The vertical position now ranges from -5% (partially off-screen) to 10% from the top.
        // This pushes the clouds up to the very top edge of the viewport.
        initialY: `${-7 + Math.random() * -25}%`,
        
        // --- CHANGE 2: DECREASED CLOUD SIZE ---
        // The scale now ranges from 0.2 to 0.5 (0.2 + 0.3).
        // This will make the clouds appear significantly smaller.
        scale: 0.2 + Math.random() * 0.3,

        duration: duration,
        delay: Math.random() * -duration,
      };
    });
  }, [count]);

  return (
    <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none">
      {clouds.map((cloud) => (
        <motion.img
          key={cloud.id}
          src={cloud.src}
          alt="A floating cloud in the sky"
          className="absolute"
          style={{
            top: cloud.initialY,
            scale: cloud.scale,
          }}
          initial={{ x: '-100%' }}
          animate={{ x: '100vw' }}
          transition={{
            duration: cloud.duration,
            delay: cloud.delay,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
};

export default FloatingClouds;