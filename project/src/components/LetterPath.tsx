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
  '/badges/L1.png',  // Additional badge for level 6
  '/badges/B1.png',  // Reuse B1 for level 7
  '/badges/B2.png',  // Reuse B2 for level 8
];

const LEVELS = 5;

// Database integration - no longer using localStorage

const LetterPath: React.FC = () => {
  const navigate = useNavigate();
  const { childId } = useParams<{ childId: string }>();
  const { user, updateChildProgress, switchBackToParent } = useAuth();
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [restartTrigger, setRestartTrigger] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  // Get child data
  const child = user?.children?.find(c => c.id === childId);

  // Fetch topics from database
  useEffect(() => {
    fetchTopics();
  }, [childId]);

  // Check screen size and refresh progress when restart trigger changes
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1143);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    if (restartTrigger > 0) {
      // Refresh topics from database
      fetchTopics();
    }
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [restartTrigger]);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/educational/letterpath/${childId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch topics');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setTopics(data.topics);
      } else {
        setError('Failed to load topics');
      }
    } catch (err) {
      console.error('Error fetching topics:', err);
      setError('Error loading topics');
    } finally {
      setLoading(false);
    }
  };

  // Calculate overall progress from database topics
  const getOverallProgress = () => {
    if (topics.length === 0) return 0;
    const totalActivities = topics.reduce((sum, topic) => sum + topic.total_activities, 0);
    const completedActivities = topics.reduce((sum, topic) => sum + topic.completed_activities, 0);
    return totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;
  };

  // Check if level should be unlocked based on database data
  const shouldUnlockLevel = (level: number) => {
    const topic = topics.find(t => t.level_number === level);
    if (!topic) return false;
    return topic.is_available || topic.status === 'completed';
  };

  // Level data is now fetched from database instead of hardcoded

  // Remove this useEffect as we're now using database instead of localStorage

  const handleStart = (level: number) => {
    const topic = topics.find(t => t.level_number === level);
    if (topic && topic.is_available) {
      // Navigate to structured learning with the specific topic
      navigate(`/structured-learning/${childId}?topicId=${topic.topic_id}`);
    } else {
      console.log(`Level ${level} is not available`);
    }
  };

  const handleBackToParent = async () => {
    try {
      await switchBackToParent();
    } catch (error) {
      console.error('Error switching back to parent:', error);
      // Fallback navigation
      navigate('/parent/dashboard');
    }
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
    // Note: This will be handled by database reset in future implementation
    
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
    const topic = topics.find(t => t.level_number === level);
    if (topic) {
      setSelectedLevel(level);
    }
  };

  const handleStartLevel = (level: number) => {
    setSelectedLevel(null);
    const topic = topics.find(t => t.level_number === level);
    if (topic && topic.is_available) {
      // Navigate to structured learning with the specific topic
      navigate(`/structured-learning/${childId}?topicId=${topic.topic_id}`);
    } else {
      console.log(`Level ${level} is not available`);
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
      
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={fetchTopics}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <div className="relative w-full h-[600px] md:h-[400px] flex items-center justify-center px-2 sm:px-4 md:px-8">
        
        {/* Curved Level Layout */}
        <div className="relative w-full h-full">
          {topics.map((topic, idx) => {
            const level = topic.level_number;
            const isUnlocked = shouldUnlockLevel(level);
            const isCompleted = topic.status === 'completed';
            const badgeSrc = BADGES[idx] || BADGES[0]; // Fallback to first badge
            const overallProgress = getOverallProgress();
            
            // Curved positioning for levels - horizontal desktop, V-shape mobile
            const getLevelPosition = (index: number) => {
              if (isDesktop) {
                // Desktop: horizontal straight line with more positions
                const positions = [
                  { x: 10, y: 50 },   // Level 1: Left
                  { x: 25, y: 50 },   // Level 2: Left-center
                  { x: 40, y: 50 },   // Level 3: Center-left
                  { x: 55, y: 50 },   // Level 4: Center
                  { x: 70, y: 50 },   // Level 5: Center-right
                  { x: 85, y: 50 },   // Level 6: Right-center
                  { x: 100, y: 50 },  // Level 7: Right
                  { x: 115, y: 50 }   // Level 8: Far-right
                ];
                // Use modulo to handle any number of levels
                const safeIndex = index % positions.length;
                return { left: `${positions[safeIndex].x}%`, top: `${positions[safeIndex].y}%` };
              } else {
                // Mobile & iPad: vertical inverted V-shape with more positions
                const positions = [
                  { x: 65, y: -12 },   // Level 1: Top center
                  { x: 25, y: 22 },   // Level 2: Mid-left
                  { x: 70, y: 62 },   // Level 3: Mid-right
                  { x: 30, y: 102 },   // Level 4: Bottom-left
                  { x: 70, y: 142 },   // Level 5: Bottom-right
                  { x: 15, y: 182 },   // Level 6: Far-bottom-left
                  { x: 80, y: 222 },   // Level 7: Far-bottom-right
                  { x: 50, y: 262 }    // Level 8: Bottom-center
                ];
                // Use modulo to handle any number of levels
                const safeIndex = index % positions.length;
                return { left: `${positions[safeIndex].x}%`, top: `${positions[safeIndex].y}%` };
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
      )}

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
                        src={BADGES[selectedLevel - 1] || BADGES[0]}
                        alt={`Level ${selectedLevel} Badge`}
                        className="w-12 h-12 rounded-full border-2 border-yellow-400"
                      />
                      <div>
                        <h2 className="text-xl font-bold text-gray-800">
                          {topics.find(t => t.level_number === selectedLevel)?.topic_title || `Level ${selectedLevel}`}
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
                    {topics.find(t => t.level_number === selectedLevel)?.topic_description || 'No description available'}
                  </p>

                  {/* Progress and Activities */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        {topics.find(t => t.level_number === selectedLevel)?.completed_activities || 0}/{topics.find(t => t.level_number === selectedLevel)?.total_activities || 0} Activities
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Progress:</span>
                      <span>{topics.find(t => t.level_number === selectedLevel)?.progress_percentage || 0}%</span>
                    </div>
                  </div>

                  {/* Chapter and Subject Info */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Learning Context:</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="font-medium">Subject:</span>
                        <span>{topics.find(t => t.level_number === selectedLevel)?.subject_name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="font-medium">Book:</span>
                        <span>{topics.find(t => t.level_number === selectedLevel)?.book_title || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="font-medium">Chapter:</span>
                        <span>{topics.find(t => t.level_number === selectedLevel)?.chapter_title || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status and Completion */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-2">Status:</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          topics.find(t => t.level_number === selectedLevel)?.status === 'completed' ? 'bg-green-100 text-green-700' :
                          topics.find(t => t.level_number === selectedLevel)?.status === 'available' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {topics.find(t => t.level_number === selectedLevel)?.status === 'completed' ? 'Completed' :
                           topics.find(t => t.level_number === selectedLevel)?.status === 'available' ? 'Available' : 'Locked'}
                        </div>
                      </div>
                      {topics.find(t => t.level_number === selectedLevel)?.completion_score && (
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-gray-700">
                            {topics.find(t => t.level_number === selectedLevel)?.completion_score}% Score
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {topics.find(t => t.level_number === selectedLevel)?.is_available ? (
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
                        {topics.find(t => t.level_number === selectedLevel)?.unlock_requirement ? 
                          `Complete ${topics.find(t => t.level_number === selectedLevel)?.unlock_requirement} previous topic(s)` : 
                          'Teacher Approval Required'}
                      </div>
                    )}
                    
                    {topics.find(t => t.level_number === selectedLevel)?.status === 'completed' && (
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