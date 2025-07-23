import React, { useState, useEffect } from 'react';
import { Home, Star, Music, QrCode, ArrowLeft, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import Confetti from 'react-confetti';
import GameMenu from '../components/Knowme/GameMenu';
import MyBodySection from '../components/Knowme/MyBodySection';
import MyLikesSection from '../components/Knowme/MyLikesSection';
import ProgressBar from '../components/Knowme/ProgressBar';
import VoiceNarrator from '../components/Knowme/VoiceNarrator';
import ParticleBackground from '../components/Knowme/ParticleBackground';
import '../index.css';

interface KnowMeActivityProps {
  onClose: () => void;
}

const KnowMeActivity: React.FC<KnowMeActivityProps> = ({ onClose }) => {
  const [currentSection, setCurrentSection] = useState<'menu' | 'body' | 'likes'>('menu');
  const [stars, setStars] = useState(0);
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const addStars = (amount: number) => {
    setStars(prev => prev + amount);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const markActivityComplete = (activityId: string) => {
    if (!completedActivities.includes(activityId)) {
      setCompletedActivities(prev => [...prev, activityId]);
      addStars(1);
    }
  };

  const resetGame = () => {
    setCurrentSection('menu');
    setStars(0);
    setCompletedActivities([]);
  };

  const pageVariants = {
    initial: { opacity: 0, scale: 0.8, rotateY: -10 },
    in: { opacity: 1, scale: 1, rotateY: 0 },
    out: { opacity: 0, scale: 1.2, rotateY: 10 }
  };

  const pageTransition = {
    type: "spring" as const,
    stiffness: 100,
    damping: 20,
    duration: 0.8
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleBackground />
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] animate-pulse"></div>
      </div>
      {/* Header */}
      <motion.div 
        className="relative z-10 bg-white/95 backdrop-blur-xl shadow-2xl border-b border-white/20 mt-0"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ marginTop: 0, paddingTop: 0 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-1"> {/* Reduced py-2 to py-1 for minimal vertical space */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <AnimatePresence>
                {currentSection !== 'menu' && (
                  <motion.button
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentSection('menu')}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-4 rounded-2xl shadow-lg transition-all duration-300"
                  >
                    <ArrowLeft size={28} />
                  </motion.button>
                )}
              </AnimatePresence>
              <motion.h1 
                className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent font-comic"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                Know Me: My Body & Favorites! 🌟
              </motion.h1>
            </div>
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-3 rounded-2xl transition-all duration-300 ${
                  soundEnabled 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-gray-400 hover:bg-gray-500 text-white'
                }`}
              >
                <Volume2 size={24} />
              </motion.button>
              <motion.div 
                className="flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-400 px-6 py-3 rounded-2xl shadow-lg"
                whileHover={{ scale: 1.05 }}
                animate={{ 
                  boxShadow: ['0 4px 20px rgba(251, 191, 36, 0.3)', '0 8px 30px rgba(251, 191, 36, 0.5)', '0 4px 20px rgba(251, 191, 36, 0.3)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Star className="text-yellow-700 fill-yellow-700" size={28} />
                </motion.div>
                <motion.span 
                  className="text-2xl font-bold text-yellow-700"
                  key={stars}
                  initial={{ scale: 1.5, color: '#fff' }}
                  animate={{ scale: 1, color: '#b45309' }}
                  transition={{ duration: 0.5 }}
                >
                  {stars}
                </motion.span>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={resetGame}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-4 rounded-2xl shadow-lg transition-all duration-300"
              >
                <Home size={28} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
      {/* Progress Bar */}
      <ProgressBar completedActivities={completedActivities} totalActivities={8} />
      {/* Voice Narrator */}
      <VoiceNarrator enabled={soundEnabled} />
      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            {currentSection === 'menu' && (
              <GameMenu onSectionSelect={setCurrentSection} />
            )}
            {currentSection === 'body' && (
              <MyBodySection 
                onActivityComplete={markActivityComplete}
                completedActivities={completedActivities}
                soundEnabled={soundEnabled}
              />
            )}
            {currentSection === 'likes' && (
              <MyLikesSection 
                onActivityComplete={markActivityComplete}
                completedActivities={completedActivities}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      {/* Enhanced QR Code Section */}
      {/* Removed the entire QR code section as requested */}
    </div>
  );
}

export default KnowMeActivity; 