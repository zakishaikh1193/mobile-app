import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, LogOut, ArrowLeft } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import { useAudio } from '../contexts/AudioContext';
import AudioButton from '../components/AudioButton';
import OptimizedImage from '../components/OptimizedImage';
import { avatars } from '../assets/avatars';

const ParentDashboard: React.FC = () => {
  const { user, logout, createChild } = useAuth();
  const { speak } = useAudio();
  const navigate = useNavigate();
  const [showCreateChild, setShowCreateChild] = useState(false);
  const [childForm, setChildForm] = useState({
    name: '',
    age: 4,
    avatar: avatars.girl[0],
    gender: 'girl' as 'boy' | 'girl',
  });

  useEffect(() => {
    if (user) {
      speak(`Welcome to your learning land, ${user.first_name}! Add your child Name and Start your fun learning.`);
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
    <div className="relative w-full min-h-screen font-sans overflow-hidden">
      {/* Background with optimized image */}
      <div className="absolute inset-0 w-full h-full">
        <OptimizedImage
          src="/ParentDashboardBackground.webp"
          alt="Background"
          isBackground
          className="w-full h-full object-cover"
          containerClassName="absolute inset-0 w-full h-full"
        />
      </div>

      {/* Foreground scrollable content */}
      <div className="relative z-10 w-full min-h-screen flex flex-col items-center overflow-y-auto bg-white/20 backdrop-blur-[1px]">
        {/* Header */}
        <header className="w-full max-w-7xl mx-auto p-4 flex justify-between items-center">
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

        {/* Main content */}
        <main className="flex flex-col items-center w-full max-w-7xl mx-auto px-4 py-20 sm:py-24 md:py-28">
          {/* Children list */}
          {user.children && user.children.length > 0 && (
            <div className="w-full mb-1sm:mb-10 md:mb-12">
              <h2 className="font-bold text-xl sm:text-2xl md:text-3xl text-center mb-4 sm:mb-6" style={{ color: '#5C3A21' }}>
                Your Kids
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {user.children.map((child) => (
                  <motion.div
                    key={child.id}
                    className="cursor-pointer text-center p-1 sm:p-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/letter-path/${child.id}`)}
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/90 rounded-full shadow-md flex items-center justify-center border-4 border-cyan-500 p-1">
                      <div className="w-20 h-20 md:w-24 md:h-24">
                        <OptimizedImage
                          src={child.avatar}
                          alt={child.name}
                          className="w-full h-full object-cover rounded-full"
                          width={96}
                          height={96}
                          // Simple gray placeholder for the child avatar
                          blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMjQgMjQnPjxwYXRoIGZpbGw9JyNkMWQxZDEnIGQ9J00xMiAyQzYuNDggMiAyIDYuNDggMiAxMnYxMGgxMGM1LjUyIDAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6Jy8+PC9zdmc+"
                          placeholderSrc={avatars.girl[0]} // Fallback avatar
                        />
                      </div>
                    </div>
                    <p className="text-center font-bold mt-1 text-sm sm:text-base" style={{ color: '#5C3A21' }}>
                      {child.name}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Add child button */}
          <motion.button
            onClick={() => setShowCreateChild(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-10 sm:mt-24 flex items-center gap-2 sm:gap-3 py-3 sm:py-4 px-6 sm:px-10 bg-cyan-500 text-white font-bold text-lg sm:text-xl uppercase rounded-full shadow-lg hover:bg-cyan-600 transition-colors"
          >
            <Plus />
            <span>Add Your Child</span>
          </motion.button>

          {/* Logo */}
          <div className="mt-20 sm:mt-24 w-15 flex justify-center">
  <OptimizedImage
    src="/KODEIT_Logo_2.png"
    alt="Kodeit Logo"
    className="w-15 h-10 md:w-8 md:h-8 object-contain"
    style={{ width: "100px", height: "80px" }}
    lazy={false}
    blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMTAwIDEwMCc+PHJlY3Qgd2lkdGg9JzEwMCUnIGhlaWdodD0nMTAwJScgZmlsbD0nI2UzZjJmZicvPjwvc3ZnPg=="
/>
          </div>
        </main>
      </div>

      {/* Create child modal */}
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
                        className={`w-16 h-16 rounded-full border-4 transition-colors ${
                          childForm.avatar === avatar ? 'border-brand-primary' : 'border-transparent'
                        } flex items-center justify-center`}
                        onClick={() => setChildForm({ ...childForm, avatar })}
                      >
                        <OptimizedImage
                          src={avatar}
                          alt="Avatar"
                          className="w-14 h-14 object-cover rounded-full"
                          placeholderSrc={avatars.girl[0]} // Fallback avatar
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateChild(false)}
                    className="flex-1 bg-gray-400 text-white py-3 text-xl font-bold uppercase rounded-xl hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-brand-accent text-white py-3 text-xl font-bold uppercase rounded-xl hover:brightness-110 transition-transform"
                  >
                    Add
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ParentDashboard;
