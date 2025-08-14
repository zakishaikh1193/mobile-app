import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { useAudio } from '../contexts/AudioContext';
import AudioButton from '../components/AudioButton';


const AuthPage: React.FC = () => {
  // --- All your original state and logic is preserved ---
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const { login } = useAuth();
  const { speak } = useAudio();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Effect for handling background music
  useEffect(() => {
    const audio = new Audio('/music.mp3');
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;

    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log("Background music autoplay was prevented by the browser.");
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Function to toggle mute/unmute
  const toggleMute = () => {
    if (audioRef.current) {
      const currentlyMuted = !audioRef.current.muted;
      audioRef.current.muted = currentlyMuted;
      setIsMuted(currentlyMuted);
    }
  };

  // --- Submission logic remains the same ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(formData.email, formData.password);
      speak("Welcome back!");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      speak(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- Input change handler remains the same ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    // --- MODIFIED: Changed items-center to items-start and added pt-28 to move container up ---
    <div className="relative min-h-screen font-sans overflow-hidden flex items-start justify-center p-4 pt-28">

      {/* Background Image Layer */}
      <div className="absolute inset-0 w-full h-full z-0">
        <img
          src="/loginbackground.webp"
          alt="Background"
          className="w-full h-full object-cover"
        />
        {/* Thin white layer, almost fully transparent */}
        <div className="absolute inset-0 w-full h-full bg-white/1 backdrop-blur-sm"></div>
      </div>

      {/* --- Container for top buttons (z-50 makes it highest) --- */}
      <div className="absolute top-4 right-4 z-50 flex items-center space-x-3">
        <button
          onClick={toggleMute}
          className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md focus:outline-none p-2.5"
          aria-label={isMuted ? "Unmute background music" : "Mute background music"}
        >
          
        </button>
        <AudioButton />
      </div>

      {/* --- Back Button (z-10 is above background) --- */}
      <div className="absolute top-4 left-4 z-10">
        <button onClick={() => navigate(-1)} className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      </div>
      
      {/* --- Main Content Container (z-10 is above background) --- */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full">
        <img 
          src="/KODEIT_Logo_2.png" 
          alt="KodeIT Logo" 
          className="h-16 w-auto mb-6"
        />
        <div className="text-center text-white mb-8">
          <h1 className="text-4xl font-bold" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>Welcome back!</h1>
          <p className="text-lg mt-2 font-medium" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>Login to continue your adventure.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
          <div className="bg-white/80 backdrop-blur-sm rounded-full shadow-md">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Username"
              required
              className="w-full px-6 py-4 bg-transparent rounded-full text-lg focus:outline-none"
            />
          </div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-full shadow-md flex items-center">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              required
              className="w-full px-6 py-4 bg-transparent rounded-full text-lg focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-6 text-gray-600 hover:text-gray-900"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {error && <p className="bg-red-500/80 text-white text-sm text-center rounded-full py-1 px-3">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00A9E0] text-white font-bold text-xl py-4 rounded-full shadow-lg hover:bg-[#0095c7] transition-all duration-300 mt-4"
          >
            {loading ? 'Logging in...' : 'LOGIN'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button className="text-white font-semibold hover:text-gray-200 transition-colors" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;