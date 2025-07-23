import React, { useState } from 'react';
import { CheckCircle, Volume2 } from 'lucide-react';

interface TracingActivityProps {
  onComplete: () => void;
}

const TracingActivity: React.FC<TracingActivityProps> = ({ onComplete }) => {
  const [currentBodyPart, setCurrentBodyPart] = useState(0);
  const [tracedParts, setTracedParts] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const bodyPartsToTrace = [
    { name: 'Hand', emoji: '✋', instruction: 'Trace around your hand!' },
    { name: 'Foot', emoji: '🦶', instruction: 'Trace around your foot!' },
    { name: 'Head', emoji: '👤', instruction: 'Draw the shape of a head!' },
    { name: 'Eye', emoji: '👁️', instruction: 'Draw the shape of an eye!' },
  ];

  const handleTrace = (partName: string) => {
    if (!tracedParts.includes(partName)) {
      const newTracedParts = [...tracedParts, partName];
      setTracedParts(newTracedParts);
      
      if (newTracedParts.length === bodyPartsToTrace.length) {
        setIsComplete(true);
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    }
  };

  const nextPart = () => {
    if (currentBodyPart < bodyPartsToTrace.length - 1) {
      setCurrentBodyPart(currentBodyPart + 1);
    }
  };

  const prevPart = () => {
    if (currentBodyPart > 0) {
      setCurrentBodyPart(currentBodyPart - 1);
    }
  };

  const currentPart = bodyPartsToTrace[currentBodyPart];

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-gray-800 mb-2 font-comic">
          Trace & Learn! ✏️
        </h3>
        <p className="text-lg text-gray-600">
          Trace body parts and learn their names!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tracing Area */}
        <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl p-6">
          <div className="text-center mb-6">
            <div className="text-8xl mb-4">{currentPart.emoji}</div>
            <h4 className="text-2xl font-bold text-gray-800 mb-2">{currentPart.name}</h4>
            <p className="text-lg text-gray-600">{currentPart.instruction}</p>
          </div>

          {/* Simulated tracing area */}
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-400 h-48 flex items-center justify-center mb-6">
            <button
              onClick={() => handleTrace(currentPart.name)}
              disabled={tracedParts.includes(currentPart.name)}
              className={`px-6 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105 ${
                tracedParts.includes(currentPart.name)
                  ? 'bg-green-200 text-green-800 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {tracedParts.includes(currentPart.name) ? (
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} />
                  Traced!
                </div>
              ) : (
                'Click to Trace!'
              )}
            </button>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={prevPart}
              disabled={currentBodyPart === 0}
              className="bg-gray-300 hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 px-4 py-2 rounded-full font-bold"
            >
              ← Previous
            </button>
            <button
              onClick={nextPart}
              disabled={currentBodyPart === bodyPartsToTrace.length - 1}
              className="bg-gray-300 hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 px-4 py-2 rounded-full font-bold"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Progress and Instructions */}
        <div className="space-y-6">
          <div className="bg-blue-50 rounded-xl p-6">
            <h4 className="text-xl font-bold text-blue-800 mb-4">Progress</h4>
            <div className="grid grid-cols-2 gap-3">
              {bodyPartsToTrace.map((part, index) => (
                <div
                  key={part.name}
                  className={`p-3 rounded-lg text-center transition-all ${
                    tracedParts.includes(part.name)
                      ? 'bg-green-200 text-green-800'
                      : index === currentBodyPart
                      ? 'bg-blue-200 text-blue-800 ring-2 ring-blue-400'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <div className="text-2xl mb-1">{part.emoji}</div>
                  <div className="font-bold text-sm">{part.name}</div>
                  {tracedParts.includes(part.name) && (
                    <CheckCircle size={16} className="mx-auto mt-1" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-purple-50 rounded-xl p-6">
            <h4 className="text-lg font-bold text-purple-800 mb-3 flex items-center gap-2">
              <Volume2 size={20} />
              Fun Facts!
            </h4>
            <div className="space-y-2 text-purple-700">
              <p>• Your hands have 27 bones each!</p>
              <p>• Your feet help you balance!</p>
              <p>• Your head protects your brain!</p>
              <p>• Your eyes can see millions of colors!</p>
            </div>
          </div>

          {isComplete && (
            <div className="bg-green-100 border-2 border-green-400 rounded-xl p-6 text-center">
              <div className="text-6xl mb-4">🌟</div>
              <h4 className="text-2xl font-bold text-green-700 mb-2">Fantastic Tracing!</h4>
              <p className="text-green-600">You traced all the body parts!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TracingActivity;