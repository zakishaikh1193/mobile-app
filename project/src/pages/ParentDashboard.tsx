import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, LogOut, MessageCircle, BarChart3, Star } from 'lucide-react';

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
      speak(`Welcome to your learning land, ${user.name}!`);
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

  const parentResources = [
    { title: "Progress", icon: BarChart3, color: "text-brand-accent" },
    { title: "Community", icon: MessageCircle, color: "text-brand-secondary" },
    { title: "Tips", icon: Star, color: "text-brand-primary" },
  ];

  if (!user) return null;

  return (
    // --- CHANGE START ---
    // The main container no longer has padding. It is the full-screen boundary.
    <div className="min-h-screen bg-gradient-to-b from-theme-green to-theme-blue text-brand-text font-sans relative overflow-hidden">
      {/* This new wrapper now contains all the content AND the padding. */}
      <div className="relative z-10 p-6 md:p-8">
        <AudioButton />

        {/* Header with Logo and Logout */}
        <header className="flex justify-between items-start z-20 relative">
          <div>
            <img 
              src="/KODEIT_Logo_2.png" 
              alt="Your Company Logo" 
              className="h-12 md:h-16 w-auto" 
            />
            {/* <p className="text-xs text-gray-600 mt-1">PRE SCHOOL | ACTIVITIES | LEARNING</p> */}
          </div>
          <button onClick={logout} className="flex items-center space-x-2 bg-white/50 p-2 rounded-lg text-gray-700 hover:bg-white transition-colors">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </header>
        
        {/* Decorative floating items */}
        <motion.img animate={{ y: [-5, 5] }} transition={{ repeat: Infinity, repeatType: 'reverse', duration: 3 }} src="/abc.png" alt="Decorative ABC letters" className="absolute top-1/4 left-1/4 w-24 opacity-80" />
        <motion.img animate={{ y: [-5, 5] }} transition={{ repeat: Infinity, repeatType: 'reverse', duration: 2.5 }} src="/abc.png" alt="Decorative lightbulb icon" className="absolute top-16 right-1/4 w-12 opacity-80" />
        <motion.img animate={{ y: [-5, 5] }} transition={{ repeat: Infinity, repeatType: 'reverse', duration: 3.5 }} src="/numbers.png" alt="Decorative atom science icon" className="absolute top-[10%] left-1/2 w-48 opacity-80" />

        {/* Main Content Area */}
        <main className="relative mt-8 md:mt-12 flex flex-col md:flex-row">
        
          {/* Left Side: Your original content, styled like the new design */}
          <div className="relative z-20 w-full md:w-2/5">
            <p className="text-theme-pink font-bold text-3xl md:text-4xl">Welcome to your</p>
            <div className="bg-brand-accent my-2 py-2 px-6 rounded-2xl inline-block">
              <h1 className="text-white text-4xl md:text-5xl font-extrabold">Learning Land!</h1>
            </div>
            
            <motion.button
              onClick={() => setShowCreateChild(true)}
              whileHover={{ scale: 1.05 }}
              className="mt-6 flex items-center space-x-2 bg-brand-primary text-white font-bold py-3 px-6 rounded-xl shadow-lg"
            >
              <Plus />
              <span>Add Your Child Name </span>
            </motion.button>
            
            <div className="mt-12">
              <h3 className="font-bold text-lg mb-3 text-brand-text/80">Parent Resources:</h3>
              <div className="flex items-center justify-start space-x-4">
                {parentResources.map((resource, index) => (
                  <motion.div
                    key={resource.title}
                    className="bg-white/60 rounded-2xl p-4 w-28 h-28 flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                    whileHover={{ y: -8, backgroundColor: 'rgba(255, 255, 255, 1)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  >
                    <resource.icon className={`w-10 h-10 ${resource.color}`} />
                    <p className="font-bold text-brand-text mt-2 text-sm">{resource.title}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: Illustrations and YOUR children as interactive elements */}
          <div className="absolute top-0 right-0 w-full md:w-3/5 h-full pointer-events-none">
              {/* <motion.img 
                src="/sofa.png" 
                alt="A decorative pink sofa" 
                className="absolute bottom-10 right-0 w-2/3 opacity-80 md:opacity-100 z-10"
                initial={{ x: 200, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              /> */}
<motion.img 
  src="/ParentDashboardpic.png" 
  alt="A cartoon boy holding a tablet" 
  className="absolute top-[10%] left-1/5 w-[900px] h-[900px] z-20"
  initial={{ y: 200, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.8 }}
/>
              {/* YOUR CHILDREN rendered as floating, clickable circles */}
              {user.children?.map((child, index) => (
                  <motion.div
                      key={child.id}
                      className="absolute z-30 cursor-pointer pointer-events-auto"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 + index * 0.1, type: 'spring' }}
                      whileHover={{ scale: 1.2, rotate: 10, zIndex: 50 }}
                      style={{ 
                          top: `${20 + (index * 18)}%`, 
                          right: `${15 + (index % 2 * 15)}%` 
                      }}
                      onClick={() => navigate(`/child-dashboard/${child.id}`)}
                  >
                      <div className="w-20 h-20 bg-white rounded-full shadow-lg flex flex-col items-center justify-center text-4xl border-4 border-brand-primary">
                          <img src={child.avatar} alt={child.name} className="w-16 h-16 object-cover" />
                      </div>
                      <p className="text-center font-bold text-brand-text mt-1">{child.name}</p>
                  </motion.div>
              ))}
          </div>
        </main>

        {/* Bottom Decorative items */}
        <motion.img 
  animate={{ y: [-3, 3], x: [0, 5] }} 
  transition={{ repeat: Infinity, repeatType: 'reverse', duration: 4 }} 
  src="/prop1.png" 
  alt="A decorative potted plant" 
  className="absolute bottom-[-300px] left-10 w-24 z-10"
/>        <motion.img animate={{ y: [-5, 5] }} transition={{ repeat: Infinity, repeatType: 'reverse', duration: 2 }} src="/prop1.png" alt="A decorative colorful ball" className="absolute bottom-16 left-1/3 w-12 z-10" />
      </div>
      
      {/* The full-width footer image is now outside the padded wrapper */}
      {/* <motion.img
        src="/group.png" 
        alt="A decorative group of happy cartoon children"
        className="absolute bottom-0 left-0 w-full h-auto z-20 pointer-events-none"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
      /> */}
      {/* --- CHANGE END --- */}

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
                  {[...avatars.girl, ...avatars.boy].map((avatar, index) => (
                    <button
                      key={avatar}
                      className={`w-16 h-16 rounded-full border-2 ${childForm.avatar === avatar ? 'border-brand-primary' : 'border-gray-300'} flex items-center justify-center`}
                      onClick={() => setChildForm({ ...childForm, avatar })}
                    >
                      <img src={avatar} alt="Avatar" className="w-12 h-12 object-cover" />
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
    </div>
  );
};

export default ParentDashboard;