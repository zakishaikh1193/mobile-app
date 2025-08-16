import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BubblePopActivity } from '../types/bubblePop';
import { BUBBLE_POP_REQUIREMENTS } from '../constants/bubblePop';

const CreateBubblePopActivity: React.FC = () => {
  const navigate = useNavigate();
  const [activity, setActivity] = useState<BubblePopActivity>({
    title: '',
    description: '',
    numberOfBubbles: '20 bubbles - Medium',
    grade: '',
    unit: '',
    learningObjectives: '',
    estimatedDuration: '10',
    difficulty: 'Easy',
    book: '',
    lesson: '',
    prerequisites: ''
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleInputChange = (field: keyof BubblePopActivity, value: string) => {
    setActivity(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setActivity(prev => ({
        ...prev,
        activityImage: file
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating Bubble Pop Activity:', activity);
    // Here you would typically send the data to your backend
    alert('Bubble Pop Activity created successfully!');
    navigate('/admin/activities');
  };

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Create New Activity</h1>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Activity Type */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activity Type
              </label>
              <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg bg-gray-50">
                <span className="text-2xl">🫧</span>
                <select 
                  className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900"
                  value="Bubble Pop"
                  disabled
                >
                  <option>Bubble Pop</option>
                </select>
              </div>
              
              {/* Activity Description */}
              <div className="mt-4 flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🫧</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Bubble Pop Activity</h3>
                  <p className="text-sm text-gray-600">Pop bubbles with numbers or letters</p>
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={activity.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter activity title"
              />
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={activity.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                placeholder="Enter activity description"
              />
            </div>

            {/* Number of Bubbles */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Bubbles
              </label>
              <select
                value={activity.numberOfBubbles}
                onChange={(e) => handleInputChange('numberOfBubbles', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="10 bubbles - Easy">10 bubbles - Easy</option>
                <option value="20 bubbles - Medium">20 bubbles - Medium</option>
                <option value="30 bubbles - Hard">30 bubbles - Hard</option>
                <option value="40 bubbles - Expert">40 bubbles - Expert</option>
              </select>
            </div>

                         {/* Bubble Pop Requirements */}
             <div className="bg-white rounded-lg shadow-sm p-6">
               <h3 className="text-sm font-medium text-gray-700 mb-3">Bubble Pop Requirements</h3>
               <div className="bg-purple-50 rounded-lg p-4 space-y-2">
                 {BUBBLE_POP_REQUIREMENTS.map((requirement, index) => (
                   <div key={index} className="flex items-center space-x-2">
                     <span className="text-purple-600">•</span>
                     <span className="text-sm text-gray-700">{requirement}</span>
                   </div>
                 ))}
               </div>
             </div>

            {/* Activity Image */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activity Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="text-gray-400 mb-2">
                    <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG up to 10MB
                  </p>
                </label>
              </div>
              {selectedImage && (
                <p className="text-sm text-green-600 mt-2">✓ {selectedImage.name} selected</p>
              )}
            </div>

            {/* Grade */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade
              </label>
              <select
                value={activity.grade}
                onChange={(e) => handleInputChange('grade', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Grade</option>
                <option value="Pre-K">Pre-K</option>
                <option value="Kindergarten">Kindergarten</option>
                <option value="1st Grade">1st Grade</option>
                <option value="2nd Grade">2nd Grade</option>
                <option value="3rd Grade">3rd Grade</option>
              </select>
            </div>

            {/* Unit */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit
              </label>
              <select
                value={activity.unit}
                onChange={(e) => handleInputChange('unit', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Unit</option>
                <option value="Unit 1: Alphabet">Unit 1: Alphabet</option>
                <option value="Unit 2: Numbers">Unit 2: Numbers</option>
                <option value="Unit 3: Shapes">Unit 3: Shapes</option>
                <option value="Unit 4: Colors">Unit 4: Colors</option>
                <option value="Unit 5: Words">Unit 5: Words</option>
              </select>
            </div>

            {/* Learning Objectives */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learning Objectives
              </label>
              <textarea
                value={activity.learningObjectives}
                onChange={(e) => handleInputChange('learningObjectives', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                placeholder="What will students learn from this activity?"
              />
            </div>

            {/* Estimated Duration */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Duration (minutes)
              </label>
              <input
                type="number"
                value={activity.estimatedDuration}
                onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                max="60"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Difficulty */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={activity.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            {/* Book */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Book
              </label>
              <select
                value={activity.book}
                onChange={(e) => handleInputChange('book', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Book</option>
                <option value="Book 1: Learning Basics">Book 1: Learning Basics</option>
                <option value="Book 2: Advanced Concepts">Book 2: Advanced Concepts</option>
                <option value="Book 3: Mastery Level">Book 3: Mastery Level</option>
              </select>
            </div>

            {/* Lesson */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lesson
              </label>
              <select
                value={activity.lesson}
                onChange={(e) => handleInputChange('lesson', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Lesson</option>
                <option value="Lesson 1: Introduction">Lesson 1: Introduction</option>
                <option value="Lesson 2: Practice">Lesson 2: Practice</option>
                <option value="Lesson 3: Review">Lesson 3: Review</option>
                <option value="Lesson 4: Assessment">Lesson 4: Assessment</option>
              </select>
            </div>

            {/* Prerequisites */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prerequisites
              </label>
              <textarea
                value={activity.prerequisites}
                onChange={(e) => handleInputChange('prerequisites', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                placeholder="What should students know before this activity?"
              />
            </div>
          </div>
        </form>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-8">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <span>📄</span>
            <span>Create Activity</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateBubblePopActivity;
