import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TikTokPreloader = ({ minLoadTime = 1500 }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const startTime = Date.now();

    const handleLoad = () => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadTime - elapsedTime);

      setTimeout(() => {
        setIsLoading(false);
      }, remainingTime);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [minLoadTime]);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black"
        >
          {/* Brand Name - Appears First with Letter Animation */}
          <div className="mb-4 flex items-center justify-center">
            {['C', 'a', 'r', 'e', 'e', 'r', 'Z', 'o', 'n', 'e'].map((letter, i) => (
              <motion.span
                key={i}
                className="text-5xl md:text-6xl font-bold"
                initial={{ opacity: 0, y: -30, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.05,
                  ease: [0.43, 0.13, 0.23, 0.96],
                }}
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #a0aec0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: '0 0 40px rgba(255, 255, 255, 0.5)',
                  filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.4)) drop-shadow(0 0 40px rgba(255, 255, 255, 0.2))',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontWeight: '800',
                  letterSpacing: i === 5 ? '0.1em' : '0.02em',
                }}
              >
                {letter}
              </motion.span>
            ))}
          </div>

          {/* Tagline */}
          <motion.p
            className="mb-12 text-gray-400 text-sm md:text-base font-medium tracking-wide"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.6,
              ease: "easeOut",
            }}
          >
            Nền tảng tuyển dụng và tìm việc số 1 Việt Nam
          </motion.p>

          {/* 3 White Glowing Circles - Appears After Text */}
          <motion.div
            className="flex gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: 0.5,
              duration: 0.4,
            }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-4 h-4 rounded-full bg-white"
                animate={{
                  y: [0, -25, 0],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: 0.5 + i * 0.15,
                  ease: "easeInOut",
                }}
                style={{
                  boxShadow: '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.4), 0 0 60px rgba(255, 255, 255, 0.2)',
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TikTokPreloader;
