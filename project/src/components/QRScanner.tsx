import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, Upload, X, RotateCcw, ZoomIn, ZoomOut, Volume2, Download } from 'lucide-react';
import AnimatedButton from './AnimatedButton';
import AudioButton from './AudioButton';

interface QRScannerProps {
  onClose: () => void;
  childId: string;
}

interface ScannedContent {
  id: string;
  type: 'animal' | 'object' | 'letter' | 'number';
  name: string;
  model3d: string; // URL or emoji for 3D representation
  description: string;
  facts: string[];
  soundUrl?: string;
  imageUrl?: string;
}

const QRScanner: React.FC<QRScannerProps> = ({ onClose, childId }) => {
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedContent, setScannedContent] = useState<ScannedContent | null>(null);
  const [modelRotation, setModelRotation] = useState({ x: 0, y: 0, z: 0 });
  const [modelScale, setModelScale] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample 3D content database - in real app, this would come from backend
  const contentDatabase: { [key: string]: ScannedContent } = {
    'lion': {
      id: 'lion',
      type: 'animal',
      name: 'Lion',
      model3d: '🦁',
      description: 'The mighty king of the jungle! Lions are strong and brave.',
      facts: [
        'Lions live in groups called prides',
        'Male lions have big manes to protect their necks',
        'Lions can roar very loudly - you can hear them from miles away!',
        'Lion cubs are born with spots that fade as they grow'
      ],
      soundUrl: '/bushes/jungle.mp3'
    },
    'elephant': {
      id: 'elephant',
      type: 'animal',
      name: 'Elephant',
      model3d: '🐘',
      description: 'The gentle giant! Elephants are the largest land animals.',
      facts: [
        'Elephants never forget - they have amazing memories',
        'They use their trunks to drink, eat, and even hug!',
        'Baby elephants are called calves',
        'Elephants are very smart and can feel emotions'
      ],
      soundUrl: '/bushes/jungle.mp3'
    },
    'monkey': {
      id: 'monkey',
      type: 'animal',
      name: 'Monkey',
      model3d: '🐒',
      description: 'Playful and clever monkeys love to swing from trees!',
      facts: [
        'Monkeys are very social and live in groups',
        'They use their hands and feet to climb trees',
        'Some monkeys can use tools to get food',
        'Baby monkeys cling to their mothers for safety'
      ],
      soundUrl: '/bushes/monkey-walk.mp3'
    },
    'frog': {
      id: 'frog',
      type: 'animal',
      name: 'Frog',
      model3d: '🐸',
      description: 'Ribbit! Frogs are amazing jumpers and swimmers.',
      facts: [
        'Frogs start life as tadpoles in water',
        'They can jump up to 20 times their body length',
        'Frogs breathe through their skin when underwater',
        'Some frogs can change colors to hide from predators'
      ],
      soundUrl: '/bushes/frog-small.mp3'
    },
    'apple': {
      id: 'apple',
      type: 'object',
      name: 'Apple',
      model3d: '🍎',
      description: 'A delicious red apple! Apples are healthy and start with the letter A.',
      facts: [
        'Apples grow on trees',
        'They come in many colors: red, green, and yellow',
        'Apples are good for your teeth and body',
        'The saying goes: An apple a day keeps the doctor away!'
      ]
    },
    'house': {
      id: 'house',
      type: 'object',
      name: 'House',
      model3d: '🏠',
      description: 'A cozy house where families live together!',
      facts: [
        'Houses keep us safe and warm',
        'Different families live in different types of homes',
        'Houses have rooms like bedrooms, kitchens, and living rooms',
        'Home is where your family is!'
      ]
    },
    'letter-a': {
      id: 'letter-a',
      type: 'letter',
      name: 'Letter A',
      model3d: '🅰️',
      description: 'The first letter of the alphabet! A is for Apple, Airplane, and Amazing!',
      facts: [
        'A is the first letter in the alphabet',
        'It makes the "ah" sound like in "apple"',
        'A is a vowel - we need vowels to make words',
        'Many words start with the letter A'
      ]
    },
    'number-1': {
      id: 'number-1',
      type: 'number',
      name: 'Number 1',
      model3d: '1️⃣',
      description: 'The first number! One is special - it comes before all other numbers.',
      facts: [
        '1 is the first counting number',
        'When you have 1 of something, you have exactly one',
        '1 is smaller than 2, 3, 4, and all other numbers',
        'We use 1 to count: 1, 2, 3, 4, 5...'
      ]
    }
  };

  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [scanner]);

  const startScanner = async () => {
    try {
      console.log('Starting QR scanner...');
      // First set scanning to true to render the div
      setIsScanning(true);
      
      // Wait for the DOM to update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if the element exists
      const qrReaderElement = document.getElementById('qr-reader');
      console.log('QR reader element:', qrReaderElement);
      
      if (!qrReaderElement) {
        throw new Error('QR reader element not found');
      }
      
      const html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        false
      );

      html5QrcodeScanner.render((decodedText) => {
        console.log('QR code scanned:', decodedText);
        handleQRCodeScanned(decodedText);
      }, (error) => {
        // Handle scan errors silently
        console.log('QR scan error:', error);
      });

      setScanner(html5QrcodeScanner);
      console.log('QR scanner started successfully');
    } catch (error) {
      console.error('Error starting scanner:', error);
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    if (scanner) {
      scanner.clear();
      setScanner(null);
    }
    setIsScanning(false);
  };

  const handleQRCodeScanned = (qrData: string) => {
    stopScanner();
    
    // Try to find content in database
    const content = contentDatabase[qrData.toLowerCase()];
    
    if (content) {
      setScannedContent(content);
    } else {
      // If not found, create a generic content object
      setScannedContent({
        id: 'unknown',
        type: 'object',
        name: 'Scanned Object',
        model3d: '🔍',
        description: `You scanned: ${qrData}`,
        facts: [
          'This is a special QR code!',
          'It contains unique information',
          'You can scan many different things',
          'Each scan reveals something new!'
        ]
      });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    // Simulate image processing and content detection
    setTimeout(() => {
      // Randomly select content for demo - in real app, this would use AI/ML
      const contentKeys = Object.keys(contentDatabase);
      const randomKey = contentKeys[Math.floor(Math.random() * contentKeys.length)];
      const content = contentDatabase[randomKey];
      
      setScannedContent(content);
      setIsUploading(false);
    }, 2000);
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

  const playSound = (soundUrl?: string) => {
    if (soundUrl) {
      const audio = new Audio(soundUrl);
      audio.play().catch(console.error);
    }
  };

  const resetView = () => {
    setModelRotation({ x: 0, y: 0, z: 0 });
    setModelScale(1);
  };

  const closeContent = () => {
    setScannedContent(null);
    setModelRotation({ x: 0, y: 0, z: 0 });
    setModelScale(1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Camera className="h-6 w-6" />
              <h2 className="text-2xl font-bold">QR Scanner & 3D Viewer</h2>
            </div>
            <div className="flex items-center space-x-2">
              <AudioButton />
              <AnimatedButton
                variant="secondary"
                size="sm"
                onClick={onClose}
                className="bg-white text-purple-600 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </AnimatedButton>
            </div>
          </div>
        </div>

        <div className="p-6">
          {!scannedContent ? (
            // Scanner/Upload Interface
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Scan QR Codes or Upload Images
                </h3>
                <p className="text-gray-600">
                  Discover 3D animals, objects, letters, and numbers!
                </p>
              </div>

              {/* Scanner */}
              <div className="bg-gray-100 rounded-2xl p-6">
                <div className="text-center mb-4">
                  <h4 className="text-lg font-bold text-gray-800 mb-2">QR Code Scanner</h4>
                  <p className="text-sm text-gray-600">Point camera at QR codes to scan</p>
                </div>
                
                {!isScanning ? (
                  <div className="text-center space-y-4">
                    <div className="text-6xl mb-4">📱</div>
                    <AnimatedButton
                      size="lg"
                      onClick={startScanner}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      Start Scanner
                    </AnimatedButton>
                    
                    <AnimatedButton
                      size="md"
                      onClick={() => {
                        console.log('Testing QR scanner with sample data...');
                        handleQRCodeScanned('apple');
                      }}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Test Scanner (No Camera)
                    </AnimatedButton>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div id="qr-reader" className="w-full"></div>
                    <AnimatedButton
                      variant="secondary"
                      onClick={stopScanner}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Stop Scanner
                    </AnimatedButton>
                  </div>
                )}
              </div>

              {/* Image Upload */}
              <div className="bg-gray-100 rounded-2xl p-6">
                <div className="text-center mb-4">
                  <h4 className="text-lg font-bold text-gray-800 mb-2">Image Upload</h4>
                  <p className="text-sm text-gray-600">Upload images to detect objects</p>
                </div>
                
                <div className="text-center">
                  <div className="text-6xl mb-4">📷</div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <AnimatedButton
                    size="lg"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-green-500 hover:bg-green-600"
                    disabled={isUploading}
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    {isUploading ? 'Processing...' : 'Upload Image'}
                  </AnimatedButton>
                </div>
              </div>

              {/* Sample Content Preview */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4 text-center">
                  What You Can Discover:
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.values(contentDatabase).slice(0, 8).map((content) => (
                    <div key={content.id} className="text-center p-3 bg-white rounded-xl shadow-sm">
                      <div className="text-3xl mb-2">{content.model3d}</div>
                      <p className="text-xs text-gray-600">{content.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // 3D Content Viewer
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-800">
                  {scannedContent.name}
                </h3>
                <AnimatedButton
                  variant="secondary"
                  size="sm"
                  onClick={closeContent}
                  className="bg-gray-100 hover:bg-gray-200"
                >
                  <X className="h-4 w-4" />
                </AnimatedButton>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 3D Model Display */}
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-8 text-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: modelScale }}
                    className="mb-6"
                    style={{
                      transform: `rotateX(${modelRotation.x}deg) rotateY(${modelRotation.y}deg) rotateZ(${modelRotation.z}deg)`
                    }}
                  >
                    <div className="text-8xl mb-4 drop-shadow-2xl">
                      {scannedContent.model3d}
                    </div>
                  </motion.div>

                  {/* Controls */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Rotate:</p>
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => rotateModel('y', -1)}
                          className="p-2 bg-purple-200 rounded-lg hover:bg-purple-300 transition-colors"
                        >
                          <RotateCcw className="h-4 w-4 text-purple-600" />
                        </button>
                        <button
                          onClick={() => rotateModel('y', 1)}
                          className="p-2 bg-purple-200 rounded-lg hover:bg-purple-300 transition-colors"
                        >
                          <RotateCcw className="h-4 w-4 text-purple-600 transform scale-x-[-1]" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Scale:</p>
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => scaleModel(-1)}
                          className="p-2 bg-blue-200 rounded-lg hover:bg-blue-300 transition-colors"
                        >
                          <ZoomOut className="h-4 w-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => scaleModel(1)}
                          className="p-2 bg-blue-200 rounded-lg hover:bg-blue-300 transition-colors"
                        >
                          <ZoomIn className="h-4 w-4 text-blue-600" />
                        </button>
                      </div>
                    </div>

                    <AnimatedButton
                      variant="secondary"
                      size="sm"
                      onClick={resetView}
                      className="bg-gray-200 hover:bg-gray-300"
                    >
                      Reset View
                    </AnimatedButton>
                  </div>
                </div>

                {/* Content Information */}
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <h4 className="text-xl font-bold text-gray-800 mb-3">
                      About {scannedContent.name}
                    </h4>
                    <p className="text-gray-600 mb-4">{scannedContent.description}</p>
                    
                    {scannedContent.soundUrl && (
                      <AnimatedButton
                        size="sm"
                        onClick={() => playSound(scannedContent.soundUrl)}
                        className="bg-green-500 hover:bg-green-600 mb-4"
                      >
                        <Volume2 className="h-4 w-4 mr-2" />
                        Play Sound
                      </AnimatedButton>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <h4 className="text-lg font-bold text-gray-800 mb-3">Fun Facts:</h4>
                    <div className="space-y-2">
                      {scannedContent.facts.map((fact, index) => (
                        <div
                          key={index}
                          className="p-3 bg-gray-50 rounded-xl flex items-center space-x-2"
                        >
                          <Volume2 className="h-4 w-4 text-purple-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{fact}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-6 text-white">
                    <h4 className="text-lg font-bold mb-3">Scan More!</h4>
                    <p className="text-sm mb-4">
                      Try scanning different QR codes or uploading more images to discover new 3D content!
                    </p>
                    <AnimatedButton
                      variant="secondary"
                      size="sm"
                      onClick={closeContent}
                      className="bg-white text-green-600 hover:bg-gray-100"
                    >
                      Scan Another
                    </AnimatedButton>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner; 