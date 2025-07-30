import React from 'react';
import { User, Heart, Play, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';

interface GameMenuProps {
  onSectionSelect: (section: 'body' | 'likes') => void;
}

const GameMenu: React.FC<GameMenuProps> = ({ onSectionSelect }) => {
  const titleSpring = useSpring({
    from: { transform: 'scale(0.8) rotateY(-30deg)', opacity: 0 },
    to: { transform: 'scale(1) rotateY(0deg)', opacity: 1 },
    config: { tension: 200, friction: 20 }
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0, scale: 0.8 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 200
      }
    }
  };

  return (
    <motion.div 
      className="text-center py-4 sm:py-6 flex flex-col justify-start touch-manipulation px-2 sm:px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Title Card */}
      <animated.div style={titleSpring} className="mb-4 sm:mb-6">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-2xl border border-white/20 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 animate-pulse"></div>
          
          <motion.div
            animate={{ 
              background: [
                'linear-gradient(45deg, #3B82F6, #8B5CF6)',
                'linear-gradient(45deg, #8B5CF6, #EC4899)',
                'linear-gradient(45deg, #EC4899, #10B981)',
                'linear-gradient(45deg, #10B981, #3B82F6)'
              ]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 opacity-5"
          />
          
          <div className="relative z-10">
            <motion.h2 
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-2 font-comic leading-tight"
              animate={{ 
                textShadow: [
                  '0 0 20px rgba(59, 130, 246, 0.5)',
                  '0 0 30px rgba(139, 92, 246, 0.5)',
                  '0 0 20px rgba(59, 130, 246, 0.5)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Welcome to Your Learning Adventure!
            </motion.h2>
            
            <motion.p 
              className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 mb-3 sm:mb-4 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Choose a fun activity to start learning about yourself!
            </motion.p>
            
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex justify-center"
            >
              <Sparkles className="text-yellow-500 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </motion.div>
          </div>
        </div>
      </animated.div>

      {/* Activity Cards Container */}
      <motion.div 
        className="grid grid-cols-1 gap-4 sm:gap-6 max-w-4xl mx-auto w-full touch-manipulation"
        variants={containerVariants}
      >
        {/* My Body Section Card */}
        <motion.div variants={itemVariants} className="flex">
          <motion.button
            onClick={() => onSectionSelect('body')}
            className="group w-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white p-4 sm:p-5 md:p-6 rounded-2xl shadow-2xl relative overflow-hidden touch-manipulation min-h-[140px] sm:min-h-[160px] md:min-h-[180px] lg:min-h-[200px]"
            whileHover={{ 
              scale: 1.02, 
              rotateY: 5,
              boxShadow: "0 25px 50px rgba(59, 130, 246, 0.4)"
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            
            <div className="relative z-10 flex flex-col items-center h-full justify-center p-2">
              <motion.div 
                className="bg-white/20 backdrop-blur-sm p-2 sm:p-3 md:p-4 rounded-full mb-2 sm:mb-3 group-hover:bg-white/30 transition-all duration-300"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.8 }}
              >
                <User className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />
              </motion.div>
              
              <motion.h3 
                className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 font-comic text-center"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                My Body
              </motion.h3>
              
              <motion.p 
                className="text-xs sm:text-sm md:text-base opacity-90 text-center leading-tight px-2 sm:px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Learn about your amazing body parts and how they work!
              </motion.p>
              
              <motion.div
                className="mt-2 sm:mt-3 flex items-center gap-1 sm:gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-semibold">Start Learning</span>
              </motion.div>
            </div>
          </motion.button>
        </motion.div>

        {/* My Likes Section Card */}
        <motion.div variants={itemVariants} className="flex">
          <motion.button
            onClick={() => onSectionSelect('likes')}
            className="group w-full bg-gradient-to-br from-pink-400 via-pink-500 to-pink-600 text-white p-4 sm:p-5 md:p-6 rounded-2xl shadow-2xl relative overflow-hidden touch-manipulation min-h-[140px] sm:min-h-[160px] md:min-h-[180px] lg:min-h-[200px]"
            whileHover={{ 
              scale: 1.02, 
              rotateY: -5,
              boxShadow: "0 25px 50px rgba(236, 72, 153, 0.4)"
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
              animate={{ x: ['100%', '-100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            
            <div className="relative z-10 flex flex-col items-center h-full justify-center p-2">
              <motion.div 
                className="bg-white/20 backdrop-blur-sm p-2 sm:p-3 md:p-4 rounded-full mb-2 sm:mb-3 group-hover:bg-white/30 transition-all duration-300"
                whileHover={{ rotate: -360, scale: 1.1 }}
                transition={{ duration: 0.8 }}
              >
                <Heart className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />
              </motion.div>
              
              <motion.h3 
                className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 font-comic text-center"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                My Favorites
              </motion.h3>
              
              <motion.p 
                className="text-xs sm:text-sm md:text-base opacity-90 text-center leading-tight px-2 sm:px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Discover what you love and what makes you special!
              </motion.p>
              
              <motion.div
                className="mt-2 sm:mt-3 flex items-center gap-1 sm:gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-semibold">Start Learning</span>
              </motion.div>
            </div>
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default GameMenu;