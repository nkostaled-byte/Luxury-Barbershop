import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scissors } from 'lucide-react';

export const LuxuryLoader: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setVisible(false), 500); // fade out shortly after 100%
          return 100;
        }
        const step = Math.floor(Math.random() * 12) + 5;
        return Math.min(prev + step, 100);
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          id="luxury-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0F0F0F]"
        >
          {/* Film grain effect overlay */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15),transparent)] mix-blend-overlay bg-repeat bg-center" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noise\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.8\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noise)\"/%3E%3C/svg%3E')" }} />

          <div className="relative flex flex-col items-center max-w-xs text-center px-6">
            {/* Elegant Monogram Ring */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative w-24 h-24 rounded-full border border-gold/20 flex items-center justify-center mb-8 bg-[#171717]/80"
            >
              {/* Spinning gold glow indicator */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="46"
                  className="stroke-gold stroke-[2px] fill-none"
                  strokeDasharray="290"
                  strokeDashoffset={290 - (290 * progress) / 100}
                  style={{ transition: 'stroke-dashoffset 150ms ease-out' }}
                />
              </svg>
              <Scissors className="w-8 h-8 text-gold" strokeWidth={1} />
            </motion.div>

            {/* Title / Brand Mark */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="font-bebas text-4xl tracking-[0.2em] text-[#F8F8F8] mb-1"
            >
              SOVEREIGN
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.4 }}
              className="text-xs tracking-[0.3em] text-[#A7A7A7] uppercase mb-12 font-sans"
            >
              BARBER APOTHECARY
            </motion.p>

            {/* Progress Percentage */}
            <div className="w-full relative">
              <div className="flex items-end justify-between mb-2">
                <span className="text-[10px] tracking-[0.2em] text-[#A7A7A7] uppercase">ESTABLISHING APPOINTMENT...</span>
                <span className="font-space text-sm font-semibold text-gold">{progress}%</span>
              </div>
              <div className="w-full h-[1px] bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full bg-gold"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
