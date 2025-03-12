import React, { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TerminalProps {
  children: ReactNode;
  chaosMeter?: number;
}

export const Terminal = ({ children, chaosMeter = 0 }: TerminalProps) => {
  const [glitchIntensity, setGlitchIntensity] = useState(1);

  useEffect(() => {
    setGlitchIntensity(1 + (chaosMeter * 0.5));
  }, [chaosMeter]);

  return (
    <div className="fixed inset-0 flex flex-col font-mono" style={{ backgroundColor: '#000000' }}>
      {/* Scanline effect */}
      <div className="pointer-events-none fixed inset-0 animate-scanline opacity-10">
        <div className="h-[2px] w-full" style={{ backgroundColor: '#00ff00' }}></div>
      </div>

      {/* CRT flicker effect */}
      <div 
        className="pointer-events-none fixed inset-0 animate-flicker opacity-[0.015]"
        style={{ backgroundColor: '#00ff00' }}
      ></div>

      {/* Terminal header */}
      <div 
        className="w-full p-2 border-b z-20"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          borderColor: '#00ff00',
          color: '#00ff00'
        }}
      >
        <div className="flex justify-between items-center">
          <span>LE NÉANT CODÉ v1.0.0</span>
          <span>CHAOS LEVEL: {chaosMeter.toFixed(2)}</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={chaosMeter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              color: '#00ff00',
              textShadow: `0 0 ${glitchIntensity * 2}px #00ff00`,
            }}
            className="max-w-3xl mx-auto"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}; 