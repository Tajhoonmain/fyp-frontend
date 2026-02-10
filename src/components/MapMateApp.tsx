import React, { useState, useEffect } from 'react';
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
import { useNavigation } from '@/contexts/NavigationContext';

// Inner component that can use the context
function MapMateAppContent() {
  const { currentPosition, localizationMode, captureAndLocalize } = useLocalization();
  const { isNavigating, currentDestination, distanceToWaypoint, hasArrived, startNavigation, stopNavigation } = useNavigation();
  const [isDestinationListOpen, setIsDestinationListOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [showMap, setShowMap] = useState(true);

  const handleCameraCapture = (imageData: string) => {
    console.log('Camera capture triggered');
    // Send image to backend for localization
    captureAndLocalize(imageData);
    setIsCameraOpen(false);
  };

  // Debug logging
  React.useEffect(() => {
    console.log('MapMateAppContent mounted');
    console.log('Environment:', import.meta.env);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0A0E14]">
      {/* Toggle between Map and AR View */}
      {showMap ? (
        <MapView />
      ) : (
        <ARView />
      )}

      {/* Status & Controls */}
      <TrackingIndicator />
      
      {/* Current Location Display */}
      <div className="absolute top-20 left-6 z-20 px-4 py-3 rounded-lg backdrop-blur-[20px] max-w-xs">
        <div className="text-xs font-mono text-[#00E5FF] mb-1">
          CURRENT LOCATION
        </div>
        <div className="text-lg font-bold text-white">
          {localizationMode === 'MIDAS Classification' 
            ? `${currentPosition.x.toFixed(0)}, ${currentPosition.y.toFixed(0)}`
            : localizationMode === 'GPS' 
            ? `GPS: ${currentPosition.x.toFixed(1)}, ${currentPosition.y.toFixed(1)}`
            : `Sim: ${currentPosition.x.toFixed(0)}, ${currentPosition.y.toFixed(0)}`
          }
        </div>
        <div className="text-xs text-[#00E5FF80]">
          {localizationMode}
        </div>
      </div>
      
      {/* View Toggle Button */}
      <button
        onClick={() => setShowMap(!showMap)}
        className="absolute top-4 right-4 px-4 py-2 rounded-lg backdrop-blur-[20px] text-sm font-medium transition-all z-20"
        style={{
          background: 'rgba(15, 25, 35, 0.9)',
          border: '1px solid rgba(0, 229, 255, 0.4)',
          color: '#00E5FF',
          boxShadow: '0 4px 20px rgba(0, 229, 255, 0.2)',
        }}
      >
        {showMap ? '🎯 AR View' : '🗺️ Map View'}
      </button>

      <InfoButton onClick={() => setIsAboutOpen(true)} />
      <DestinationsButton onClick={() => setIsDestinationListOpen(true)} />
      
      {/* Updated Capture Button */}
      <button
        onClick={() => setIsCameraOpen(true)}
        className="absolute bottom-6 right-6 z-30 w-16 h-16 rounded-full backdrop-blur-[20px] flex items-center justify-center transition-all"
        style={{
          background: 'rgba(15, 25, 35, 0.9)',
          border: '1px solid rgba(0, 229, 255, 0.4)',
          boxShadow: '0 4px 20px rgba(0, 229, 255, 0.3)',
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
          <path d="M23 19a2 2 0 0 1-2h-3a2 2 0 0 1-2 0 0V5a2 2 0 0 1 2h-3a2 2 0 0 1 2 0v14a2 2 0 0 1-2h-3a2 2 0 0 1-2z" />
        </svg>
      </button>

      {/* Destination List Modal */}
      <DestinationList
        isOpen={isDestinationListOpen}
        onClose={() => setIsDestinationListOpen(false)}
        onSelectDestination={(destination) => {
          console.log('Selected destination:', destination);
          startNavigation(destination);
          setIsDestinationListOpen(false);
        }}
      />

      {/* Camera Capture Modal */}
      {isCameraOpen && (
        <CameraCapture
          onClose={() => setIsCameraOpen(false)}
          onCapture={handleCameraCapture}
        />
      )}

      {/* About Modal */}
      {isAboutOpen && (
        <AboutScreen
          onClose={() => setIsAboutOpen(false)}
        />
      )}

      {/* Distance Label */}
      <DistanceLabel />

      {/* Direction Arrow */}
      <DirectionArrow />

      {/* Debug Overlay */}
      <DebugOverlay />
    </div>
  );
}

export function MapMateApp() {
  return (
    <LocalizationProvider>
      <NavigationProvider>
        <MapMateAppContent />
      </NavigationProvider>
    </LocalizationProvider>
  );
}
