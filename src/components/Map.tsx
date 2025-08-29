import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Station {
  station_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  chargers: Array<{
    charger_id: string;
    plug_type: string;
    max_power_kw: number;
    current_status: string;
    last_update_timestamp: string;
  }>;
}

interface MapProps {
  stations: Station[];
  selectedPlugTypes: string[];
  onStationClick: (station: Station) => void;
}

const Map: React.FC<MapProps> = ({ stations, selectedPlugTypes, onStationClick }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState(true);

  const getStationPinColor = (station: Station) => {
    const relevantChargers = station.chargers.filter(charger =>
      selectedPlugTypes.length === 0 || selectedPlugTypes.includes(charger.plug_type)
    );
    
    if (relevantChargers.length === 0) return '#6b7280'; // Gray if no relevant chargers

    // Check if any charger is out of service
    if (relevantChargers.some(c => c.current_status === 'Out of Service')) {
      return '#dc2626'; // Red
    }

    // Check if all chargers are in use
    if (relevantChargers.every(c => c.current_status === 'In Use')) {
      return '#2563eb'; // Blue
    }

    // Check if any charger is available
    if (relevantChargers.some(c => c.current_status === 'Available')) {
      return '#16a34a'; // Green
    }

    // Check if data is stale (older than 6 hours)
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    if (relevantChargers.some(c => new Date(c.last_update_timestamp) < sixHoursAgo)) {
      return '#6b7280'; // Gray
    }

    return '#6b7280'; // Default gray
  };

  const createMarkerElement = (color: string) => {
    const el = document.createElement('div');
    el.className = 'marker';
    el.style.cssText = `
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: ${color};
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      cursor: pointer;
      transition: transform 0.2s ease;
    `;
    
    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.2)';
    });
    
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1)';
    });
    
    return el;
  };

  const initializeMap = (token: string) => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = token;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-122.4194, 37.7749], // San Francisco default
      zoom: 12,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Get user location and center map
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.current?.setCenter([longitude, latitude]);
          
          // Add user location marker
          new mapboxgl.Marker({ color: '#3b82f6' })
            .setLngLat([longitude, latitude])
            .addTo(map.current!);
        },
        (error) => {
          console.warn('Could not get user location:', error);
        }
      );
    }

    updateMarkers();
  };

  const updateMarkers = () => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Filter stations based on plug type selection
    const filteredStations = stations.filter(station => {
      if (selectedPlugTypes.length === 0) return true;
      return station.chargers.some(charger => 
        selectedPlugTypes.includes(charger.plug_type)
      );
    });

    // Add new markers
    filteredStations.forEach(station => {
      const color = getStationPinColor(station);
      const markerElement = createMarkerElement(color);
      
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([station.longitude, station.latitude])
        .addTo(map.current!);

      markerElement.addEventListener('click', () => {
        onStationClick(station);
      });

      markers.current.push(marker);
    });
  };

  useEffect(() => {
    updateMarkers();
  }, [stations, selectedPlugTypes]);

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      setShowTokenInput(false);
      initializeMap(mapboxToken);
    }
  };

  if (showTokenInput) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-muted">
        <Card className="p-6 max-w-md w-full mx-4">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Mapbox Token Required</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            To display the map, please enter your Mapbox public token.
          </p>
          <div className="space-y-3">
            <Input
              type="text"
              placeholder="pk.eyJ1IjoibXl1c2VybmFtZS..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTokenSubmit()}
            />
            <Button onClick={handleTokenSubmit} className="w-full">
              Load Map
            </Button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <AlertCircle className="h-3 w-3" />
              <span>Get your token at mapbox.com</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
    </div>
  );
};

export default Map;