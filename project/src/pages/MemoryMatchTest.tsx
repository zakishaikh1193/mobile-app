import React from 'react';
import MemoryMatch from '../components/MemoryMatch';

const MemoryMatchTest: React.FC = () => {
  // Sample activity data for testing
  const sampleActivity = {
    id: 2,
    title: 'Memory Match Game',
    type: 'memory_match',
    description: 'Test your memory by finding matching pairs of cards!',
    difficulty: 'easy',
    estimated_duration: 15,
    max_attempts: 3,
    passing_score: 70,
    data: {
      difficulty: 'easy',
      theme: 'animals'
    }
  };

  const handleComplete = (score: number, timeSpent: number) => {
    console.log('Memory Match completed!', { score, timeSpent });
    alert(`Memory Match completed! Score: ${score}, Time: ${timeSpent} seconds`);
  };

  const handleClose = () => {
    console.log('Closing memory match');
    // In a real app, this would navigate back
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto p-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">🧠 Memory Match Test</h1>
          <p className="text-gray-600">Testing the memory match game functionality</p>
        </div>
        
        <MemoryMatch 
          activity={sampleActivity}
          onComplete={handleComplete}
          onClose={handleClose}
        />
      </div>
    </div>
  );
};

export default MemoryMatchTest;
