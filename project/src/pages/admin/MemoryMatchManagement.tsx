import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, Search, Filter } from 'lucide-react';
import api from '../../services/api';

interface MemoryMatchActivity {
  id: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  theme: 'animals' | 'fruits' | 'objects';
  estimated_duration: number;
  max_attempts: number;
  passing_score: number;
  lesson_id?: number;
  created_at: string;
  updated_at: string;
}

const MemoryMatchManagement: React.FC = () => {
  const [activities, setActivities] = useState<MemoryMatchActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterTheme, setFilterTheme] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<MemoryMatchActivity | null>(null);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    theme: 'animals' as 'animals' | 'fruits' | 'objects',
    estimated_duration: 15,
    max_attempts: 3,
    passing_score: 70,
    lesson_id: ''
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await api.get('/activities?type=memory_match');
      if (response.data.success) {
        setActivities(response.data.activities);
      }
    } catch (error) {
      console.error('Error fetching memory match activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateActivity = async () => {
    try {
      const activityData = {
        ...formData,
        type: 'memory_match',
        lesson_id: formData.lesson_id ? parseInt(formData.lesson_id) : null
      };

      const response = await api.post('/activities', activityData);
      if (response.data.success) {
        setShowCreateModal(false);
        resetForm();
        fetchActivities();
      }
    } catch (error) {
      console.error('Error creating memory match activity:', error);
    }
  };

  const handleUpdateActivity = async () => {
    if (!editingActivity) return;

    try {
      const activityData = {
        ...formData,
        type: 'memory_match',
        lesson_id: formData.lesson_id ? parseInt(formData.lesson_id) : null
      };

      const response = await api.put(`/activities/${editingActivity.id}`, activityData);
      if (response.data.success) {
        setEditingActivity(null);
        resetForm();
        fetchActivities();
      }
    } catch (error) {
      console.error('Error updating memory match activity:', error);
    }
  };

  const handleDeleteActivity = async (id: number) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;

    try {
      const response = await api.delete(`/activities/${id}`);
      if (response.data.success) {
        fetchActivities();
      }
    } catch (error) {
      console.error('Error deleting memory match activity:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      difficulty: 'easy',
      theme: 'animals',
      estimated_duration: 15,
      max_attempts: 3,
      passing_score: 70,
      lesson_id: ''
    });
  };

  const openEditModal = (activity: MemoryMatchActivity) => {
    setEditingActivity(activity);
    setFormData({
      title: activity.title,
      description: activity.description,
      difficulty: activity.difficulty,
      theme: activity.theme,
      estimated_duration: activity.estimated_duration,
      max_attempts: activity.max_attempts,
      passing_score: activity.passing_score,
      lesson_id: activity.lesson_id?.toString() || ''
    });
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || activity.difficulty === filterDifficulty;
    const matchesTheme = filterTheme === 'all' || activity.theme === filterTheme;
    
    return matchesSearch && matchesDifficulty && matchesTheme;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getThemeColor = (theme: string) => {
    switch (theme) {
      case 'animals': return 'bg-blue-100 text-blue-800';
      case 'fruits': return 'bg-orange-100 text-orange-800';
      case 'objects': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">🧠 Memory Match Management</h1>
              <p className="text-gray-600">Create and manage memory match activities for students</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-full font-bold"
            >
              <Plus className="w-5 h-5" />
              Create Activity
            </motion.button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-4">
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              
              <select
                value={filterTheme}
                onChange={(e) => setFilterTheme(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Themes</option>
                <option value="animals">Animals</option>
                <option value="fruits">Fruits</option>
                <option value="objects">Objects</option>
              </select>
            </div>
          </div>
        </div>

        {/* Activities List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🧠</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Memory Match Activities</h3>
              <p className="text-gray-600 mb-4">Create your first memory match activity to get started!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-500 text-white px-6 py-3 rounded-full font-bold"
              >
                Create First Activity
              </motion.button>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredActivities.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-800">{activity.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(activity.difficulty)}`}>
                          {activity.difficulty}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getThemeColor(activity.theme)}`}>
                          {activity.theme}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">{activity.description}</p>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span>⏱️ {activity.estimated_duration} min</span>
                        <span>🎯 {activity.passing_score}% passing score</span>
                        <span>🔄 {activity.max_attempts} max attempts</span>
                        <span>📅 {new Date(activity.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openEditModal(activity)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit className="w-5 h-5" />
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteActivity(activity.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingActivity) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingActivity ? 'Edit Memory Match Activity' : 'Create New Memory Match Activity'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter activity title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter activity description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                  <select
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value as 'animals' | 'fruits' | 'objects' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="animals">Animals</option>
                    <option value="fruits">Fruits</option>
                    <option value="objects">Objects</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (min)</label>
                  <input
                    type="number"
                    value={formData.estimated_duration}
                    onChange={(e) => setFormData({ ...formData, estimated_duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    max="60"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Attempts</label>
                  <input
                    type="number"
                    value={formData.max_attempts}
                    onChange={(e) => setFormData({ ...formData, max_attempts: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    max="10"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Passing Score (%)</label>
                  <input
                    type="number"
                    value={formData.passing_score}
                    onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lesson ID (Optional)</label>
                <input
                  type="number"
                  value={formData.lesson_id}
                  onChange={(e) => setFormData({ ...formData, lesson_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter lesson ID"
                />
              </div>
            </div>
            
            <div className="flex gap-4 mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={editingActivity ? handleUpdateActivity : handleCreateActivity}
                className="flex-1 bg-blue-500 text-white py-3 rounded-full font-bold"
              >
                {editingActivity ? 'Update Activity' : 'Create Activity'}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingActivity(null);
                  resetForm();
                }}
                className="flex-1 bg-gray-500 text-white py-3 rounded-full font-bold"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MemoryMatchManagement;
