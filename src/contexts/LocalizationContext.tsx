import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  captureAndLocalize: () => Promise<void>;
  startSimulation: (targetPath: Coordinate[]) => void;
  stopSimulation: () => void;
  toggleDebugGPS: () => void;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export function LocalizationProvider({ children }: { children: React.ReactNode }) {
  const [currentPosition, setCurrentPosition] = useState<Coordinate>(defaultStartPosition);
  const [localizationMode, setLocalizationMode] = useState<LocalizationMode>('Simulated');
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureConfidence, setCaptureConfidence] = useState<number | null>(null);
  const [debugGPS, setDebugGPS] = useState(false);
  const [simulationPath, setSimulationPath] = useState<Coordinate[]>([]);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);

  const updatePosition = useCallback((position: Coordinate) => {
    setCurrentPosition(position);
  }, []);

  const captureAndLocalize = useCallback(async () => {
    setIsCapturing(true);
    setCaptureConfidence(null);

    try {
      // Simulate camera capture delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Simulate backend call
      const response = await fetch('/api/localize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frame: 'simulated_frame_data' }),
      }).catch(() => {
        // If backend not available, simulate response
        return {
          ok: true,
          json: async () => ({
            x: currentPosition.x + (Math.random() - 0.5) * 10,
            y: currentPosition.y + (Math.random() - 0.5) * 10,
            building: 'FCSE',
            confidence: 0.65 + Math.random() * 0.3,
          }),
        };
      });

      if (response.ok) {
        const data: BackendLocalizationResponse = await response.json();
        setCaptureConfidence(data.confidence);
        
        if (data.confidence >= 0.6) {
          setCurrentPosition({ x: data.x, y: data.y });
          setLocalizationMode('Backend CV');
        }
      }
    } catch (error) {
      console.error('Localization failed:', error);
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
