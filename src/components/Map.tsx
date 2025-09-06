import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Coordinates, calculateDistance } from '@/utils/distance';

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
  showAvailableOnly: boolean;
  userLocation: Coordinates | null;
  onStationClick: (station: Station) => void;
}

const Map: React.FC<MapProps> = ({ stations, selectedPlugTypes, showAvailableOnly, userLocation, onStationClick }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN; // Get token from environment variables

  const getStationPinStyle = (station: Station) => {
    const relevantChargers = station.chargers.filter(charger =>
      selectedPlugTypes.length === 0 || selectedPlugTypes.includes(charger.plug_type)
    );
    
    if (relevantChargers.length === 0) return { color: '#6b7280', size: 16, isGolden: false, powerLevel: 'none' };

    // Check for golden pin (95%+ uptime simulation - would be based on real data)
    const isGolden = station.station_id.endsWith('1') || station.station_id.endsWith('3'); // Simulated
    
    // Determine max power level for pin size and style
    const maxPower = Math.max(...relevantChargers.map(c => c.max_power_kw));
    let powerLevel = 'level2';
    let size = 16;
    
    if (maxPower >= 150) {
      powerLevel = 'ultra';
      size = 24;
    } else if (maxPower >= 50) {
      powerLevel = 'fast';
      size = 20;
    }

    // Check availability status for color
    const hasOutOfService = relevantChargers.some(c => c.current_status === 'Out of Service');
    const allInUse = relevantChargers.every(c => c.current_status === 'In Use');
    const hasAvailable = relevantChargers.some(c => c.current_status === 'Available');
    
    let color = '#6b7280'; // default gray
    
    if (hasOutOfService) {
      color = '#dc2626'; // red
    } else if (allInUse) {
      color = '#2563eb'; // blue
    } else if (hasAvailable) {
      color = powerLevel === 'level2' ? '#ea580c' : '#16a34a'; // orange for Level 2, green for DC
    }

    return { color, size, isGolden, powerLevel };
  };

  const createAdvancedMarkerElement = useCallback((station: Station) => {
    const { color, size, isGolden, powerLevel } = getStationPinStyle(station);
    
    const el = document.createElement('div');
    el.className = 'advanced-marker';
    
    // Create the main pin element
    const pin = document.createElement('div');
    pin.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      background-color: ${color};
      border: 3px solid white;
      border-radius: ${powerLevel === 'level2' ? '50%' : '20%'};
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      position: relative;
      z-index: 10;
    `;
    
    // Add golden glow for trusted stations
    if (isGolden) {
      const glow = document.createElement('div');
      glow.style.cssText = `
        position: absolute;
        inset: -8px;
        background: linear-gradient(135deg, #fbbf24, #f59e0b);
        border-radius: 50%;
        opacity: 0.6;
        z-index: -1;
        animation: pulse 2s ease-in-out infinite;
      `;
      pin.appendChild(glow);
    }
    
    // Add ultra-fast glow for 150kW+ chargers
    if (powerLevel === 'ultra') {
      const ultraGlow = document.createElement('div');
      ultraGlow.style.cssText = `
        position: absolute;
        inset: -6px;
        background: radial-gradient(circle, rgba(34, 197, 94, 0.4) 0%, transparent 70%);
        border-radius: 20%;
        z-index: -1;
        animation: pulse 3s ease-in-out infinite;
      `;
      pin.appendChild(ultraGlow);
    }
    
    // Add availability status icon overlay
    const relevantChargers = station.chargers.filter(charger =>
      selectedPlugTypes.length === 0 || selectedPlugTypes.includes(charger.plug_type)
    );
    
    const statusIcon = document.createElement('div');
    statusIcon.style.cssText = `
      position: absolute;
      top: -6px;
      right: -6px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8px;
      font-weight: bold;
      z-index: 20;
    `;
    
    const hasAvailable = relevantChargers.some(c => c.current_status === 'Available');
    const allInUse = relevantChargers.every(c => c.current_status === 'In Use');
    const hasOutOfService = relevantChargers.some(c => c.current_status === 'Out of Service');
    
    if (hasAvailable) {
      statusIcon.style.backgroundColor = '#16a34a';
      statusIcon.textContent = '✓';
      statusIcon.style.color = 'white';
    } else if (allInUse) {
      statusIcon.style.backgroundColor = '#ea580c';
      statusIcon.textContent = '⏳';
      statusIcon.style.color = 'white';
    } else if (hasOutOfService) {
      statusIcon.style.backgroundColor = '#dc2626';
      statusIcon.textContent = '✕';
      statusIcon.style.color = 'white';
    }
    
    pin.appendChild(statusIcon);
    el.appendChild(pin);
    
    // Add hover effects
    el.addEventListener('mouseenter', () => {
      pin.style.transform = 'scale(1.2) translateY(-3px)';
      pin.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
    });
    
    el.addEventListener('mouseleave', () => {
      pin.style.transform = 'scale(1) translateY(0)';
      pin.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    });
    
    return el;
  }, [selectedPlugTypes, showAvailableOnly]); // Added dependencies

  const initializeMap = () => {
    if (!mapContainer.current || map.current) return;

    if (!mapboxToken) {
      console.error("Mapbox token is missing. Please set VITE_MAPBOX_TOKEN in your .env file.");
      return;
    }

    mapboxgl.accessToken = mapboxToken;
    
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

  const updateMarkers = useCallback(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Filter stations based on plug type and availability selection
    const filteredStations = stations.filter(station => {
      // Filter by plug type
      const hasMatchingPlugType = selectedPlugTypes.length === 0 || 
        station.chargers.some(charger => selectedPlugTypes.includes(charger.plug_type));
      
      if (!hasMatchingPlugType) return false;
      
      // Filter by availability if enabled
      if (showAvailableOnly) {
        const relevantChargers = station.chargers.filter(charger =>
          selectedPlugTypes.length === 0 || selectedPlugTypes.includes(charger.plug_type)
        );
        return relevantChargers.some(charger => charger.current_status === 'Available');
      }
      
      return true;
    });

    // Add new markers with enhanced styling
    filteredStations.forEach(station => {
      const markerElement = createAdvancedMarkerElement(station);
      
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([station.longitude, station.latitude])
        .addTo(map.current!);

      markerElement.addEventListener('click', () => {
        onStationClick(station);
      });

      markers.current.push(marker);
    });
  }, [stations, selectedPlugTypes, showAvailableOnly, onStationClick, createAdvancedMarkerElement]);

  useEffect(() => {
    if (mapboxToken) {
      initializeMap();
    }
  }, [mapboxToken]); // Initialize map when token is available

  useEffect(() => {
    updateMarkers();
  }, [stations, selectedPlugTypes, showAvailableOnly, updateMarkers]);

  if (!mapboxToken) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-muted">
        <Card className="p-6 max-w-md w-full mx-4">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Mapbox Token Required</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            To display the map, please set your Mapbox public token in the `.env.local` file.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertCircle className="h-3 w-3" />
            <span>Get your token at mapbox.com</span>
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