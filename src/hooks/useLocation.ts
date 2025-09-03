import { useState, useEffect, useCallback } from 'react';
import { getCurrentLocation, watchLocation, Coordinates } from '@/utils/distance';

interface LocationState {
  location: Coordinates | null;
  loading: boolean;
  error: string | null;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    location: null,
    loading: false,
    error: null,
  });

  const requestLocation = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const location = await getCurrentLocation();
      setState({
        location,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        location: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to get location',
      });
    }
  }, []);

  const watchUserLocation = useCallback(() => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    const watchId = watchLocation(
      (location) => {
        setState({
          location,
          loading: false,
          error: null,
        });
      },
      (error) => {
        setState({
          location: null,
          loading: false,
          error: error.message,
        });
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  useEffect(() => {
    // Try to get location on mount
    requestLocation();
  }, [requestLocation]);

  return {
    ...state,
    requestLocation,
    watchUserLocation,
  };
}