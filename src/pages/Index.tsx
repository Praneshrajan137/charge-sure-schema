import { useState } from 'react';
import Map from '@/components/Map';
import FilterChips from '@/components/FilterChips';
import StationDetailsModal from '@/components/StationDetailsModal';
import { useStations } from '@/hooks/useStations';
import { Card } from '@/components/ui/card';
import { Loader2, MapPin } from 'lucide-react';

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

const Index = () => {
  const { stations, loading } = useStations();
  const [selectedPlugTypes, setSelectedPlugTypes] = useState<string[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get all available plug types from stations
  const availablePlugTypes = Array.from(
    new Set(stations.flatMap(station => 
      station.chargers.map(charger => charger.plug_type)
    ))
  ).sort();

  const handleStationClick = (station: Station) => {
    setSelectedStation(station);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedStation(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold mb-2">Loading ChargeSure</h2>
          <p className="text-muted-foreground">Finding charging stations near you...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-background">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-center py-3 px-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">ChargeSure</h1>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="absolute top-16 left-0 right-0 z-10 px-4">
        <FilterChips
          availablePlugTypes={availablePlugTypes}
          selectedPlugTypes={selectedPlugTypes}
          onSelectionChange={setSelectedPlugTypes}
        />
      </div>

      {/* Map */}
      <div className="absolute inset-0 pt-16">
        <Map
          stations={stations}
          selectedPlugTypes={selectedPlugTypes}
          onStationClick={handleStationClick}
        />
      </div>

      {/* Station Details Modal */}
      <StationDetailsModal
        station={selectedStation}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default Index;
