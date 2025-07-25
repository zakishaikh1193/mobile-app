import React, { useState, useEffect, useRef } from 'react';
import { motion, Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FloatingClouds from './FloatingClouds';

// BubblyHeading Component (kept for reuse)
const BubblyHeading: React.FC<{ text: string; className?: string; colorConfig: Record<string, string> }> = ({ text, className, colorConfig }) => {
  const letterVariants: Variants = {
    hover: {
      y: -5,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 17
      }
    },
    initial: {
      y: 0,
    },
  };

  return (
    <h1 className={`bubbly-heading flex justify-center ${className}`}>
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          style={{ color: colorConfig[char.toLowerCase()] || '#000' }}
          variants={letterVariants}
          initial="initial"
          whileHover="hover"
          className="cursor-pointer"
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </h1>
  );
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [sunAnimationState, setSunAnimationState] = useState('hidden');
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [showHeading, setShowHeading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setShowHeading(true);
  
    if (audioRef.current) {
      audioRef.current.play().catch(error => {
        console.log("Background music autoplay prevented:", error);
      });
    }
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center font-sans min-h-screen w-full p-4 relative overflow-hidden"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'scroll'
      }}
    >
      <audio ref={audioRef} src="/music.mp3" loop autoPlay muted={isMuted} />

      {/* Mute/Unmute Button */}
      <button
  onClick={toggleMute}
  className="absolute top-4 right-4 z-50 w-10 md:w-12"
>
  <img
    src={isMuted ? '/unmute.png' : '/mute-icon.png'} // Provide your own image paths
    alt={isMuted ? 'Unmute Background Music' : 'Mute Background Music'}
    className="w-full h-auto"
  />
</button>

      {/* Logo */}
      <img
        src="/KODEIT_Logo_2.png"
        alt="Kodeit Preschool Learning official logo"
        className="absolute top-4 left-4 w-20 md:w-24 h-auto z-50"
      />

      <FloatingClouds count={8} />

      <main className="relative w-full h-full flex flex-col items-center justify-center pt-0 md:pt-0">
        <motion.div
          className="relative w-full max-w-4xl flex flex-col items-center justify-center p-8"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}

        >
          {/* Title Image */}
          {showHeading && (
            <motion.img
              src="/title.png"
              alt="Kodeit Preschool Learning Title"
              className="w-[95%] max-w-[650px] mt-[-400px] z-10"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              
            />
          )}
        </motion.div>

        {/* Butterfly animations */}
        <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none">
  {/* Butterfly 1 - Right side */}
  <img
    src="/butterfly2.gif"
    alt="Cartoon girl reading a book"
    className="absolute z-10"
    style={{
      top: '45vh',         // 35% down from top of the screen
      right: '12vw',       // 12% from the right side of the screen
      width: 'clamp(80px, 10vw, 150px)' // responsive width
    }}
  />

  <div className="relative w-full h-screen"></div>

  {/* Butterfly 2 - Left side */}
  <img
    src="/butterfly1.gif"
    alt="Kids looking at a book with magnifying glasses"
    className="absolute z-10"
    style={{
      top: '40vh',         // 38% down from top
      left: '10vw',        // 12% from left side
      width: 'clamp(90px, 8vw, 120px)' // responsive width
    }}
  />
</div>

        <motion.img
  src="/start.png"
  alt="Start Button"
  onClick={() => navigate('/auth')}
  className="absolute top-[-185%] sm:top-[8%] md:top-[5%] w-[50%] sm:w-[20%] md:w-[16%] max-w-[180px] z-20 cursor-pointer"
  animate={{
    scale: [1, 1.1, 1],
    y: [0, -10, 0], // vertical bounce
  }}
  transition={{
    duration: 1.5,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
/>


      </main>
    </div>
  );
};

export default LandingPage;
