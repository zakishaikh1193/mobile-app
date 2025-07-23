import React, { useState } from 'react';
import { Music, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BodyPartsDragDrop from './BodyPartsDragDrop';
import BodyPartsMatching from './BodyPartsMatching';
import HeadShouldersGame from './HeadShouldersGame';
import TracingActivity from './TracingActivity';

interface MyBodySectionProps {
  onActivityComplete: (activityId: string) => void;
  completedActivities: string[];
  soundEnabled?: boolean;
}

const MyBodySection: React.FC<MyBodySectionProps> = ({ 
  onActivityComplete, 
  completedActivities, 
  soundEnabled = true 
}) => {
  const [currentActivity, setCurrentActivity] = useState<'menu' | 'dragdrop' | 'matching' | 'song' | 'tracing'>('menu');

  const activities = [
    {
      id: 'body-dragdrop',
      title: 'Label My Body',
      description: 'Drag body part names to the right places!',
      icon: '🫵',
      activity: 'dragdrop',
      color: 'from-blue-400 via-blue-500 to-blue-600',
      shadowColor: 'rgba(59, 130, 246, 0.4)'
    },
    {
      id: 'body-matching',
      title: 'What Do They Do?',
      description: 'Match body parts with their jobs!',
      icon: '🔗',
      activity: 'matching',
      color: 'from-green-400 via-green-500 to-green-600',
      shadowColor: 'rgba(34, 197, 94, 0.4)'
    },
    {
      id: 'body-song',
      title: 'Head, Shoulders Song',
      description: 'Sing and move with the music!',
      icon: '🎵',
      activity: 'song',
      color: 'from-purple-400 via-purple-500 to-purple-600',
      shadowColor: 'rgba(139, 92, 246, 0.4)'
    },
    {
      id: 'body-tracing',
      title: 'Trace & Learn',
      description: 'Trace body parts and hear their names!',
      icon: '✏️',
      activity: 'tracing',
      color: 'from-orange-400 via-orange-500 to-orange-600',
      shadowColor: 'rgba(249, 115, 22, 0.4)'
    }
  ];

  if (currentActivity !== 'menu') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.5 }}
      >
        <motion.button
          onClick={() => setCurrentActivity('menu')}
          className="mb-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl border border-white/20"
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2">
            <ArrowLeft size={24} />
            Back to Activities
          </div>
        </motion.button>
        
        <AnimatePresence mode="wait">
          {currentActivity === 'dragdrop' && (
            <BodyPartsDragDrop 
              onComplete={() => onActivityComplete('body-dragdrop')} 
              soundEnabled={soundEnabled}
            />
          )}
          {currentActivity === 'matching' && (
            <BodyPartsMatching 
              onComplete={() => onActivityComplete('body-matching')}
              soundEnabled={soundEnabled}
            />
          )}
          {currentActivity === 'song' && (
            <HeadShouldersGame 
              onComplete={() => onActivityComplete('body-song')}
              soundEnabled={soundEnabled}
            />
          )}
          {currentActivity === 'tracing' && (
            <TracingActivity 
              onComplete={() => onActivityComplete('body-tracing')}
              soundEnabled={soundEnabled}
            />
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="text-center mb-12">
        <motion.h2 
          className="text-4xl md:text-6xl font-bold text-white mb-6 font-comic"
          animate={{ 
            textShadow: [
              '0 0 20px rgba(255,255,255,0.5)',
              '0 0 30px rgba(255,255,255,0.8)',
              '0 0 20px rgba(255,255,255,0.5)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          My Amazing Body! 
          <motion.span
            animate={{ 
              rotate: [0, 20, -20, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block ml-2"
          >
            💪
          </motion.span>
        </motion.h2>
        
        <motion.p 
          className="text-xl md:text-2xl text-white/90"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Let's learn about all the incredible parts of your body!
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {activities.map((activity, index) => {
          const isCompleted = completedActivities.includes(activity.id);
          
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                delay: index * 0.2,
                type: "spring",
                stiffness: 200,
                damping: 20
              }}
            >
              <motion.button
                onClick={() => setCurrentActivity(activity.activity as any)}
                className={`group w-full bg-gradient-to-br ${activity.color} text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden border border-white/20`}
                whileHover={{ 
                  scale: 1.05,
                  rotateY: 5,
                  boxShadow: `0 25px 50px ${activity.shadowColor}`
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Animated background gradient */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                
                {/* Completion badge */}
                <AnimatePresence>
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="absolute top-4 right-4 z-10"
                    >
                      <div className="bg-green-500 text-white rounded-full p-2 shadow-lg">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <CheckCircle size={28} />
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="relative z-10 flex flex-col items-center">
                  <motion.div 
                    className="text-8xl mb-6"
                    whileHover={{ 
                      scale: 1.2, 
                      rotate: 360 
                    }}
                    transition={{ duration: 0.8 }}
                  >
                    {activity.icon}
                  </motion.div>
                  
                  <motion.h3 
                    className="text-2xl md:text-3xl font-bold mb-4 font-comic"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                  >
                    {activity.title}
                  </motion.h3>
                  
                  <p className="text-lg md:text-xl opacity-90 mb-6 leading-relaxed">
                    {activity.description}
                  </p>
                  
                  <motion.div 
                    className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full"
                    whileHover={{ 
                      scale: 1.1, 
                      backgroundColor: 'rgba(255,255,255,0.3)' 
                    }}
                  >
                    <span className="font-bold text-lg">Let's Play!</span>
                  </motion.div>
                </div>

                {/* Floating particles */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-white/30 rounded-full"
                      initial={{ 
                        x: Math.random() * 100 + '%',
                        y: Math.random() * 100 + '%',
                        scale: 0
                      }}
                      animate={{
                        y: [0, -20, 0],
                        scale: [0, 1, 0],
                        opacity: [0, 0.8, 0]
                      }}
                      transition={{
                        duration: 3,
                        delay: Math.random() * 2,
                        repeat: Infinity,
                        repeatDelay: Math.random() * 3
                      }}
                    />
                  ))}
                </div>
              </motion.button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default MyBodySection;