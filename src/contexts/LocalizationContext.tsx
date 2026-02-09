import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Coordinate, LocalizationMode, BackendLocalizationResponse } from '@/types/navigation';
import { defaultStartPosition } from '@/data/destinations';
import { moveTowardsPoint } from '@/utils/navigation';

interface LocalizationContextType {
  currentPosition: Coordinate;
  localizationMode: LocalizationMode;
  isCapturing: boolean;
  captureConfidence: number | null;
  debugGPS: boolean;
  setLocalizationMode: (mode: LocalizationMode) => void;
  updatePosition: (position: Coordinate) => void;
  captureAndLocalize: (imageData?: string) => Promise<void>;
  startSimulation: (targetPath: Coordinate[]) => void;
  stopSimulation: () => void;
  toggleDebugGPS: () => void;
  getCurrentGPSPosition: () => Promise<void>;
  getDirectionsFromMIDAS: (from: Coordinate, to: Coordinate) => Promise<any>;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export function LocalizationProvider({ children }: { children: React.ReactNode }) {
  const [currentPosition, setCurrentPosition] = useState<Coordinate>({ x: 10, y: 10 }); // Start slightly away from origin
  const [localizationMode, setLocalizationMode] = useState<LocalizationMode>('Simulated');
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureConfidence, setCaptureConfidence] = useState<number | null>(null);
  const [debugGPS, setDebugGPS] = useState(false);
  const [simulationPath, setSimulationPath] = useState<Coordinate[]>([]);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const updatePosition = useCallback((position: Coordinate) => {
    setCurrentPosition(position);
  }, []);

  const getCurrentGPSPosition = useCallback(async () => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        });
      });

      const { latitude, longitude, accuracy } = position.coords;
      
      // Convert GPS coordinates to local coordinate system
      // This is a simplified conversion - you'll need to adjust based on your map's coordinate system
      const localX = (longitude - 73.0479) * 111320; // Approximate conversion to meters
      const localY = (33.6844 - latitude) * 111320; // Approximate conversion to meters
      
      setCurrentPosition({ x: localX, y: localY });
      setLocalizationMode('GPS');
      setCaptureConfidence(Math.max(0.5, 1 - (accuracy / 100))); // Confidence based on GPS accuracy
      
      console.log(`GPS Position: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`);
    } catch (error) {
      console.error('GPS positioning failed:', error);
      // Fallback to simulated position with lower confidence
      setCaptureConfidence(0.3);
    }
  }, []);

  const captureAndLocalize = useCallback(async (imageData?: string) => {
    setIsCapturing(true);
    setCaptureConfidence(null);

    try {
      // Simulate camera capture delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Try MIDAS backend for location classification
      let backendSuccess = false;
      
      try {
        // Use provided image data or mock data
        const imageToSend = imageData || "base64_encoded_image_data";
        
        const response = await fetch('http://localhost:8000/api/classify-location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageToSend }),
        });

        if (response.ok) {
          const data = await response.json();
          setCaptureConfidence(data.confidence);
          
          if (data.confidence >= 0.6) {
            // Convert GPS to local coordinates
            const localX = (data.coordinates.lng - 73.0479) * 111320;
            const localY = (33.6844 - data.coordinates.lat) * 111320;
            
            setCurrentPosition({ x: localX, y: localY });
            setLocalizationMode('MIDAS Classification');
            backendSuccess = true;
          }
        }
      } catch (backendError) {
        console.log('MIDAS backend not available, falling back to GPS');
      }

      // Fallback to GPS if MIDAS failed
      if (!backendSuccess) {
        await getCurrentGPSPosition();
      }
    } catch (error) {
      console.error('Location classification failed:', error);
      // Final fallback to GPS
      await getCurrentGPSPosition();
    } finally {
      setIsCapturing(false);
      setTimeout(() => setCaptureConfidence(null), 3000);
    }
  }, [currentPosition]);

  const startSimulation = useCallback((targetPath: Coordinate[]) => {
    setSimulationPath(targetPath);
    setCurrentPathIndex(0);
    setLocalizationMode('Simulated');
  }, []);

  const stopSimulation = useCallback(() => {
    setSimulationPath([]);
    setCurrentPathIndex(0);
  }, []);

  const getDirectionsFromMIDAS = useCallback(async (from: Coordinate, to: Coordinate) => {
    try {
      // Convert local coordinates back to GPS for backend
      const fromGPS = {
        lat: 33.6844 - (from.y / 111320),
        lng: 73.0479 + (from.x / 111320)
      };
      const toGPS = {
        lat: 33.6844 - (to.y / 111320),
        lng: 73.0479 + (to.x / 111320)
      };

      const response = await fetch('http://localhost:8000/api/get-directions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: fromGPS, to: toGPS }),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error('Failed to get directions from MIDAS:', error);
      return null;
    }
  }, []);

  const toggleDebugGPS = useCallback(() => {
    setDebugGPS(prev => !prev);
  }, []);

  // Simulation loop
  useEffect(() => {
    if (simulationPath.length === 0 || currentPathIndex >= simulationPath.length) {
      return;
    }

    const interval = setInterval(() => {
      const targetWaypoint = simulationPath[currentPathIndex];
      const newPosition = moveTowardsPoint(currentPosition, targetWaypoint, 2);
      setCurrentPosition(newPosition);

      // Check if reached current waypoint
      const dx = targetWaypoint.x - newPosition.x;
      const dy = targetWaypoint.y - newPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 1) {
        setCurrentPathIndex(prev => prev + 1);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [simulationPath, currentPathIndex, currentPosition]);

  return (
    <LocalizationContext.Provider
      value={{
        currentPosition,
        localizationMode,
        isCapturing,
        captureConfidence,
        debugGPS,
        setLocalizationMode,
        updatePosition,
        captureAndLocalize,
        startSimulation,
        stopSimulation,
        toggleDebugGPS,
        getCurrentGPSPosition,
        getDirectionsFromMIDAS,
      }}
    >
      {children}
    </LocalizationContext.Provider>
  );
}

export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within LocalizationProvider');
  }
  return context;
}
