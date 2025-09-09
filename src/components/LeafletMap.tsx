import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { LatLngExpression, DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom charging station icons
const createChargingIcon = (color: string): DivIcon => {
  return new L.DivIcon({
    html: `
      <div style="
        width: 24px; 
        height: 24px; 
        border-radius: 50%; 
        background-color: ${color}; 
        border: 3px solid white; 
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px; 
          height: 8px; 
          background-color: white; 
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
    className: 'custom-charging-icon'
  });
};

// User location icon
const createUserIcon = (): DivIcon => {
  return new L.DivIcon({
    html: `
      <div style="
        width: 20px; 
        height: 20px; 
        border-radius: 50%; 
        background-color: #3B82F6; 
        border: 3px solid white; 
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    className: 'custom-user-icon'
  });
};

// Station status colors
const getStationColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'available': return '#10B981'; // Green
    case 'in use': return '#F59E0B';    // Orange  
    case 'out of service': return '#EF4444'; // Red
    case 'unknown': return '#6B7280';   // Gray
    default: return '#10B981';
  }
};

interface Station {
  station_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  chargers?: Array<{
    current_status: string;
    plug_type: string;
    max_power_kw: number;
  }>;
}

interface LeafletMapProps {
  stations: Station[];
  userLocation?: { latitude: number; longitude: number } | null;
  onStationClick?: (station: Station) => void;
  className?: string;
}

// Component to handle map interactions
const MapController = ({ stations }: { stations: Station[] }) => {
  const map = useMap();

  useEffect(() => {
    if (stations.length > 0) {
      const bounds = L.latLngBounds(
        stations.map(station => [station.latitude, station.longitude] as LatLngExpression)
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [stations, map]);

  return null;
};

export const LeafletMap = ({ stations, userLocation, onStationClick, className = "" }: LeafletMapProps) => {
  // Default center (San Francisco Bay Area)
  const defaultCenter: LatLngExpression = [37.7749, -122.4194];
  const center: LatLngExpression = userLocation 
    ? [userLocation.latitude, userLocation.longitude]
    : defaultCenter;

  return (
    <div className={`w-full h-full ${className}`}>
      <MapContainer
        center={center}
        zoom={12}
        className="w-full h-full rounded-lg"
        scrollWheelZoom={true}
      >
        {/* Free OpenStreetMap tiles */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* User location marker */}
        {userLocation && (
          <Marker 
            position={[userLocation.latitude, userLocation.longitude]}
            icon={createUserIcon()}
          >
            <Popup>
              <div className="text-center">
                <strong>Your Location</strong>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Charging station markers */}
        {stations.map((station) => {
          const chargers = Array.isArray(station.chargers) ? station.chargers : [];
          const availableChargers = chargers.filter(c => 
            c?.current_status?.toLowerCase() === 'available'
          ).length;
          
          const status = availableChargers > 0 ? 'available' : 
                        chargers.some(c => c?.current_status?.toLowerCase() === 'in use') ? 'in use' :
                        'out of service';
          
          const maxPower = chargers.length > 0
            ? Math.max(...chargers.map(c => c?.max_power_kw || 0))
            : 0;
          
          return (
            <Marker
              key={station.station_id}
              position={[station.latitude, station.longitude]}
              icon={createChargingIcon(getStationColor(status))}
              eventHandlers={{
                click: () => onStationClick?.(station)
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-semibold text-sm mb-1">{station.name}</h3>
                  <p className="text-xs text-gray-600 mb-2">{station.address}</p>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Available:</span>
                      <span className="font-medium">{availableChargers}/{chargers.length}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Max Power:</span>
                      <span className="font-medium">{maxPower} kW</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Status:</span>
                      <span className={`font-medium ${
                        status === 'available' ? 'text-green-600' :
                        status === 'in use' ? 'text-orange-600' : 
                        'text-red-600'
                      }`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {chargers.length > 0 && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs font-medium mb-1">Chargers:</p>
                      {chargers.slice(0, 3).map((charger, idx) => (
                        <div key={idx} className="text-xs flex justify-between">
                          <span>{charger.plug_type}</span>
                          <span>{charger.max_power_kw}kW</span>
                        </div>
                      ))}
                      {chargers.length > 3 && (
                        <p className="text-xs text-gray-500">+{chargers.length - 3} more</p>
                      )}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        <MapController stations={stations} />
      </MapContainer>
    </div>
  );
};