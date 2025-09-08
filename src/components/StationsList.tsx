import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Zap, Clock, AlertTriangle, Navigation } from 'lucide-react';
import { Coordinates, calculateDistance, formatDistance } from '@/utils/distance';
// removed unused imports
// directions and analytics imported where needed

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
    last_verified_at?: string;
    verification_count?: number;
    rating_score?: number;
    rating_count?: number;
  }>;
}

interface StationsListProps {
  stations: Station[];
  selectedPlugTypes: string[];
  showAvailableOnly: boolean;
  userLocation: Coordinates | null;
  onStationClick: (station: Station) => void;
}

const StationsList: React.FC<StationsListProps> = ({ 
  stations, 
  selectedPlugTypes, 
  showAvailableOnly,
  userLocation,
  onStationClick 
}) => {
  // analytics disabled for now

  // directions handled where needed

  const handleStationClick = (station: Station) => {
    onStationClick(station);
  };

  // Safety check for stations array
  if (!stations || !Array.isArray(stations)) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>No station data available</p>
      </div>
    );
  }

  // Filter stations based on plug type and availability selection
  const filteredStations = stations.filter(station => {
    // Safety check: ensure station has valid chargers array
    if (!station || !station.chargers || !Array.isArray(station.chargers) || station.chargers.length === 0) {
      return false;
    }
    
    // Filter by plug type
    const hasMatchingPlugType = selectedPlugTypes.length === 0 || 
      station.chargers.some(charger => charger && charger.plug_type && selectedPlugTypes.includes(charger.plug_type));
    
    if (!hasMatchingPlugType) return false;
    
    // Filter by availability if enabled
    if (showAvailableOnly) {
      const relevantChargers = station.chargers.filter(charger =>
        charger && charger.plug_type && (selectedPlugTypes.length === 0 || selectedPlugTypes.includes(charger.plug_type))
      );
      return relevantChargers.some(charger => charger && charger.current_status === 'Available');
    }
    
    return true;
  });

  // Sort by distance if user location is available
  const sortedStations = userLocation 
    ? filteredStations.sort((a, b) => {
        const distanceA = calculateDistance(userLocation, { latitude: a.latitude, longitude: a.longitude });
        const distanceB = calculateDistance(userLocation, { latitude: b.latitude, longitude: b.longitude });
        return distanceA - distanceB;
      })
    : filteredStations;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Available': return <div className="w-2 h-2 bg-ev-available rounded-full" />;
      case 'In Use': return <Clock className="h-3 w-3 text-ev-in-use" />;
      case 'Out of Service': return <AlertTriangle className="h-3 w-3 text-ev-out-of-service" />;
      default: return <div className="w-2 h-2 bg-muted rounded-full" />;
    }
  };

  const getAvailabilityStatus = (station: Station) => {
    // Safety check: ensure station has valid chargers array
    if (!station || !station.chargers || !Array.isArray(station.chargers) || station.chargers.length === 0) {
      return { text: 'No Data', variant: 'outline' as const };
    }
    
    const relevantChargers = station.chargers.filter(charger =>
      charger && charger.plug_type && (selectedPlugTypes.length === 0 || selectedPlugTypes.includes(charger.plug_type))
    );
    
    if (relevantChargers.length === 0) {
      return { text: 'No Matching Plugs', variant: 'outline' as const };
    }
    
    const available = relevantChargers.filter(c => c && c.current_status === 'Available').length;
    const total = relevantChargers.length;
    const hasOutOfService = relevantChargers.some(c => c && c.current_status === 'Out of Service');
    
    if (hasOutOfService && available === 0) return { text: 'Issues Reported', variant: 'destructive' as const };
    if (available === 0) return { text: 'All In Use', variant: 'secondary' as const };
    if (available === total) return { text: 'All Available', variant: 'default' as const };
    return { text: `${available}/${total} Available`, variant: 'outline' as const };
  };

  if (sortedStations.length === 0) {
    return (
      <div className="text-center py-8">
        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No stations found</h3>
        <p className="text-muted-foreground">
          {selectedPlugTypes.length > 0 || showAvailableOnly
            ? 'Try adjusting your filter selection'
            : 'Stations will appear here once loaded'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Charging Stations ({sortedStations.length})
        {userLocation && (
          <span className="text-sm font-normal text-muted-foreground ml-2">
            • Sorted by distance
          </span>
        )}
      </h2>
      
      {sortedStations.map((station) => {
        const status = getAvailabilityStatus(station);
        
        // Safety check for maxPower calculation
        const maxPower = station.chargers && Array.isArray(station.chargers) && station.chargers.length > 0
          ? Math.max(...station.chargers.map(c => c.max_power_kw || 0).filter(power => !isNaN(power)))
          : 0;
          
        const distance = userLocation 
          ? calculateDistance(userLocation, { latitude: station.latitude, longitude: station.longitude })
          : null;
        
        return (
          <Card 
            key={station.station_id} 
            className="p-4 cursor-pointer transition-colors hover:bg-accent/50"
            onClick={() => handleStationClick(station)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{station.name}</h3>
                  <Badge variant={status.variant} className="text-xs">
                    {status.text}
                  </Badge>
                  {distance && (
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <Navigation className="h-3 w-3" />
                      {formatDistance(distance)}
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                  {station.address}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    <span>Up to {maxPower}kW</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>
                      {station.chargers && Array.isArray(station.chargers) ? station.chargers.length : 0} charger{((station.chargers?.length || 0) !== 1 ? 's' : '')}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                {station.chargers && Array.isArray(station.chargers) 
                  ? station.chargers.slice(0, 3).map((charger) => (
                      <div key={charger.charger_id} className="flex items-center gap-1">
                        {getStatusIcon(charger.current_status)}
                        <span className="text-xs text-muted-foreground">
                          {charger.plug_type || 'Unknown'}
                        </span>
                      </div>
                    ))
                  : null
                }
                {station.chargers && station.chargers.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{station.chargers.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default StationsList;