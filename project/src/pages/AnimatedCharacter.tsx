import React from 'react';
import { motion } from 'framer-motion';

const AnimatedCharacter: React.FC<{ src: string; alt: string; className: string }> = ({ src, alt, className }) => {
  // Randomize durations to make animations look natural and not synchronized
  const randomDuration = 2.5 + Math.random() * 2;

  return (
    <motion.img
      src={src}
      alt={alt}
      className={className}
      initial={{ opacity: 0, y: 50 }}
      animate={{ 
        opacity: 1, 
        y: [0, -8, 0], // Gentle up-and-down floating motion
      }}
      transition={{
        delay: 0.8 + Math.random() * 0.5,
        duration: randomDuration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
};

export default AnimatedCharacter;