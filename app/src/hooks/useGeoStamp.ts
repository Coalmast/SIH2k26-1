import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { GeoStamp } from '../types/inspection.types';

export function useGeoStamp() {
  const [geoStamp, setGeoStamp] = useState<GeoStamp | null>(null);
  const [inBoundary, setInBoundary] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchLocation = useCallback(async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setGeoStamp({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: new Date(location.timestamp).toISOString(),
      });
      
      // TODO: Actual boundary checking against mine_boundary geojson
      setInBoundary(true); 
    } catch (error) {
      console.error('Error getting location', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocation();
    
    // Optional: set up a background interval to refresh every 30s if needed, 
    // but typically we just fetch once on mount or when refresh is called
  }, [fetchLocation]);

  return {
    lat: geoStamp?.lat ?? null,
    lng: geoStamp?.lng ?? null,
    accuracy: geoStamp?.accuracy ?? null,
    inBoundary,
    loading,
    refresh: fetchLocation,
  };
}
