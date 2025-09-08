import React, { useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppStore } from '../../store/useAppStore';
import type { ChargingStation } from '../../types';
import { Button } from '@/components/ui/button';
import { MapPin, Zap, Building, Wrench } from 'lucide-react';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons based on station status and power
const createCustomIcon = (station: ChargingStation) => {
  const color = getStationColor(station);
  const iconHtml = `
    <div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: bold;
      color: white;
    ">
      ${station.plugCount}
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const getStationColor = (station: ChargingStation): string => {
  switch (station.status) {
    case 'available':
      return station.maxPower > 100 ? '#f97316' : '#22c55e'; // orange for high power, green for regular
    case 'in-use':
      return '#6b7280'; // gray
    case 'out-of-order':
      return '#ef4444'; // red
    case 'restricted':
      return '#9ca3af'; // light gray
    default:
      return '#22c55e';
  }
};

// Custom Legend Component
const MapLegend: React.FC<{ isVisible: boolean; onToggle: () => void }> = ({ isVisible, onToggle }) => {
  const legendItems = [
    { 
      id: 'available', 
      label: 'Available', 
      color: '#22c55e', 
      icon: MapPin,
      description: 'Station has available chargers'
    },
    { 
      id: 'highpower', 
      label: 'High Power (100kW+)', 
      color: '#f97316', 
      icon: Zap,
      description: 'Fast charging available'
    },
    { 
      id: 'inuse', 
      label: 'In Use', 
      color: '#6b7280', 
      icon: MapPin,
      description: 'All chargers currently occupied'
    },
    { 
      id: 'outoforder', 
      label: 'Out of Service', 
      color: '#ef4444', 
      icon: Wrench,
      description: 'Station temporarily unavailable'
    },
    { 
      id: 'restricted', 
      label: 'Restricted Access', 
      color: '#9ca3af', 
      icon: Building,
      description: 'Private or limited access'
    },
  ];

  return (
    <div className="absolute top-4 left-4 z-[1000]">
      <Button
        onClick={onToggle}
        variant="outline"
        size="sm"
        className="bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200 border-gray-200 font-medium"
      >
        <MapPin className="w-4 h-4 mr-2" />
        Legend
      </Button>
      
      {isVisible && (
        <div className="mt-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 p-4 min-w-[280px] animate-in slide-in-from-top-2 duration-200">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Station Status Legend
          </h3>
          <div className="space-y-3">
            {legendItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-1">
                <div 
                  className="w-5 h-5 rounded-full border-2 border-white shadow-sm flex items-center justify-center"
                  style={{ backgroundColor: item.color }}
                >
                  <item.icon className="w-3 h-3 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800 text-sm">{item.label}</div>
                  <div className="text-xs text-gray-600">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Numbers on markers indicate available charging ports
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export function MapComponent() {
  const { 
    filteredStations, 
    setSelectedStation, 
    mapCenter, 
    mapZoom, 
    setMapZoom,
    setMapBounds 
  } = useAppStore();
  
  const [legendVisible, setLegendVisible] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  const handleStationClick = (station: ChargingStation) => {
    setSelectedStation(station);
  };

  const handleMapEvents = (map: L.Map) => {
    mapRef.current = map;
    
    // Update bounds when map moves
    const updateBounds = () => {
      const bounds = map.getBounds();
      setMapBounds({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    };

    map.on('moveend', updateBounds);
    map.on('zoomend', () => {
      setMapZoom(map.getZoom());
      updateBounds();
    });

    // Initial bounds update
    updateBounds();
  };

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="w-full h-full"
        {...({ whenCreated: handleMapEvents } as unknown as Record<string, unknown>)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {filteredStations.map((station) => (
          <Marker
            key={station.id}
            position={[station.latitude, station.longitude]}
            icon={createCustomIcon(station)}
            eventHandlers={{
              click: () => handleStationClick(station),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-gray-800 mb-2">{station.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{station.address}</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getStationColor(station) }}
                    />
                    <span className="capitalize">{station.status.replace('-', ' ')}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{station.plugCount}</span> charging ports
                  </div>
                  <div className="text-sm text-gray-600">
                    Max Power: <span className="font-medium">{station.maxPower}kW</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    PlugScore: <span className="font-medium">{station.plugScore}/10</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => handleStationClick(station)}
                >
                  View Details
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Custom Legend */}
      <MapLegend 
        isVisible={legendVisible} 
        onToggle={() => setLegendVisible(!legendVisible)} 
      />

      {/* Station Count */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm shadow-lg z-[1000]">
        <span className="font-medium">{filteredStations.length}</span> Charging Locations
      </div>
    </div>
  );
}
