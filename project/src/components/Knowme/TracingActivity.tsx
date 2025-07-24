import React, { useState, useRef } from 'react';
import { CheckCircle, Volume2 } from 'lucide-react';
// @ts-ignore
import confetti from 'canvas-confetti';

interface TracingActivityProps {
  onComplete: () => void;
}

// Helper for speech synthesis
const speak = (text: string) => {
  if ('speechSynthesis' in window) {
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    window.speechSynthesis.speak(utter);
  }
};

const TracingActivity: React.FC<TracingActivityProps> = ({ onComplete }) => {
  const [currentBodyPart, setCurrentBodyPart] = useState(0);
  const [tracedParts, setTracedParts] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isTracing, setIsTracing] = useState(false);
  const [tracePath, setTracePath] = useState<{x: number, y: number}[]>([]);

  const bodyPartsToTrace = [
    { name: 'Hand', image: '/body/hand.png', emoji: '✋', instruction: 'Trace around your hand!' },
    { name: 'Foot', image: '/body/foot.png', emoji: '🦶', instruction: 'Trace around your foot!' },
    { name: 'Head', image: '/body/head.png', emoji: '👤', instruction: 'Draw the shape of a head!' },
    { name: 'Eye', image: '/body/eye.png', emoji: '👁️', instruction: 'Draw the shape of an eye!' },
  ];

  const handleTrace = (partName: string) => {
    if (!tracedParts.includes(partName)) {
      const newTracedParts = [...tracedParts, partName];
      setTracedParts(newTracedParts);
      speak(partName);
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

  // Tracing overlay handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsTracing(true);
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTracePath([{x, y}]);
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isTracing) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTracePath(path => [...path, {x, y}]);
  };
  const handlePointerUp = () => {
    setIsTracing(false);
    setTracePath([]);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
  };

  // Draw the trace path
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (tracePath.length > 1) {
      ctx.save();
      ctx.strokeStyle = '#f59e42';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 10;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tracePath[0].x, tracePath[0].y);
      for (let i = 1; i < tracePath.length; i++) {
        ctx.lineTo(tracePath[i].x, tracePath[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }
  }, [tracePath]);

  return (
    <div>
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
            <div className="mb-4 flex items-center justify-center relative" style={{ width: 160, height: 160 }}>
              <img
                src={currentPart.image}
                alt={currentPart.name}
                className="w-32 h-32 object-contain drop-shadow-lg absolute left-0 top-0 z-10"
                onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent && !parent.querySelector('.img-placeholder')) {
                    const placeholder = document.createElement('div');
                    placeholder.className = 'img-placeholder w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-4xl text-gray-500 absolute left-0 top-0 z-10';
                    placeholder.innerText = '?';
                    parent.appendChild(placeholder);
                  }
                }}
              />
              <canvas
                ref={canvasRef}
                width={160}
                height={160}
                className="absolute left-0 top-0 z-20 pointer-events-auto"
                style={{ touchAction: 'none' }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              />
            </div>
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