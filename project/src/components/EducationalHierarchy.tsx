import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Lock, CheckCircle, Play, Star } from 'lucide-react';

interface Topic {
  topic_id: number;
  topic_title: string;
  topic_description: string;
  order_number: number;
  is_unlocked: boolean;
  unlock_requirement: number;
  chapter_id: number;
  chapter_title: string;
  is_released: boolean;
  release_date: string;
  book_id: number;
  book_title: string;
  subject_id: number;
  subject_name: string;
  total_activities: number;
  completed_activities: number;
  completion_score: number;
  completed_at: string;
  is_available: boolean;
  progress_percentage: number;
}

interface EducationalHierarchyProps {
  childId: string;
  onTopicSelect: (topicId: number) => void;
}

const EducationalHierarchy: React.FC<EducationalHierarchyProps> = ({
  childId,
  onTopicSelect
}) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableTopics();
  }, [childId]);

  const fetchAvailableTopics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/educational/available-topics/${childId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setTopics(data.topics);
      } else {
        setError('Failed to load topics');
      }
    } catch (err) {
      setError('Error loading topics');
    } finally {
      setLoading(false);
    }
  };

  const handleTopicClick = (topic: Topic) => {
    if (topic.is_available) {
      onTopicSelect(topic.topic_id);
    }
  };

  const getTopicStatus = (topic: Topic) => {
    if (topic.completed_at) {
      return 'completed';
    } else if (topic.is_available) {
      return 'available';
    } else {
      return 'locked';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'available':
        return <Play className="w-6 h-6 text-blue-500" />;
      case 'locked':
        return <Lock className="w-6 h-6 text-gray-400" />;
      default:
        return <Lock className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-300';
      case 'available':
        return 'bg-blue-100 border-blue-300 hover:bg-blue-200';
      case 'locked':
        return 'bg-gray-100 border-gray-300';
      default:
        return 'bg-gray-100 border-gray-300';
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
          onClick={fetchAvailableTopics}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // Group topics by subject and book
  const groupedTopics = topics.reduce((acc, topic) => {
    const key = `${topic.subject_name}-${topic.book_title}`;
    if (!acc[key]) {
      acc[key] = {
        subject: topic.subject_name,
        book: topic.book_title,
        topics: []
      };
    }
    acc[key].topics.push(topic);
    return acc;
  }, {} as Record<string, { subject: string; book: string; topics: Topic[] }>);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Learning Journey
      </h2>
      
      <div className="space-y-8">
        {Object.entries(groupedTopics).map(([key, group]) => (
          <div key={key} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <BookOpen className="w-6 h-6 text-blue-500 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {group.subject}
                </h3>
                <p className="text-sm text-gray-600">{group.book}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.topics.map((topic, index) => {
                const status = getTopicStatus(topic);
                const isClickable = topic.is_available;
                
                return (
                  <motion.div
                    key={topic.topic_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
                      ${getStatusColor(status)}
                      ${isClickable ? 'hover:shadow-lg transform hover:scale-105' : ''}
                    `}
                    onClick={() => handleTopicClick(topic)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2">
                          {topic.order_number}
                        </span>
                        {getStatusIcon(status)}
                      </div>
                      {topic.completion_score > 0 && (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="text-sm font-medium">
                            {topic.completion_score}%
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <h4 className="font-semibold text-gray-800 mb-2">
                      {topic.topic_title}
                    </h4>
                    
                    <p className="text-sm text-gray-600 mb-3">
                      {topic.topic_description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Activities: {topic.completed_activities}/{topic.total_activities}</span>
                        <span>{topic.progress_percentage}%</span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${topic.progress_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {!topic.is_available && topic.unlock_requirement > 0 && (
                      <div className="mt-3 text-xs text-gray-500">
                        Complete {topic.unlock_requirement} previous topic(s) to unlock
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {topics.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No topics available yet
          </h3>
          <p className="text-gray-500">
            Chapters will be released by your teacher as the year progresses.
          </p>
        </div>
      )}
    </div>
  );
};

export default EducationalHierarchy; 