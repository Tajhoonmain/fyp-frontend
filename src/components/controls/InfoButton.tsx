import React from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

interface InfoButtonProps {
  onClick: () => void;
}

export function InfoButton({ onClick }: InfoButtonProps) {
  return (
    <motion.button
      className="absolute top-6 right-6 z-30 w-10 h-10 rounded-full backdrop-blur-[20px] flex items-center justify-center"
      style={{
        background: 'rgba(15, 25, 35, 0.7)',
        border: '1px solid rgba(0, 229, 255, 0.3)',
        boxShadow: '0 0 20px rgba(0, 229, 255, 0.4)',
      }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      whileHover={{
        boxShadow: '0 0 30px rgba(0, 229, 255, 0.6)',
      }}
    >
      <Info className="w-5 h-5 text-[#00E5FF]" />
    </motion.button>
  );
}
