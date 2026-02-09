import React, { useState } from 'react';
import { LocalizationProvider } from '@/contexts/LocalizationContext';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { ARView } from '@/components/ar/ARView';
import { MapView } from '@/components/MapView';
import { DirectionArrow } from '@/components/ar/DirectionArrow';
import { DistanceLabel } from '@/components/ar/DistanceLabel';
import { TrackingIndicator } from '@/components/ar/TrackingIndicator';
import { CaptureButton } from '@/components/ar/CaptureButton';
import { CameraCapture } from '@/components/CameraCapture';
import { DebugOverlay } from '@/components/ar/DebugOverlay';
import { DestinationList } from '@/components/modals/DestinationList';
import { AboutScreen } from '@/components/modals/AboutScreen';
import { DestinationsButton } from '@/components/controls/DestinationsButton';
import { InfoButton } from '@/components/controls/InfoButton';
import { useLocalization } from '@/contexts/LocalizationContext';

export function MapMateApp() {
  const [isDestinationListOpen, setIsDestinationListOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const { captureAndLocalize } = useLocalization();

  const handleCameraCapture = (imageData: string) => {
    // Send image to backend for localization
    captureAndLocalize(imageData);
    setIsCameraOpen(false);
  };

  return (
    <LocalizationProvider>
      <NavigationProvider>
        <div className="relative w-full h-screen overflow-hidden bg-[#0A0E14]">
          {/* Toggle between Map and AR View */}
          {showMap ? (
            <MapView />
          ) : (
            <ARView />
          )}

          {/* Navigation Overlays - only show in AR mode */}
          {!showMap && (
            <>
              <DirectionArrow />
              <DistanceLabel />
            </>
          )}

          {/* Camera Capture Modal */}
          {isCameraOpen && (
            <CameraCapture
              onClose={() => setIsCameraOpen(false)}
              onCapture={handleCameraCapture}
            />
          )}

          {/* Status & Controls */}
          <TrackingIndicator />
          
          {/* View Toggle Button */}
          <button
            onClick={() => setShowMap(!showMap)}
            className="absolute top-4 left-4 px-3 py-2 rounded-lg backdrop-blur-[20px] text-sm font-medium transition-colors z-20"
            style={{
              background: 'rgba(15, 25, 35, 0.8)',
              border: '1px solid rgba(0, 229, 255, 0.3)',
              color: '#00E5FF'
            }}
          >
            {showMap ? 'AR View' : 'Map View'}
          </button>

          <InfoButton onClick={() => setIsAboutOpen(true)} />
          <DestinationsButton onClick={() => setIsDestinationListOpen(true)} />
          
          {/* Updated Capture Button */}
          <button
            onClick={() => setIsCameraOpen(true)}
            className="absolute bottom-6 right-6 z-30 w-16 h-16 rounded-full backdrop-blur-[20px] flex items-center justify-center"
            style={{
              background: 'rgba(15, 25, 35, 0.7)',
              border: '1px solid rgba(0, 229, 255, 0.3)',
              boxShadow: '0 0 20px rgba(0, 229, 255, 0.4)',
            }}
          >
            <svg
              className="w-6 h-6 text-[#00E5FF]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>
          
          <DebugOverlay />

          {/* Modals */}
          <DestinationList
            isOpen={isDestinationListOpen}
            onClose={() => setIsDestinationListOpen(false)}
          />
          <AboutScreen isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
        </div>
      </NavigationProvider>
    </LocalizationProvider>
  );
}
