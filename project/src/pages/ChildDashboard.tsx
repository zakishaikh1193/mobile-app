import React, { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Palette, Calculator, Heart, User, Users, Camera, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAudio } from '../contexts/AudioContext';
import KodeitLogo from '../components/KodeitLogo';
import AnimatedButton from '../components/AnimatedButton';
import AudioButton from '../components/AudioButton';
import ProgressWheel from '../components/ProgressWheel';
import { useContentLibrary } from '../contexts/ContentLibraryContext';
import EducationalGame from './EducationalGame';

const KnowMeActivity = React.lazy(() => import('./KnowMeActivity'));

const ChildDashboard: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const { user } = useAuth();
  const { speak } = useAudio();
  const navigate = useNavigate();
  const { contentLibrary } = useContentLibrary();
  const [htmlModalUrl, setHtmlModalUrl] = useState<string | null>(null);
  const [showKnowMe, setShowKnowMe] = useState(false);

  const child = user?.children?.find(c => c.id === childId);

  useEffect(() => {
    if (child) {
      speak(`Hi ${child.name}! Ready for some fun learning today? Let's explore together!`);
    }
  }, [child, speak]);

  const learningHubs = [
    {
      id: 'literacy',
      title: 'Literacy Hub',
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500',
      description: 'Letters, sounds, and stories',
      emoji: '📚'
    },
    {
      id: 'forest-letter-hunt',
      title: 'Forest Letter Hunt',
      icon: null, // You can add a custom icon if desired
      color: 'from-green-700 to-lime-400',
      description: 'Find letters hiding in the magical forest!',
      emoji: '🌳'
    },
    {
      id: 'creativity',
      title: 'Creativity Hub',
      icon: Palette,
      color: 'from-pink-500 to-rose-500',
      description: 'Colors, drawing, and art',
      emoji: '🎨'
    },
    {
      id: 'maths',
      title: 'Maths Hub',
      icon: Calculator,
      color: 'from-green-500 to-emerald-500',
      description: 'Numbers, shapes, and counting',
      emoji: '🔢'
    },
    {
      id: 'emotions',
      title: 'Emotions Hub',
      icon: Heart,
      color: 'from-red-500 to-pink-500',
      description: 'Feelings and expressions',
      emoji: '😊'
    },
    {
      id: 'body',
      title: 'My Body Hub',
      icon: User,
      color: 'from-orange-500 to-yellow-500',
      description: 'Body parts and health',
      emoji: '🏃‍♂️'
    },
    {
      id: 'family',
      title: 'My Family Hub',
      icon: Users,
      color: 'from-purple-500 to-indigo-500',
      description: 'Family and relationships',
      emoji: '👨‍👩‍👧‍👦'
    },
    {
      id: 'educational-game',
      title: 'Educational Games & Tasks',
      icon: null, // You can add a custom icon if desired
      color: 'from-yellow-400 to-orange-400',
      description: 'Fun games and learning tasks',
      emoji: '🎲'
    },
    {
      id: 'word-match',
      title: 'Word Match',
      icon: null,
      color: 'from-green-400 to-blue-400',
      description: 'Drag and drop to match words',
      emoji: '🔤'
    },
    {
      id: 'tap-translation',
      title: 'Tap the Correct Translation',
      icon: null,
      color: 'from-yellow-400 to-pink-400',
      description: 'Tap the right answer',
      emoji: '🖐️'
    },
    {
      id: 'know-me',
      title: 'Know Me: My Body and My Favorites',
      icon: null, // You can add a custom icon if desired
      color: 'from-blue-400 to-pink-400',
      description: 'Interactive Learning Adventure',
      emoji: '🧒',
      cardDescription: 'Discover your amazing body and share your favorite things! Learn about body parts, their functions, and express your likes and dislikes through fun interactive games.'
    }
  ];

  if (!child) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Child not found</h2>
          <AnimatedButton onClick={() => navigate('/parent-dashboard')}>
            Back to Dashboard
          </AnimatedButton>
        </div>
      </div>
    );
  }

  const getOverallProgress = () => {
    const progressValues = Object.values(child.progress) as number[];
    return progressValues.reduce((sum, val) => sum + val, 0) / progressValues.length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
      <AudioButton />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <AnimatedButton
              variant="secondary"
              size="sm"
              onClick={() => navigate('/parent-dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </AnimatedButton>
            <KodeitLogo size="md" />
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Welcome back,</p>
              <p className="font-bold text-gray-800">{child.name}!</p>
            </div>
            <div className="w-12 h-12">
              <img src={child.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
          >
            Hi {child.name}! 👋
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl text-gray-600 mb-8"
          >
            Ready for another amazing learning adventure?
          </motion.p>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-3xl p-8 shadow-lg mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="text-center">
              <ProgressWheel progress={getOverallProgress()} size={120}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(getOverallProgress())}%
                  </div>
                  <div className="text-xs text-gray-500">Complete</div>
                </div>
              </ProgressWheel>
              <p className="text-gray-600 mt-4">Overall Progress</p>
            </div>
            
            <div className="text-center">
              <div className="text-6xl mb-4">🔥</div>
              <div className="text-3xl font-bold text-orange-600">{child.streak}</div>
              <p className="text-gray-600">Day Streak</p>
            </div>
            
            <div className="text-center">
              <div className="text-6xl mb-4">🏆</div>
              <div className="text-3xl font-bold text-yellow-600">{child.badges.length}</div>
              <p className="text-gray-600">Badges Earned</p>
            </div>
          </div>
        </motion.div>

        {/* Learning Hubs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Choose Your Adventure!</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {learningHubs.map((hub, index) => (
              <motion.div
                key={hub.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => {
                  if (hub.id === 'literacy') {
                    navigate(`/letter-matching/${child.id}`);
                  } else if (hub.id === 'forest-letter-hunt') {
                    navigate(`/forest-letter-hunt/${child.id}`);
                  } else if (hub.id === 'educational-game') {
                    navigate(`/educational-game/${child.id}`);
                  } else if (hub.id === 'know-me') {
                    setShowKnowMe(true);
                  } else if (hub.id === 'word-match') {
                    navigate(`/letter-path/${child.id}`);
                  } else if (hub.id === 'tap-translation') {
                    navigate('/tap-translation');
                  } else {
                    navigate(`/learning/${hub.id}/${child.id}`);
                  }
                }}
              >
                <div className="text-center">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {hub.emoji}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{hub.title}</h3>
                  <p className="text-gray-600 mb-4">{hub.description}</p>
                  <div className="mb-4">
                    <ProgressWheel 
                      progress={child.progress[hub.id as keyof typeof child.progress]} 
                      size={80}
                      color={hub.color.includes('blue') ? '#3B82F6' : 
                             hub.color.includes('pink') ? '#EC4899' :
                             hub.color.includes('green') ? '#10B981' :
                             hub.color.includes('red') ? '#EF4444' :
                             hub.color.includes('orange') ? '#F59E0B' : '#8B5CF6'}
                    >
                      <span className="text-sm font-bold">
                        {child.progress[hub.id as keyof typeof child.progress]}%
                      </span>
                    </ProgressWheel>
                  </div>
                  <AnimatedButton
                    size="sm"
                    className={`bg-gradient-to-r ${hub.color} text-white`}
                  >
                    Let's Play!
                  </AnimatedButton>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AR Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 text-white text-center"
        >
          <div className="text-6xl mb-4">📱</div>
          <h3 className="text-2xl font-bold mb-4">AR Magic Zone</h3>
          <p className="text-lg mb-6 opacity-90">
            Point your camera at the book pages to see them come to life in 3D!
          </p>
          <AnimatedButton
            variant="secondary"
            size="lg"
            onClick={() => navigate(`/ar-zone/${child.id}`)}
            className="bg-white text-purple-600 hover:bg-gray-100"
          >
            <Camera className="h-5 w-5 mr-2" />
            Open AR Camera
          </AnimatedButton>
        </motion.div>
      </div>

      {/* Know Me Activity Modal/Page */}
      {showKnowMe && (
        <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">Loading...</div>}>
          <KnowMeActivity onClose={() => setShowKnowMe(false)} />
        </Suspense>
      )}
    </div>
  );
};

export default ChildDashboard;