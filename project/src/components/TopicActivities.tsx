import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, CheckCircle, Clock, Star, Trophy } from 'lucide-react';

interface Activity {
  id: number;
  title: string;
  type: string;
  description: string;
  difficulty: string;
  estimated_duration: number;
  max_attempts: number;
  passing_score: number;
  image_path: string;
  colors: string[];
  data: any;
  progress_value: number;
  score: number;
  completed: boolean;
  attempts_count: number;
  last_attempt_at: string;
  teacher_feedback: string;
  teacher_score: number;
  is_assessed: boolean;
}

interface Topic {
  id: number;
  title: string;
  completion_score: number;
}

interface TopicActivitiesProps {
  topicId: number;
  childId: string;
  onBack: () => void;
  onActivityComplete: (activityId: number, score: number) => void;
}

const TopicActivities: React.FC<TopicActivitiesProps> = ({
  topicId,
  childId,
  onBack,
  onActivityComplete
}) => {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  useEffect(() => {
    fetchTopicActivities();
  }, [topicId, childId]);

  const fetchTopicActivities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/educational/topics/${topicId}/activities?childId=${childId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setTopic(data.topic);
        setActivities(data.activities);
      } else {
        setError('Failed to load activities');
      }
    } catch (err) {
      setError('Error loading activities');
    } finally {
      setLoading(false);
    }
  };

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
  };

  const handleActivityComplete = async (activityId: number, score: number) => {
    try {
      // Update progress in backend
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/children/${childId}/progress`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activityType: 'activity',
          activityId: activityId.toString(),
          progressValue: 100,
          completed: true,
          score: score
        })
      });

      if (response.ok) {
        // Update local state
        setActivities(prev => prev.map(activity => 
          activity.id === activityId 
            ? { ...activity, completed: true, score: score, progress_value: 100 }
            : activity
        ));

        onActivityComplete(activityId, score);
        setSelectedActivity(null);

        // Check if all activities in topic are completed
        const updatedActivities = activities.map(activity => 
          activity.id === activityId 
            ? { ...activity, completed: true, score: score, progress_value: 100 }
            : activity
        );

        const allCompleted = updatedActivities.every(activity => activity.completed);
        if (allCompleted) {
          // Complete the topic
          await completeTopic();
        }
      }
    } catch (err) {
      console.error('Error completing activity:', err);
    }
  };

  const completeTopic = async () => {
    try {
      const avgScore = activities.reduce((sum, activity) => sum + (activity.score || 0), 0) / activities.length;
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/educational/complete-topic', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicId,
          childId: parseInt(childId),
          completionScore: avgScore
        })
      });

      if (response.ok) {
        // Show completion celebration
        console.log('Topic completed!');
      }
    } catch (err) {
      console.error('Error completing topic:', err);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'coloring':
        return '🎨';
      case 'letter_match':
        return '🔤';
      case 'bubble_pop':
        return '🫧';
      case 'counting':
        return '🔢';
      case 'emotion_match':
        return '😊';
      case 'family_tree':
        return '👨‍👩‍👧‍👦';
      case 'digital_painting':
        return '🖼️';
      case 'forest_hunt':
        return '🌲';
      default:
        return '🎮';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'hard':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityStatus = (activity: Activity) => {
    if (activity.completed) {
      return 'completed';
    } else if (activity.progress_value > 0) {
      return 'in_progress';
    } else {
      return 'not_started';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={fetchTopicActivities}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {topic?.title}
            </h2>
            {topic?.completion_score > 0 && (
              <div className="flex items-center mt-1">
                <Trophy className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="text-sm text-gray-600">
                  Completed with {topic.completion_score}% score
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map((activity, index) => {
          const status = getActivityStatus(activity);
          const isClickable = !activity.completed;
          
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                bg-white rounded-lg shadow-md border-2 transition-all duration-200
                ${status === 'completed' ? 'border-green-300 bg-green-50' : ''}
                ${status === 'in_progress' ? 'border-blue-300 bg-blue-50' : ''}
                ${status === 'not_started' ? 'border-gray-200 hover:border-blue-300' : ''}
                ${isClickable ? 'cursor-pointer hover:shadow-lg transform hover:scale-105' : ''}
              `}
              onClick={() => isClickable && handleActivityClick(activity)}
            >
              <div className="p-6">
                {/* Activity Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">
                      {getActivityIcon(activity.type)}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {activity.title}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(activity.difficulty)}`}>
                        {activity.difficulty}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {activity.completed && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {activity.is_assessed && (
                      <Star className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                </div>

                {/* Activity Description */}
                <p className="text-sm text-gray-600 mb-4">
                  {activity.description}
                </p>

                {/* Activity Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{activity.estimated_duration} min</span>
                    </div>
                    <span>Attempts: {activity.attempts_count}/{activity.max_attempts}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${activity.progress_value || 0}%` }}
                    ></div>
                  </div>

                  {/* Score Display */}
                  {activity.score > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Score:</span>
                      <span className="text-sm font-bold text-blue-600">
                        {activity.score}/{activity.passing_score}
                      </span>
                    </div>
                  )}

                  {/* Teacher Feedback */}
                  {activity.teacher_feedback && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                      <p className="text-xs text-gray-700">
                        <strong>Teacher Feedback:</strong> {activity.teacher_feedback}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                {!activity.completed && (
                  <div className="mt-4">
                    <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center">
                      <Play className="w-4 h-4 mr-2" />
                      {activity.progress_value > 0 ? 'Continue' : 'Start'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {activities.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🎮</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No activities available
          </h3>
          <p className="text-gray-500">
            Activities for this topic will be added soon.
          </p>
        </div>
      )}

      {/* Activity Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {selectedActivity.title}
            </h3>
            <p className="text-gray-600 mb-4">
              {selectedActivity.description}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedActivity(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleActivityComplete(selectedActivity.id, 85)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Start Activity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicActivities; 