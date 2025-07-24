import React from 'react';
import { GameProgress } from '../App';
import { X, Star, Trophy, Target, TrendingUp } from 'lucide-react';

interface ProgressTrackerProps {
  progress: GameProgress;
  onClose: () => void;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ progress, onClose }) => {
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-600';
    if (accuracy >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyBgColor = (accuracy: number) => {
    if (accuracy >= 90) return 'bg-green-100';
    if (accuracy >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-green-800 flex items-center gap-2">
            <Trophy className="text-yellow-600" size={28} />
            Your Progress
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Level and Stars */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center">
              <div className="text-3xl font-bold text-blue-700 mb-1">
                {progress.level}
              </div>
              <div className="text-sm text-blue-600 font-medium">
                Current Level
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl text-center">
              <div className="text-3xl font-bold text-yellow-700 mb-1 flex items-center justify-center gap-1">
                <Star className="fill-current" size={24} />
                {progress.totalStars}
              </div>
              <div className="text-sm text-yellow-600 font-medium">
                Total Stars
              </div>
            </div>
          </div>

          {/* Accuracy */}
          <div className={`p-4 rounded-xl ${getAccuracyBgColor(progress.accuracy)}`}>
            <div className="flex items-center gap-3 mb-2">
              <Target className={getAccuracyColor(progress.accuracy)} size={24} />
              <span className="font-semibold text-gray-700">Accuracy</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    progress.accuracy >= 90 ? 'bg-green-500' :
                    progress.accuracy >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${progress.accuracy}%` }}
                />
              </div>
              <span className={`font-bold text-lg ${getAccuracyColor(progress.accuracy)}`}>
                {progress.accuracy}%
              </span>
            </div>
          </div>

          {/* Games Played */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="text-purple-600" size={24} />
              <span className="font-semibold text-gray-700">Games Played</span>
            </div>
            <div className="text-2xl font-bold text-purple-700">
              {progress.gamesPlayed}
            </div>
          </div>

          {/* Letters Learned */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">📚</span>
              <span className="font-semibold text-gray-700">Letters Mastered</span>
            </div>
            <div className="text-lg font-bold text-green-700 mb-2">
              {progress.lettersLearned.length} / 26 letters
            </div>
            <div className="flex flex-wrap gap-1">
              {progress.lettersLearned.map((letter, index) => (
                <span
                  key={index}
                  className="bg-green-200 text-green-800 px-2 py-1 rounded text-sm font-medium"
                >
                  {letter.toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <Trophy className="text-orange-600" size={24} />
              <span className="font-semibold text-gray-700">Achievements</span>
            </div>
            <div className="space-y-2">
              {progress.level >= 5 && (
                <div className="flex items-center gap-2 text-sm text-orange-700">
                  🏆 <span>Explorer - Reached level 5!</span>
                </div>
              )}
              {progress.totalStars >= 50 && (
                <div className="flex items-center gap-2 text-sm text-orange-700">
                  ⭐ <span>Star Collector - Earned 50+ stars!</span>
                </div>
              )}
              {progress.accuracy >= 95 && (
                <div className="flex items-center gap-2 text-sm text-orange-700">
                  🎯 <span>Sharp Shooter - 95%+ accuracy!</span>
                </div>
              )}
              {progress.lettersLearned.length >= 13 && (
                <div className="flex items-center gap-2 text-sm text-orange-700">
                  📖 <span>Half Way There - Learned 13+ letters!</span>
                </div>
              )}
              {progress.lettersLearned.length >= 26 && (
                <div className="flex items-center gap-2 text-sm text-orange-700">
                  🎓 <span>Alphabet Master - All letters learned!</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Continue Playing
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;