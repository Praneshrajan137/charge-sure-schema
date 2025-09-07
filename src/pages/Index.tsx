import { useState, useMemo } from "react";
import Map from "@/components/Map";
import OfflineIndicator from "@/components/OfflineIndicator";
import { PlugShareHeader } from "@/components/PlugShareHeader";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useStations } from "@/hooks/useStations";
import { useLocation } from "@/hooks/useLocation";
import { useRecentStations } from "@/hooks/useRecentStations";
import { calculateDistance } from "@/utils/distance";

export default function Index() {
  const { data: stations = [], isLoading, error } = useStations();
  const { location, loading: locationLoading, error: locationError } = useLocation();
  const { recentStations } = useRecentStations();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter and search stations
  const filteredStations = useMemo(() => {
    let filtered = stations;

    // Apply text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(station => 
        station.name.toLowerCase().includes(query) ||
        station.address.toLowerCase().includes(query) ||
        station.chargers.some(charger => 
          charger.plug_type.toLowerCase().includes(query)
        )
      );
    }

    return filtered;
  }, [stations, searchQuery]);

  // Sort stations by distance if location is available
  const sortedStations = useMemo(() => {
    if (!location) return filteredStations;
    
    return [...filteredStations].sort((a, b) => {
      const distanceA = calculateDistance(
        { latitude: location.latitude, longitude: location.longitude },
        { latitude: a.latitude, longitude: a.longitude }
      );
      const distanceB = calculateDistance(
        { latitude: location.latitude, longitude: location.longitude },
        { latitude: b.latitude, longitude: b.longitude }
      );
      return distanceA - distanceB;
    });
  }, [filteredStations, location]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background flex flex-col">
        <OfflineIndicator />
        
        <PlugShareHeader onSearch={setSearchQuery} />
        
        <div className="flex-1 relative">
          <Map 
            stations={sortedStations} 
            selectedPlugTypes={[]}
            showAvailableOnly={false}
            userLocation={location ? { latitude: location.latitude, longitude: location.longitude } : null}
            onStationClick={() => {}}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}
