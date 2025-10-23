import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Preloader = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-gray-900"
        >
          <div className="relative w-24 h-24">
            {/* First Circle - Cyan */}
            <motion.div
              className="absolute w-16 h-16 rounded-full bg-cyan-400"
              animate={{
                x: [0, 20, 0, -20, 0],
                y: [0, -20, 0, 20, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                left: '50%',
                top: '50%',
                marginLeft: '-32px',
                marginTop: '-32px',
              }}
            />
            
            {/* Second Circle - Pink */}
            <motion.div
              className="absolute w-16 h-16 rounded-full bg-pink-500"
              animate={{
                x: [0, -20, 0, 20, 0],
                y: [0, 20, 0, -20, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                left: '50%',
                top: '50%',
                marginLeft: '-32px',
                marginTop: '-32px',
                mixBlendMode: 'multiply',
              }}
            />
          </div>
          
          {/* Optional: Loading text */}
          <motion.p
            className="absolute bottom-1/3 text-gray-600 dark:text-gray-300 font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
