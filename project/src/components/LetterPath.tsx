import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Play } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

// Database integration - no longer using localStorage

const LetterPath: React.FC = () => {
  const navigate = useNavigate();
  const { childId } = useParams<{ childId: string }>();
  const { user, updateChildProgress, switchBackToParent } = useAuth();
  const [units, setUnits] = useState<any[]>([]);
  const [bookInfo, setBookInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [restartTrigger, setRestartTrigger] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  // Get child data
  const child = user?.children?.find(c => c.id === childId);

  // Get bookId from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get('bookId');

  // Fetch units and lessons for the selected book
  useEffect(() => {
    if (bookId) {
      fetchBookContent();
    }
  }, [bookId, childId]);

  // Check screen size and refresh progress when restart trigger changes
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1143);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    if (restartTrigger > 0) {
      // Refresh book content from database
      fetchBookContent();
    }
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [restartTrigger]);

  const fetchBookContent = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/activities/book/${bookId}/units-lessons/${childId}`);
      
      if (response.data.success) {
        setUnits(response.data.units || []);
        setBookInfo(response.data.book || {});
      } else {
        setError('Failed to load book content');
      }
    } catch (err) {
      console.error('Error fetching book content:', err);
      setError('Error loading book content');
    } finally {
      setLoading(false);
    }
  };

  // Calculate overall progress from database units
  const getOverallProgress = () => {
    if (units.length === 0) return 0;
    const totalLessons = units.reduce((sum, unit) => sum + (unit.lessons?.length || 0), 0);
    const completedLessons = units.reduce((sum, unit) => 
      sum + (unit.lessons?.filter((lesson: any) => lesson.is_unlocked).length || 0), 0);
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  };

  // Check if unit should be unlocked based on database data
  const shouldUnlockUnit = (unitId: number) => {
    const unit = units.find(u => u.unit_id === unitId);
    if (!unit) return false;
    return unit.is_unlocked;
  };

  // Level data is now fetched from database instead of hardcoded

  // Remove this useEffect as we're now using database instead of localStorage

  const handleLessonClick = (lessonId: number) => {
    // Navigate to the lesson activities
    navigate(`/lesson-activities/${lessonId}/${childId}`);
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

  const handleCloseModal = () => {
    setSelectedUnit(null);
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
          onClick={() => navigate(`/student-books/${childId}`)}
        >
          ← Back to Books
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
            onClick={fetchBookContent}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <div className="relative w-full min-h-[600px] flex flex-col items-center justify-center px-2 sm:px-4 md:px-8">
          
          {/* Book Title */}
          {bookInfo && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{bookInfo.title}</h1>
              <p className="text-gray-600">{bookInfo.description}</p>
            </motion.div>
          )}

          {/* Units Layout */}
          <div className="w-full max-w-6xl">
            {units.map((unit, unitIndex) => (
              <motion.div
                key={unit.unit_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: unitIndex * 0.1 }}
                className="mb-12"
              >
                {/* Unit Header */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Unit {unit.unit_number}: {unit.unit_title}
                  </h2>
                  <p className="text-gray-600 mb-4">{unit.unit_description}</p>
                  
                  {/* Unit Status */}
                  <div className="flex items-center justify-center space-x-4">
                    <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      unit.is_unlocked 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {unit.is_unlocked ? '🔓 Unlocked' : '🔒 Locked'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {unit.lessons?.length || 0} Lessons
                    </div>
                  </div>
                </div>

                {/* Lessons Grid */}
                {unit.is_unlocked && unit.lessons && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {unit.lessons.map((lesson: any, lessonIndex: number) => (
                      <motion.div
                        key={lesson.lesson_id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: lessonIndex * 0.05 }}
                        className={`bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
                          lesson.is_unlocked ? 'border-2 border-green-200' : 'border-2 border-gray-200 opacity-60'
                        }`}
                        onClick={() => lesson.is_unlocked && handleLessonClick(lesson.lesson_id)}
                      >
                        <div className="text-center">
                          <div className="mb-4">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                              lesson.is_unlocked 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-300 text-gray-500'
                            }`}>
                              {lesson.is_unlocked ? (
                                <Play className="h-8 w-8" />
                              ) : (
                                <Lock className="h-8 w-8" />
                              )}
                            </div>
                          </div>
                          
                          <h3 className="text-lg font-bold text-gray-800 mb-2">
                            Lesson {lesson.lesson_number}: {lesson.lesson_title}
                          </h3>
                          
                          <div className="text-sm text-gray-600 mb-4">
                            {lesson.is_unlocked ? 'Ready to start!' : 'Will be unlocked later'}
                          </div>
                          
                          {lesson.is_unlocked ? (
                            <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors">
                              Start Lesson
                            </button>
                          ) : (
                            <div className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-lg font-semibold text-center">
                              Locked
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Locked Unit Message */}
                {!unit.is_unlocked && (
                  <div className="text-center py-8 bg-gray-50 rounded-xl">
                    <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Unit Locked</h3>
                    <p className="text-gray-500">This unit will be unlocked by your teacher when you're ready.</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}


    </div>
  );
};

export default LetterPath; 