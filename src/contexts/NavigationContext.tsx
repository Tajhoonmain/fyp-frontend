import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Destination, NavigationState } from '@/types/navigation';
import { calculateDistance } from '@/utils/navigation';
import { useLocalization } from './LocalizationContext';

interface NavigationContextType extends NavigationState {
  startNavigation: (destination: Destination) => void;
  stopNavigation: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const { currentPosition, startSimulation, stopSimulation, getDirectionsFromMIDAS } = useLocalization();
  const [navigationState, setNavigationState] = useState<NavigationState>({
    isNavigating: false,
    currentDestination: null,
    currentWaypointIndex: 0,
    distanceToWaypoint: 0,
    hasArrived: false,
  });

  const startNavigation = useCallback(async (destination: Destination) => {
    setNavigationState({
      isNavigating: true,
      currentDestination: destination,
      currentWaypointIndex: 0,
      distanceToWaypoint: 0,
      hasArrived: false,
    });

    // Try to get directions from MIDAS backend
    try {
      const directions = await getDirectionsFromMIDAS(currentPosition, destination.coordinate);
      
      if (directions && directions.path) {
        console.log('Using MIDAS backend directions:', directions.path);
        // Don't use simulation - let real GPS/position tracking handle movement
        // Just store the path for reference
        console.log('Navigation started - using real location tracking');
      } else {
        console.log('MIDAS backend unavailable, using predefined waypoints');
        // Fallback to predefined waypoints
        console.log('Navigation started - using real location tracking');
      }
    } catch (error) {
      console.error('Failed to get MIDAS directions, using fallback:', error);
      console.log('Navigation started - using real location tracking');
    }
  }, [currentPosition, getDirectionsFromMIDAS]);

  const stopNavigation = useCallback(() => {
    setNavigationState({
      isNavigating: false,
      currentDestination: null,
      currentWaypointIndex: 0,
      distanceToWaypoint: 0,
      hasArrived: false,
    });
    stopSimulation();
  }, [stopSimulation]);

  // Update navigation state based on REAL position (no simulation)
  useEffect(() => {
    if (!navigationState.isNavigating || !navigationState.currentDestination) {
      return;
    }

    const { currentDestination, currentWaypointIndex } = navigationState;
    const waypoints = currentDestination.waypoints;

    if (currentWaypointIndex >= waypoints.length) {
      // Arrived at destination
      setNavigationState(prev => ({
        ...prev,
        hasArrived: true,
        distanceToWaypoint: 0,
      }));
      return;
    }

    const currentWaypoint = waypoints[currentWaypointIndex];
    const distance = calculateDistance(currentPosition, currentWaypoint);

    setNavigationState(prev => ({
      ...prev,
      distanceToWaypoint: distance,
    }));

    // Check if reached current waypoint (within 3 units)
    if (distance < 3) {
      const nextIndex = currentWaypointIndex + 1;
      if (nextIndex >= waypoints.length) {
        // Reached final destination
        setNavigationState(prev => ({
          ...prev,
          hasArrived: true,
          currentWaypointIndex: nextIndex,
        }));
      } else {
        // Move to next waypoint
        setNavigationState(prev => ({
          ...prev,
          currentWaypointIndex: nextIndex,
        }));
      }
    }
  }, [currentPosition, navigationState.isNavigating, navigationState.currentDestination, navigationState.currentWaypointIndex]);

  return (
    <NavigationContext.Provider
      value={{
        ...navigationState,
        startNavigation,
        stopNavigation,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}
