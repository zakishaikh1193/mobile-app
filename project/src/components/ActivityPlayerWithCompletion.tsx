import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Clock, Target, Users } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import Gallery from './Gallery';
import DigitalPaintingWithCompletion from './DigitalPaintingWithCompletion';
import JigsawPuzzle from './JigsawPuzzle';
import WorkingMazePuzzle from './WorkingMazePuzzle';
import BubblePopLearning from './BubblePopLearning';
import { LineArt } from '../types/lineArt';
import BubblePopGame from './BubblePopGame';

interface Activity {
  id: number;
  title: string;
  type: string;
  description: string;
  difficulty: string;
  image_url?: string;
  colors?: string[];
  estimated_duration: number;
  lesson_id?: number;
  data?: any; // Activity-specific data (e.g., bubble pop game type)
}

const ActivityPlayerWithCompletion: React.FC = () => {
  const { activityId, childId } = useParams<{ activityId: string; childId: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArtwork, setSelectedArtwork] = useState<LineArt | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchActivity();
  }, [activityId]);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/activities/${activityId}`);
      
      if (response.data.success) {
        setActivity(response.data.activity);
      } else {
        setError('Failed to load activity');
      }
    } catch (err) {
      console.error('Error fetching activity:', err);
      setError('Error loading activity');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToActivities = () => {
    navigate(`/lesson-activities/${activity?.lesson_id}/${childId}`);
  };

  const handleArtworkSelect = (artwork: LineArt) => {
    setSelectedArtwork(artwork);
  };

  const handleCompleteColoring = (score: number) => {
    setSelectedArtwork(null);
    console.log('Coloring completed with score:', score);
  };

  const handleCompletePuzzle = (completionData: any) => {
    console.log('Puzzle completed:', completionData);
    // Handle puzzle completion - you can add navigation or other logic here
  };

  const renderActivityContent = () => {
    if (!activity) return null;

    switch (activity.type) {
      case 'coloring':
        return (
          <div className="w-full">
            {selectedArtwork ? (
              <DigitalPaintingWithCompletion 
                lineArt={selectedArtwork}
                onComplete={handleCompleteColoring}
                activityId={activity.id}
                childId={childId}
              />
            ) : (
              <>
                <div className="text-center mb-4 md:mb-8 px-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 md:mb-4">{activity.title}</h2>
                  <p className="text-gray-600 text-base md:text-lg mb-4 md:mb-6">{activity.description}</p>
                  
                  <div className="flex items-center justify-center space-x-4 md:space-x-6 text-xs md:text-sm text-gray-500 mb-6 md:mb-8">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 md:h-4 md:w-4" />
                      <span>{activity.estimated_duration} min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Target className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="capitalize">{activity.difficulty}</span>
                    </div>
                  </div>
                </div>

                <Gallery 
                  artworks={getColoringArtworks(activity)}
                  onSelectArtwork={handleArtworkSelect}
                />
              </>
            )}
          </div>
        );

      case 'letter_match':
        return (
          <div className="text-center px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Letter Matching</h2>
            <p className="text-gray-600">Letter matching activity coming soon!</p>
          </div>
        );

      case 'puzzle':
        return (
          <JigsawPuzzle
            activityId={activity.id}
            childId={parseInt(childId || '0')}
            onComplete={handleCompletePuzzle}
            onBack={handleBackToActivities}
          />
        );

      case 'maze':
        return (
          <WorkingMazePuzzle
            activityId={activity.id}
            childId={parseInt(childId || '0')}
            onComplete={handleCompletePuzzle}
            onBack={handleBackToActivities}
          />
        );

      case 'bubble_pop':
        return (
          <BubblePopGame
            bubbleType={activity.data?.bubblePopGameType || 'alphabet'}
            difficulty={activity.difficulty as 'easy' | 'medium' | 'hard'}
            onComplete={() => handleCompletePuzzle({})}
            onBack={handleBackToActivities}
          />
        );

      default:
        return (
          <div className="text-center px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Activity</h2>
            <p className="text-gray-600 mb-6">This activity type is not yet implemented.</p>
            
            <button 
              onClick={handleBackToActivities}
              className="px-4 md:px-6 py-2 md:py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm md:text-base min-h-[44px] touch-manipulation"
            >
              ← Back to Activities
            </button>
          </div>
        );
    }
  };

  const getColoringArtworks = (activity: Activity): LineArt[] => {
    return [{
      id: activity.id.toString(),
      title: activity.title,
      category: 'Coloring',
      difficulty: activity.difficulty as 'easy' | 'medium' | 'hard',
      referenceImage: activity.image_url || '/default-coloring.png',
      svgContent: activity.image_url || '/default-coloring.png',
      tags: ['coloring', 'fun', 'creative']
    }];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-3 md:mb-4"></div>
          <p className="text-base md:text-lg text-gray-600">Loading activity...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="text-center">
          <div className="bg-red-100 rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mx-auto mb-4">
            <Play className="h-8 w-8 md:h-10 md:w-10 text-red-500" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 md:mb-4">Error Loading Activity</h2>
          <p className="text-gray-600 mb-6 text-sm md:text-base">{error}</p>
          
          <button 
            onClick={handleBackToActivities}
            className="px-4 md:px-6 py-2 md:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm md:text-base min-h-[44px] touch-manipulation"
          >
            ← Back to Activities
          </button>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="text-center">
          <div className="bg-yellow-50 rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mx-auto mb-4">
            <Play className="h-8 w-8 md:h-10 md:w-10 text-yellow-500" />
          </div>
          <h3 className="text-xl md:text-2xl font-semibold text-gray-700 mb-2">Activity not found</h3>
          <p className="text-gray-500 mb-4 text-sm md:text-base">The activity you're looking for doesn't exist.</p>
          <button 
            onClick={handleBackToActivities}
            className="px-4 md:px-6 py-2 md:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm md:text-base min-h-[44px] touch-manipulation"
          >
            Back to Activities
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto p-3 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 md:mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBackToActivities}
              className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-3 md:px-4 py-2 md:py-3 rounded-lg text-gray-700 hover:bg-white transition-colors shadow-md text-sm md:text-base min-h-[44px] touch-manipulation"
            >
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
              <span>Back to Activities</span>
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {renderActivityContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default ActivityPlayerWithCompletion; 
