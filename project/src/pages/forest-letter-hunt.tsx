import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Game from '../components/ForestLetterHunt/Game';
import Settings from '../components/ForestLetterHunt/Settings';
import ProgressTracker from '../components/ForestLetterHunt/ProgressTracker';
import { Settings as SettingsIcon, BarChart3, ArrowLeft } from 'lucide-react';
import AnimatedButton from '../components/AnimatedButton';
import AnimatedA2 from '../components/ForestLetterHunt/AnimatedA2';
import AnimatedFrog from '../components/ForestLetterHunt/AnimatedFrog';
import AnimatedMonkey from '../components/ForestLetterHunt/AnimatedMonkey';

export interface GameSettings {
  audioEnabled: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  gameMode: 'letters' | 'phonics' | 'sightWords';
  letterCase: 'uppercase' | 'lowercase' | 'mixed';
}

export interface GameProgress {
  level: number;
  totalStars: number;
  lettersLearned: string[];
  accuracy: number;
  gamesPlayed: number;
}

const ForestLetterHuntPage: React.FC = () => {
  const navigate = useNavigate();
  const { childId } = useParams<{ childId: string }>();
  const [showSettings, setShowSettings] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [settings, setSettings] = useState<GameSettings>({
    audioEnabled: true,
    difficulty: 'easy',
    gameMode: 'letters',
    letterCase: 'uppercase'
  });
  const [progress, setProgress] = useState<GameProgress>({
    level: 1,
    totalStars: 0,
    lettersLearned: [],
    accuracy: 100,
    gamesPlayed: 0
  });

  // Load settings and progress from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('forestLetterHunt_settings');
    const savedProgress = localStorage.getItem('forestLetterHunt_progress');
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedProgress) setProgress(JSON.parse(savedProgress));
  }, []);

  // Save settings and progress to localStorage
  useEffect(() => {
    localStorage.setItem('forestLetterHunt_settings', JSON.stringify(settings));
  }, [settings]);
  useEffect(() => {
    localStorage.setItem('forestLetterHunt_progress', JSON.stringify(progress));
  }, [progress]);

  const monkeyWalkRef = useRef<HTMLAudioElement | null>(null);
  const jungleRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (monkeyWalkRef.current) monkeyWalkRef.current.volume = 0.2;
    if (jungleRef.current) jungleRef.current.volume = 0.2;
  }, []);

  return (
    <div className="min-h-screen relative overflow-x-auto overflow-y-auto md:overflow-hidden">
      <img
        src="/bushes/main.jpg"
        alt="Forest Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ minHeight: '100vh', minWidth: '100vw', opacity: 0.95 }}
      />
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Animal A2 flying from left to right (animated, responsive, smaller on mobile) */}
        <AnimatedA2
          className="absolute top-[60%] left-0 w-12 sm:w-16 md:w-24 lg:w-32 animate-fly-x"
          style={{ zIndex: 2 }}
        />
        {/* Floating butterflies */}
        <div className="absolute top-20 left-10 animate-bounce text-2xl delay-500">🦋</div>
        <div className="absolute top-32 right-20 animate-pulse text-xl delay-1000">🦋</div>
        <div className="absolute top-60 left-1/3 animate-bounce text-lg delay-1500">🦋</div>
        <div className="absolute top-80 right-10 animate-bounce text-xl delay-2000">🦋</div>
        {/* Realistic forest trees */}
        <div className="absolute bottom-0 left-0 text-8xl animate-pulse delay-300">🌲</div>
        <div className="absolute bottom-0 right-0 text-9xl animate-pulse delay-800">🌲</div>
        <div className="absolute bottom-0 left-1/4 text-7xl animate-pulse delay-1200">🌳</div>
        <div className="absolute bottom-0 right-1/3 text-8xl animate-pulse delay-600">🌳</div>
        <div className="absolute bottom-0 left-1/2 text-6xl animate-pulse delay-1500">🌲</div>
        {/* Floating leaves */}
        <div className="absolute top-40 left-1/2 text-xl animate-bounce delay-700">🍃</div>
        <div className="absolute top-80 right-1/4 text-lg animate-bounce delay-1100">🍃</div>
        <div className="absolute top-50 left-1/4 text-lg animate-bounce delay-1400">🍃</div>
        {/* Forest floor elements */}
        <div className="absolute bottom-10 left-1/3 text-sm animate-pulse delay-2000">🍄</div>
        <div className="absolute bottom-8 right-1/4 text-sm animate-pulse delay-2500">🍄</div>
        <div className="absolute bottom-12 left-3/4 text-xs animate-pulse delay-1800">🌿</div>
        {/* Animated Frog jumping from left to pond (middle, responsive, always visible) */}
        <AnimatedFrog
          className="w-12 sm:w-16 md:w-20 lg:w-24"
        />
        {/* Animated Monkey in the middle of the background (responsive) */}
        <AnimatedMonkey
          className="absolute w-16 sm:w-20 md:w-28 lg:w-36"
          topPercent={72}
        />
      </div>
      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-4 bg-green-800/20 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <AnimatedButton onClick={() => navigate(`/child-dashboard/${childId}`)} size="sm" className="bg-green-700 text-white px-3 py-1">
            <ArrowLeft className="h-5 w-5 mr-1" /> Back
          </AnimatedButton>
          <h1 className="text-3xl md:text-4xl font-bold text-green-800 drop-shadow-lg ml-2">
            🌳 Forest Letter Hunt
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowProgress(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          >
            <BarChart3 size={24} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          >
            <SettingsIcon size={24} />
          </button>
        </div>
      </header>
      {/* Main Game */}
      <main className="relative z-10 flex-1 p-4">
        <Game 
          settings={settings} 
          progress={progress} 
          onProgressUpdate={setProgress}
        />
      </main>
      {/* Settings Modal */}
      {showSettings && (
        <Settings
          soundEnabled={settings.audioEnabled}
          onToggleSound={() => setSettings(s => ({ ...s, audioEnabled: !s.audioEnabled }))}
          onResetProgress={() => setProgress({ level: 1, totalStars: 0, lettersLearned: [], accuracy: 100, gamesPlayed: 0 })}
          onBackToMenu={() => setShowSettings(false)}
        />
      )}
      {/* Progress Modal */}
      {showProgress && (
        <ProgressTracker
          progress={progress}
          onClose={() => setShowProgress(false)}
        />
      )}
      {/* Mobile Landscape Tip (non-blocking, only on mobile landscape) */}
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-black/70 text-white text-sm rounded-xl shadow-lg md:hidden landscape:block portrait:hidden flex items-center gap-2 pointer-events-auto">
        <span>Tip: Use two fingers to move and zoom the game area in landscape mode.</span>
        {/* Optionally, add a close button */}
        {/* <button className="ml-2 text-white/70 hover:text-white" onClick={() => setShowTip(false)}>&times;</button> */}
      </div>
      {/* Big Monkey Walking Sound (background, looping) */}
      <audio ref={monkeyWalkRef} src="/bushes/monkey-walk.mp3" autoPlay loop preload="auto" hidden />
      {/* Jungle Ambient Sound (background, looping) */}
      <audio ref={jungleRef} src="/bushes/jungle.mp3" autoPlay loop preload="auto" hidden />
    </div>
  );
};

export default ForestLetterHuntPage; 