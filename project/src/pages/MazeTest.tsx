import React, { useState } from 'react';
import MazePuzzle from '../components/MazePuzzle';

const MazeTest: React.FC = () => {
  const [selectedPuzzle, setSelectedPuzzle] = useState<number>(13); // Use a new puzzle ID
  const [childId, setChildId] = useState<number>(1);

  const samplePuzzles = [
    {
      id: 13,
      title: 'Rocket to Earth Maze',
      difficulty: 'easy',
      description: 'Navigate the rocket through the maze to reach Earth!'
    }
  ];

  const handleComplete = (completionData: any) => {
    console.log('Maze completed:', completionData);
    alert(`Maze completed! Score: ${completionData.score}`);
  };

  const handleBack = () => {
    // Navigate back to main menu
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">🚀 Maze Puzzle Test</h1>
          <p className="text-lg text-gray-600 mb-6">
            Test the maze puzzle functionality with different difficulty levels
          </p>
          
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4">Select Maze</h2>
            <div className="space-y-3">
              {samplePuzzles.map((puzzle) => (
                <button
                  key={puzzle.id}
                  onClick={() => setSelectedPuzzle(puzzle.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-colors ${
                    selectedPuzzle === puzzle.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800">{puzzle.title}</h3>
                    <p className="text-sm text-gray-600">{puzzle.description}</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      puzzle.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      puzzle.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {puzzle.difficulty}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Child ID (for testing):
              </label>
              <input
                type="number"
                value={childId}
                onChange={(e) => setChildId(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Maze Puzzle Component */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <MazePuzzle
            activityId={selectedPuzzle}
            childId={childId}
            onComplete={handleComplete}
            onBack={handleBack}
          />
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">How to Play</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">🎮 Game Controls</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• <strong>Arrow Keys:</strong> Move the rocket up, down, left, right</li>
                <li>• <strong>WASD Keys:</strong> Alternative movement controls</li>
                <li>• <strong>Solution:</strong> Click the eye icon to see the maze solution</li>
                <li>• <strong>Hint:</strong> Click the lightbulb for help (3 hints available)</li>
                <li>• <strong>Reset:</strong> Click the reset button to start over</li>
                <li>• <strong>Audio:</strong> Toggle sound effects on/off</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">🏆 Scoring System</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• <strong>Base Score:</strong> 100 points</li>
                <li>• <strong>Time Bonus:</strong> Up to 300 points for quick completion</li>
                <li>• <strong>Hint Penalty:</strong> -10 points per hint used</li>
                <li>• <strong>Final Score:</strong> Base + time bonus - hint penalty</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">💡 Tips for Success</h3>
            <ul className="space-y-1 text-blue-700">
              <li>• Start from the bottom-left (rocket) and navigate to the top-center (Earth)</li>
              <li>• Look for the shortest path through the maze</li>
              <li>• Use the solution feature if you get stuck</li>
              <li>• Try to complete the maze quickly for bonus points</li>
              <li>• The maze is randomly generated each time you play</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MazeTest;
