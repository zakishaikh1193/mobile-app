import React from 'react';
import { motion } from 'framer-motion';

// --- IMAGES REQUIRED ---
// Ensure these images exist in your `public` folder
const cloudImages = ['/cloud1.png', '/cloud1.png', '/cloud1.png'];

// Interface for cloud properties
interface Cloud {
  id: number;
  src: string;
  initialY: string; // Vertical position from top
  scale: number;
  duration: number;
  delay: number;
}

const FloatingClouds: React.FC<{ count: number }> = ({ count }) => {
  // Create cloud objects with randomized values
  const clouds: Cloud[] = React.useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      src: cloudImages[i % cloudImages.length],
      // Clouds start higher on the screen now: from -5% to 15% from the top
      initialY: `${-5 + Math.random() * 20}%`,
      scale: 0.6 + Math.random() * 0.8,
      duration: 30 + Math.random() * 40,
      delay: Math.random() * 20,
    }));
  }, [count]);

  return (
    // Container for all clouds
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
