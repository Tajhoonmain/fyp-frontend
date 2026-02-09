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
  const { currentPosition, startSimulation, stopSimulation } = useLocalization();
  const [navigationState, setNavigationState] = useState<NavigationState>({
    isNavigating: false,
    currentDestination: null,
    currentWaypointIndex: 0,
    distanceToWaypoint: 0,
    hasArrived: false,
  });

  const startNavigation = useCallback((destination: Destination) => {
    setNavigationState({
      isNavigating: true,
      currentDestination: destination,
      currentWaypointIndex: 0,
      distanceToWaypoint: 0,
      hasArrived: false,
    });
    startSimulation(destination.waypoints);
  }, [startSimulation]);

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

  // Update navigation state based on position
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
  }, [currentPosition, navigationState]);

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
