import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, RotateCcw, Home, Volume2, VolumeX, Eye, Lightbulb, 
  Trophy, Target, Rocket, Globe, Star, BookOpen, Calculator, 
  Palette, Music, Heart, Brain, Zap, Award
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAudio } from '../contexts/AudioContext';

interface MazeCell {
  x: number;
  y: number;
  isWall: boolean;
  isStart: boolean;
  isEnd: boolean;
  isVisited: boolean;
  isPath: boolean;
  isCollectible?: boolean;
  collectibleType?: 'star' | 'book' | 'number' | 'letter' | 'color' | 'shape';
  collectibleValue?: string | number;
  isObstacle?: boolean;
  obstacleType?: 'water' | 'fire' | 'ice' | 'mud';
}

interface LearningObjective {
  id: string;
  type: 'counting' | 'alphabet' | 'colors' | 'shapes' | 'math' | 'vocabulary' | 'memory';
  description: string;
  target: number | string[];
  collected: number | string[];
  completed: boolean;
}

interface EducationalMazePuzzleProps {
  activityId: number;
  childId: number;
  difficulty: 'preschool' | 'kindergarten' | 'grade1' | 'grade2' | 'grade3';
  learningTheme: 'space' | 'jungle' | 'ocean' | 'farm' | 'city' | 'fairy_tale';
  onComplete?: (completionData: any) => void;
  onBack?: () => void;
}

const EducationalMazePuzzle: React.FC<EducationalMazePuzzleProps> = ({ 
  activityId, 
  childId, 
  difficulty, 
  learningTheme,
  onComplete, 
  onBack 
}) => {
  const { user } = useAuth();
  const { playSound, speak } = useAudio();
  
  // Game State
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'paused' | 'completed'>('intro');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Game Progress
  const [timeSpent, setTimeSpent] = useState(0);
  const [movesCount, setMovesCount] = useState(0);
  const [score, setScore] = useState(0);
  const [starsCollected, setStarsCollected] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  
  // Audio & UI
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Maze & Player
  const [maze, setMaze] = useState<MazeCell[][]>([]);
  const [playerPosition, setPlayerPosition] = useState({ x: 1, y: 1 });
  const [mazeSize, setMazeSize] = useState({ width: 15, height: 15 });
  const [cellSize, setCellSize] = useState(30);
  
  // Learning Objectives
  const [learningObjectives, setLearningObjectives] = useState<LearningObjective[]>([]);
  const [currentObjective, setCurrentObjective] = useState<LearningObjective | null>(null);
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Difficulty Configuration
  const difficultyConfig = {
    preschool: { 
      width: 8, 
      height: 8, 
      cellSize: isMobile ? 40 : 45, 
      maxHints: 5,
      collectibles: 3,
      obstacles: 0
    },
    kindergarten: { 
      width: 10, 
      height: 10, 
      cellSize: isMobile ? 35 : 40, 
      maxHints: 4,
      collectibles: 5,
      obstacles: 2
    },
    grade1: { 
      width: 12, 
      height: 12, 
      cellSize: isMobile ? 32 : 37, 
      maxHints: 3,
      collectibles: 7,
      obstacles: 4
    },
    grade2: { 
      width: 15, 
      height: 15, 
      cellSize: isMobile ? 28 : 33, 
      maxHints: 3,
      collectibles: 10,
      obstacles: 6
    },
    grade3: { 
      width: 18, 
      height: 18, 
      cellSize: isMobile ? 25 : 30, 
      maxHints: 2,
      collectibles: 15,
      obstacles: 8
    }
  };

  // Learning Themes Configuration
  const themeConfig = {
    space: {
      title: "Space Explorer",
      description: "Navigate through space to collect stars and planets!",
      collectibles: ['star', 'planet', 'rocket'],
      obstacles: ['meteor', 'black_hole'],
      colors: { wall: '#1a1a2e', path: '#16213e', player: '#0f3460', end: '#e94560' }
    },
    jungle: {
      title: "Jungle Adventure",
      description: "Help the explorer find hidden treasures in the jungle!",
      collectibles: ['banana', 'coconut', 'flower'],
      obstacles: ['river', 'quicksand'],
      colors: { wall: '#2d5016', path: '#4a7c59', player: '#8fbc8f', end: '#ffd700' }
    },
    ocean: {
      title: "Ocean Discovery",
      description: "Swim through the ocean to find sea creatures!",
      collectibles: ['fish', 'shell', 'pearl'],
      obstacles: ['shark', 'jellyfish'],
      colors: { wall: '#1e3a8a', path: '#3b82f6', player: '#60a5fa', end: '#fbbf24' }
    },
    farm: {
      title: "Farm Friends",
      description: "Help the farmer collect farm animals and vegetables!",
      collectibles: ['carrot', 'apple', 'egg'],
      obstacles: ['mud', 'fence'],
      colors: { wall: '#78350f', path: '#a16207', player: '#f59e0b', end: '#10b981' }
    },
    city: {
      title: "City Explorer",
      description: "Navigate the city streets to find important buildings!",
      collectibles: ['library', 'park', 'school'],
      obstacles: ['traffic', 'construction'],
      colors: { wall: '#374151', path: '#6b7280', player: '#3b82f6', end: '#ef4444' }
    },
    fairy_tale: {
      title: "Fairy Tale Quest",
      description: "Help the princess find magical items in the enchanted forest!",
      collectibles: ['crown', 'wand', 'gem'],
      obstacles: ['dragon', 'thorns'],
      colors: { wall: '#581c87', path: '#7c3aed', player: '#a855f7', end: '#fbbf24' }
    }
  };

  // Initialize learning objectives based on difficulty and theme
  useEffect(() => {
    const objectives = generateLearningObjectives(difficulty, learningTheme);
    setLearningObjectives(objectives);
    setCurrentObjective(objectives[0]);
  }, [difficulty, learningTheme]);

  // Generate learning objectives
  const generateLearningObjectives = (difficulty: string, theme: string): LearningObjective[] => {
    const objectives: LearningObjective[] = [];
    
    switch (difficulty) {
      case 'preschool':
        objectives.push({
          id: 'counting',
          type: 'counting',
          description: 'Count the stars!',
          target: 3,
          collected: 0,
          completed: false
        });
        objectives.push({
          id: 'colors',
          type: 'colors',
          description: 'Find all the colors!',
          target: ['red', 'blue', 'yellow'],
          collected: [],
          completed: false
        });
        break;
        
      case 'kindergarten':
        objectives.push({
          id: 'counting',
          type: 'counting',
          description: 'Count to 5!',
          target: 5,
          collected: 0,
          completed: false
        });
        objectives.push({
          id: 'alphabet',
          type: 'alphabet',
          description: 'Find letters A, B, C!',
          target: ['A', 'B', 'C'],
          collected: [],
          completed: false
        });
        break;
        
      case 'grade1':
        objectives.push({
          id: 'math',
          type: 'math',
          description: 'Add numbers to make 10!',
          target: 10,
          collected: 0,
          completed: false
        });
        objectives.push({
          id: 'vocabulary',
          type: 'vocabulary',
          description: 'Find space words!',
          target: ['star', 'planet', 'rocket'],
          collected: [],
          completed: false
        });
        break;
        
      case 'grade2':
        objectives.push({
          id: 'math',
          type: 'math',
          description: 'Solve multiplication problems!',
          target: 12,
          collected: 0,
          completed: false
        });
        objectives.push({
          id: 'memory',
          type: 'memory',
          description: 'Remember the sequence!',
          target: ['red', 'blue', 'green', 'yellow'],
          collected: [],
          completed: false
        });
        break;
        
      case 'grade3':
        objectives.push({
          id: 'math',
          type: 'math',
          description: 'Solve word problems!',
          target: 15,
          collected: 0,
          completed: false
        });
        objectives.push({
          id: 'vocabulary',
          type: 'vocabulary',
          description: 'Learn new words!',
          target: ['explorer', 'adventure', 'discovery', 'journey'],
          collected: [],
          completed: false
        });
        break;
    }
    
    return objectives;
  };

  // Check mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize game
  useEffect(() => {
    setLoading(false);
    setGameState('playing');
  }, []);

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Educational Maze...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const theme = themeConfig[learningTheme];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Home className="h-6 w-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{theme.title}</h1>
                <p className="text-gray-600">{theme.description}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {audioEnabled ? <Volume2 className="h-6 w-6 text-gray-600" /> : <VolumeX className="h-6 w-6 text-gray-600" />}
              </button>
              
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                <Trophy className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-600">{score}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-lg text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Time</p>
            <p className="text-xl font-bold text-gray-800">{formatTime(timeSpent)}</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-lg text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Moves</p>
            <p className="text-xl font-bold text-gray-800">{movesCount}</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-lg text-center">
            <div className="flex items-center justify-center mb-2">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <p className="text-sm text-gray-600">Stars</p>
            <p className="text-xl font-bold text-gray-800">{starsCollected}</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-lg text-center">
            <div className="flex items-center justify-center mb-2">
              <Lightbulb className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600">Hints</p>
            <p className="text-xl font-bold text-gray-800">{hintsUsed}/{difficultyConfig[difficulty].maxHints}</p>
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <BookOpen className="h-6 w-6 text-blue-600 mr-2" />
            Learning Goals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {learningObjectives.map((objective) => (
              <div 
                key={objective.id}
                className={`p-4 rounded-xl border-2 transition-colors ${
                  objective.completed 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">{objective.description}</h3>
                  {objective.completed && <CheckCircle className="h-5 w-5 text-green-600" />}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        objective.completed ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{
                        width: `${objective.type === 'counting' || objective.type === 'math' 
                          ? ((objective.collected as number) / (objective.target as number)) * 100
                          : Array.isArray(objective.collected) 
                            ? (objective.collected.length / objective.target.length) * 100
                            : 0}%`
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">
                    {objective.type === 'counting' || objective.type === 'math'
                      ? `${objective.collected}/${objective.target}`
                      : `${Array.isArray(objective.collected) ? objective.collected.length : 0}/${objective.target.length}`
                    }
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Area */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-center mb-4">
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Educational Maze Coming Soon!</h3>
              <p className="text-gray-600 mb-4">This advanced maze will include:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p className="font-semibold mb-2">🎓 Learning Features:</p>
                  <ul className="space-y-1">
                    <li>• Counting and numbers</li>
                    <li>• Alphabet and letters</li>
                    <li>• Colors and shapes</li>
                    <li>• Math problems</li>
                    <li>• Vocabulary building</li>
                    <li>• Memory exercises</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2">🎮 Game Features:</p>
                  <ul className="space-y-1">
                    <li>• Multiple difficulty levels</li>
                    <li>• Educational themes</li>
                    <li>• Collectible items</li>
                    <li>• Obstacles and challenges</li>
                    <li>• Progress tracking</li>
                    <li>• Audio feedback</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">How to Play</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p className="mb-2"><strong>🎮 Controls:</strong></p>
              <ul className="space-y-1">
                <li>• Use arrow keys or WASD to move</li>
                <li>• Click the direction buttons on mobile</li>
                <li>• Press H for a hint</li>
              </ul>
            </div>
            <div>
              <p className="mb-2"><strong>🎯 Goals:</strong></p>
              <ul className="space-y-1">
                <li>• Collect all the items to learn</li>
                <li>• Avoid obstacles and walls</li>
                <li>• Reach the end point</li>
                <li>• Complete learning objectives</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationalMazePuzzle;
