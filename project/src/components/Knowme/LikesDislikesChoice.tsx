import React, { useState } from 'react';
import { Heart, X, CheckCircle } from 'lucide-react';

interface LikesDislikesChoiceProps {
  onComplete: () => void;
}

const LikesDislikesChoice: React.FC<LikesDislikesChoiceProps> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [isComplete, setIsComplete] = useState(false);

  const questions = [
    { item1: 'Ice Cream', item2: 'Broccoli', emoji1: '🍦', emoji2: '🥦' },
    { item1: 'Playing Outside', item2: 'Watching TV', emoji1: '🏃‍♀️', emoji2: '📺' },
    { item1: 'Dogs', item2: 'Cats', emoji1: '🐕', emoji2: '🐱' },
    { item1: 'Drawing', item2: 'Reading', emoji1: '🎨', emoji2: '📚' },
    { item1: 'Pizza', item2: 'Salad', emoji1: '🍕', emoji2: '🥗' },
    { item1: 'Swimming', item2: 'Dancing', emoji1: '🏊‍♀️', emoji2: '💃' },
  ];

  const handleChoice = (choice: boolean) => {
    const newAnswers = { ...answers, [currentQuestion]: choice };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 1000);
    } else {
      setTimeout(() => {
        setIsComplete(true);
        setTimeout(() => {
          onComplete();
        }, 2000);
      }, 1000);
    }
  };

  const currentQ = questions[currentQuestion];
  const hasAnswered = currentQuestion in answers;

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-gray-800 mb-2 font-comic">
          Pick Your Favorites! 😊
        </h3>
        <p className="text-lg text-gray-600">
          Which one do you like more? Choose your favorite!
        </p>
        <div className="mt-4">
          <div className="bg-gray-200 rounded-full h-3 max-w-md mx-auto">
            <div 
              className="bg-gradient-to-r from-pink-400 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${((currentQuestion + (hasAnswered ? 1 : 0)) / questions.length) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>
      </div>

      {!isComplete ? (
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h4 className="text-2xl font-bold text-gray-800 mb-4">
              Which do you like more?
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Option 1 */}
            <button
              onClick={() => handleChoice(true)}
              disabled={hasAnswered}
              className={`group p-8 rounded-3xl transition-all transform hover:scale-105 ${
                hasAnswered && answers[currentQuestion]
                  ? 'bg-green-200 ring-4 ring-green-400'
                  : hasAnswered
                  ? 'bg-gray-200 opacity-60'
                  : 'bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white'
              }`}
            >
              <div className="flex flex-col items-center">
                <div className="text-8xl mb-4">{currentQ.emoji1}</div>
                <h5 className={`text-2xl font-bold ${hasAnswered ? 'text-gray-800' : 'text-white'}`}>
                  {currentQ.item1}
                </h5>
                {hasAnswered && answers[currentQuestion] && (
                  <div className="mt-4 flex items-center gap-2 text-green-700">
                    <Heart className="fill-green-500 text-green-500" size={24} />
                    <span className="font-bold">I like this!</span>
                  </div>
                )}
              </div>
            </button>

            {/* Option 2 */}
            <button
              onClick={() => handleChoice(false)}
              disabled={hasAnswered}
              className={`group p-8 rounded-3xl transition-all transform hover:scale-105 ${
                hasAnswered && !answers[currentQuestion]
                  ? 'bg-green-200 ring-4 ring-green-400'
                  : hasAnswered
                  ? 'bg-gray-200 opacity-60'
                  : 'bg-gradient-to-br from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700 text-white'
              }`}
            >
              <div className="flex flex-col items-center">
                <div className="text-8xl mb-4">{currentQ.emoji2}</div>
                <h5 className={`text-2xl font-bold ${hasAnswered ? 'text-gray-800' : 'text-white'}`}>
                  {currentQ.item2}
                </h5>
                {hasAnswered && !answers[currentQuestion] && (
                  <div className="mt-4 flex items-center gap-2 text-green-700">
                    <Heart className="fill-green-500 text-green-500" size={24} />
                    <span className="font-bold">I like this!</span>
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="bg-green-100 border-2 border-green-400 rounded-xl p-8 max-w-md mx-auto">
            <div className="text-6xl mb-4">🎉</div>
            <h4 className="text-2xl font-bold text-green-700 mb-2">Great Choices!</h4>
            <p className="text-green-600 mb-4">
              You've shared all your favorites! Everyone has different likes, and that's what makes us special.
            </p>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="text-green-500" size={24} />
              <span className="font-bold text-green-700">Complete!</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LikesDislikesChoice;