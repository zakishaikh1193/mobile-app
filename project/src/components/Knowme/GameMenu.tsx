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
        type: "spring",
        damping: 12,
        stiffness: 200
      }
    }
  };

  return (
    <motion.div 
      className="text-center py-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <animated.div style={titleSpring} className="mb-12">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 relative overflow-hidden">
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
              className="text-4xl md:text-6xl font-bold text-gray-800 mb-4 font-comic"
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
              <motion.span
                animate={{ rotate: [0, 20, -20, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block ml-2"
              >
                🎉
              </motion.span>
            </motion.h2>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Choose a fun activity to start learning about yourself!
            </motion.p>
            
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex justify-center"
            >
              <Sparkles className="text-yellow-500" size={32} />
            </motion.div>
          </div>
        </div>
      </animated.div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
        variants={containerVariants}
      >
        {/* My Body Section */}
        <motion.div variants={itemVariants}>
          <motion.button
            onClick={() => onSectionSelect('body')}
            className="group w-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden"
            whileHover={{ 
              scale: 1.05, 
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
            
            <div className="relative z-10 flex flex-col items-center">
              <motion.div 
                className="bg-white/20 backdrop-blur-sm p-8 rounded-full mb-6 group-hover:bg-white/30 transition-all duration-300"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.8 }}
              >
                <User size={80} />
              </motion.div>
              
              <motion.h3 
                className="text-3xl md:text-4xl font-bold mb-4 font-comic"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                My Body
              </motion.h3>
              
              <p className="text-lg md:text-xl opacity-90 mb-6 leading-relaxed">
                Learn about your amazing body parts and what they do!
              </p>
              
              <motion.div 
                className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full"
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.3)' }}
              >
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Play size={24} />
                </motion.div>
                <span className="font-bold text-lg">Start Learning</span>
              </motion.div>
            </div>
          </motion.button>
        </motion.div>

        {/* My Likes Section */}
        <motion.div variants={itemVariants}>
          <motion.button
            onClick={() => onSectionSelect('likes')}
            className="group w-full bg-gradient-to-br from-pink-400 via-pink-500 to-pink-600 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden"
            whileHover={{ 
              scale: 1.05, 
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
            
            <div className="relative z-10 flex flex-col items-center">
              <motion.div 
                className="bg-white/20 backdrop-blur-sm p-8 rounded-full mb-6 group-hover:bg-white/30 transition-all duration-300"
                whileHover={{ rotate: -360, scale: 1.1 }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Heart size={80} />
                </motion.div>
              </motion.div>
              
              <motion.h3 
                className="text-3xl md:text-4xl font-bold mb-4 font-comic"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                My Favorites
              </motion.h3>
              
              <p className="text-lg md:text-xl opacity-90 mb-6 leading-relaxed">
                Discover what you love and share your favorite things!
              </p>
              
              <motion.div 
                className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full"
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.3)' }}
              >
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                >
                  <Play size={24} />
                </motion.div>
                <span className="font-bold text-lg">Start Exploring</span>
              </motion.div>
            </div>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Floating elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0.6
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 360],
              opacity: [0.6, 0.8, 0.6]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          >
            {['⭐', '🌟', '✨', '🎈', '🎊', '🌈'][i]}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default GameMenu;