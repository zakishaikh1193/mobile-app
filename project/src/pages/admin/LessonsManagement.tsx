import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Edit, Trash2, Search, Filter, BookOpen, GraduationCap,
  ArrowLeft, School, X, Check, Lock, Unlock
} from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import AnimatedButton from '../../components/AnimatedButton';
import AudioButton from '../../components/AudioButton';

interface Lesson {
  id: number;
  title: string;
  description: string;
  lesson_number: number;
  is_active: boolean;
  is_unlocked: boolean;
  unlocked_by?: number;
  unlocked_at?: string;
  created_at: string;
  updated_at: string;
  unit_id: number;
  unit_title: string;
  book_id: number;
  book_title: string;
  grade_id: number;
  grade_name: string;
}

interface Unit {
  id: number;
  title: string;
  description: string;
  book_id: number;
  book_title: string;
  grade_name: string;
}

const LessonsManagement: React.FC = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    unit_id: '',
    lesson_number: 1,
    is_active: true
  });

  useEffect(() => {
    fetchLessons();
    fetchUnits();
  }, []);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const response = await api.get('/education/lessons');
      // Handle both response formats: response.data.lessons or response.data
      const lessonsData = response.data.lessons || response.data;
      setLessons(Array.isArray(lessonsData) ? lessonsData : []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      setLessons([]); // Ensure lessons is always an array
    } finally {
      setLoading(false);
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await api.get('/education/units');
      // Handle both response formats: response.data.units or response.data
      const unitsData = response.data.units || response.data;
      setUnits(Array.isArray(unitsData) ? unitsData : []);
    } catch (error) {
      console.error('Error fetching units:', error);
      setUnits([]); // Ensure units is always an array
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingLesson) {
        await api.put(`/education/lessons/${editingLesson.id}`, formData);
      } else {
        await api.post('/education/lessons', formData);
      }
      
      fetchLessons();
      resetForm();
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;
    
    try {
      await api.delete(`/education/lessons/${id}`);
      fetchLessons();
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  const handleToggleLock = async (lesson: Lesson) => {
    try {
      const url = `/education/lessons/${lesson.id}/${lesson.is_unlocked ? 'lock' : 'unlock'}`;
      const response = await api.post(url, {
        unlockNotes: 'Unlocked by admin'
      });
      
      const data = response.data;
      if (data.success) {
        fetchLessons();
      }
    } catch (error) {
      console.error('Error toggling lesson lock:', error);
    }
  };

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description,
      unit_id: lesson.unit_id.toString(),
      lesson_number: lesson.lesson_number,
      is_active: lesson.is_active
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      unit_id: '',
      lesson_number: 1,
      is_active: true
    });
  };

  const filteredLessons = (Array.isArray(lessons) ? lessons : []).filter(lesson => {
    const matchesSearch = lesson?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson?.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUnit = selectedUnit ? lesson?.unit_id === selectedUnit : true;
    return matchesSearch && matchesUnit;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-indigo-100">
      <AudioButton />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <AnimatedButton
                variant="secondary"
                size="sm"
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </AnimatedButton>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Lessons Management</h1>
                <p className="text-gray-600">Manage lessons and unlock status</p>
              </div>
            </div>
            <AnimatedButton
              variant="primary"
              onClick={() => {
                setEditingLesson(null);
                resetForm();
                setShowAddForm(true);
              }}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Lesson</span>
            </AnimatedButton>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search lessons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
                            <select
                  value={selectedUnit || ''}
                  onChange={(e) => setSelectedUnit(e.target.value ? parseInt(e.target.value) : null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Units</option>
                  {units.map(unit => (
                    <option key={unit.id} value={unit.id}>{unit.title}</option>
                  ))}
                </select>
            <AnimatedButton variant="secondary" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </AnimatedButton>
          </div>
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-3xl p-6 shadow-lg animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))
          ) : filteredLessons.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Lessons Found</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first lesson</p>
              <AnimatedButton
                variant="primary"
                onClick={() => {
                  setEditingLesson(null);
                  resetForm();
                  setShowAddForm(true);
                }}
              >
                Add First Lesson
              </AnimatedButton>
            </div>
          ) : (
            filteredLessons.map((lesson) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">{lesson.title}</h3>
                    <p className="text-sm text-gray-600">{lesson.book_title}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    lesson.is_unlocked 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {lesson.is_unlocked ? 'Unlocked' : 'Locked'}
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4 line-clamp-2">{lesson.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">Lesson {lesson.lesson_number}</span>
                  <span className="text-sm text-gray-500">{lesson.grade_name}</span>
                </div>
                
                <div className="flex space-x-2">
                  <AnimatedButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(lesson)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </AnimatedButton>
                  <AnimatedButton
                    variant={lesson.is_unlocked ? "secondary" : "primary"}
                    size="sm"
                    onClick={() => handleToggleLock(lesson)}
                    className="flex-1"
                  >
                    {lesson.is_unlocked ? (
                      <>
                        <Lock className="h-4 w-4 mr-1" />
                        Lock
                      </>
                    ) : (
                      <>
                        <Unlock className="h-4 w-4 mr-1" />
                        Unlock
                      </>
                    )}
                  </AnimatedButton>
                </div>
                
                <div className="flex space-x-2 mt-2">
                                     <AnimatedButton 
                     variant="secondary" 
                     onClick={() => handleDelete(lesson.id)}
                     className="text-red-600 hover:text-red-700"
                   >
                     <Trash2 className="h-4 w-4" />
                   </AnimatedButton>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
              </h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingLesson(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Introduction to Numbers"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit *
                </label>
                <select
                  value={formData.unit_id}
                  onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a unit</option>
                  {units.map(unit => (
                    <option key={unit.id} value={unit.id}>{unit.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe this lesson..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson Number *
                </label>
                <input
                  type="number"
                  value={formData.lesson_number}
                  onChange={(e) => setFormData({ ...formData, lesson_number: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="1"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded focus:ring-purple-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <AnimatedButton 
                  variant="secondary" 
                  onClick={() => setShowAddForm(false)}
                  className="flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </AnimatedButton>
                <AnimatedButton 
                  variant="primary" 
                  className="flex items-center space-x-2"
                >
                  <Check className="h-4 w-4" />
                  <span>Save</span>
                </AnimatedButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LessonsManagement; 