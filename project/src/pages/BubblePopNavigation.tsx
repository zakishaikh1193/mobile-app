import React from 'react';
import { useNavigate } from 'react-router-dom';

const BubblePopNavigation: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: '🎮 Test Bubble Pop Game',
      description: 'Test the working bubble pop game with different types',
      route: '/bubble-pop-test',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: '📝 Create Bubble Pop Activity',
      description: 'Create new bubble pop activities with detailed settings',
      route: '/create-bubble-pop-activity',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: '🎈 Full Game Selection',
      description: 'Complete bubble pop game selection interface',
      route: '/bubble-pop-games',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: '⚙️ Admin Management',
      description: 'Manage bubble pop game settings and configurations',
      route: '/admin/bubble-pop-management',
      color: 'from-orange-500 to-red-500'
    },
    {
      title: '🚀 Demo Version',
      description: 'Quick demo of the bubble pop game features',
      route: '/bubble-pop-demo',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎈 Bubble Pop Activity Hub
          </h1>
          <p className="text-xl text-gray-600">
            Access all bubble pop game features and management tools
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
              onClick={() => navigate(feature.route)}
            >
              <div className={`bg-gradient-to-br ${feature.color} p-6 text-white`}>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-white/90 text-sm">{feature.description}</p>
              </div>
              <div className="p-6">
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium transition-colors">
                  Open →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Status Information */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            🎯 Bubble Pop Game Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl mb-2">✅</div>
              <h4 className="font-semibold text-gray-800 mb-2">Game Working</h4>
              <p className="text-sm text-gray-600">Bubble pop game is fully functional</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl mb-2">🎮</div>
              <h4 className="font-semibold text-gray-800 mb-2">5 Game Types</h4>
              <p className="text-sm text-gray-600">Alphabet, Numbers, Shapes, Colors, Words</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl mb-2">⚙️</div>
              <h4 className="font-semibold text-gray-800 mb-2">Admin Tools</h4>
              <p className="text-sm text-gray-600">Create and manage activities</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/bubble-pop-test')}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-2xl text-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 mr-4"
          >
            🎮 Quick Test
          </button>
          <button
            onClick={() => navigate('/create-bubble-pop-activity')}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-2xl text-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            📝 Create Activity
          </button>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default BubblePopNavigation;
