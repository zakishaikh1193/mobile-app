import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Lock, Play, RotateCcw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const BADGES = [
  '/badges/B1.png',
  '/badges/B2.png',
  '/badges/B3.png',
  '/badges/B4.png',
  '/badges/B5.png',
];

const LEVELS = 5;

const getProgress = () => {
  try {
    return JSON.parse(localStorage.getItem('letterPathProgress') || '[]');
  } catch {
    return [];
  }
};

const setProgress = (progress: number[]) => {
  localStorage.setItem('letterPathProgress', JSON.stringify(progress));
};

const LetterPath: React.FC = () => {
  const navigate = useNavigate();
  const { childId } = useParams<{ childId: string }>();
  const { user, updateChildProgress } = useAuth();
  const [progress, setProgressState] = useState<number[]>(getProgress());
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [restartTrigger, setRestartTrigger] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  // Get child data
  const child = user?.children?.find(c => c.id === childId);

  // Check screen size and refresh progress when restart trigger changes
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1143);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    if (restartTrigger > 0) {
      // Refresh progress from localStorage
      const freshProgress = getProgress();
      setProgressState(freshProgress);
    }
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [restartTrigger]);

  // Calculate overall progress from all learning hubs
  const getOverallProgress = () => {
    if (!child) return 0;
    const progressValues = Object.values(child.progress) as number[];
    return progressValues.reduce((sum, val) => sum + val, 0) / progressValues.length;
  };

  // Check if level should be unlocked based on progress
  const shouldUnlockLevel = (level: number) => {
    if (level === 1) return true; // Level 1 is always unlocked
    // All other levels require teacher approval - mock system
    return false; // Only Level 1 is accessible
  };

  // Level data with details
  const levelData = [
    {
      id: 1,
      title: 'All About Me and My Family',
      description: 'Build self-awareness, recognize emotions, explore the body, and understand family and home',
      objectives: [
        'Recognize and express basic emotions',
        'Identify body parts and personal preferences',
        'Understand family roles, home spaces, and traditions'
      ],
      difficulty: 'Easy',
      estimatedTime: 60,
      skills: ['Emotional Awareness', 'Body & Spatial Knowledge', 'Social Understanding'],
      rewards: {
        stars: 3,
        badges: ['Me & My World Explorer'],
        points: 600
      }
    },
    {
      id: 2,
      title: 'Creative Expression',
      description: 'Express yourself through art and creativity',
      objectives: ['Create artwork', 'Use imagination', 'Develop creativity'],
      difficulty: 'Easy',
      estimatedTime: 15,
      skills: ['Artistic expression', 'Creativity', 'Fine motor skills'],
      rewards: {
        stars: 3,
        badges: ['Creative Artist'],
        points: 150
      }
    },
    {
      id: 3,
      title: 'Story Time',
      description: 'Listen to and create stories',
      objectives: ['Listen to stories', 'Create narratives', 'Develop imagination'],
      difficulty: 'Medium',
      estimatedTime: 20,
      skills: ['Listening comprehension', 'Storytelling', 'Imagination'],
      rewards: {
        stars: 3,
        badges: ['Story Master'],
        points: 200
      }
    },
    {
      id: 4,
      title: 'Math Adventure',
      description: 'Learn numbers and basic math concepts',
      objectives: ['Count numbers', 'Learn basic addition', 'Understand patterns'],
      difficulty: 'Medium',
      estimatedTime: 25,
      skills: ['Number recognition', 'Basic math', 'Pattern recognition'],
      rewards: {
        stars: 3,
        badges: ['Math Explorer'],
        points: 250
      }
    },
    {
      id: 5,
      title: 'Science Discovery',
      description: 'Explore the world through science',
      objectives: ['Learn about nature', 'Understand basic science', 'Make observations'],
      difficulty: 'Hard',
      estimatedTime: 30,
      skills: ['Scientific thinking', 'Observation', 'Curiosity'],
      rewards: {
        stars: 3,
        badges: ['Science Master'],
        points: 300
      }
    }
  ];

  useEffect(() => {
    setProgress(progress);
  }, [progress]);

  const handleStart = (level: number) => {
    if (level === 1) {
      // Navigate to children's dashboard for level 1
      navigate(`/child-dashboard/${childId}`);
    } else {
      // For other levels, stay in standalone mode
      console.log(`Starting level ${level} - standalone mode`);
    }
  };

  const handleBackToParent = () => {
    navigate('/parent-dashboard');
  };

  const handleRestart = (level: number) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to restart everything?\n\n' +
      'This will reset:\n' +
      '• All learning progress to 0%\n' +
      '• Day streak to 0\n' +
      '• All earned badges\n' +
      '• Level progress\n' +
      '• Teacher notifications\n\n' +
      'This action cannot be undone!'
    );
    
    if (!confirmed) {
      return;
    }
    
    // Reset all progress to 0% - complete restart
    const newProgress: number[] = [];
    setProgress(newProgress);
    setProgressState(newProgress);
    
    // Reset child's learning hub progress to 0%
    if (child) {
      const hubs = ['literacy', 'creativity', 'maths', 'emotions', 'body', 'family'];
      hubs.forEach(hub => {
        updateChildProgress(child.id, hub, 0);
      });
      
      // Reset day streak and badges
      const savedUser = localStorage.getItem('kodeit_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        const childIndex = user.children?.findIndex((c: any) => c.id === child.id);
        if (childIndex !== undefined && childIndex >= 0) {
          user.children[childIndex].streak = 0;
          user.children[childIndex].badges = [];
          // Force immediate save
          localStorage.setItem('kodeit_user', JSON.stringify(user));
        }
      }
      
      // Clear all activity dates
      localStorage.removeItem(`lastActivity_${child.id}`);
      
      // Clear teacher notifications
      localStorage.removeItem('teacherNotifications');
      
      // Clear LetterPath progress
      localStorage.removeItem('letterPathProgress');
      
      // Force immediate localStorage update for all progress
      const updatedUser = JSON.parse(localStorage.getItem('kodeit_user') || '{}');
      if (updatedUser.children) {
        const childToUpdate = updatedUser.children.find((c: any) => c.id === child.id);
        if (childToUpdate) {
          childToUpdate.progress = {
            literacy: 0,
            creativity: 0,
            maths: 0,
            emotions: 0,
            body: 0,
            family: 0
          };
          childToUpdate.streak = 0;
          childToUpdate.badges = [];
          localStorage.setItem('kodeit_user', JSON.stringify(updatedUser));
        }
      }
      
      // Clear all possible progress-related localStorage items
      const keysToRemove = [
        'letterPathProgress',
        'teacherNotifications',
        `lastActivity_${child.id}`,
        'childProgress',
        'learningProgress',
        'activityProgress'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Show restart confirmation
      if (typeof window !== 'undefined' && 'Notification' in window) {
        new Notification('Restart Complete!', {
          body: 'All progress has been reset to 0%. You can start fresh from the beginning!',
          icon: '/badges/B1.png'
        });
      }
      
      // Force re-render by updating trigger
      setRestartTrigger(prev => prev + 1);
      
      // Close modal if open
      setSelectedLevel(null);
      
      // Force page reload to ensure all components update
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const handleLevelClick = (level: number) => {
    setSelectedLevel(level);
  };

  const handleStartLevel = (level: number) => {
    setSelectedLevel(null);
    if (level === 1) {
      // Navigate to children's dashboard for level 1
      navigate(`/child-dashboard/${childId}`);
    } else {
      // For other levels, stay in standalone mode
      console.log(`Starting level ${level} from popup - standalone mode`);
    }
  };

  const handleCloseModal = () => {
    setSelectedLevel(null);
  };





  // Standalone mode - no external game integration

  // Responsive horizontal/vertical path at 1143px breakpoint
  if (typeof window !== 'undefined') {
    const style = document.createElement('style');
    style.innerHTML = `@media (min-width: 1143px) { .custom1143\\:flex-row { flex-direction: row !important; } }`;
    document.head.appendChild(style);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-blue-200 px-2 sm:px-4 md:px-8 py-4 sm:py-8">
      {/* Blurred BG.png image as the only background */}
      <img
        src="/words/BG.png"
        alt="Background"
        className="fixed inset-0 w-full h-full object-cover z-0 opacity-60"
        style={{ minHeight: '100vh', minWidth: '100vw', objectFit: 'cover', zIndex: 0 }}
      />
      {/* Responsive Back Button */}
      <div className="w-full flex justify-center md:justify-start mb-40 relative z-20 mx-auto">
        <button
          className="w-full sm:w-48 md:w-auto px-4 py-2 rounded-full bg-blue-500 text-white font-bold shadow hover:bg-blue-600 active:scale-95 transition z-30 md:fixed md:top-4 md:left-4"
          onClick={handleBackToParent}
        >
          ← Back to Parent Dashboard
        </button>
      </div>
      <h1 className="text-3xl font-extrabold text-center text-green-600 mb-8 mt-2 tracking-tight" style={{ fontFamily: 'Comic Sans MS, Comic Sans, cursive' }}></h1>
      <div className="relative w-full h-[600px] md:h-[400px] flex items-center justify-center px-2 sm:px-4 md:px-8">
        
        {/* Curved Level Layout */}
        <div className="relative w-full h-full">
          {[...Array(LEVELS)].map((_, idx) => {
            const level = idx + 1;
            const isUnlocked = shouldUnlockLevel(level);
            // Only Level 1 can be completed, and only when all activities are 100%
            const isCompleted = level === 1 && getOverallProgress() >= 100;
            const badgeSrc = BADGES[idx];
            const overallProgress = getOverallProgress();
            
            // Curved positioning for levels - horizontal desktop, V-shape mobile
            const getLevelPosition = (index: number) => {
              if (isDesktop) {
                // Desktop: horizontal straight line
                const positions = [
                  { x: 10, y: 50 },   // Level 1: Left
                  { x: 30, y: 50 },   // Level 2: Left-center
                  { x: 50, y: 50 },   // Level 3: Center
                  { x: 70, y: 50 },   // Level 4: Right-center
                  { x: 90, y: 50 }    // Level 5: Right
                ];
                return { left: `${positions[index].x}%`, top: `${positions[index].y}%` };
              } else {
                // Mobile & iPad: vertical inverted V-shape
                const positions = [
                  { x: 65, y: -12 },   // Level 1: Top center
                  { x: 25, y: 22 },   // Level 2: Mid-left
                  { x: 70, y: 62 },   // Level 3: Mid-right
                  { x: 30, y: 102 },   // Level 4: Bottom-left
                  { x: 70, y: 142 }    // Level 5: Bottom-right
                ];
                return { left: `${positions[index].x}%`, top: `${positions[index].y}%` };
              }
            };
            
            const position = getLevelPosition(idx);
            
            return (
              <div 
                key={level} 
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
                style={position}
              >
              <div className="mb-2 flex flex-col items-center">
                <motion.button
                  onClick={() => handleLevelClick(level)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="cursor-pointer relative"
                >
                  {/* Progress Circle for Level 1 */}
                  {level === 1 && (
                    <div className="absolute -inset-2 flex items-center justify-center z-10 bg-blue-100 rounded-full">
                      <svg className="w-24 sm:w-26 md:w-28 h-24 sm:h-26 md:h-28 transform -rotate-90" viewBox="0 0 100 100">
                        {/* Background circle */}
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                        />
                        {/* Progress circle */}
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${overallProgress * 2.83} 283`}
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      {/* Progress percentage */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs sm:text-sm md:text-base font-bold text-green-600">
                          {Math.round(overallProgress)}%
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <img
                    src={badgeSrc}
                    alt={`Level ${level} Badge`}
                    className={`w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 rounded-full shadow-lg border-4 transition-all duration-300 z-20 relative ${isCompleted ? 'border-green-500 scale-110 animate-bounce' : isUnlocked ? 'border-yellow-400 grayscale' : 'border-gray-300 grayscale opacity-60'} ${isCompleted ? '' : 'hover:scale-105'}`}
                    style={{ filter: isCompleted ? 'none' : 'grayscale(100%)', background: '#fff' }}
                  />
                </motion.button>
                <span className="text-base sm:text-lg md:text-xl font-bold text-gray-700 mt-2">Level {level}</span>
              </div>
              <div className="flex flex-row gap-2 items-center justify-center mt-1">
                {isCompleted ? (
                  <>
                    <div className="text-green-600 font-bold">✓ Level 1 Complete!</div>
                  </>
                ) : isUnlocked ? (
                  <>
                    <button
                      className="px-6 py-2 rounded-full bg-green-500 text-white font-bold shadow hover:bg-green-600 active:scale-95 transition"
                      onClick={() => handleStart(level)}
                    >
                      Start
                    </button>
                  </>
                ) : (
                  <div className="text-gray-400 text-sm">🔒 Teacher Approval Required</div>
                )}
              </div>
              


            </div>
          );
        })}
        </div>
      </div>

      {/* Level Details Popup Modal */}
      <AnimatePresence>
        {selectedLevel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedLevel && (
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={BADGES[selectedLevel - 1]}
                        alt={`Level ${selectedLevel} Badge`}
                        className="w-12 h-12 rounded-full border-2 border-yellow-400"
                      />
                      <div>
                        <h2 className="text-xl font-bold text-gray-800">
                          {levelData[selectedLevel - 1].title}
                        </h2>
                        <p className="text-sm text-gray-600">Level {selectedLevel}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleCloseModal}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 mb-4">
                    {levelData[selectedLevel - 1].description}
                  </p>

                  {/* Difficulty and Time */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        levelData[selectedLevel - 1].difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                        levelData[selectedLevel - 1].difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {levelData[selectedLevel - 1].difficulty}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Time:</span>
                      <span>{levelData[selectedLevel - 1].estimatedTime} min</span>
                    </div>
                  </div>

                  {/* Objectives */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Learning Objectives:</h3>
                    <ul className="space-y-1">
                      {levelData[selectedLevel - 1].objectives.map((objective, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Skills */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Skills You'll Learn:</h3>
                    <div className="flex flex-wrap gap-2">
                      {levelData[selectedLevel - 1].skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Rewards */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-2">Rewards:</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-700">
                          {levelData[selectedLevel - 1].rewards.stars} Stars
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">
                          {levelData[selectedLevel - 1].rewards.points} Points ({Math.floor(levelData[selectedLevel - 1].rewards.points / 6)} per activity)
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      {levelData[selectedLevel - 1].rewards.badges.map((badge, index) => (
                        <span
                          key={index}
                          className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium mr-2"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {selectedLevel === 1 ? (
                      <motion.button
                        onClick={() => handleStartLevel(selectedLevel)}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-600 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Play className="w-4 h-4" />
                        Start Level
                      </motion.button>
                    ) : (
                      <div className="flex-1 flex items-center justify-center gap-2 bg-gray-300 text-gray-500 py-3 px-4 rounded-xl font-semibold">
                        <Lock className="w-4 h-4" />
                        Teacher Approval Required
                      </div>
                    )}
                    
                    {(selectedLevel === 1 && getOverallProgress() >= 100) && (
                      <motion.button
                        onClick={() => {
                          handleRestart(selectedLevel);
                          handleCloseModal();
                        }}
                        className="flex items-center justify-center gap-2 bg-yellow-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-yellow-600 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <RotateCcw className="w-4 h-4" />
                        Restart
                      </motion.button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LetterPath; 