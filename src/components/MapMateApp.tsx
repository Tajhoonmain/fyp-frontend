import React, { useState } from 'react';
import { LocalizationProvider } from '@/contexts/LocalizationContext';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { ARView } from '@/components/ar/ARView';
import { DirectionArrow } from '@/components/ar/DirectionArrow';
import { DistanceLabel } from '@/components/ar/DistanceLabel';
import { TrackingIndicator } from '@/components/ar/TrackingIndicator';
import { CaptureButton } from '@/components/ar/CaptureButton';
import { DebugOverlay } from '@/components/ar/DebugOverlay';
import { DestinationList } from '@/components/modals/DestinationList';
import { AboutScreen } from '@/components/modals/AboutScreen';
import { DestinationsButton } from '@/components/controls/DestinationsButton';
import { InfoButton } from '@/components/controls/InfoButton';

export function MapMateApp() {
  const [isDestinationListOpen, setIsDestinationListOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <LocalizationProvider>
      <NavigationProvider>
        <div className="relative w-full h-screen overflow-hidden bg-[#0A0E14]">
          {/* AR Camera View */}
          <ARView />

          {/* Navigation Overlays */}
          <DirectionArrow />
          <DistanceLabel />

          {/* Status & Controls */}
          <TrackingIndicator />
          <InfoButton onClick={() => setIsAboutOpen(true)} />
          <DestinationsButton onClick={() => setIsDestinationListOpen(true)} />
          <CaptureButton />
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
