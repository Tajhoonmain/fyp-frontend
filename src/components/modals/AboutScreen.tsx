import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info } from 'lucide-react';

interface AboutScreenProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutScreen({ isOpen, onClose }: AboutScreenProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-md z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <motion.div
              className="max-w-2xl w-full rounded-2xl backdrop-blur-[20px] overflow-hidden"
              style={{
                background: 'rgba(15, 25, 35, 0.95)',
                border: '1px solid rgba(0, 229, 255, 0.3)',
                boxShadow: '0 0 60px rgba(0, 229, 255, 0.3)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#00E5FF]/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#00E5FF]/20 flex items-center justify-center">
                    <Info className="w-6 h-6 text-[#00E5FF]" />
                  </div>
                  <h2
                    className="text-2xl font-bold text-[#00E5FF]"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    About MapMate
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-[#00E5FF]" />
                </button>
              </div>

              {/* Content */}
              <div
                className="p-6 space-y-4 max-h-[60vh] overflow-y-auto text-white/80"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
              >
                <div>
                  <h3
                    className="text-lg font-semibold text-white mb-2"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    FYP Scope
                  </h3>
                  <p className="text-sm leading-relaxed">
                    MapMate is an AR-powered campus navigation system designed for GIKI students and
                    visitors. This is a Final Year Project demonstration showcasing an offline-first
                    navigation experience with multiple localization modes.
                  </p>
                </div>

                <div>
                  <h3
                    className="text-lg font-semibold text-white mb-2"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    Localization Modes
                  </h3>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-[#00FF88] mt-1">●</span>
                      <span>
                        <strong>Simulated:</strong> Follows a predefined path through campus
                        landmarks. Default mode for demonstration purposes.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#00E5FF] mt-1">●</span>
                      <span>
                        <strong>Backend CV:</strong> Sends camera frames to computer vision backend
                        for real-time localization. Requires backend service running.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#FFB800] mt-1">●</span>
                      <span>
                        <strong>AR (Stubbed):</strong> Placeholder for future AR Kit/ARCore
                        integration. Not yet implemented.
                      </span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3
                    className="text-lg font-semibold text-white mb-2"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    How to Use
                  </h3>
                  <ol className="text-sm space-y-2 list-decimal list-inside">
                    <li>Tap the "Destinations" button in the bottom-left corner</li>
                    <li>Select a campus landmark from the list</li>
                    <li>Follow the directional arrow and distance label</li>
                    <li>
                      Optionally, use the capture button to test backend CV localization (if
                      available)
                    </li>
                  </ol>
                </div>

                <div>
                  <h3
                    className="text-lg font-semibold text-white mb-2"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    Backend Integration
                  </h3>
                  <p className="text-sm leading-relaxed">
                    The CV backend expects POST requests to <code className="text-[#00E5FF] text-xs" style={{ fontFamily: 'JetBrains Mono, monospace' }}>/api/localize</code> and returns JSON
                    with <code className="text-[#00E5FF] text-xs" style={{ fontFamily: 'JetBrains Mono, monospace' }}>&#123;x, y, building, confidence&#125;</code>. Low confidence values (&lt;0.6) trigger a warning
                    indicator.
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs text-white/60">
                    MapMate FYP Frontend • GIKI • 2024
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
