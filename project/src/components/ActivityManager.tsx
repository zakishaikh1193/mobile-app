import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { activityService, Activity } from '../services/activityService';
import api from '../services/api';

interface ActivityManagerProps {
  onClose?: () => void;
}

const ActivityManager: React.FC<ActivityManagerProps> = ({ onClose }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'coloring' as Activity['type'],
    description: '',
    difficulty: 'easy' as Activity['difficulty'],
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
    grade_id: '',
    book_id: '',
    unit_id: '',
    lesson_id: '',
    learning_objectives: '',
    prerequisites: '',
    estimated_duration: 10,
    pieceCount: 9, // For puzzle games
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  // Hierarchy data state
  const [grades, setGrades] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);

  useEffect(() => {
    loadActivities();
    loadHierarchyData();
  }, []);

    const loadHierarchyData = async () => {
    try {
      // Load grades
      const gradesResponse = await api.get('/education/grades');
      setGrades(gradesResponse.data.grades || []);
     
      // Load books
      const booksResponse = await api.get('/education/books');
      console.log("Books Response", booksResponse.data.books);
      setBooks(booksResponse.data.books || []);

      // Load units
      const unitsResponse = await api.get('/education/units');
      setUnits(unitsResponse.data.units || []);

      // Load lessons
      const lessonsResponse = await api.get('/education/lessons');
      setLessons(lessonsResponse.data.lessons || []);
    } catch (error) {
      console.error('Error loading hierarchy data:', error);
    }
  };

  const loadActivities = async () => {
    setLoading(true);
    try {
      const data = await activityService.getAllActivities();
      setActivities(data);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
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

  const handleColorChange = (index: number, color: string) => {
    const newColors = [...formData.colors];
    newColors[index] = color;
    setFormData({ ...formData, colors: newColors });
  };

  const addColor = () => {
    setFormData({ ...formData, colors: [...formData.colors, '#000000'] });
  };

  const removeColor = (index: number) => {
    const newColors = formData.colors.filter((_, i) => i !== index);
    setFormData({ ...formData, colors: newColors });
  };

  const handlePuzzleSubmit = async () => {
    if (!selectedFile) {
      alert('Please select a puzzle image');
      return;
    }

    const puzzleFormData = new FormData();
    puzzleFormData.append('title', formData.title);
    puzzleFormData.append('description', formData.description);
    puzzleFormData.append('difficulty', formData.difficulty);
    puzzleFormData.append('pieceCount', formData.pieceCount.toString());
    puzzleFormData.append('puzzle_image', selectedFile);
    
    // Debug: Log FormData contents
    console.log('Puzzle FormData contents:');
    for (let [key, value] of puzzleFormData.entries()) {
      console.log(key, value);
    }
    
    // Add hierarchy fields
    if (formData.grade_id && formData.grade_id.trim() !== '') {
      puzzleFormData.append('grade_id', formData.grade_id);
    }
    if (formData.book_id && formData.book_id.trim() !== '') {
      puzzleFormData.append('book_id', formData.book_id);
    }
    if (formData.unit_id && formData.unit_id.trim() !== '') {
      puzzleFormData.append('unit_id', formData.unit_id);
    }
    if (formData.lesson_id && formData.lesson_id.trim() !== '') {
      puzzleFormData.append('lesson_id', formData.lesson_id);
    }

    try {
      // Use direct axios call for FormData to avoid Content-Type header issues
      const token = localStorage.getItem('token');
      console.log('Token being sent:', token);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/activities/upload-puzzle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type - let browser set it for FormData
        },
        body: puzzleFormData
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Puzzle activity created successfully!');
        resetForm();
        loadActivities();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error creating puzzle activity:', error);
      alert('An error occurred while creating the puzzle activity');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Handle puzzle creation differently
    if (formData.type === 'puzzle') {
      await handlePuzzleSubmit();
      return;
    }
    
    // Create full FormData with all fields for regular activities
    const submitFormData = new FormData();
    submitFormData.append('title', formData.title);
    submitFormData.append('type', formData.type);
    submitFormData.append('description', formData.description);
    submitFormData.append('difficulty', formData.difficulty);
    submitFormData.append('colors', JSON.stringify(formData.colors));
    
    // Add all hierarchy fields
    if (formData.grade_id && formData.grade_id.trim() !== '') {
      submitFormData.append('grade_id', formData.grade_id);
    }
    if (formData.book_id && formData.book_id.trim() !== '') {
      submitFormData.append('book_id', formData.book_id);
    }
    if (formData.unit_id && formData.unit_id.trim() !== '') {
      submitFormData.append('unit_id', formData.unit_id);
    }
    if (formData.lesson_id && formData.lesson_id.trim() !== '') {
      submitFormData.append('lesson_id', formData.lesson_id);
    }
    if (formData.learning_objectives && formData.learning_objectives.trim() !== '') {
      submitFormData.append('learning_objectives', formData.learning_objectives);
    }
    if (formData.prerequisites && formData.prerequisites.trim() !== '') {
      submitFormData.append('prerequisites', formData.prerequisites);
    }
    submitFormData.append('estimated_duration', formData.estimated_duration.toString());
    
    if (selectedFile) {
      submitFormData.append('image', selectedFile);
    }

    // Debug: Log FormData contents
    console.log('FormData contents:');
    for (let [key, value] of submitFormData.entries()) {
      console.log(key, value);
    }

    try {
      if (editingActivity) {
        const result = await activityService.updateActivity(editingActivity.id, submitFormData);
        if (result.success) {
          alert('Activity updated successfully!');
          resetForm();
          loadActivities();
        } else {
          alert(`Error: ${result.error}`);
        }
      } else {
        const result = await activityService.createActivity(submitFormData);
        if (result.success) {
          alert('Activity created successfully!');
          resetForm();
          loadActivities();
        } else {
          alert(`Error: ${result.error}`);
        }
      }
    } catch (error) {
      console.error('Error submitting activity:', error);
      alert('An error occurred while saving the activity');
    }
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setFormData({
      title: activity.title,
      type: activity.type,
      description: activity.description,
      difficulty: activity.difficulty,
      colors: Array.isArray(activity.colors) ? activity.colors : [], // Ensure colors is an array
      grade_id: activity.grade_id?.toString() || '',
      book_id: activity.book_id?.toString() || '',
      unit_id: activity.unit_id?.toString() || '',
      lesson_id: activity.lesson_id?.toString() || '',
      learning_objectives: activity.learning_objectives || '',
      prerequisites: activity.prerequisites || '',
      estimated_duration: activity.estimated_duration || 10,
      pieceCount: 9, // Default for puzzle games
    });
    // --- CHANGE THIS LINE ---
    if (activity.image_url) {
      // The image_url from the service is already the full URL. No need to process it again.
      setPreviewUrl(activity.image_url);
    }
    // --- END CHANGE ---
    setShowCreateForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this activity?')) {
      try {
        const result = await activityService.deleteActivity(id);
        if (result.success) {
          alert('Activity deleted successfully!');
          loadActivities();
        } else {
          alert(`Error: ${result.error}`);
        }
      } catch (error) {
        console.error('Error deleting activity:', error);
        alert('An error occurred while deleting the activity');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'coloring',
      description: '',
      difficulty: 'easy',
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
      grade_id: '',
      book_id: '',
      unit_id: '',
      lesson_id: '',
      learning_objectives: '',
      prerequisites: '',
      estimated_duration: 10,
      pieceCount: 9,
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setEditingActivity(null);
    setShowCreateForm(false);
  };

  // Helper functions to filter hierarchy data
  const getBooksByGrade = (gradeId: string) => {
    return books.filter(book => book.grade_id === parseInt(gradeId));
  };

  const getUnitsByBook = (bookId: string) => {
    return units.filter(unit => unit.book_id === parseInt(bookId));
  };

  const getLessonsByUnit = (unitId: string) => {
    return lessons.filter(lesson => lesson.unit_id === parseInt(unitId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Activity Manager</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Create Activity</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <X size={20} />
              <span>Close</span>
            </button>
          )}
        </div>
      </div>

      {/* Create/Edit Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-lg shadow-lg p-6 mb-6"
          >
            <h3 className="text-xl font-bold mb-4">
              {editingActivity ? 'Edit Activity' : 'Create New Activity'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Activity['type'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="coloring">Coloring</option>
                    <option value="letter_match">Letter Match</option>
                    <option value="bubble_pop">Bubble Pop</option>
                    <option value="counting">Counting</option>
                    <option value="emotion_match">Emotion Match</option>
                    <option value="family_tree">Family Tree</option>
                    <option value="digital_painting">Digital Painting</option>
                    <option value="forest_hunt">Forest Hunt</option>
                    <option value="puzzle">Puzzle (Jigsaw)</option>
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
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Activity['difficulty'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              {/* Puzzle-specific fields */}
              {formData.type === 'puzzle' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Pieces
                  </label>
                  <select
                    value={formData.pieceCount}
                    onChange={(e) => setFormData({ ...formData, pieceCount: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={9}>9 pieces (3x3) - Easy</option>
                    <option value={16}>16 pieces (4x4) - Medium</option>
                    <option value={25}>25 pieces (5x5) - Hard</option>
                  </select>
                </div>
              )}

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
                    placeholder="What will students learn from this activity?"
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
                    placeholder="What should students know before this activity?"
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
                    max="120"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Attempts
                  </label>
                  
                </div>

              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.type === 'puzzle' ? 'Puzzle Image Upload' : 'Image Upload'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {previewUrl && (
                  <div className="mt-2">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              {formData.type === 'coloring' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Colors
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.colors.map((color, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => handleColorChange(index, e.target.value)}
                          className="w-8 h-8 rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => removeColor(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addColor}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    + Add Color
                  </button>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <Save size={20} />
                  <span>{editingActivity ? 'Update' : 'Create'}</span>
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activities List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map((activity) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            {activity.image_url && (
             <img
             src={activity.image_url} // Use the direct URL
             alt={activity.title}
             className="w-full h-48 object-cover"
           />
            )}
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">{activity.title}</h3>
              <p className="text-gray-600 text-sm mb-2">{activity.description}</p>
              <div className="flex justify-between items-center mb-4">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {activity.type.replace('_', ' ')}
                </span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                  {activity.difficulty}
                </span>
              </div>
              {activity.colors && (
                <div className="flex space-x-1 mb-4">
                  {activity.colors.slice(0, 6).map((color, index) => (
                    <div
                      key={index}
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(activity)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                >
                  <Edit size={14} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(activity.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-12">
          <Upload size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No activities yet</h3>
          <p className="text-gray-500">Create your first activity to get started!</p>
        </div>
      )}
    </div>
  );
};

export default ActivityManager;
