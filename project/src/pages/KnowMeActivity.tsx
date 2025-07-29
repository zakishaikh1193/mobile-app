import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Star, Home, ArrowLeft } from 'lucide-react';
import GameMenu from '../components/Knowme/GameMenu';
import MyBodySection from '../components/Knowme/MyBodySection';
import MyLikesSection from '../components/Knowme/MyLikesSection';
import ParticleBackground from '../components/Knowme/ParticleBackground';

interface KnowMeActivityProps {
  onClose: () => void;
}

const KnowMeActivity: React.FC<KnowMeActivityProps> = ({ onClose }) => {
  const [currentSection, setCurrentSection] = useState<'menu' | 'body' | 'likes'>('menu');
  const [stars, setStars] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);

  const resetGame = () => {
    setCurrentSection('menu');
    setStars(0);
    setCompletedActivities([]);
  };

  const addStars = (amount: number) => {
    setStars(prev => prev + amount);
  };

  const markActivityComplete = (activityId: string) => {
    if (!completedActivities.includes(activityId)) {
      setCompletedActivities(prev => [...prev, activityId]);
      addStars(1);
    }
  };

  useEffect(() => {
    // Set viewport meta for mobile but allow scrolling
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, user-scalable=yes, viewport-fit=cover');
    }

    return () => {
      // Reset viewport on unmount
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
      }
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-x-hidden">
      {/* Animated Background */}
      <ParticleBackground />
      
      {/* Header - Fixed at top */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-3 w-full max-w-6xl mx-auto">
          {/* Title */}
          <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent font-comic leading-tight flex-1">
            Know Me: My Body & Favorites!
          </h1>
          
          {/* Controls - Touch optimized */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 sm:p-2.5 rounded-xl transition-all duration-300 touch-manipulation min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center ${
                soundEnabled 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-gray-400 hover:bg-gray-500 text-white'
              }`}
            >
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
            
            <motion.div 
              className="flex items-center gap-1 sm:gap-2 md:gap-3 bg-gradient-to-r from-yellow-400 to-orange-400 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 rounded-xl shadow-lg touch-manipulation min-h-[40px] sm:min-h-[44px]"
              whileHover={{ scale: 1.02 }}
              animate={{ 
                boxShadow: ['0 4px 20px rgba(251, 191, 36, 0.3)', '0 8px 30px rgba(251, 191, 36, 0.5)', '0 4px 20px rgba(251, 191, 36, 0.3)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Star className="text-yellow-700 fill-yellow-700 w-4 h-4 sm:w-5 sm:h-5" />
              </motion.div>
              <motion.span 
                className="text-xs sm:text-sm md:text-base font-bold text-yellow-700"
                key={stars}
                initial={{ scale: 1.5, color: '#fff' }}
                animate={{ scale: 1, color: '#b45309' }}
                transition={{ duration: 0.5 }}
              >
                {stars}
              </motion.span>
            </motion.div>
            
            <motion.button
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetGame}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-2 sm:p-2.5 rounded-xl shadow-lg transition-all duration-300 touch-manipulation min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center"
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-2 sm:p-2.5 rounded-xl shadow-lg transition-all duration-300 touch-manipulation min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <main className="relative z-10 w-full px-2 sm:px-4 md:px-6 py-2 sm:py-4 md:py-6 max-w-6xl mx-auto overflow-y-auto" style={{ height: 'calc(100vh - 80px)' }}>
        <AnimatePresence mode="wait">
          {currentSection === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="min-h-full flex flex-col pb-8"
            >
              <GameMenu 
                onSectionSelect={setCurrentSection}
              />
            </motion.div>
          )}
          
          {currentSection === 'body' && (
            <motion.div
              key="body"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="min-h-full pb-8"
            >
              <MyBodySection 
                onActivityComplete={markActivityComplete}
                completedActivities={completedActivities}
                soundEnabled={soundEnabled}
              />
            </motion.div>
          )}
          
          {currentSection === 'likes' && (
            <motion.div
              key="likes"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="min-h-full pb-8"
            >
              <MyLikesSection 
                onActivityComplete={markActivityComplete}
                completedActivities={completedActivities}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
  };
  
  export default KnowMeActivity; 