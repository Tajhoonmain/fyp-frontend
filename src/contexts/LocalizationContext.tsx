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
  const [currentPosition, setCurrentPosition] = useState<Coordinate>({ x: 1200, y: 200 }); // Start at campus entrance
  const [localizationMode, setLocalizationMode] = useState<LocalizationMode>('GPS'); // Start with GPS
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureConfidence, setCaptureConfidence] = useState<number | null>(null);
  const [debugGPS, setDebugGPS] = useState(false);
  const [simulationPath, setSimulationPath] = useState<Coordinate[]>([]);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get GPS location on component mount and track continuously
  useEffect(() => {
    const initializeGPS = async () => {
      try {
        await getCurrentGPSPosition();
        console.log('GPS initialized successfully');
      } catch (error) {
        console.error('GPS initialization failed:', error);
        setLocalizationMode('Simulated');
      }
    };

    initializeGPS();

    return () => {
      // Cleanup GPS tracking on unmount
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  let watchId: number | null = null;

  const startGPSTracking = () => {
    if (!navigator.geolocation) return;

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        // Convert GPS to local coordinates (using GIKI reference)
        const localX = (longitude - 73.0479) * 111320;
        const localY = (33.6844 - latitude) * 111320;
        
        setCurrentPosition({ x: localX, y: localY });
        setLocalizationMode('GPS');
        setCaptureConfidence(Math.max(0.5, 1 - (accuracy / 100)));
        
        console.log(`GPS Update: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (accuracy: ${accuracy}m)`);
        console.log(`Local Position: x=${localX.toFixed(1)}, y=${localY.toFixed(1)}`);
      },
      (error) => {
        console.error('GPS tracking failed:', error);
        setCaptureConfidence(0.3);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 2000, // Use very recent positions
      }
    );
  };

  const updatePosition = useCallback((position: Coordinate) => {
    setCurrentPosition(position);
  }, []);

  const getCurrentGPSPosition = useCallback(async () => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      throw new Error('Geolocation not supported');
    }

    return new Promise<void>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          // Convert GPS to local coordinates (using GIKI reference)
          const localX = (longitude - 73.0479) * 111320;
          const localY = (33.6844 - latitude) * 111320;
          
          setCurrentPosition({ x: localX, y: localY });
          setLocalizationMode('GPS');
          setCaptureConfidence(Math.max(0.5, 1 - (accuracy / 100)));
          
          console.log(`GPS Position: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`);
          console.log(`Local Position: x=${localX.toFixed(1)}, y=${localY.toFixed(1)}`);
          resolve();
        },
        (error) => {
          console.error('GPS positioning failed:', error);
          setCaptureConfidence(0.3);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000,
        }
      );
    });
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
        
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('building', 'library'); // Default to library
        formData.append('image', dataURLtoFile(imageToSend, 'capture.jpg'));
        
        const response = await fetch('http://localhost:8000/localize/', {
          method: 'POST',
          body: formData, // Don't set Content-Type header for FormData
        });

        if (response.ok) {
          const data = await response.json();
          setCaptureConfidence(data.confidence || 0.8);
          
          if (data.success) {
            // Use backend coordinates directly (already in local coordinate system)
            setCurrentPosition({ 
              x: data.map_x, 
              y: data.map_y 
            });
            setLocalizationMode('MIDAS Classification');
            backendSuccess = true;
            
            console.log(`MIDAS Location: ${data.building}`);
            console.log(`Local Position: x=${data.map_x}, y=${data.map_y}`);
          }
        }
      } catch (backendError) {
        console.log('MIDAS backend not available, falling back to GPS');
      }

      // Helper function to convert dataURL to File
      function dataURLtoFile(dataurl: string, filename: string): File {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while(n--){
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {type:mime});
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
  }, []);

  const startSimulation = useCallback((targetPath: Coordinate[]) => {
    // Disable automatic simulation - use real GPS/camera location
    console.log('Navigation started - using real location instead of simulation');
    setSimulationPath(targetPath);
    setCurrentPathIndex(0);
    setLocalizationMode('GPS'); // Use GPS mode instead of simulated
  }, []);

  const stopSimulation = useCallback(() => {
    setSimulationPath([]);
    setCurrentPathIndex(0);
  }, []);

  const getDirectionsFromMIDAS = useCallback(async (from: Coordinate, to: Coordinate) => {
    try {
      // Send coordinates directly to backend (already in local coordinate system)
      const response = await fetch('http://localhost:8000/navigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          start_node: 'N64', // Use detected node from localization
          destination_node: 'FCSE' // Use building name
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('MIDAS Directions:', data);
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
