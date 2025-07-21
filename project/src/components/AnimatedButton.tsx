import React from 'react';
import { motion } from 'framer-motion';
import { useAudio } from '../contexts/AudioContext';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'fun';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  soundEffect?: boolean;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  soundEffect = true
}) => {
  const { playSound } = useAudio();

  const variants = {
    primary: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
    secondary: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
    fun: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const handleClick = () => {
    if (soundEffect) {
      playSound('click');
    }
    onClick?.();
  };

  return (
    <motion.button
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${className}
        rounded-full font-semibold shadow-lg
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-4 focus:ring-purple-300
      `}
      onClick={handleClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  );
};

export default AnimatedButton;