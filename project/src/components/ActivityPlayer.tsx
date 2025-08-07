import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Clock, Target, Users } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import Gallery from './Gallery';
import DigitalPainting from './DigitalPainting';
import { LineArt } from '../types/lineArt';

interface Activity {
  id: number;
  title: string;
  type: string;
  description: string;
  difficulty: string;
  image_url?: string;
  colors?: string[];
  estimated_duration: number;
  max_attempts: number;
  passing_score: number;
  lesson_id?: number;
}

const ActivityPlayer: React.FC = () => {
  const { activityId, childId } = useParams<{ activityId: string; childId: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArtwork, setSelectedArtwork] = useState<LineArt | null>(null);

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
    // Navigate back to lesson activities
    navigate(`/lesson-activities/${activity?.lesson_id}/${childId}`);
  };

  const handleArtworkSelect = (artwork: LineArt) => {
    setSelectedArtwork(artwork);
  };

  const handleCompleteColoring = (score: number) => {
    setSelectedArtwork(null);
    // Here you can add logic to save progress, show completion message, etc.
    console.log('Coloring completed with score:', score);
  };

  const renderActivityContent = () => {
    if (!activity) return null;

    switch (activity.type) {
      case 'coloring':
        return (
          <div className="w-full">
            {selectedArtwork ? (
              // Show the DigitalPainting component when an artwork is selected
              <DigitalPainting 
                lineArt={selectedArtwork}
                onComplete={handleCompleteColoring}
              />
            ) : (
              // Show the activity info and gallery when no artwork is selected
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">{activity.title}</h2>
                  <p className="text-gray-600 text-lg mb-6">{activity.description}</p>
                  
                  {/* Activity Info */}
                  <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 mb-8">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{activity.estimated_duration} min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Target className="h-4 w-4" />
                      <span className="capitalize">{activity.difficulty}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{activity.max_attempts} attempts</span>
                    </div>
                  </div>
                </div>

                {/* Coloring Gallery */}
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
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Letter Matching</h2>
            <p className="text-gray-600">Letter matching activity coming soon!</p>
          </div>
        );

      case 'bubble_pop':
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Bubble Pop</h2>
            <p className="text-gray-600">Bubble pop activity coming soon!</p>
          </div>
        );

      case 'counting':
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Counting Games</h2>
            <p className="text-gray-600">Counting activity coming soon!</p>
          </div>
        );

      case 'emotion_match':
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Emotion Matching</h2>
            <p className="text-gray-600">Emotion matching activity coming soon!</p>
          </div>
        );

      case 'family_tree':
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Family Tree</h2>
            <p className="text-gray-600">Family tree activity coming soon!</p>
          </div>
        );

      case 'digital_painting':
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Digital Painting</h2>
            <p className="text-gray-600">Digital painting activity coming soon!</p>
          </div>
        );

      case 'forest_hunt':
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Forest Hunt</h2>
            <p className="text-gray-600">Forest hunt activity coming soon!</p>
          </div>
        );

      default:
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Activity</h2>
            <p className="text-gray-600">This activity type is not yet implemented.</p>
          </div>
        );
    }
  };

  // Convert activity data to LineArt format for Gallery component
  const getColoringArtworks = (activity: Activity): LineArt[] => {
    // For now, create a single artwork from the activity data
    // In the future, you can fetch multiple artworks from the database
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading activity...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Play className="h-10 w-10 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Oops! Something went wrong</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button 
            onClick={fetchActivity}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="bg-yellow-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Play className="h-10 w-10 text-yellow-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Activity not found</h3>
          <p className="text-gray-500 mb-4">The activity you're looking for doesn't exist.</p>
          <button 
            onClick={handleBackToActivities}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Activities
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBackToActivities}
              className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg text-gray-700 hover:bg-white transition-colors shadow-md"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Activities</span>
            </button>
          </div>
        </motion.div>

        {/* Activity Content */}
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

export default ActivityPlayer;
