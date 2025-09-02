import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Zap, Clock, AlertTriangle } from 'lucide-react';

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

interface StationsListProps {
  stations: Station[];
  selectedPlugTypes: string[];
  onStationClick: (station: Station) => void;
}

const StationsList: React.FC<StationsListProps> = ({ 
  stations, 
  selectedPlugTypes, 
  onStationClick 
}) => {
  // Filter stations based on plug type selection
  const filteredStations = stations.filter(station => {
    if (selectedPlugTypes.length === 0) return true;
    return station.chargers.some(charger => 
      selectedPlugTypes.includes(charger.plug_type)
    );
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Available': return <div className="w-2 h-2 bg-ev-available rounded-full" />;
      case 'In Use': return <Clock className="h-3 w-3 text-ev-in-use" />;
      case 'Out of Service': return <AlertTriangle className="h-3 w-3 text-ev-out-of-service" />;
      default: return <div className="w-2 h-2 bg-muted rounded-full" />;
    }
  };

  const getAvailabilityStatus = (station: Station) => {
    const relevantChargers = station.chargers.filter(charger =>
      selectedPlugTypes.length === 0 || selectedPlugTypes.includes(charger.plug_type)
    );
    
    const available = relevantChargers.filter(c => c.current_status === 'Available').length;
    const total = relevantChargers.length;
    const hasOutOfService = relevantChargers.some(c => c.current_status === 'Out of Service');
    
    if (hasOutOfService && available === 0) return { text: 'Issues Reported', variant: 'destructive' as const };
    if (available === 0) return { text: 'All In Use', variant: 'secondary' as const };
    if (available === total) return { text: 'All Available', variant: 'default' as const };
    return { text: `${available}/${total} Available`, variant: 'outline' as const };
  };

  if (filteredStations.length === 0) {
    return (
      <div className="text-center py-8">
        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No stations found</h3>
        <p className="text-muted-foreground">
          {selectedPlugTypes.length > 0 
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
        Charging Stations ({filteredStations.length})
      </h2>
      
      {filteredStations.map((station) => {
        const status = getAvailabilityStatus(station);
        const maxPower = Math.max(...station.chargers.map(c => c.max_power_kw));
        
        return (
          <Card 
            key={station.station_id} 
            className="p-4 cursor-pointer transition-colors hover:bg-accent/50"
            onClick={() => onStationClick(station)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{station.name}</h3>
                  <Badge variant={status.variant} className="text-xs">
                    {status.text}
                  </Badge>
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
                    <span>{station.chargers.length} charger{station.chargers.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                {station.chargers.slice(0, 3).map((charger) => (
                  <div key={charger.charger_id} className="flex items-center gap-1">
                    {getStatusIcon(charger.current_status)}
                    <span className="text-xs text-muted-foreground">
                      {charger.plug_type}
                    </span>
                  </div>
                ))}
                {station.chargers.length > 3 && (
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