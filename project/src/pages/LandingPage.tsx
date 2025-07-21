import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

// --- Configuration for Decorative Images ---
const decorativeImages = [
  // CRAYONS & PENCILS
  { src: '/image1.png',      className: 'top-24 left-4 md:left-8 w-16 md:w-24 transform -rotate-12' },
  { src: '/image2.png',       className: 'bottom-16 left-4 md:left-12 w-16 md:w-20 transform rotate-12' },
  { src: '/image3.png',    className: 'bottom-8 left-28 md:left-48 w-20 md:w-28' },
  { src: '/image2.png',     className: 'top-32 right-4 md:right-20 w-12 md:w-16 transform rotate-12' },
  
  // KID FACES & OTHER OBJECTS
  { src: '/kid1.png',        className: 'top-1/3 right-1/2 w-24 md:w-32' },
  { src: '/kid2.png',  className: 'top-20 right-1/4 w-24 md:w-32' },
  { src: '/kid3.png',    className: 'bottom-1/3 left-1/3 w-24 md:w-32' },
  { src: '/elephant.png',       className: 'md:top-1/5  md:right-1/3 md:left-1/2 w-20 md:w-24' },
  
  // STARS
  { src: '/star1.png',        className: 'top-20 left-1/4 w-6' },
  { src: '/star2.png',        className: 'top-36 left-8 w-4' },
  { src: '/star3.png',      className: 'top-1/3 right-1/4 w-5' },
  { src: '/star1.png',      className: 'bottom-1/4 right-[55%] w-6' },
  { src: '/star2.png',        className: 'top-20 right-1/2 w-4' },
];

const navLinks = ["HOME", "ABOUT US", "F.A.Q", "CONTACT US"];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    // UPDATED: Using the new brand background color
    <div className="h-screen bg-brand-background text-brand-text font-sans relative overflow-hidden p-4 sm:p-6 md:p-8 flex flex-col">
      
      {/* Decorative images remain the same */}
      {decorativeImages.map((img, index) => (
         <motion.img
            key={index}
            src={img.src}
            alt=""
            className={`absolute z-0 ${img.className}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1, y: ["-8px", "8px"], rotate: [img.className.includes('-rotate') ? -10 : 0, img.className.includes('rotate') ? 10 : 0] }}
            transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: Math.random() }}
          />
      ))}

      <div className="relative z-10">
        <header className="flex justify-between items-center py-4">
          <nav className="hidden md:flex items-center space-x-6">
             {navLinks.map((link) => (
                // UPDATED: Text color now uses the new brand text color
                <a key={link} href="#" className="text-sm font-bold tracking-wider text-brand-text hover:text-brand-accent transition-colors">
                   {link}
                </a>
             ))}
          </nav>
          <div className="relative flex-1 md:flex-initial">
             <input 
                type="text" 
                placeholder="" 
                // UPDATED: Search bar styling to match the new theme
                className="bg-white/60 rounded-full py-2 pl-4 pr-10 w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all"
             />
             <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-text/70"/>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 flex-grow pt-16 md:pt-24 lg:pt-32 mb-0">
          <motion.div 
            className="space-y-6 text-center lg:text-left relative z-10"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
           >
            <div className="flex justify-center lg:justify-start lg:pl-8">
              <img src="/KODEIT_Logo_2.png" alt="Kodeit Learnings Logo" className="h-[12rem] w-[18rem] mb-3 sm:ml-[3rem] mx-auto" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold uppercase leading-tight text-brand-text">
              Kodeit Learnings 
            </h1>
            <h2 className="text-base sm:text-lg font-semibold tracking-wider text-brand-text/80">
              WELCOME TO THE LEARNING CENTER
            </h2>
            <p className="max-w-md text-base sm:text-lg text-brand-text/70 mx-auto lg:mx-0">
                An interactive educational platform designed for Pre-K to early primary students. Discover, learn, and grow.
            </p>
            <div className="pt-4">
              <motion.button 
                onClick={() => navigate('/auth')} 
                // UPDATED: Button colors now match the new theme
                className="bg-brand-accent text-white font-bold py-3 px-8 sm:px-10 rounded-full shadow-lg hover:brightness-110 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                MORE INFO
              </motion.button>
            </div>
          </motion.div>

          <motion.div 
  className="relative z-10 flex justify-center lg:justify-start"
  initial={{ opacity: 0, scale: 0.8, x: 0, y: 0 }}
  animate={{ opacity: 1, scale: 1, x: 40, y: +40 }}  // right + up
  transition={{ duration: 0.8, delay: 0.4 }}
>
  <img 
    src="/login.png"
    alt="Children engaged in a learning activity" 
    className="w-full max-w-md md:max-w-xl lg:max-w-2xl h-auto object-cover aspect-[4/3]"
  />
</motion.div>

        </main>
      </div>
    </div>
  );
};

export default LandingPage;