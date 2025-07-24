import React, { useState, useEffect, useRef } from 'react';
import { motion, Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SpeakingSun from './SpeakingSun';
import AnimatedCharacter from './AnimatedCharacter';
import NavSign from './NavSign';
import FloatingClouds from './FloatingClouds';

// BubblyHeading Component remains the same

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
    const timer1 = setTimeout(() => setSunAnimationState('center'), 500);
    const timer2 = setTimeout(() => {
      setShowSpeechBubble(true);
      const welcomeAudio = new Audio('/welcome-audio.mp3');
      if (!isMuted) {
        welcomeAudio.play().catch(error => console.log("Welcome audio autoplay prevented:", error));
      }
    }, 2000);
    const timer3 = setTimeout(() => setShowSpeechBubble(false), 6000);
    const timer4 = setTimeout(() => {
      setSunAnimationState('topRight');
      setTimeout(() => setShowHeading(true), 500);
    }, 6500);

    // Attempt to play background music
    if (audioRef.current) {
      audioRef.current.play().catch(error => {
        console.log("Background music autoplay prevented:", error);
        // Autoplay was prevented, user interaction is needed
      });
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };
  
  // Color configurations for the headings
  const kodeitColorConfig = {
    k: '#1ebbd7', o: '#3ee577', d: '#1ebbd7', e: '#ff9800', i: '#ffc107', t: '#ff9800'
  };

  const preschoolColorConfig = {
    p: '#4CAF50', r: '#FFC107', e: '#f44336', s: '#2196F3', c: '#9C27B0',
    h: '#FF9800', o: '#4CAF50', l: '#f44336', ' ': 'transparent', // Handles space
    a: '#2196F3', n: '#9C27B0', i: '#FF9800', g: '#4CAF50'
  };


  return (
    <div
      className="h-screen w-screen bg-center bg-no-repeat font-sans relative overflow-hidden flex flex-col items-center p-4"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center top 10%',
        backgroundAttachment: 'fixed'
      }}
    >
      <audio ref={audioRef} src="/music.mp3" loop autoPlay muted={isMuted} />

      {/* Mute/Unmute Button */}
      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 z-50 bg-white p-2 rounded-full shadow-md"
      >
        {isMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707a1 1 0 011.414 0L14 9.586l-2.293 2.293a1 1 0 01-1.414-1.414l2.293-2.293L10 6.586 5.586 11H4v2h1.586l4.707 4.707a1 1 0 01-1.414 1.414L5.586 15z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M17.657 6.343a9 9 0 010 12.728M4.293 4.293a1 1 0 011.414 0L19.414 18a1 1 0 01-1.414 1.414L4.293 5.707a1 1 0 010-1.414z" />
          </svg>
        )}
      </button>

      <img
        src="/KODEIT_Logo_2.png"
        alt="Kodeit Preschool Learning official logo"
        className="absolute top-4 left-4 w-20 md:w-24 h-auto z-50"
      />

      <FloatingClouds count={8} />

      <SpeakingSun
        animate={sunAnimationState}
        showSpeechBubble={showSpeechBubble}
      />

      <main className="relative w-full h-full flex flex-col items-center justify-center pt-0 md:pt-0">
        <motion.div
          className="relative max-w-7xl mx-auto"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "backOut" }}
        >
          <div className="relative" style={{ transform: 'translateY(clamp(-250px, -30vh, -150px))' }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              {showHeading && (
                <>
                  <BubblyHeading text="Kodeit" className="text-5xl md:text-6xl lg:text-7xl" colorConfig={kodeitColorConfig} />
                  <BubblyHeading text="Preschool Learning" className="text-6xl md:text-7xl lg:text-8xl mt-2" colorConfig={preschoolColorConfig} />
                </>
              )}
            </div>
          </div>
        </motion.div>

        <div className="absolute top-0 left-0 w-full h-full z-10">
          <img
            src="/butterfly1.gif"
            alt="Cartoon girl reading a book"
            className="absolute z-10"
            style={{ bottom: '10px', left: '30px', width: '150px' }}
          />
          <NavSign
            src="/learn-sign.png"
            alt="Wooden sign for Learn"
            onClick={() => navigate('/learn')}
            className="absolute bottom-[20%] sm:bottom-[25%] left-[8%] sm:left-[12%] w-[35%] sm:w-[30%] md:w-[25%] max-w-[200px] md:max-w-sm z-20"
          />
          <AnimatedCharacter
            src="/boy-with-books.png"
            alt="Cartoon boy on a stack of books"
            className="absolute bottom-[15%] sm:bottom-[20%] left-1/2 -translate-x-1/2 w-[35%] sm:w-[30%] md:w-[25%] max-w-[180px] md:max-w-xs z-10"
          />
           <motion.img
            src="/start.png"
            alt="Wooden sign for Game"
            onClick={() => navigate('/auth')}
            className="absolute bottom-[38%] sm:bottom-[41%] right-[50%] translate-x-[50%] sm:right-[44.5%] sm:-translate-x-[40%] w-[15%] sm:w-[12%] md:w-[10%] max-w-[100px] md:max-w-md z-20 cursor-pointer"
            animate={{
              scale: [1, 1.1, 1], // Zoom in to 1.1x then back to 1x
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <img
            src="/butterfly2.gif"
            alt="Kids looking at a book with magnifying glasses"
            className="absolute z-10"
            style={{ bottom: '20px', right: '15px', width: '120px' }}
          />
          <NavSign
            src="/quiz-sign.png"
            alt="Wooden sign for Quiz"
            onClick={() => navigate('/quiz')}
            className="absolute bottom-[22%] sm:bottom-[28%] right-[8%] sm:right-[12%] w-[35%] sm:w-[30%] md:w-[25%] max-w-[200px] md:max-w-sm z-20"
          />
        </div>
      </main>
    </div>
  );
};

export default LandingPage;