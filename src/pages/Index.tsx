import { useState } from 'react';
import Map from '@/components/Map';
import FilterChips from '@/components/FilterChips';
import StationDetailsModal from '@/components/StationDetailsModal';
import StationsList from '@/components/StationsList';
import { useStations } from '@/hooks/useStations';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    <div className="min-h-screen bg-background">
      {/* Minimalist Header */}
      <div className="bg-background/80 backdrop-blur-lg border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 py-4">
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

      {/* Filter Section */}
      {availablePlugTypes.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 pt-4 pb-4">
          <FilterChips
            availablePlugTypes={availablePlugTypes}
            selectedPlugTypes={selectedPlugTypes}
            onSelectionChange={setSelectedPlugTypes}
          />
        </div>
      )}

      {/* Main Content with Tabs */}
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <Tabs defaultValue="map" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="map" className="h-[70vh] rounded-lg overflow-hidden border border-border">
            <Map
              stations={stations}
              selectedPlugTypes={selectedPlugTypes}
              onStationClick={handleStationClick}
            />
          </TabsContent>
          
          <TabsContent value="list" className="max-h-[70vh] overflow-y-auto">
            <StationsList
              stations={stations}
              selectedPlugTypes={selectedPlugTypes}
              onStationClick={handleStationClick}
            />
          </TabsContent>
        </Tabs>
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
