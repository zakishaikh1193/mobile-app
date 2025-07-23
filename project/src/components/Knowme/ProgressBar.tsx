import React from 'react';
import { Star, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';

interface ProgressBarProps {
  completedActivities: string[];
  totalActivities: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ completedActivities, totalActivities }) => {
  const progress = (completedActivities.length / totalActivities) * 100;
  
  const progressSpring = useSpring({
    width: `${progress}%`,
    config: { tension: 200, friction: 25 }
  });

  const containerSpring = useSpring({
    from: { opacity: 0, transform: 'translateY(-20px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { tension: 200, friction: 20 }
  });

  return (
    <animated.div style={containerSpring} className="relative z-10 mx-6 mt-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <motion.h4 
              className="text-xl font-bold text-gray-800 flex items-center gap-2"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Trophy className="text-purple-600" size={24} />
              </motion.div>
              Learning Progress
            </motion.h4>
            
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Star className="text-yellow-500 fill-yellow-500" size={20} />
              </motion.div>
              <span className="text-lg font-bold text-gray-700">
                {completedActivities.length} / {totalActivities} Complete
              </span>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-4 shadow-inner">
              <animated.div 
                style={progressSpring}
                className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 h-4 rounded-full relative overflow-hidden shadow-lg"
              >
                {/* Animated shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </animated.div>
            </div>
            
            {/* Progress milestones */}
            <div className="absolute top-0 left-0 w-full h-4 flex justify-between items-center">
              {[...Array(totalActivities)].map((_, index) => {
                const isCompleted = index < completedActivities.length;
                const position = ((index + 1) / totalActivities) * 100;
                
                return (
                  <motion.div
                    key={index}
                    className="absolute transform -translate-x-1/2"
                    style={{ left: `${position}%` }}
                    initial={{ scale: 0 }}
                    animate={{ 
                      scale: isCompleted ? [1, 1.3, 1] : 1,
                      rotate: isCompleted ? [0, 360] : 0
                    }}
                    transition={{ 
                      duration: 0.5,
                      delay: index * 0.1,
                      repeat: isCompleted ? Infinity : 0,
                      repeatDelay: 2
                    }}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isCompleted 
                        ? 'bg-yellow-400 border-yellow-500 text-yellow-800' 
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <Star size={12} className="fill-current" />
                      ) : (
                        <span className="text-xs font-bold">{index + 1}</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
          
          {/* Completion message */}
          {progress === 100 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 text-center"
            >
              <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-4 border-2 border-green-300">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl mb-2"
                >
                  🏆
                </motion.div>
                <p className="text-green-700 font-bold text-lg">
                  Congratulations! You completed all activities! 🎉
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </animated.div>
  );
};

export default ProgressBar;