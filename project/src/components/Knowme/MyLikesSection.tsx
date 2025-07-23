import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import LikesDislikesChoice from './LikesDislikesChoice';
import LikesDislikesSort from './LikesDislikesSort';
import ShowAndTell from './ShowAndTell';
import FavoriteFruits from './FavoriteFruits';

interface MyLikesSectionProps {
  onActivityComplete: (activityId: string) => void;
  completedActivities: string[];
}

const MyLikesSection: React.FC<MyLikesSectionProps> = ({ onActivityComplete, completedActivities }) => {
  const [currentActivity, setCurrentActivity] = useState<'menu' | 'choice' | 'sort' | 'showtell' | 'fruits'>('menu');

  const activities = [
    {
      id: 'likes-choice',
      title: 'Pick Your Favorites',
      description: 'Choose what you like or dislike!',
      icon: '😊',
      activity: 'choice',
      color: 'from-pink-400 to-red-500'
    },
    {
      id: 'likes-sort',
      title: 'Sort My Things',
      description: 'Drag things you like or dislike!',
      icon: '📊',
      activity: 'sort',
      color: 'from-green-400 to-blue-500'
    },
    {
      id: 'likes-showtell',
      title: 'Show & Tell',
      description: 'Share your favorite things!',
      icon: '🎤',
      activity: 'showtell',
      color: 'from-purple-400 to-pink-500'
    },
    {
      id: 'likes-fruits',
      title: 'Favorite Fruits',
      description: 'Pick your favorite fruits!',
      icon: '🍎',
      activity: 'fruits',
      color: 'from-yellow-400 to-orange-500'
    }
  ];

  if (currentActivity !== 'menu') {
    return (
      <div>
        <button
          onClick={() => setCurrentActivity('menu')}
          className="mb-6 bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-full font-bold text-lg transform hover:scale-105 transition-all"
        >
          ← Back to Activities
        </button>
        
        {currentActivity === 'choice' && (
          <LikesDislikesChoice onComplete={() => onActivityComplete('likes-choice')} />
        )}
        {currentActivity === 'sort' && (
          <LikesDislikesSort onComplete={() => onActivityComplete('likes-sort')} />
        )}
        {currentActivity === 'showtell' && (
          <ShowAndTell onComplete={() => onActivityComplete('likes-showtell')} />
        )}
        {currentActivity === 'fruits' && (
          <FavoriteFruits onComplete={() => onActivityComplete('likes-fruits')} />
        )}
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-white mb-4 font-comic">
          My Favorite Things! ❤️
        </h2>
        <p className="text-xl text-white/90">
          Let's discover what you love and what you don't like so much!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {activities.map((activity) => (
          <button
            key={activity.id}
            onClick={() => setCurrentActivity(activity.activity as any)}
            className={`group bg-gradient-to-br ${activity.color} hover:shadow-xl text-white p-6 rounded-3xl transform transition-all duration-300 hover:scale-105 relative`}
          >
            {completedActivities.includes(activity.id) && (
              <div className="absolute top-4 right-4">
                <CheckCircle className="text-white bg-green-500 rounded-full" size={24} />
              </div>
            )}
            
            <div className="text-6xl mb-4">{activity.icon}</div>
            <h3 className="text-2xl font-bold mb-2 font-comic">{activity.title}</h3>
            <p className="text-lg opacity-90">{activity.description}</p>
            
            <div className="mt-4 bg-white/20 px-4 py-2 rounded-full inline-block">
              <span className="font-semibold">Let's Explore!</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MyLikesSection;