import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, LogOut, ArrowLeft } from 'lucide-react';

// Assuming these hooks and components are correctly set up
import { useAuth } from '../contexts/AuthContext';
import { useAudio } from '../contexts/AudioContext';
import AudioButton from '../components/AudioButton';
import { avatars } from '../assets/avatars';

const ParentDashboard: React.FC = () => {
  // --- All your original state and logic remains untouched ---
  const { user, logout, createChild } = useAuth();
  const { speak } = useAudio();
  const navigate = useNavigate();
  const [showCreateChild, setShowCreateChild] = useState(false);
  const [childForm, setChildForm] = useState({ name: '', age: 4, avatar: avatars.girl[0], gender: 'girl' as 'boy' | 'girl' });

  useEffect(() => {
    if (user) {
      speak(`Welcome to your learning land, ${user.name}! Add your child Name and Start your fun learning.`);
    }
  }, [user, speak]);

  const handleCreateChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childForm.name) return;
    createChild(childForm);
    setShowCreateChild(false);
    setChildForm({ name: '', age: 4, avatar: avatars.girl[0], gender: 'girl' });
    speak(`Great! ${childForm.name} is ready to play!`);
  };

  if (!user) return null;

  return (
    <>
      {/* 
        Main container with the new background and layout.
        Flexbox is used to center the main content area.
      */}
      <div 
  className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#DCECFB] bg-cover bg-center font-sans relative"
  // style={{ backgroundImage: "url('/parentscreenbackground.png')" }}
>
        {/* Top bar for navigation and controls */}
        <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center w-full">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center space-x-2 bg-white/60 p-3 rounded-full text-gray-700 hover:bg-white transition-colors shadow-md backdrop-blur-sm"
            >
              <ArrowLeft size={24} />
            </button>
            <AudioButton />
          </div>
          <button 
            onClick={logout} 
            className="flex items-center space-x-2 bg-white/60 py-3 px-5 rounded-full text-gray-700 hover:bg-white transition-colors font-semibold shadow-md backdrop-blur-sm"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </header>

        {/* Main content aligned to the center */}
        <main className="flex flex-col items-center">
          {/* Logo styled to look like the "SkyGround Kids" text in the image */}
          <div className="bg-white rounded-3xl shadow-lg p-5 text-center">
            <h1 className="text-6xl md:text-7xl font-extrabold" style={{ color: '#5C3A21' }}>
              Welcome to your 
              <br />
              Learning Land
            </h1>
          </div>

          {/* 
            Your "Add Your Child" button, now styled like the main button in the image.
            It triggers your existing modal functionality.
          */}
          <motion.button
            onClick={() => setShowCreateChild(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-10 flex items-center gap-3 py-4 px-10 bg-cyan-500 text-white font-bold text-xl uppercase rounded-full shadow-lg hover:bg-cyan-600 transition-colors"
          >
            <Plus />
            <span>Add Your Child</span>
          </motion.button>

          {/* Displaying existing children for quick navigation */}
          {user.children && user.children.length > 0 && (
            <div className="mt-8">
              <h2 className="font-bold text-xl text-center mb-4" style={{ color: '#5C3A21' }}>Your Kids</h2>
              <div className="flex items-center justify-center gap-4">
                {user.children.map(child => (
                   <motion.div
                    key={child.id}
                    className="cursor-pointer text-center"
                    whileHover={{ scale: 1.1 }}
                    onClick={() => navigate(`/child-dashboard/${child.id}`)}
                  >
                      <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-cyan-500 p-1">
                          <img src={child.avatar} alt={child.name} className="w-full h-full object-cover rounded-full" />
                      </div>
                      <p className="text-center font-bold mt-2 text-lg" style={{ color: '#5C3A21' }}>{child.name}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Your original "Create Child" Modal remains the same */}
      <AnimatePresence>
        {showCreateChild && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md border-4 border-brand-accent shadow-2xl text-brand-text"
            >
              <h3 className="text-4xl font-extrabold mb-6 text-center text-brand-accent">Add Your kid!</h3>
              <form onSubmit={handleCreateChild} className="space-y-4">
                <div>
                  <label className="block text-xl mb-1 font-bold">Kid's Name</label>
                  <input
                    type="text"
                    value={childForm.name}
                    onChange={(e) => setChildForm({ ...childForm, name: e.target.value })}
                    className="w-full p-3 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-brand-accent focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xl mb-1 font-bold">Choose Avatar</label>
                  <div className="grid grid-cols-4 gap-2 bg-gray-100 p-2 rounded-lg">
                    {[...avatars.girl, ...avatars.boy].map((avatar) => (
                      <button
                        type="button"
                        key={avatar}
                        className={`w-16 h-16 rounded-full border-4 transition-colors ${childForm.avatar === avatar ? 'border-brand-primary' : 'border-transparent'} flex items-center justify-center`}
                        onClick={() => setChildForm({ ...childForm, avatar })}
                      >
                        <img src={avatar} alt="Avatar" className="w-14 h-14 object-cover rounded-full" />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-4 pt-4">
                  <button type="button" onClick={() => setShowCreateChild(false)} className="flex-1 bg-gray-400 text-white py-3 text-xl font-bold uppercase rounded-xl hover:bg-gray-500 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 bg-brand-accent text-white py-3 text-xl font-bold uppercase rounded-xl hover:brightness-110 transition-transform">Add</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ParentDashboard;