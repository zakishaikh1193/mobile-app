import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, LogOut, ArrowLeft } from 'lucide-react';

import { useAuth, type Child } from '../contexts/AuthContext';
import { useAudio } from '../contexts/AudioContext';
import { authAPI } from '../services/api';
import AudioButton from '../components/AudioButton';
import OptimizedImage from '../components/OptimizedImage';
import { avatars } from '../assets/avatars';

const ParentDashboard = () => {
  const { user, logout, createChild, switchToChild } = useAuth();
  const { speak } = useAudio();
  const navigate = useNavigate();
  const [showCreateChild, setShowCreateChild] = useState(false);
  const [loading, setLoading] = useState(false);
  const [children, setChildren] = useState<Array<Child & { first_name?: string; firstName?: string }>>([]);
  const [error, setError] = useState('');
  interface ChildFormData {
    firstName: string;
    username: string;
    age: number;
    avatar: string;
    gender: 'boy' | 'girl';
    email: string;
    name: string;
    role: 'student';
    first_name: string;
    last_name: string;
    badges: string[];
    streak: number;
    created_at: string;
    updated_at: string;
  }

  const [childForm, setChildForm] = useState<Omit<ChildFormData, 'id' | 'progress'>>(() => {
    const initialData = {
      firstName: '',
      first_name: '',
      username: '',
      age: 4,
      avatar: avatars.girl[0],
      gender: 'girl' as const,
      email: '',
      name: '',
      role: 'student' as const,
      last_name: '',
      badges: [],
      streak: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Set initial derived values
    initialData.first_name = initialData.firstName;
    initialData.name = initialData.firstName;
    initialData.email = initialData.username ? `${initialData.username}@child.local` : '';
    
    return initialData;
  });
  
  // Update derived fields when form data changes
  useEffect(() => {
    setChildForm(prev => ({
      ...prev,
      first_name: prev.firstName,
      name: prev.firstName,
      email: prev.username ? `${prev.username}@child.local` : ''
    }));
  }, [childForm.firstName, childForm.username]);

  useEffect(() => {
    console.log('ParentDashboard - useEffect triggered, user:', user);
    if (user) {
      console.log('ParentDashboard - User found, role:', user.role, 'max_children:', user.max_children);
      speak(`Welcome to your learning land, ${user.first_name}! Add your child and start your fun learning.`);
      fetchChildren();
    } else {
      console.log('ParentDashboard - No user found');
    }
  }, [user, speak]);

  const handleAvatarSelect = (avatar: string) => {
    setChildForm(prev => ({ ...prev, avatar }));
  };

  const fetchChildren = async () => {
    console.log('ParentDashboard - fetchChildren called, user:', user);
    if (!user || user.role !== 'parent') {
      console.log('ParentDashboard - User is not a parent or user is null');
      return;
    }
    
    try {
      console.log('ParentDashboard - Attempting to fetch children');
      // Fetch the children from the backend
      const response = await authAPI.getChildren();
      console.log('ParentDashboard - Children response:', response);
      setChildren(response.children || []);
    } catch (error) {
      console.error('ParentDashboard - Error fetching children:', error);
      setChildren([]);
    }
  };



  const handleCreateChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childForm.firstName || !childForm.username) return;
    
    setLoading(true);
    setError('');
    try {
      await createChild({
        firstName: childForm.firstName,
        username: childForm.username,
        age: childForm.age,
        gender: childForm.gender,
        avatar: childForm.avatar,
      });
      setShowCreateChild(false);
      // Reset form with all required fields
      setChildForm({
        firstName: '',
        first_name: '',
        username: '',
        age: 4,
        avatar: avatars.girl[0],
        gender: 'girl' as const,
        email: '',
        name: '',
        role: 'student' as const,
        last_name: '',
        badges: [],
        streak: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      speak(`Great! ${childForm.firstName} is ready to play!`);
      // Refresh children list and user data
      await fetchChildren();
      
    } catch (error) {
      console.error('Error creating child:', error);
      if (error) {
        console.log(error);
      } else {
        setError('Failed to create child profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToChild = async (childId: string, childName: string) => {
    try {
      await switchToChild(childId);
      speak(`Welcome ${childName}! Let's start learning!`);
    } catch (error) {
      console.error('Error switching to child:', error);
    }
  };

  console.log('ParentDashboard - Rendering, user:', user, 'children:', children);
  
  if (!user) {
    console.log('ParentDashboard - No user, returning null');
    return null;
  }
  
  if (user.role !== 'parent') {
    console.log('ParentDashboard - User is not a parent, role:', user.role);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">This page is only accessible to parent users.</p>
          <p className="text-sm text-gray-500 mt-2">Current role: {user.role}</p>
        </div>
      </div>
    );
  }

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
          {children && children.length > 0 && (
            <div className="w-full mb-1sm:mb-10 md:mb-12">
              <h2 className="font-bold text-xl sm:text-2xl md:text-3xl text-center mb-4 sm:mb-6" style={{ color: '#5C3A21' }}>
                Your Kids
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {children.map((child) => (
                  <motion.div
                    key={child.id}
                    className="cursor-pointer text-center p-1 sm:p-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSwitchToChild(child.id, child.first_name)}
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/90 rounded-full shadow-md flex items-center justify-center border-4 border-cyan-500 p-1">
                      <div className="w-20 h-20 md:w-24 md:h-24">
                        <OptimizedImage
                          src={child.avatar || avatars.girl[0]}
                          alt={child.first_name}
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
                      {child.first_name || child.firstName}
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
            className={`mt-10 sm:mt-24 flex items-center gap-2 sm:gap-3 py-3 sm:py-4 px-6 sm:px-10 font-bold text-lg sm:text-xl uppercase rounded-full shadow-lg transition-colors ${
              user?.max_children === undefined || children.length < user.max_children
                ? 'bg-cyan-500 text-white hover:bg-cyan-600 cursor-pointer' 
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
            disabled={user?.max_children !== undefined && children.length >= user.max_children}
          >
            <Plus />
            <span>Add Your Child</span>
          </motion.button>

          {/* Children limit info */}
          <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center text-gray-700 shadow-lg">
            <h3 className="font-bold text-lg mb-2 text-cyan-700">Children</h3>
            <p><strong>Current:</strong> {children.length} {user?.max_children !== undefined ? `/ ${user.max_children}` : ''}</p>
            {user?.max_children !== undefined && children.length >= user.max_children && (
              <p className="text-red-600 font-semibold mt-2">
                You've reached your child limit. Contact admin to increase your limit.
              </p>
            )}
          </div>

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
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              <form onSubmit={handleCreateChild} className="space-y-4">
                <div>
                  <label className="block text-xl mb-1 font-bold">Child's First Name</label>
                  <input
                    type="text"
                    value={childForm.firstName}
                    onChange={(e) => setChildForm({ ...childForm, firstName: e.target.value })}
                    className="w-full p-3 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-brand-accent focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xl mb-1 font-bold">Username</label>
                  <input
                    type="text"
                    value={childForm.username}
                    onChange={(e) => setChildForm({ ...childForm, username: e.target.value })}
                    className="w-full p-3 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-brand-accent focus:outline-none"
                    placeholder="Unique username for your child"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xl mb-1 font-bold">Age</label>
                  <select
                    value={childForm.age}
                    onChange={(e) => setChildForm({ ...childForm, age: Number(e.target.value) })}
                    className="w-full p-3 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-brand-accent focus:outline-none"
                  >
                    {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(age => (
                      <option key={age} value={age}>{age} years old</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xl mb-1 font-bold">Gender</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="girl"
                        checked={childForm.gender === 'girl'}
                        onChange={() => setChildForm(prev => ({ ...prev, gender: 'girl' }))}
                        className="mr-2"
                      />
                      Girl
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="boy"
                        checked={childForm.gender === 'boy'}
                        onChange={() => setChildForm(prev => ({ ...prev, gender: 'boy' }))}
                        className="mr-2"
                      />
                      Boy
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xl mb-1 font-bold">Choose Avatar</label>
                  <div className="grid grid-cols-4 gap-2 bg-gray-100 p-2 rounded-lg">
                    {[...avatars.girl, ...avatars.boy].map((avatar) => (
                      <button
                        key={avatar}
                        type="button"
                        onClick={() => handleAvatarSelect(avatar)}
                        className={`w-16 h-16 rounded-full overflow-hidden ${childForm.avatar === avatar ? 'ring-2 ring-brand-accent' : ''}`}
                      >
                        <OptimizedImage
                          src={avatar}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                          width={64}
                          height={64}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateChild(false);
                      setError('');
                    }}
                    className="flex-1 bg-gray-400 text-white py-3 text-xl font-bold uppercase rounded-xl hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-brand-accent text-white py-3 text-xl font-bold uppercase rounded-xl hover:brightness-110 transition-transform disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add'}
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
