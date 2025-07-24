import React from 'react';
import { motion } from 'framer-motion';

const NavSign: React.FC<{ src: string; alt: string; onClick: () => void; className: string; }> = ({ src, alt, onClick, className }) => {
  return (
    <motion.button
      onClick={onClick}
      className={`focus:outline-none transition-transform duration-300 ${className}`}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 1.2, ease: "backOut" }}
      whileHover={{ scale: 1.1, rotate: 2 }}
      whileTap={{ scale: 0.95 }}
    >
      <img src={src} alt={alt} className="w-full h-auto drop-shadow-lg" />
    </motion.button>
  );
};

export default NavSign;