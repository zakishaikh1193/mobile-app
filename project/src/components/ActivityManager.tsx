import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Plus, Edit, Trash2, Save, X, Palette, Puzzle, BookOpen, Target, Users, Heart, Leaf, Paintbrush, Search } from 'lucide-react';
import { activityService, Activity } from '../services/activityService';
import api from '../services/api';

interface ActivityManagerProps {
  onClose?: () => void;
}

const ActivityManager: React.FC<ActivityManagerProps> = ({ onClose }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    letterSet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', // For letter matching
    bubbleCount: 20, // For bubble pop
    numberRange: 10, // For counting
    emotionSet: ['happy', 'sad', 'angry', 'surprised'], // For emotion matching
    familyMembers: ['father', 'mother', 'sister', 'brother'], // For family tree
    forestLetters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', // For forest hunt
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
      console.log('Loading hierarchy data...');
      
      // Load grades
      const gradesResponse = await api.get('/education/grades');
      console.log('Grades response:', gradesResponse.data);
      setGrades(gradesResponse.data.grades || []);
     
      // Load books
      const booksResponse = await api.get('/education/books');
      console.log('Books response:', booksResponse.data);
      setBooks(booksResponse.data.books || []);

      // Load units
      const unitsResponse = await api.get('/education/units');
      console.log('Units response:', unitsResponse.data);
      setUnits(unitsResponse.data.units || []);

      // Load lessons
      const lessonsResponse = await api.get('/education/lessons');
      console.log('Lessons response:', lessonsResponse.data);
      setLessons(lessonsResponse.data.lessons || []);
    } catch (error) {
      console.error('Error loading hierarchy data:', error);
      setError('Failed to load hierarchy data. Please check your connection.');
    }
  };

  const loadActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Loading activities...');
      const data = await activityService.getAllActivities();
      console.log('Activities loaded:', data);
      setActivities(data);
    } catch (error) {
      console.error('Error loading activities:', error);
      setError('Failed to load activities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.size, file.type);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    console.log('Submitting form data:', formData);
    
    const submitFormData = new FormData();
    submitFormData.append('title', formData.title);
    submitFormData.append('type', formData.type);
    submitFormData.append('description', formData.description);
    submitFormData.append('difficulty', formData.difficulty);
    submitFormData.append('colors', JSON.stringify(formData.colors));
    submitFormData.append('estimated_duration', formData.estimated_duration.toString());
    
    // Add activity-specific data to the data field
    const activityData: any = {};
    if (formData.type === 'puzzle') {
      activityData.pieceCount = formData.pieceCount;
    } else if (formData.type === 'letter_match') {
      activityData.letterSet = formData.letterSet;
    } else if (formData.type === 'bubble_pop') {
      activityData.bubbleCount = formData.bubbleCount;
    } else if (formData.type === 'counting') {
      activityData.numberRange = formData.numberRange;
    } else if (formData.type === 'emotion_match') {
      activityData.emotionSet = formData.emotionSet;
    } else if (formData.type === 'family_tree') {
      activityData.familyMembers = formData.familyMembers;
    } else if (formData.type === 'forest_hunt') {
      activityData.forestLetters = formData.forestLetters;
    }
    
    // Add data field with activity-specific information
    submitFormData.append('data', JSON.stringify(activityData));
    
    // Add hierarchy fields only if they have values
    if (formData.grade_id && formData.grade_id !== '') {
      submitFormData.append('grade_id', formData.grade_id);
    }
    if (formData.book_id && formData.book_id !== '') {
      submitFormData.append('book_id', formData.book_id);
    }
    if (formData.unit_id && formData.unit_id !== '') {
      submitFormData.append('unit_id', formData.unit_id);
    }
    if (formData.lesson_id && formData.lesson_id !== '') {
      submitFormData.append('lesson_id', formData.lesson_id);
    }
    if (formData.learning_objectives && formData.learning_objectives.trim() !== '') {
      submitFormData.append('learning_objectives', formData.learning_objectives);
    }
    if (formData.prerequisites && formData.prerequisites.trim() !== '') {
      submitFormData.append('prerequisites', formData.prerequisites);
    }
    
    // Image is required for new activities
    if (selectedFile) {
      submitFormData.append('image', selectedFile);
    } else if (!editingActivity) {
      setError('Image file is required for new activities.');
      return;
    }

    // Debug: Log FormData contents
    console.log('FormData contents:');
    for (let [key, value] of submitFormData.entries()) {
      console.log(key, value);
    }

    try {
      if (editingActivity) {
        console.log('Updating activity:', editingActivity.id);
        const result = await activityService.updateActivity(editingActivity.id, submitFormData);
        if (result.success) {
          alert('Activity updated successfully!');
          resetForm();
          loadActivities();
        } else {
          setError(`Error: ${result.error}`);
          alert(`Error: ${result.error}`);
        }
      } else {
        console.log('Creating new activity');
        const result = await activityService.createActivity(submitFormData);
        if (result.success) {
          alert('Activity created successfully!');
          resetForm();
          loadActivities();
        } else {
          setError(`Error: ${result.error}`);
          alert(`Error: ${result.error}`);
        }
      }
    } catch (error) {
      console.error('Error submitting activity:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      alert('An error occurred while saving the activity');
    }
  };

  const handleEdit = (activity: Activity) => {
    console.log('Editing activity:', activity);
    setEditingActivity(activity);
    
    // Parse activity-specific data from the data field
    let activityData: any = {};
    if (activity.data) {
      try {
        activityData = typeof activity.data === 'string' ? JSON.parse(activity.data) : activity.data;
      } catch (e) {
        console.error('Error parsing activity data:', e);
        activityData = {};
      }
    }
    
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
      pieceCount: activityData.pieceCount || 9,
      letterSet: activityData.letterSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      bubbleCount: activityData.bubbleCount || 20,
      numberRange: activityData.numberRange || 10,
      emotionSet: activityData.emotionSet || ['happy', 'sad', 'angry', 'surprised'],
      familyMembers: activityData.familyMembers || ['father', 'mother', 'sister', 'brother'],
      forestLetters: activityData.forestLetters || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    });
    
    if (activity.image_url) {
      setPreviewUrl(activity.image_url);
    }
    setShowCreateForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this activity?')) {
      try {
        console.log('Deleting activity:', id);
        const result = await activityService.deleteActivity(id);
        if (result.success) {
          alert('Activity deleted successfully!');
          loadActivities();
        } else {
          setError(`Error: ${result.error}`);
          alert(`Error: ${result.error}`);
        }
      } catch (error) {
        console.error('Error deleting activity:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        setError(errorMessage);
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
      letterSet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      bubbleCount: 20,
      numberRange: 10,
      emotionSet: ['happy', 'sad', 'angry', 'surprised'],
      familyMembers: ['father', 'mother', 'sister', 'brother'],
      forestLetters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setEditingActivity(null);
    setShowCreateForm(false);
    setError(null);
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

  // Activity type configurations
  const activityConfigs = {
    coloring: {
      icon: Palette,
      title: 'Coloring Activity',
      description: 'Create coloring pages with custom colors',
      requirements: ['Image file (PNG/JPG)', 'Color palette', 'Age-appropriate content'],
      fields: ['colors', 'image']
    },
    letter_match: {
      icon: BookOpen,
      title: 'Letter Matching Activity',
      description: 'Match letters with sounds and objects',
      requirements: ['Letter set', 'Audio files', 'Visual aids'],
      fields: ['letterSet']
    },
    bubble_pop: {
      icon: Target,
      title: 'Bubble Pop Activity',
      description: 'Pop bubbles with numbers or letters',
      requirements: ['Bubble count', 'Target content', 'Animation settings'],
      fields: ['bubbleCount']
    },
    counting: {
      icon: Target,
      title: 'Counting Activity',
      description: 'Learn numbers and counting',
      requirements: ['Number range', 'Visual objects', 'Audio cues'],
      fields: ['numberRange']
    },
    emotion_match: {
      icon: Heart,
      title: 'Emotion Matching Activity',
      description: 'Match emotions with expressions',
      requirements: ['Emotion set', 'Face images', 'Audio descriptions'],
      fields: ['emotionSet']
    },
    family_tree: {
      icon: Users,
      title: 'Family Tree Activity',
      description: 'Learn about family relationships',
      requirements: ['Family members', 'Relationship images', 'Audio names'],
      fields: ['familyMembers']
    },
    digital_painting: {
      icon: Paintbrush,
      title: 'Digital Painting Activity',
      description: 'Create digital artwork',
      requirements: ['Canvas size', 'Brush tools', 'Color palette'],
      fields: ['colors']
    },
    forest_hunt: {
      icon: Leaf,
      title: 'Forest Letter Hunt Activity',
      description: 'Find letters hidden in forest scenes',
      requirements: ['Forest scene', 'Hidden letters', 'Audio cues'],
      fields: ['forestLetters']
    },
    puzzle: {
      icon: Puzzle,
      title: 'Puzzle (Jigsaw) Activity',
      description: 'Complete jigsaw puzzles',
      requirements: ['Puzzle image', 'Piece count', 'Difficulty level'],
      fields: ['pieceCount', 'image']
    }
  };

  // Render activity-specific form fields
  const renderActivitySpecificFields = () => {
    const config = activityConfigs[formData.type as keyof typeof activityConfigs];
    
    switch (formData.type) {
      case 'puzzle':
        return (
          <div className="space-y-4">
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
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Puzzle Requirements:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• High-quality image (PNG/JPG, max 10MB)</li>
                <li>• Clear, recognizable content</li>
                <li>• Good contrast for piece visibility</li>
                <li>• Age-appropriate subject matter</li>
              </ul>
            </div>
          </div>
        );

      case 'letter_match':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Letter Set
              </label>
              <input
                type="text"
                value={formData.letterSet}
                onChange={(e) => setFormData({ ...formData, letterSet: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ABCDEFGHIJKLMNOPQRSTUVWXYZ"
              />
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Letter Matching Requirements:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Clear letter fonts</li>
                <li>• Audio pronunciation files</li>
                <li>• Matching object images</li>
                <li>• Progressive difficulty levels</li>
              </ul>
            </div>
          </div>
        );

      case 'bubble_pop':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Bubbles
              </label>
              <select
                value={formData.bubbleCount}
                onChange={(e) => setFormData({ ...formData, bubbleCount: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10 bubbles - Easy</option>
                <option value={20}>20 bubbles - Medium</option>
                <option value={30}>30 bubbles - Hard</option>
              </select>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">Bubble Pop Requirements:</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Animated bubble graphics</li>
                <li>• Sound effects for popping</li>
                <li>• Target content (numbers/letters)</li>
                <li>• Timer and scoring system</li>
              </ul>
            </div>
          </div>
        );

      case 'counting':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number Range
              </label>
              <select
                value={formData.numberRange}
                onChange={(e) => setFormData({ ...formData, numberRange: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>1-5 - Easy</option>
                <option value={10}>1-10 - Medium</option>
                <option value={20}>1-20 - Hard</option>
              </select>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-medium text-orange-800 mb-2">Counting Requirements:</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Visual counting objects</li>
                <li>• Audio number pronunciation</li>
                <li>• Interactive counting interface</li>
                <li>• Progress tracking</li>
              </ul>
            </div>
          </div>
        );

      case 'emotion_match':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emotion Set
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['happy', 'sad', 'angry', 'surprised', 'scared', 'excited'].map((emotion) => (
                  <label key={emotion} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.emotionSet.includes(emotion)}
                      onChange={(e) => {
                        const newEmotions = e.target.checked
                          ? [...formData.emotionSet, emotion]
                          : formData.emotionSet.filter(e => e !== emotion);
                        setFormData({ ...formData, emotionSet: newEmotions });
                      }}
                      className="rounded"
                    />
                    <span className="text-sm capitalize">{emotion}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="bg-pink-50 p-4 rounded-lg">
              <h4 className="font-medium text-pink-800 mb-2">Emotion Matching Requirements:</h4>
              <ul className="text-sm text-pink-700 space-y-1">
                <li>• Clear facial expressions</li>
                <li>• Audio emotion descriptions</li>
                <li>• Age-appropriate content</li>
                <li>• Positive learning approach</li>
              </ul>
            </div>
          </div>
        );

      case 'family_tree':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Family Members
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['father', 'mother', 'sister', 'brother', 'grandfather', 'grandmother', 'aunt', 'uncle'].map((member) => (
                  <label key={member} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.familyMembers.includes(member)}
                      onChange={(e) => {
                        const newMembers = e.target.checked
                          ? [...formData.familyMembers, member]
                          : formData.familyMembers.filter(m => m !== member);
                        setFormData({ ...formData, familyMembers: newMembers });
                      }}
                      className="rounded"
                    />
                    <span className="text-sm capitalize">{member}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h4 className="font-medium text-indigo-800 mb-2">Family Tree Requirements:</h4>
              <ul className="text-sm text-indigo-700 space-y-1">
                <li>• Family member images</li>
                <li>• Relationship connections</li>
                <li>• Audio pronunciation</li>
                <li>• Cultural sensitivity</li>
              </ul>
            </div>
          </div>
        );

      case 'digital_painting':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color Palette
              </label>
              <div className="flex flex-wrap gap-2">
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
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addColor}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Add Color
                </button>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Digital Painting Requirements:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Canvas size options</li>
                <li>• Brush tool variety</li>
                <li>• Color palette</li>
                <li>• Save/export functionality</li>
              </ul>
            </div>
          </div>
        );

      case 'forest_hunt':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Letters to Hide
              </label>
              <input
                type="text"
                value={formData.forestLetters}
                onChange={(e) => setFormData({ ...formData, forestLetters: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ABCDEFGHIJKLMNOPQRSTUVWXYZ"
              />
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Forest Hunt Requirements:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Forest scene background</li>
                <li>• Hidden letter placement</li>
                <li>• Audio letter pronunciation</li>
                <li>• Interactive discovery</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Render activity type icon and info
  const renderActivityTypeInfo = () => {
    const config = activityConfigs[formData.type as keyof typeof activityConfigs];
    const IconComponent = config.icon;
    
    return (
      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg mb-4">
        <IconComponent className="w-8 h-8 text-blue-600" />
        <div>
          <h3 className="font-semibold text-gray-800">{config.title}</h3>
          <p className="text-sm text-gray-600">{config.description}</p>
        </div>
      </div>
    );  
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Activity Manager</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Activity</span>
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <div className="ml-auto pl-3">
            <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600"
            >
                  <X className="w-5 h-5" />
            </button>
              </div>
            </div>
          </div>
        )}

        {/* Activities List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {activities.map((activity) => {
            const config = activityConfigs[activity.type as keyof typeof activityConfigs];
            const IconComponent = config?.icon || BookOpen;
            
            return (
              <div key={activity.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="w-6 h-6 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600 capitalize">
                      {activity.type.replace('_', ' ')}
                    </span>
        </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(activity)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(activity.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="font-semibold text-gray-800 mb-2">{activity.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activity.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    activity.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {activity.difficulty}
                  </span>
                  <span className="text-gray-500">{activity.estimated_duration} min</span>
                </div>
              </div>
            );
          })}
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
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">
              {editingActivity ? 'Edit Activity' : 'Create New Activity'}
            </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Activity Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Activity Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Activity['type'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="coloring">🎨 Coloring</option>
                    <option value="letter_match">📚 Letter Match</option>
                    <option value="bubble_pop">🎯 Bubble Pop</option>
                    <option value="counting">🔢 Counting</option>
                    <option value="emotion_match">😊 Emotion Match</option>
                    <option value="family_tree">👨‍👩‍👧‍👦 Family Tree</option>
                    <option value="digital_painting">🖌️ Digital Painting</option>
                    <option value="forest_hunt">🌲 Forest Hunt</option>
                    <option value="puzzle">🧩 Puzzle (Jigsaw)</option>
                  </select>
                </div>

                {/* Activity Type Info */}
                {renderActivityTypeInfo()}

                {/* Basic Fields */}
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

                {/* Activity-Specific Fields */}
                {renderActivitySpecificFields()}

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Activity Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept="image/*"
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG up to 10MB
                      </p>
                    </label>
                  </div>
                  {previewUrl && (
                    <div className="mt-4">
                      <img src={previewUrl} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                </div>
              )}
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

                {/* Additional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Learning Objectives
                  </label>
                  <textarea
                    value={formData.learning_objectives}
                    onChange={(e) => setFormData({ ...formData, learning_objectives: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
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
                      rows={3}
                    placeholder="What should students know before this activity?"
                  />
                </div>
              </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.estimated_duration}
                    onChange={(e) => setFormData({ ...formData, estimated_duration: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="60"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                    Cancel
                        </button>
                <button
                  type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingActivity ? 'Update Activity' : 'Create Activity'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
              </div>
    </div>
  );
};

export default ActivityManager;
