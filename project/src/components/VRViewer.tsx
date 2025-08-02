import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, ZoomIn, ZoomOut, Volume2, Play, Pause, Move, Eye } from 'lucide-react';
import * as THREE from 'three';
import { useAudio } from '../contexts/AudioContext';
import AnimatedButton from './AnimatedButton';

interface VRViewerProps {
  onClose: () => void;
  childId: string;
  selectedObject?: any;
}

const VRViewer: React.FC<VRViewerProps> = ({ onClose, childId, selectedObject }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const objectRef = useRef<THREE.Object3D | null>(null);
  const animationRef = useRef<number | null>(null);
  
  const { speak } = useAudio();
  
  const [isVRMode, setIsVRMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentObject, setCurrentObject] = useState(selectedObject);
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0, z: 5 });
  const [objectRotation, setObjectRotation] = useState({ x: 0, y: 0, z: 0 });
  const [objectScale, setObjectScale] = useState(1);

  // VR Objects with 3D models
  const vrObjects = {
    'apple': {
      name: 'Apple',
      model: '🍎',
      description: 'A delicious red apple in 3D space!',
      facts: [
        'Apples grow on trees and are healthy',
        'They come in many colors: red, green, and yellow',
        'Apples are good for your teeth and body',
        'The saying goes: An apple a day keeps the doctor away!'
      ],
      soundUrl: '/bushes/jungle.mp3',
      color: '#ef4444',
      geometry: 'sphere',
      size: 1
    },
    'house': {
      name: 'House',
      model: '🏠',
      description: 'A cozy 3D house where families live together!',
      facts: [
        'Houses keep us safe and warm',
        'Different families live in different types of homes',
        'Houses have rooms like bedrooms, kitchens, and living rooms',
        'Home is where your family is!'
      ],
      soundUrl: '/bushes/jungle.mp3',
      color: '#fbbf24',
      geometry: 'box',
      size: 1.5
    },
    'tree': {
      name: 'Tree',
      model: '🌳',
      description: 'A tall 3D tree providing shade and oxygen!',
      facts: [
        'Trees give us oxygen to breathe',
        'They provide homes for birds and animals',
        'Trees help keep our air clean',
        'We can climb trees and have fun!'
      ],
      soundUrl: '/bushes/jungle.mp3',
      color: '#22c55e',
      geometry: 'cylinder',
      size: 2
    },
    'car': {
      name: 'Car',
      model: '🚗',
      description: 'A fast 3D car that takes us places!',
      facts: [
        'Cars help us travel quickly',
        'They have wheels that spin round and round',
        'Cars need fuel to run',
        'We must always wear seatbelts in cars!'
      ],
      soundUrl: '/bushes/jungle.mp3',
      color: '#3b82f6',
      geometry: 'box',
      size: 1.2
    },
    'heart': {
      name: 'Heart',
      model: '❤️',
      description: 'A 3D heart representing love and feelings!',
      facts: [
        'Hearts pump blood through our bodies',
        'We use heart symbols to show love',
        'Your heart beats faster when you exercise',
        'Love makes our hearts happy!'
      ],
      soundUrl: '/bushes/jungle.mp3',
      color: '#ec4899',
      geometry: 'sphere',
      size: 1
    }
  };

  // Initialize Three.js scene
  const initScene = useCallback(() => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Sky blue background
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x90EE90 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Add clouds
    for (let i = 0; i < 5; i++) {
      const cloudGeometry = new THREE.SphereGeometry(0.5, 8, 8);
      const cloudMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
      const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
      cloud.position.set(
        (Math.random() - 0.5) * 15,
        3 + Math.random() * 2,
        (Math.random() - 0.5) * 15
      );
      cloud.scale.set(
        1 + Math.random() * 0.5,
        0.5 + Math.random() * 0.3,
        1 + Math.random() * 0.5
      );
      scene.add(cloud);
    }

    return { scene, camera, renderer };
  }, []);

  // Create 3D object
  const createObject = useCallback((objectKey: string) => {
    if (!sceneRef.current) return;

    // Remove existing object
    if (objectRef.current) {
      sceneRef.current.remove(objectRef.current);
    }

    const objectData = vrObjects[objectKey as keyof typeof vrObjects];
    if (!objectData) return;

    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;

    // Create geometry based on object type
    switch (objectData.geometry) {
      case 'sphere':
        geometry = new THREE.SphereGeometry(objectData.size, 32, 32);
        break;
      case 'box':
        geometry = new THREE.BoxGeometry(objectData.size, objectData.size, objectData.size);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(objectData.size * 0.5, objectData.size * 0.5, objectData.size * 2, 32);
        break;
      default:
        geometry = new THREE.SphereGeometry(objectData.size, 32, 32);
    }

    // Create material with color
    material = new THREE.MeshLambertMaterial({ 
      color: objectData.color,
      transparent: true,
      opacity: 0.9
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, objectData.size, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Add glow effect
    const glowGeometry = geometry.clone();
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: objectData.color,
      transparent: true,
      opacity: 0.3
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.scale.set(1.2, 1.2, 1.2);
    mesh.add(glow);

    objectRef.current = mesh;
    sceneRef.current.add(mesh);

    setCurrentObject(objectData);
    speak(`Welcome to the 3D ${objectData.name} world! ${objectData.description}`);
  }, [speak]);

  // Animation loop
  const animate = useCallback(() => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

    animationRef.current = requestAnimationFrame(animate);

    // Rotate object
    if (objectRef.current && isPlaying) {
      objectRef.current.rotation.y += 0.01;
      objectRef.current.rotation.x += 0.005;
    }

    // Update camera position for VR mode
    if (isVRMode && cameraRef.current) {
      cameraRef.current.position.x = cameraPosition.x;
      cameraRef.current.position.y = cameraPosition.y;
      cameraRef.current.position.z = cameraPosition.z;
    }

    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }, [isVRMode, isPlaying, cameraPosition]);

  // Handle window resize
  const handleResize = useCallback(() => {
    if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(width, height);
  }, []);

  // Initialize scene on mount
  useEffect(() => {
    const { scene, camera, renderer } = initScene() || {};
    if (scene && camera && renderer) {
      animate();
      window.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [initScene, animate, handleResize]);

  // Create initial object
  useEffect(() => {
    if (selectedObject) {
      createObject(selectedObject);
    } else {
      createObject('apple'); // Default object
    }
  }, [selectedObject, createObject]);

  const toggleVRMode = () => {
    setIsVRMode(!isVRMode);
    if (!isVRMode) {
      speak('Entering immersive VR mode! Move around to explore the 3D world.');
    } else {
      speak('Exiting VR mode. Back to normal view.');
    }
  };

  const toggleAnimation = () => {
    setIsPlaying(!isPlaying);
    speak(isPlaying ? 'Animation paused.' : 'Animation playing!');
  };

  const rotateObject = (axis: 'x' | 'y' | 'z', direction: number) => {
    if (objectRef.current) {
      const rotation = direction * 0.1;
      switch (axis) {
        case 'x':
          objectRef.current.rotation.x += rotation;
          break;
        case 'y':
          objectRef.current.rotation.y += rotation;
          break;
        case 'z':
          objectRef.current.rotation.z += rotation;
          break;
      }
    }
  };

  const scaleObject = (direction: number) => {
    if (objectRef.current) {
      const scale = direction * 0.1;
      const newScale = Math.max(0.5, Math.min(2, objectRef.current.scale.x + scale));
      objectRef.current.scale.set(newScale, newScale, newScale);
      setObjectScale(newScale);
    }
  };

  const resetView = () => {
    if (objectRef.current) {
      objectRef.current.rotation.set(0, 0, 0);
      objectRef.current.scale.set(1, 1, 1);
      setObjectRotation({ x: 0, y: 0, z: 0 });
      setObjectScale(1);
    }
    setCameraPosition({ x: 0, y: 0, z: 5 });
    speak('View reset to original position.');
  };

  const moveCamera = (direction: 'up' | 'down' | 'left' | 'right' | 'forward' | 'back') => {
    const step = 0.5;
    setCameraPosition(prev => {
      const newPos = { ...prev };
      switch (direction) {
        case 'up':
          newPos.y += step;
          break;
        case 'down':
          newPos.y -= step;
          break;
        case 'left':
          newPos.x -= step;
          break;
        case 'right':
          newPos.x += step;
          break;
        case 'forward':
          newPos.z -= step;
          break;
        case 'back':
          newPos.z += step;
          break;
      }
      return newPos;
    });
  };

  const playSound = () => {
    if (currentObject?.soundUrl) {
      const audio = new Audio(currentObject.soundUrl);
      audio.play().catch(console.error);
      speak(`Playing ${currentObject.name} sound!`);
    }
  };

  const speakFact = (fact: string) => {
    speak(fact);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black"
    >
      {/* VR Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 text-white p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Eye className="h-6 w-6" />
            <h1 className="text-xl font-bold">VR 3D World</h1>
            {currentObject && (
              <span className="text-2xl">{currentObject.model}</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <AnimatedButton
              variant="secondary"
              size="sm"
              onClick={toggleVRMode}
              className={`${isVRMode ? 'bg-purple-600' : 'bg-gray-600'} text-white`}
            >
              <Eye className="h-4 w-4 mr-1" />
              {isVRMode ? 'Exit VR' : 'Enter VR'}
            </AnimatedButton>
            <AnimatedButton
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="bg-red-600 text-white"
            >
              <X className="h-4 w-4" />
            </AnimatedButton>
          </div>
        </div>
      </div>

      {/* 3D Scene Container */}
      <div 
        ref={mountRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* VR Controls Panel */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Object Controls */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold">Object Controls</h3>
            <div className="flex space-x-1">
              <button
                onClick={() => rotateObject('y', -1)}
                className="p-2 bg-blue-600 rounded hover:bg-blue-700"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={() => rotateObject('y', 1)}
                className="p-2 bg-blue-600 rounded hover:bg-blue-700"
              >
                <RotateCcw className="h-4 w-4 transform scale-x-[-1]" />
              </button>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => scaleObject(-1)}
                className="p-2 bg-green-600 rounded hover:bg-green-700"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                onClick={() => scaleObject(1)}
                className="p-2 bg-green-600 rounded hover:bg-green-700"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Camera Controls */}
          {isVRMode && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold">Camera Movement</h3>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => moveCamera('up')}
                  className="p-2 bg-purple-600 rounded hover:bg-purple-700"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveCamera('left')}
                  className="p-2 bg-purple-600 rounded hover:bg-purple-700"
                >
                  ←
                </button>
                <button
                  onClick={() => moveCamera('right')}
                  className="p-2 bg-purple-600 rounded hover:bg-purple-700"
                >
                  →
                </button>
                <button
                  onClick={() => moveCamera('forward')}
                  className="p-2 bg-purple-600 rounded hover:bg-purple-700"
                >
                  ↑↑
                </button>
                <button
                  onClick={() => moveCamera('down')}
                  className="p-2 bg-purple-600 rounded hover:bg-purple-700"
                >
                  ↓
                </button>
                <button
                  onClick={() => moveCamera('back')}
                  className="p-2 bg-purple-600 rounded hover:bg-purple-700"
                >
                  ↓↓
                </button>
              </div>
            </div>
          )}

          {/* Animation Controls */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold">Animation</h3>
            <div className="flex space-x-1">
              <button
                onClick={toggleAnimation}
                className="p-2 bg-orange-600 rounded hover:bg-orange-700"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              <button
                onClick={resetView}
                className="p-2 bg-gray-600 rounded hover:bg-gray-700"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={playSound}
              className="w-full p-2 bg-yellow-600 rounded hover:bg-yellow-700"
            >
              <Volume2 className="h-4 w-4" />
            </button>
          </div>

          {/* Object Selection */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold">Objects</h3>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(vrObjects).map(([key, obj]) => (
                <button
                  key={key}
                  onClick={() => createObject(key)}
                  className="p-2 bg-indigo-600 rounded hover:bg-indigo-700 text-xs"
                >
                  {obj.model}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Object Information Panel */}
      {currentObject && (
        <div className="absolute top-20 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg max-w-xs">
          <h3 className="text-lg font-bold mb-2">{currentObject.name}</h3>
          <p className="text-sm mb-3">{currentObject.description}</p>
          
          <h4 className="text-sm font-bold mb-2">Fun Facts:</h4>
          <div className="space-y-1">
            {currentObject.facts.map((fact: string, index: number) => (
              <button
                key={index}
                onClick={() => speakFact(fact)}
                className="w-full text-left p-2 bg-gray-700 rounded hover:bg-gray-600 text-xs"
              >
                {fact}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default VRViewer; 