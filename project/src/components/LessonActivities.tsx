import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Clock, Target, Users } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

interface Activity {
  id: number;
  title: string;
  type: string;
  description: string;
  difficulty: string;
  image_url?: string;
  colors?: string[];
  estimated_duration: number;
}

interface ActivityType {
  name: string;
  icon: string;
  description: string;
}

const LessonActivities: React.FC = () => {
  const { lessonId, childId } = useParams<{ lessonId: string; childId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<any>(null);
  const [activitiesByType, setActivitiesByType] = useState<Record<string, Activity[]>>({});
  const [activityTypes, setActivityTypes] = useState<Record<string, ActivityType>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    fetchLessonActivities();
  }, [lessonId]);

  const fetchLessonActivities = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/activities/lesson/${lessonId}`);
      
      if (response.data.success) {
        setLesson(response.data.lesson);
        setActivitiesByType(response.data.activitiesByType);
        setActivityTypes(response.data.activityTypes);
      } else {
        setError('Failed to load lesson activities');
      }
    } catch (err) {
      console.error('Error fetching lesson activities:', err);
      setError('Error loading lesson activities');
    } finally {
      setLoading(false);
    }
  };

  const handleActivityClick = (activity: Activity) => {
    // Navigate to the specific activity
    navigate(`/activity/${activity.id}/${childId}`);
  };

  const handleBackToLesson = () => {
    navigate(`/letter-path/${childId}?bookId=${lesson?.book_id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading lesson activities...</p>
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
            onClick={fetchLessonActivities}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="bg-yellow-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Play className="h-10 w-10 text-yellow-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Lesson not found</h3>
          <p className="text-gray-500 mb-4">The lesson you're looking for doesn't exist.</p>
          <button 
            onClick={handleBackToLesson}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Lesson
          </button>
        </div>
      </div>
    );
  }

  // Flatten all activities into a single array
  const allActivities = Object.values(activitiesByType).flat();

  if (allActivities.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="bg-yellow-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Play className="h-10 w-10 text-yellow-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No activities available</h3>
          <p className="text-gray-500 mb-4">This lesson doesn't have any activities yet.</p>
          <button 
            onClick={handleBackToLesson}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Lesson
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
              onClick={handleBackToLesson}
              className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg text-gray-700 hover:bg-white transition-colors shadow-md"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Lesson</span>
            </button>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">{lesson.title}</h1>
            <p className="text-gray-600 text-lg mb-4">{lesson.description}</p>
                         <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
               <div className="flex items-center space-x-1">
                 <Users className="h-4 w-4" />
                 <span>Lesson {lesson.lesson_number}</span>
               </div>
               <div className="flex items-center space-x-1">
                 <Target className="h-4 w-4" />
                 <span>{allActivities.length} Activities</span>
               </div>
             </div>
           </div>
         </motion.div>

         {/* All Activities Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {allActivities.map((activity, index) => {
             const typeInfo = activityTypes[activity.type];
             
             return (
               <motion.div
                 key={activity.id}
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: index * 0.05 }}
                 className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                 onClick={() => handleActivityClick(activity)}
               >
                 <div className="text-center">
                   <div className="mb-4">
                     {activity.image_url ? (
                       <img
                         src={activity.image_url}
                         alt={activity.title}
                         className="w-20 h-20 mx-auto object-cover rounded-lg"
                       />
                     ) : (
                       <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mx-auto">
                         <Play className="h-10 w-10 text-white" />
                       </div>
                     )}
                   </div>
                   
                   <h3 className="text-lg font-bold text-gray-800 mb-2">{activity.title}</h3>
                   <p className="text-gray-600 mb-4 text-sm">{activity.description}</p>
                   
                   {/* Activity Type Badge */}
                   <div className="mb-4">
                     <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                       <span>{typeInfo?.icon || '🎯'}</span>
                       <span>{typeInfo?.name || activity.type}</span>
                     </div>
                   </div>
                   
                   <div className="space-y-2">
                     <div className="flex items-center justify-between text-sm">
                       <span className="text-gray-500">Difficulty:</span>
                       <span className="font-semibold text-gray-700 capitalize">{activity.difficulty}</span>
                     </div>
                     
                     <div className="flex items-center justify-between text-sm">
                       <span className="text-gray-500">Duration:</span>
                       <span className="font-semibold text-gray-700">{activity.estimated_duration} min</span>
                     </div>
                     
                    
                   </div>
                   
                   <div className="mt-6">
                     <button className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2">
                       <Play className="h-4 w-4" />
                       <span>Start Activity</span>
                     </button>
                   </div>
                 </div>
               </motion.div>
             );
           })}
         </div>
      </div>
    </div>
  );
};

export default LessonActivities;
