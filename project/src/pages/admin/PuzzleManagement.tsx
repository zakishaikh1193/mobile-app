import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Plus, Edit, Trash2, Save, X, Eye, 
  Settings, BarChart3, Users, Clock, Target 
} from 'lucide-react';
import { activityService, Activity } from '../../services/activityService';
import api from '../../services/api';

interface PuzzleStats {
  totalPuzzles: number;
  completedPuzzles: number;
  averageScore: number;
  averageTime: number;
  popularDifficulties: { difficulty: string; count: number }[];
}

const PuzzleManagement: React.FC = () => {
  const [puzzles, setPuzzles] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPuzzle, setEditingPuzzle] = useState<Activity | null>(null);
  const [stats, setStats] = useState<PuzzleStats>({
    totalPuzzles: 0,
    completedPuzzles: 0,
    averageScore: 0,
    averageTime: 0,
    popularDifficulties: []
  });
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'easy' as Activity['difficulty'],
    grade_id: '',
    book_id: '',
    unit_id: '',
    lesson_id: '',
    learning_objectives: '',
    prerequisites: '',
    estimated_duration: 10,
    max_attempts: 3,
    passing_score: 70
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  // Hierarchy data state
  const [grades, setGrades] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);

  useEffect(() => {
    loadPuzzles();
    loadHierarchyData();
    loadStats();
  }, []);

  const loadHierarchyData = async () => {
    try {
      const gradesResponse = await api.get('/education/grades');
      setGrades(gradesResponse.data.grades || []);
      
      const booksResponse = await api.get('/education/books');
      setBooks(booksResponse.data.books || []);

      const unitsResponse = await api.get('/education/units');
      setUnits(unitsResponse.data.units || []);

      const lessonsResponse = await api.get('/education/lessons');
      setLessons(lessonsResponse.data.lessons || []);
    } catch (error) {
      console.error('Error loading hierarchy data:', error);
    }
  };

  const loadPuzzles = async () => {
    setLoading(true);
    try {
      const data = await activityService.getActivitiesByType('puzzle');
      setPuzzles(data);
    } catch (error) {
      console.error('Error loading puzzles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Mock stats for now - in real implementation, fetch from API
      setStats({
        totalPuzzles: puzzles.length,
        completedPuzzles: Math.floor(puzzles.length * 0.7),
        averageScore: 85,
        averageTime: 180,
        popularDifficulties: [
          { difficulty: 'easy', count: 15 },
          { difficulty: 'medium', count: 8 },
          { difficulty: 'hard', count: 3 }
        ]
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitFormData = new FormData();
    submitFormData.append('title', formData.title);
    submitFormData.append('type', 'puzzle');
    submitFormData.append('description', formData.description);
    submitFormData.append('difficulty', formData.difficulty);
    
    if (selectedFile) {
      submitFormData.append('image', selectedFile);
    }
    
    // Add hierarchy fields
    if (formData.grade_id) submitFormData.append('grade_id', formData.grade_id);
    if (formData.book_id) submitFormData.append('book_id', formData.book_id);
    if (formData.unit_id) submitFormData.append('unit_id', formData.unit_id);
    if (formData.lesson_id) submitFormData.append('lesson_id', formData.lesson_id);
    
    // Add educational fields
    submitFormData.append('learning_objectives', formData.learning_objectives);
    submitFormData.append('prerequisites', formData.prerequisites);
    submitFormData.append('estimated_duration', formData.estimated_duration.toString());
    submitFormData.append('max_attempts', formData.max_attempts.toString());
    submitFormData.append('passing_score', formData.passing_score.toString());

    try {
      if (editingPuzzle) {
        const result = await activityService.updateActivity(editingPuzzle.id, submitFormData);
        if (result.success) {
          setShowCreateForm(false);
          setEditingPuzzle(null);
          resetForm();
          loadPuzzles();
        } else {
          alert('Error updating puzzle: ' + result.error);
        }
      } else {
        const result = await activityService.createActivity(submitFormData);
        if (result.success) {
          setShowCreateForm(false);
          resetForm();
          loadPuzzles();
        } else {
          alert('Error creating puzzle: ' + result.error);
        }
      }
    } catch (error) {
      console.error('Error submitting puzzle:', error);
      alert('Error submitting puzzle');
    }
  };

  const handleEdit = (puzzle: Activity) => {
    setEditingPuzzle(puzzle);
    setFormData({
      title: puzzle.title,
      description: puzzle.description,
      difficulty: puzzle.difficulty,
      grade_id: puzzle.grade_id?.toString() || '',
      book_id: puzzle.book_id?.toString() || '',
      unit_id: puzzle.unit_id?.toString() || '',
      lesson_id: puzzle.lesson_id?.toString() || '',
      learning_objectives: puzzle.learning_objectives || '',
      prerequisites: puzzle.prerequisites || '',
      estimated_duration: puzzle.estimated_duration || 10,
      max_attempts: puzzle.max_attempts || 3,
      passing_score: puzzle.passing_score || 70
    });
    setPreviewUrl(puzzle.image_url || '');
    setShowCreateForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this puzzle?')) {
      try {
        const result = await activityService.deleteActivity(id);
        if (result.success) {
          loadPuzzles();
        } else {
          alert('Error deleting puzzle: ' + result.error);
        }
      } catch (error) {
        console.error('Error deleting puzzle:', error);
        alert('Error deleting puzzle');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      difficulty: 'easy',
      grade_id: '',
      book_id: '',
      unit_id: '',
      lesson_id: '',
      learning_objectives: '',
      prerequisites: '',
      estimated_duration: 10,
      max_attempts: 3,
      passing_score: 70
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setEditingPuzzle(null);
  };

  const getBooksByGrade = (gradeId: string) => {
    return books.filter(book => book.grade_id?.toString() === gradeId);
  };

  const getUnitsByBook = (bookId: string) => {
    return units.filter(unit => unit.book_id?.toString() === bookId);
  };

  const getLessonsByUnit = (unitId: string) => {
    return lessons.filter(lesson => lesson.unit_id?.toString() === unitId);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">🧩 Puzzle Management</h1>
              <p className="text-gray-600">Create and manage puzzle activities for children</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-full font-bold"
            >
              <Plus className="w-5 h-5" />
              Add New Puzzle
            </motion.button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 rounded-full p-2">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Puzzles</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalPuzzles}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 rounded-full p-2">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedPuzzles}</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-500 rounded-full p-2">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Score</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.averageScore}%</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500 rounded-full p-2">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Time</p>
                  <p className="text-2xl font-bold text-purple-600">{Math.floor(stats.averageTime / 60)}m</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create/Edit Form */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editingPuzzle ? 'Edit Puzzle' : 'Create New Puzzle'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Puzzle Title
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        placeholder="e.g., Animal Puzzle"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty Level
                      </label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Activity['difficulty'] })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="easy">Easy (2×2)</option>
                        <option value="medium">Medium (3×4)</option>
                        <option value="hard">Hard (4×6)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      required
                      placeholder="Describe the puzzle and what children will learn..."
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Puzzle Image
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="puzzle-image"
                        required={!editingPuzzle}
                      />
                      <label htmlFor="puzzle-image" className="cursor-pointer">
                        {previewUrl ? (
                          <div className="space-y-4">
                            <img src={previewUrl} alt="Preview" className="max-w-xs mx-auto rounded-lg" />
                            <p className="text-sm text-gray-500">Click to change image</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                            <p className="text-gray-600">Click to upload puzzle image</p>
                            <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Hierarchy Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Grade
                      </label>
                      <select
                        value={formData.grade_id}
                        onChange={(e) => {
                          setFormData({ 
                            ...formData, 
                            grade_id: e.target.value,
                            book_id: '',
                            unit_id: '',
                            lesson_id: ''
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Grade</option>
                        {grades.map((grade) => (
                          <option key={grade.id} value={grade.id}>
                            {grade.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Book
                      </label>
                      <select
                        value={formData.book_id}
                        onChange={(e) => {
                          setFormData({ 
                            ...formData, 
                            book_id: e.target.value,
                            unit_id: '',
                            lesson_id: ''
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!formData.grade_id}
                      >
                        <option value="">Select Book</option>
                        {formData.grade_id && getBooksByGrade(formData.grade_id).map((book) => (
                          <option key={book.id} value={book.id}>
                            {book.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit
                      </label>
                      <select
                        value={formData.unit_id}
                        onChange={(e) => {
                          setFormData({ 
                            ...formData, 
                            unit_id: e.target.value,
                            lesson_id: ''
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!formData.book_id}
                      >
                        <option value="">Select Unit</option>
                        {formData.book_id && getUnitsByBook(formData.book_id).map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lesson
                      </label>
                      <select
                        value={formData.lesson_id}
                        onChange={(e) => setFormData({ ...formData, lesson_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!formData.unit_id}
                      >
                        <option value="">Select Lesson</option>
                        {formData.unit_id && getLessonsByUnit(formData.unit_id).map((lesson) => (
                          <option key={lesson.id} value={lesson.id}>
                            {lesson.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Educational Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Learning Objectives
                      </label>
                      <textarea
                        value={formData.learning_objectives}
                        onChange={(e) => setFormData({ ...formData, learning_objectives: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        placeholder="What will children learn from this puzzle?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prerequisites
                      </label>
                      <textarea
                        value={formData.prerequisites}
                        onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        placeholder="What should children know before this puzzle?"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estimated Duration (minutes)
                      </label>
                      <input
                        type="number"
                        value={formData.estimated_duration}
                        onChange={(e) => setFormData({ ...formData, estimated_duration: parseInt(e.target.value) || 10 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        max="60"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Attempts
                      </label>
                      <input
                        type="number"
                        value={formData.max_attempts}
                        onChange={(e) => setFormData({ ...formData, max_attempts: parseInt(e.target.value) || 3 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        max="10"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Passing Score (%)
                      </label>
                      <input
                        type="number"
                        value={formData.passing_score}
                        onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) || 70 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 bg-blue-500 text-white py-3 rounded-full font-bold"
                    >
                      <Save className="w-5 h-5 inline mr-2" />
                      {editingPuzzle ? 'Update Puzzle' : 'Create Puzzle'}
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setShowCreateForm(false);
                        resetForm();
                      }}
                      className="flex-1 bg-gray-500 text-white py-3 rounded-full font-bold"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Puzzles List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Puzzle Activities</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading puzzles...</p>
            </div>
          ) : puzzles.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🧩</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No puzzles yet</h3>
              <p className="text-gray-500 mb-4">Create your first puzzle activity to get started!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-500 text-white px-6 py-3 rounded-full font-bold"
              >
                Create First Puzzle
              </motion.button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {puzzles.map((puzzle) => (
                <motion.div
                  key={puzzle.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                >
                  <div className="aspect-video bg-gray-200 rounded-lg mb-4 overflow-hidden">
                    {puzzle.image_url ? (
                      <img 
                        src={puzzle.image_url} 
                        alt={puzzle.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Eye className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{puzzle.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{puzzle.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(puzzle.difficulty)}`}>
                        {puzzle.difficulty}
                      </span>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEdit(puzzle)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(puzzle.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                    
                    {puzzle.lesson_title && (
                      <p className="text-xs text-gray-500">
                        Lesson: {puzzle.lesson_title}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PuzzleManagement;
