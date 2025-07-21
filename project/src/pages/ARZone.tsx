import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, RotateCcw, ZoomIn, ZoomOut, Volume2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAudio } from '../contexts/AudioContext';
import AnimatedButton from '../components/AnimatedButton';
import AudioButton from '../components/AudioButton';

const ARZone: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const { user } = useAuth();
  const { speak } = useAudio();
  const navigate = useNavigate();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [cameraActive, setCameraActive] = useState(false);
  const [detectedObject, setDetectedObject] = useState<string | null>(null);
  const [arModel, setArModel] = useState<any>(null);
  const [modelRotation, setModelRotation] = useState({ x: 0, y: 0, z: 0 });
  const [modelScale, setModelScale] = useState(1);

  const child = user?.children?.find(c => c.id === childId);

  // AR Objects that can be detected from the book
  const arObjects = {
    'apple': {
      name: 'Apple',
      model: '🍎',
      description: 'A delicious red apple! Apples are healthy and start with the letter A.',
      facts: [
        'Apples grow on trees',
        'They come in many colors: red, green, and yellow',
        'Apples are good for your teeth and body',
        'The saying goes: An apple a day keeps the doctor away!'
      ]
    },
    'family': {
      name: 'Family',
      model: '👨‍👩‍👧‍👦',
      description: 'A loving family! Families come in all shapes and sizes.',
      facts: [
        'Families love and care for each other',
        'Your family might include parents, siblings, grandparents, and pets',
        'Every family is special and unique',
        'Families help each other and have fun together'
      ]
    },
    'house': {
      name: 'House',
      model: '🏠',
      description: 'A cozy house where families live together!',
      facts: [
        'Houses keep us safe and warm',
        'Different families live in different types of homes',
        'Houses have rooms like bedrooms, kitchens, and living rooms',
        'Home is where your family is!'
      ]
    },
    'heart': {
      name: 'Heart',
      model: '❤️',
      description: 'A heart represents love and feelings!',
      facts: [
        'Hearts pump blood through our bodies',
        'We use heart symbols to show love',
        'Your heart beats faster when you exercise',
        'Love makes our hearts happy!'
      ]
    }
  };

  useEffect(() => {
    if (child) {
      speak(`Welcome to the AR Magic Zone, ${child.name}! Point your camera at pictures in your book to see them come to life!`);
    }
  }, [child, speak]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera if available
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        speak('Camera is ready! Point it at pictures in your book to discover AR magic!');
        
        // Start object detection simulation
        startObjectDetection();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      speak('Sorry, we need camera permission to use AR features.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setDetectedObject(null);
    setArModel(null);
  };

  const startObjectDetection = () => {
    // Simulate object detection - in a real app, this would use computer vision
    const detectObjects = () => {
      if (!cameraActive) return;
      
      // Randomly detect objects for demo purposes
      const objects = Object.keys(arObjects);
      const randomObject = objects[Math.floor(Math.random() * objects.length)];
      
      // Simulate detection every 5-10 seconds
      setTimeout(() => {
        if (Math.random() > 0.7) { // 30% chance of detection
          handleObjectDetection(randomObject);
        }
        detectObjects(); // Continue detection loop
      }, Math.random() * 5000 + 3000);
    };
    
    detectObjects();
  };

  const handleObjectDetection = (objectKey: string) => {
    const object = arObjects[objectKey as keyof typeof arObjects];
    setDetectedObject(objectKey);
    setArModel(object);
    setModelRotation({ x: 0, y: 0, z: 0 });
    setModelScale(1);
    
    speak(`I found a ${object.name}! ${object.description}`);
  };

  const rotateModel = (axis: 'x' | 'y' | 'z', direction: number) => {
    setModelRotation(prev => ({
      ...prev,
      [axis]: prev[axis] + (direction * 15)
    }));
  };

  const scaleModel = (direction: number) => {
    setModelScale(prev => Math.max(0.5, Math.min(2, prev + (direction * 0.1))));
  };

  const speakFact = (fact: string) => {
    speak(fact);
  };

  if (!child) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Child not found</h2>
          <AnimatedButton onClick={() => navigate('/parent-dashboard')}>
            Back to Dashboard
          </AnimatedButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <AudioButton />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <AnimatedButton
              variant="secondary"
              size="sm"
              onClick={() => {
                stopCamera();
                navigate(`/child-dashboard/${childId}`);
              }}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </AnimatedButton>
            <div className="flex items-center space-x-2">
              <span className="text-3xl">📱</span>
              <h1 className="text-xl font-bold text-gray-800">AR Magic Zone</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{child.avatar}</span>
            <span className="font-bold text-gray-800">{child.name}</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!cameraActive ? (
          // Camera Setup Screen
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="bg-white rounded-3xl p-12 shadow-lg max-w-2xl mx-auto">
              <div className="text-8xl mb-6">📸</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Ready for AR Magic?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Point your camera at pictures in your "All About Me and My Family" book 
                to see them come to life in 3D!
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {Object.entries(arObjects).map(([key, object]) => (
                  <div key={key} className="text-center p-4 bg-gray-50 rounded-2xl">
                    <div className="text-4xl mb-2">{object.model}</div>
                    <p className="text-sm text-gray-600">{object.name}</p>
                  </div>
                ))}
              </div>
              
              <AnimatedButton
                size="lg"
                onClick={startCamera}
                className="flex items-center space-x-2"
              >
                <Camera className="h-6 w-6" />
                <span>Start AR Camera</span>
              </AnimatedButton>
              
              <p className="text-sm text-gray-500 mt-4">
                Make sure to allow camera access when prompted
              </p>
            </div>
          </motion.div>
        ) : (
          // AR Camera View
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Camera Feed */}
            <div className="lg:col-span-2">
              <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-96 object-cover"
                />
                
                {/* AR Overlay */}
                {arModel && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: modelScale }}
                      className="text-center"
                      style={{
                        transform: `rotateX(${modelRotation.x}deg) rotateY(${modelRotation.y}deg) rotateZ(${modelRotation.z}deg)`
                      }}
                    >
                      <div className="text-8xl mb-4 drop-shadow-2xl">
                        {arModel.model}
                      </div>
                      <div className="bg-white bg-opacity-90 rounded-2xl p-4 backdrop-blur-sm">
                        <h3 className="text-xl font-bold text-gray-800">{arModel.name}</h3>
                      </div>
                    </motion.div>
                  </div>
                )}
                
                {/* Detection Indicator */}
                {detectedObject && (
                  <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                    ✓ {arObjects[detectedObject as keyof typeof arObjects].name} Detected!
                  </div>
                )}
                
                {/* Camera Controls */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  <AnimatedButton
                    variant="secondary"
                    size="sm"
                    onClick={stopCamera}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    Stop Camera
                  </AnimatedButton>
                </div>
              </div>
            </div>
            
            {/* AR Controls & Information */}
            <div className="space-y-6">
              {arModel ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-3xl p-6 shadow-lg"
                >
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                    <span className="text-3xl mr-2">{arModel.model}</span>
                    {arModel.name}
                  </h3>
                  
                  <p className="text-gray-600 mb-6">{arModel.description}</p>
                  
                  {/* Model Controls */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Rotate Model:</p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => rotateModel('y', -1)}
                          className="p-2 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
                        >
                          <RotateCcw className="h-4 w-4 text-purple-600" />
                        </button>
                        <button
                          onClick={() => rotateModel('y', 1)}
                          className="p-2 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
                        >
                          <RotateCcw className="h-4 w-4 text-purple-600 transform scale-x-[-1]" />
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Scale Model:</p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => scaleModel(-1)}
                          className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <ZoomOut className="h-4 w-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => scaleModel(1)}
                          className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <ZoomIn className="h-4 w-4 text-blue-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Fun Facts */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-3">Fun Facts:</h4>
                    <div className="space-y-2">
                      {arModel.facts.map((fact: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => speakFact(fact)}
                          className="w-full text-left p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors flex items-center space-x-2"
                        >
                          <Volume2 className="h-4 w-4 text-purple-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{fact}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white rounded-3xl p-6 shadow-lg text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Looking for Objects...</h3>
                  <p className="text-gray-600">
                    Point your camera at pictures in your book to discover AR magic!
                  </p>
                </div>
              )}
              
              {/* Instructions */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-6 text-white">
                <h4 className="text-lg font-bold mb-3">How to Use AR:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <span>📖</span>
                    <span>Open your "All About Me and My Family" book</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span>📱</span>
                    <span>Point the camera at pictures in the book</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span>✨</span>
                    <span>Watch as they come to life in 3D!</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span>🎮</span>
                    <span>Use controls to rotate and resize objects</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ARZone;