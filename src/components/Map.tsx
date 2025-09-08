import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Coordinates, calculateDistance } from '@/utils/distance';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
  panTo?: { latitude: number; longitude: number } | null;
}

// Create custom station icons based on power and status
const createStationIcon = (station: Station, selectedPlugTypes: string[], showAvailableOnly: boolean) => {
    // Safety check: ensure chargers array exists
    if (!station.chargers || !Array.isArray(station.chargers)) {
    return null;
    }
    
    const relevantChargers = station.chargers.filter(charger =>
      charger && charger.plug_type && (selectedPlugTypes.length === 0 || selectedPlugTypes.includes(charger.plug_type))
    );
    
  if (relevantChargers.length === 0) return null;

  // Determine station type and styling
    const validPowers = relevantChargers
      .map(c => c.max_power_kw)
      .filter(power => typeof power === 'number' && !isNaN(power));
      
    const maxPower = validPowers.length > 0 ? Math.max(...validPowers) : 0;
    const hasOutOfService = relevantChargers.some(c => c && c.current_status === 'Out of Service');
    const allInUse = relevantChargers.every(c => c && c.current_status === 'In Use');
    const hasAvailable = relevantChargers.some(c => c && c.current_status === 'Available');
    
    // Simple color coding based on power and status
    let color = '#22c55e'; // Default: Green
  let size = 25;
    
    // High Power stations (150kW+) - Orange
    if (maxPower >= 150) {
      color = '#f97316'; // Orange
    size = 30;
    }
    // Fast charging (50kW+) - Orange
    else if (maxPower >= 50) {
      color = '#f97316'; // Orange  
    size = 28;
    }
    
    // Override colors based on status
    if (hasOutOfService) {
    color = '#ef4444'; // Red
    } else if (allInUse) {
    color = '#eab308'; // Yellow
  }

  // Filter for availability if needed
  if (showAvailableOnly && !hasAvailable) {
    return null;
  }

  return new L.DivIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
      width: ${size}px;
      height: ${size}px;
        border-radius: 50%;
      background-color: ${color};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
      ">
        ⚡
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

const Map: React.FC<MapProps> = ({ stations, selectedPlugTypes, showAvailableOnly, userLocation, onStationClick, panTo }) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]); // San Francisco default
  const [mapZoom, setMapZoom] = useState(12);

  // Update map center when user location is available
  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.latitude, userLocation.longitude]);
      setMapZoom(13);
    }
  }, [userLocation]);

  // Handle panTo prop
  useEffect(() => {
    if (panTo) {
      setMapCenter([panTo.latitude, panTo.longitude]);
      setMapZoom(15);
    }
  }, [panTo]);

  // Filter stations for display
    const filteredStations = stations.filter(station => {
    if (!station || !station.chargers || !Array.isArray(station.chargers)) {
        return false;
      }
      
        const relevantChargers = station.chargers.filter(charger =>
          charger && charger.plug_type && (selectedPlugTypes.length === 0 || selectedPlugTypes.includes(charger.plug_type))
        );

    if (relevantChargers.length === 0) return false;

    if (showAvailableOnly) {
        return relevantChargers.some(charger => charger && charger.current_status === 'Available');
      }
      
      return true;
    });

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
        key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`} // Force re-render when center changes
      >
        {/* OpenStreetMap tiles - completely free, no API key needed */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        {userLocation && (
          <Marker 
            position={[userLocation.latitude, userLocation.longitude]}
            icon={new L.DivIcon({
              className: 'user-location-icon',
              html: `
                <div style="
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background-color: #3b82f6;
                  border: 3px solid white;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                "></div>
              `,
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })}
          >
            <Popup>
              <div className="text-center">
                <MapPin className="h-4 w-4 mx-auto mb-1" />
                <p className="text-sm font-medium">Your Location</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Station markers */}
        {filteredStations.map(station => {
          const icon = createStationIcon(station, selectedPlugTypes, showAvailableOnly);
          if (!icon) return null;

          return (
            <Marker
              key={station.station_id}
              position={[station.latitude, station.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => onStationClick(station)
              }}
            >
              <Popup>
                <div className="min-w-[250px] p-2">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm">{station.name}</h3>
                    <Badge variant="outline" className="ml-2">
                      {station.chargers?.length || 0} chargers
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-3">{station.address}</p>
                  
                  {station.chargers && station.chargers.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium">Available Chargers:</h4>
                      <div className="space-y-1">
                        {station.chargers.slice(0, 3).map(charger => (
                          <div key={charger.charger_id} className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              {charger.plug_type}
                            </span>
                            <span className="flex items-center gap-1">
                              {charger.max_power_kw}kW
                              <Badge 
                                variant={charger.current_status === 'Available' ? 'default' : 'secondary'}
                                className="text-xs px-1 py-0"
                              >
                                {charger.current_status}
                              </Badge>
                            </span>
                          </div>
                        ))}
                        {station.chargers.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{station.chargers.length - 3} more chargers
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {userLocation && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        📍 {calculateDistance(userLocation, {
                          latitude: station.latitude,
                          longitude: station.longitude
                        }).toFixed(1)} km away
                      </p>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default Map;