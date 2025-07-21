import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserCheck } from 'lucide-react';

// Assuming these hooks and components are correctly set up
import { useAuth } from '../contexts/AuthContext';
import { useAudio } from '../contexts/AudioContext';
import AudioButton from '../components/AudioButton';

// --- NEW: Added the same decorative images array from the Landing Page ---
const decorativeImages = [
    // CRAYONS & PENCILS
  { src: '/image1.png',      className: 'top-1/4 left-4 md:left-8 w-16 md:w-24 transform -rotate-12' },
  { src: '/image2.png',       className: 'bottom-1/4 left-4 md:left-12 w-16 md:w-20 transform rotate-12' },
  { src: '/image3.png',    className: 'bottom-8 right-1/4 w-20 md:w-28' },
  
  // KID FACES & OTHER OBJECTS
  { src: '/kid1.png',        className: 'top-16 right-1/4 w-24 md:w-32' },
  { src: '/kid2.png',  className: 'bottom-16 right-1/3 w-24 md:w-32' },
  { 
    src: '/elephant.png',       
    className: 'top-10 left-1/3 w-20 md:w-24' 
  },
  
  // STARS
  { src: '/star1.png',        className: 'top-1/2 left-1/4 w-6' },
  { src: '/star2.png',        className: 'top-3/4 left-1/2 w-4' },
  { src: '/star3.png',      className: 'top-1/3 right-1/4 w-5' },
  { src: '/star1.png',      className: 'bottom-1/4 right-1/2 w-6' },
];


interface FormInputProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  [key: string]: any;
}

const FormInput = ({ icon: Icon, ...props }: FormInputProps) => (
  <div className="relative">
    <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
    <input
      {...props}
      className="w-full pl-10 pr-4 py-3 bg-transparent border-b-2 border-gray-300 focus:outline-none focus:border-brand-accent transition-colors"
    />
  </div>
);

const AuthPage: React.FC = () => {
  // All your original state and logic is preserved
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '', role: 'parent' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();
  const { speak } = useAudio();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
      try {
        if (isLogin) {
          await login(formData.email, formData.password);
          speak("Welcome back!");
          // Navigation is handled in AuthContext
        } else {
          await register(formData.email, formData.password, formData.name, formData.role);
          speak("Registration successful!");
          // Navigation is handled in AuthContext
        }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      speak("Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-brand-background text-brand-text font-sans relative overflow-hidden flex items-center justify-center p-4">
      <AudioButton />
      
      {/* --- NEW: Added the rendering logic for the floating sticker images --- */}
      {/* They have a z-index of 0 to stay in the background */}
      {decorativeImages.map((img, index) => (
         <motion.img
            key={index}
            src={img.src}
            alt=""
            className={`absolute z-0 ${img.className}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
                opacity: 1, 
                scale: 1,
                y: ["-8px", "8px"],
                rotate: [img.className.includes('-rotate') ? -10 : 0, img.className.includes('rotate') ? 10 : 0]
            }}
            transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: Math.random()
            }}
          />
      ))}

      {/* Decorative blobs still provide a nice base layer */}
      <motion.div
        animate={{ y: [0, -20, 0], x: [0, 10, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-40 -left-40 w-96 h-96 bg-brand-primary/60 rounded-full filter blur-sm"
      />
      <motion.div
        animate={{ y: [0, 20, 0], x: [0, -10, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-secondary/50 rounded-full filter blur-sm"
      />

      {/* Main content now has z-10 to ensure it sits on top of all background elements */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 items-center gap-16 max-w-6xl w-full">
        <motion.div
          className="hidden lg:flex items-center justify-center"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
<div className="w-full overflow-x-auto px-0 mx-0">
  <img 
    src="/pic5.png"
    alt="Playful kids illustration" 
    className="w-[2000px] h-[800px] ml-0"
  />
</div>
        </motion.div>

        <motion.div
          className="bg-white/40 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 w-full"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        >
          <div className="text-center mb-8">
            <img 
              src="/KODEIT_Logo_2.png"
              alt="Kodeit Company Logo"
              className="h-12 w-auto mx-auto mb-4"
            />
            <h2 className="text-4xl font-extrabold text-brand-text">
              {isLogin ? 'Welcome Back!' : 'Join The Fun!'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -20 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="space-y-6 mb-6">
                    <FormInput icon={User} type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Your Full Name" required />
                    <div className="relative">
                      <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select name="role" value={formData.role} onChange={handleInputChange} className="w-full pl-10 bg-transparent border-b-2 border-gray-300 py-3 focus:outline-none focus:border-brand-accent appearance-none">
                        <option value="parent">I am a Parent</option>
                        <option value="teacher">I am a Teacher</option>
                        <option value="admin">I am an Administrator</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <FormInput icon={Mail} type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email Address" required />
            <FormInput icon={Lock} type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Password" required />

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-brand-text text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-opacity-90 transition-all duration-300"
            >
              {loading ? 'Working on it...' : (isLogin ? 'Sign In' : 'Create Account')}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-gray-600 hover:text-brand-text font-medium mt-1 transition-colors">
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;