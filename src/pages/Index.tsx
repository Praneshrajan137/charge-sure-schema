import { useState } from 'react';
import Map from '@/components/Map';
import FilterChips from '@/components/FilterChips';
import StationDetailsModal from '@/components/StationDetailsModal';
import { useStations } from '@/hooks/useStations';
import { Card } from '@/components/ui/card';
import { Loader2, Zap } from 'lucide-react';

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
        <Card className="p-8 text-center max-w-sm mx-4 animate-fade-in">
          <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
          <h2 className="text-xl font-bold mb-2">ChargeSure</h2>
          <p className="text-muted-foreground">Finding charging stations with certainty...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-background overflow-hidden">
      {/* Minimalist Header */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/30">
        <div className="flex items-center justify-center py-4 px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">ChargeSure</h1>
              <p className="text-xs text-muted-foreground">Charge with Certainty</p>
            </div>
          </div>
        </div>
      </div>

      {/* Intelligent Filter Chips */}
      <FilterChips
        availablePlugTypes={availablePlugTypes}
        selectedPlugTypes={selectedPlugTypes}
        onSelectionChange={setSelectedPlugTypes}
      />

      {/* Predictive Smart Map */}
      <div className="absolute inset-0 pt-20">
        <Map
          stations={stations}
          selectedPlugTypes={selectedPlugTypes}
          onStationClick={handleStationClick}
        />
      </div>

      {/* Contextual Station Hub */}
      <StationDetailsModal
        station={selectedStation}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default Index;
