import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BubblePopSettings } from '../types/bubblePop';
import { GAME_OPTIONS } from '../constants/bubblePop';

const AdminBubblePopManagement: React.FC = () => {
  const [settings, setSettings] = useState<BubblePopSettings[]>(
    GAME_OPTIONS.map(option => ({
      id: option.id,
      name: option.name,
      type: option.type,
      isActive: option.isActive,
      difficulty: option.difficulty,
      description: option.description,
      icon: option.icon
    }))
  );

  const [selectedSetting, setSelectedSetting] = useState<BubblePopSettings | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleToggleActive = (id: string) => {
    setSettings(prev => 
      prev.map(setting => 
        setting.id === id 
          ? { ...setting, isActive: !setting.isActive }
          : setting
      )
    );
  };

  const handleEdit = (setting: BubblePopSettings) => {
    setSelectedSetting(setting);
    setIsEditing(true);
  };

  const handleSave = (updatedSetting: BubblePopSettings) => {
    setSettings(prev => 
      prev.map(setting => 
        setting.id === updatedSetting.id 
          ? updatedSetting
          : setting
      )
    );
    setIsEditing(false);
    setSelectedSetting(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedSetting(null);
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🎈 Bubble Pop Game Management
          </h1>
          <p className="text-gray-600">
            Configure different types of bubble pop games for students
          </p>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settings.map((setting) => (
            <motion.div
              key={setting.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{setting.icon}</span>
                    <div>
                      <h3 className="text-xl font-bold">{setting.name}</h3>
                      <p className="text-blue-100 text-sm">{setting.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(setting.difficulty)}`}>
                      {setting.difficulty}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-600 mb-4">{setting.description}</p>
                
                {/* Status */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">Status:</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${setting.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`text-sm font-medium ${setting.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {setting.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleToggleActive(setting.id)}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      setting.isActive
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {setting.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => handleEdit(setting)}
                    className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Edit Modal */}
        {isEditing && selectedSetting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Edit {selectedSetting.name}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={selectedSetting.name}
                    onChange={(e) => setSelectedSetting({
                      ...selectedSetting,
                      name: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={selectedSetting.description}
                    onChange={(e) => setSelectedSetting({
                      ...selectedSetting,
                      description: e.target.value
                    })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={selectedSetting.difficulty}
                    onChange={(e) => setSelectedSetting({
                      ...selectedSetting,
                      difficulty: e.target.value as 'easy' | 'medium' | 'hard'
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        checked={selectedSetting.isActive}
                        onChange={() => setSelectedSetting({
                          ...selectedSetting,
                          isActive: true
                        })}
                        className="mr-2"
                      />
                      Active
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        checked={!selectedSetting.isActive}
                        onChange={() => setSelectedSetting({
                          ...selectedSetting,
                          isActive: false
                        })}
                        className="mr-2"
                      />
                      Inactive
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSave(selectedSetting)}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Game Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {settings.filter(s => s.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Active Games</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {settings.filter(s => s.difficulty === 'easy').length}
              </div>
              <div className="text-sm text-gray-600">Easy Level</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {settings.filter(s => s.difficulty === 'medium').length}
              </div>
              <div className="text-sm text-gray-600">Medium Level</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {settings.filter(s => s.difficulty === 'hard').length}
              </div>
              <div className="text-sm text-gray-600">Hard Level</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBubblePopManagement;
