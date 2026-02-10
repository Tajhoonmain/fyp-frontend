import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X } from 'lucide-react';
import { destinations } from '@/data/destinations';
import { Destination } from '@/types/navigation';
import { useNavigation } from '@/contexts/NavigationContext';

interface DestinationListProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDestination: (destination: Destination) => void;
}

export function DestinationList({ isOpen, onClose }: DestinationListProps) {
  const { startNavigation } = useNavigation();

  const handleSelectDestination = (destination: Destination) => {
    startNavigation(destination);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 z-50 rounded-t-3xl backdrop-blur-[20px] overflow-hidden"
            style={{
              background: 'rgba(15, 25, 35, 0.95)',
              border: '1px solid rgba(0, 229, 255, 0.3)',
              borderBottom: 'none',
              height: '60vh',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#00E5FF]/20">
              <h2
                className="text-2xl font-bold text-[#00E5FF]"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Destinations
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-[#00E5FF]" />
              </button>
            </div>

            {/* Destinations List */}
            <div className="overflow-y-auto p-6 space-y-3" style={{ maxHeight: 'calc(60vh - 80px)' }}>
              {destinations.map((destination, index) => (
                <motion.button
                  key={destination.id}
                  className="w-full p-4 rounded-xl backdrop-blur-[20px] text-left hover:scale-[1.02] transition-transform"
                  style={{
                    background: 'rgba(15, 25, 35, 0.7)',
                    border: '1px solid rgba(0, 229, 255, 0.3)',
                    boxShadow: '0 0 20px rgba(0, 229, 255, 0.2)',
                  }}
                  onClick={() => handleSelectDestination(destination)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{
                    boxShadow: '0 0 30px rgba(0, 229, 255, 0.4)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#00E5FF]/20 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-[#00E5FF]" />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="text-lg font-semibold text-white mb-1"
                        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                      >
                        {destination.name}
                      </h3>
                      <p
                        className="text-sm text-[#00E5FF]/60"
                        style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
                      >
                        {destination.building}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
