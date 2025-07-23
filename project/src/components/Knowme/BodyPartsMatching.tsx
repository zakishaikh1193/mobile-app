import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';

interface BodyPartsMatchingProps {
  onComplete: () => void;
}

const BodyPartsMatching: React.FC<BodyPartsMatchingProps> = ({ onComplete }) => {
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const matchingPairs = [
    { bodyPart: 'Eyes', function: 'See', emoji: '👀' },
    { bodyPart: 'Feet', function: 'Walk', emoji: '🦶' },
    { bodyPart: 'Hands', function: 'Hold', emoji: '✋' },
    { bodyPart: 'Mouth', function: 'Talk', emoji: '👄' },
    { bodyPart: 'Ears', function: 'Hear', emoji: '👂' },
    { bodyPart: 'Nose', function: 'Smell', emoji: '👃' },
  ];

  const handleBodyPartClick = (bodyPart: string) => {
    setSelectedBodyPart(bodyPart);
  };

  const handleFunctionClick = (functionName: string) => {
    if (selectedBodyPart) {
      const correctPair = matchingPairs.find(
        pair => pair.bodyPart === selectedBodyPart && pair.function === functionName
      );
      
      if (correctPair) {
        const newMatches = { ...matches, [selectedBodyPart]: functionName };
        setMatches(newMatches);
        
        if (Object.keys(newMatches).length === matchingPairs.length) {
          setIsComplete(true);
          setTimeout(() => {
            onComplete();
          }, 2000);
        }
      }
      setSelectedBodyPart(null);
    }
  };

  const getBodyPartStatus = (bodyPart: string) => {
    if (matches[bodyPart]) return 'matched';
    if (selectedBodyPart === bodyPart) return 'selected';
    return 'unmatched';
  };

  const getFunctionStatus = (functionName: string) => {
    const isMatched = Object.values(matches).includes(functionName);
    if (isMatched) return 'matched';
    return 'unmatched';
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-gray-800 mb-2 font-comic">
          What Do They Do? 🔗
        </h3>
        <p className="text-lg text-gray-600">
          Match each body part with what it helps you do!
        </p>
        <p className="text-md text-blue-600 mt-2">
          Click a body part, then click what it does!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Body Parts */}
        <div>
          <h4 className="text-2xl font-bold text-gray-800 mb-6 text-center">Body Parts</h4>
          <div className="space-y-4">
            {matchingPairs.map((pair) => {
              const status = getBodyPartStatus(pair.bodyPart);
              return (
                <button
                  key={pair.bodyPart}
                  onClick={() => handleBodyPartClick(pair.bodyPart)}
                  disabled={matches[pair.bodyPart]}
                  className={`w-full p-4 rounded-xl text-xl font-bold transition-all transform hover:scale-105 ${
                    status === 'matched'
                      ? 'bg-green-200 text-green-800 cursor-not-allowed'
                      : status === 'selected'
                      ? 'bg-blue-200 text-blue-800 ring-4 ring-blue-400'
                      : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl">{pair.emoji}</span>
                    <span>{pair.bodyPart}</span>
                    {matches[pair.bodyPart] && <CheckCircle size={24} className="text-green-600" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Functions */}
        <div>
          <h4 className="text-2xl font-bold text-gray-800 mb-6 text-center">What They Do</h4>
          <div className="space-y-4">
            {matchingPairs.map((pair) => {
              const status = getFunctionStatus(pair.function);
              return (
                <button
                  key={pair.function}
                  onClick={() => handleFunctionClick(pair.function)}
                  disabled={status === 'matched'}
                  className={`w-full p-4 rounded-xl text-xl font-bold transition-all transform hover:scale-105 ${
                    status === 'matched'
                      ? 'bg-green-200 text-green-800 cursor-not-allowed'
                      : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <span>{pair.function}</span>
                    {status === 'matched' && <CheckCircle size={24} className="text-green-600" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {isComplete && (
        <div className="mt-8 text-center">
          <div className="bg-green-100 border-2 border-green-400 rounded-xl p-6">
            <div className="text-6xl mb-4">🌟</div>
            <h4 className="text-2xl font-bold text-green-700 mb-2">Perfect Matching!</h4>
            <p className="text-green-600">You know what all your body parts do!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BodyPartsMatching;