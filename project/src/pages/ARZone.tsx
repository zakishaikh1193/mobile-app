import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, RotateCcw, ZoomIn, ZoomOut, Volume2, QrCode, Sparkles, Target, Play, Pause, RefreshCw, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAudio } from '../contexts/AudioContext';
import AnimatedButton from '../components/AnimatedButton';
import AudioButton from '../components/AudioButton';
import QRScanner from '../components/QRScanner';
import VRViewer from '../components/VRViewer';

const ARZone: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const { user } = useAuth();
  const { speak } = useAudio();
  const navigate = useNavigate();
  
  console.log('ARZone loaded with childId:', childId);
  console.log('User:', user);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [cameraActive, setCameraActive] = useState(false);
  const [detectedObject, setDetectedObject] = useState<string | null>(null);
  const [arModel, setArModel] = useState<any>(null);
  const [modelRotation, setModelRotation] = useState({ x: 0, y: 0, z: 0 });
  const [modelScale, setModelScale] = useState(1);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showVRViewer, setShowVRViewer] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionCount, setDetectionCount] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const child = user?.children?.find(c => c.id === childId);
  console.log('Found child:', child);
  console.log('User children:', user?.children);

  // Enhanced AR Objects with more details and interactions
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
      ],
      soundUrl: '/bushes/jungle.mp3',
      color: 'from-red-400 to-red-600',
      category: 'fruit'
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
      ],
      soundUrl: '/bushes/jungle.mp3',
      color: 'from-blue-400 to-blue-600',
      category: 'people'
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
      ],
      soundUrl: '/bushes/jungle.mp3',
      color: 'from-yellow-400 to-yellow-600',
      category: 'building'
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
      ],
      soundUrl: '/bushes/jungle.mp3',
      color: 'from-pink-400 to-pink-600',
      category: 'symbol'
    },
    'tree': {
      name: 'Tree',
      model: '🌳',
      description: 'A tall tree providing shade and oxygen!',
      facts: [
        'Trees give us oxygen to breathe',
        'They provide homes for birds and animals',
        'Trees help keep our air clean',
        'We can climb trees and have fun!'
      ],
      soundUrl: '/bushes/jungle.mp3',
      color: 'from-green-400 to-green-600',
      category: 'nature'
    },
    'car': {
      name: 'Car',
      model: '🚗',
      description: 'A fast car that takes us places!',
      facts: [
        'Cars help us travel quickly',
        'They have wheels that spin round and round',
        'Cars need fuel to run',
        'We must always wear seatbelts in cars!'
      ],
      soundUrl: '/bushes/jungle.mp3',
      color: 'from-blue-400 to-blue-600',
      category: 'vehicle'
    }
  };

  useEffect(() => {
    if (child) {
      speak(`Welcome to the AR Magic Zone, ${child.first_name || child.name}! Point your camera at pictures in your book to see them come to life!`);
    }
  }, [child, speak]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      console.log('Starting AR camera...');
      setCameraError(null);
      setIsProcessing(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      console.log('Camera stream obtained:', stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setIsProcessing(false);
        speak('Camera is ready! Point it at pictures in your book to discover AR magic!');
        
        // Start object detection
        startObjectDetection();
        console.log('AR camera started successfully');
      } else {
        console.error('Video ref not available');
        setCameraError('Camera setup failed. Please try again.');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Camera access denied. Please allow camera permissions and try again.');
      setIsProcessing(false);
      speak('Sorry, we need camera permission to use AR features.');
    }
  };

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    setCameraActive(false);
    setDetectedObject(null);
    setArModel(null);
    setIsDetecting(false);
    setDetectionCount(0);
  }, []);

  const startObjectDetection = () => {
    setIsDetecting(true);
    
    // Enhanced object detection simulation
    const detectObjects = () => {
      if (!cameraActive) return;
      
      setDetectionCount(prev => prev + 1);
      
      // Simulate more realistic detection patterns
      const objects = Object.keys(arObjects);
      const randomObject = objects[Math.floor(Math.random() * objects.length)];
      
      // Vary detection timing and probability
      const detectionDelay = Math.random() * 4000 + 2000; // 2-6 seconds
      const detectionProbability = Math.random();
      
      setTimeout(() => {
        if (detectionProbability > 0.6 && cameraActive) { // 40% chance of detection
          handleObjectDetection(randomObject);
        }
        
        if (cameraActive) {
          detectObjects(); // Continue detection loop
        }
      }, detectionDelay);
    };
    
    detectObjects();
  };

  const handleObjectDetection = (objectKey: string) => {
    const object = arObjects[objectKey as keyof typeof arObjects];
    setDetectedObject(objectKey);
    setArModel(object);
    setModelRotation({ x: 0, y: 0, z: 0 });
    setModelScale(1);
    
    speak(`Amazing! I found a ${object.name}! ${object.description}`);
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

  const resetModel = () => {
    setModelRotation({ x: 0, y: 0, z: 0 });
    setModelScale(1);
  };

  const speakFact = (fact: string) => {
    speak(fact);
  };

  const playObjectSound = () => {
    if (arModel?.soundUrl) {
      const audio = new Audio(arModel.soundUrl);
      audio.play().catch(console.error);
    }
  };

  const clearDetection = () => {
    setDetectedObject(null);
    setArModel(null);
    setModelRotation({ x: 0, y: 0, z: 0 });
    setModelScale(1);
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
            <img src={child.avatar} alt="Avatar" className="w-8 h-8 rounded-full" />
            <span className="font-bold text-gray-800">{child.first_name || child.name}</span>
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
            <div className="bg-white rounded-3xl p-12 shadow-lg max-w-4xl mx-auto">
              <div className="text-8xl mb-6">📸</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Ready for AR Magic?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Point your camera at pictures in your "All About Me and My Family" book 
                to see them come to life in 3D!
              </p>
              
              {/* Available Objects Preview */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {Object.entries(arObjects).map(([key, object]) => (
                  <motion.div 
                    key={key} 
                    className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-transparent hover:border-purple-300 transition-all duration-300 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    onClick={() => speak(`You can discover a ${object.name} in your book!`)}
                  >
                    <div className="text-4xl mb-2">{object.model}</div>
                    <p className="text-sm text-gray-600 font-medium">{object.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{object.category}</p>
                  </motion.div>
                ))}
              </div>
              
              {/* Error Message */}
              {cameraError && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6"
                >
                  {cameraError}
                </motion.div>
              )}
              
              <div className="space-y-4">
                <AnimatedButton
                  size="lg"
                  onClick={startCamera}
                  disabled={isProcessing}
                  className="flex items-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-6 w-6 animate-spin" />
                      <span>Starting Camera...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="h-6 w-6" />
                      <span>Start AR Camera</span>
                    </>
                  )}
                </AnimatedButton>
                
                <AnimatedButton
                  size="lg"
                  onClick={() => {
                    console.log('Testing AR detection...');
                    const testObject = 'apple';
                    handleObjectDetection(testObject);
                    setCameraActive(true);
                  }}
                  className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600"
                >
                  <Sparkles className="h-6 w-6" />
                  <span>Test AR (No Camera)</span>
                </AnimatedButton>
                
                <AnimatedButton
                  size="lg"
                  onClick={() => setShowQRScanner(true)}
                  className="flex items-center space-x-2 bg-green-500 hover:bg-green-600"
                >
                  <QrCode className="h-6 w-6" />
                  <span>QR Scanner & 3D Viewer</span>
                </AnimatedButton>
                
                <AnimatedButton
                  size="lg"
                  onClick={() => setShowVRViewer(true)}
                  className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600"
                >
                  <Eye className="h-6 w-6" />
                  <span>VR 3D World</span>
                </AnimatedButton>
              </div>
              
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
                
                {/* Detection Overlay */}
                {isDetecting && !arModel && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="text-center"
                    >
                      <Target className="h-16 w-16 text-white opacity-50" />
                      <p className="text-white text-sm mt-2">Scanning for objects...</p>
                    </motion.div>
                  </div>
                )}
                
                {/* AR Overlay */}
                <AnimatePresence>
                  {arModel && (
                    <motion.div 
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                    >
                      <motion.div
                        className="text-center"
                        style={{
                          transform: `rotateX(${modelRotation.x}deg) rotateY(${modelRotation.y}deg) rotateZ(${modelRotation.z}deg) scale(${modelScale})`
                        }}
                      >
                        <motion.div 
                          className="text-8xl mb-4 drop-shadow-2xl"
                          animate={{ 
                            y: [0, -10, 0],
                            rotateY: [0, 5, 0]
                          }}
                          transition={{ 
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          {arModel.model}
                        </motion.div>
                        <div className="bg-white bg-opacity-90 rounded-2xl p-4 backdrop-blur-sm">
                          <h3 className="text-xl font-bold text-gray-800">{arModel.name}</h3>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Detection Indicator */}
                {detectedObject && (
                  <motion.div 
                    className="absolute top-4 left-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center space-x-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{arObjects[detectedObject as keyof typeof arObjects].name} Detected!</span>
                  </motion.div>
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
                  
                  {arModel && (
                    <AnimatedButton
                      variant="secondary"
                      size="sm"
                      onClick={clearDetection}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Clear Object
                    </AnimatedButton>
                  )}
                </div>
              </div>
            </div>
            
            {/* AR Controls & Information */}
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {arModel ? (
                  <motion.div
                    key="ar-model"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-3xl p-6 shadow-lg"
                  >
                    <div className={`bg-gradient-to-r ${arModel.color} rounded-2xl p-4 mb-4 text-white`}>
                      <h3 className="text-2xl font-bold flex items-center">
                        <span className="text-3xl mr-2">{arModel.model}</span>
                        {arModel.name}
                      </h3>
                      <p className="text-sm opacity-90">{arModel.description}</p>
                    </div>
                    
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
                      
                      <div>
                        <button
                          onClick={resetModel}
                          className="w-full p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                        >
                          <RefreshCw className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-700">Reset View</span>
                        </button>
                      </div>
                      
                      {arModel.soundUrl && (
                        <div>
                          <button
                            onClick={playObjectSound}
                            className="w-full p-2 bg-green-100 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center space-x-2"
                          >
                            <Play className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-700">Play Sound</span>
                          </button>
                        </div>
                      )}
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
                  <motion.div 
                    key="detecting"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-3xl p-6 shadow-lg text-center"
                  >
                    <motion.div 
                      className="text-6xl mb-4"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      🔍
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Looking for Objects...</h3>
                    <p className="text-gray-600 mb-4">
                      Point your camera at pictures in your book to discover AR magic!
                    </p>
                    <div className="text-sm text-gray-500">
                      Detections: {detectionCount}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
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

        {/* QR Scanner Modal */}
        {showQRScanner && (
          <QRScanner
            onClose={() => setShowQRScanner(false)}
            childId={childId || ''}
          />
        )}

        {/* VR Viewer Modal */}
        {showVRViewer && (
          <VRViewer
            onClose={() => setShowVRViewer(false)}
            childId={childId || ''}
            selectedObject={detectedObject}
          />
        )}
      </div>
    </div>
  );
};

export default ARZone;