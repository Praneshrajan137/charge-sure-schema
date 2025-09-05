import { useState, useMemo } from "react";
import Map from "@/components/Map";
import StationsList from "@/components/StationsList";
import { FilterChips } from "@/components/FilterChips";
import OfflineIndicator from "@/components/OfflineIndicator";
import { SearchBar } from "@/components/SearchBar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useStations } from "@/hooks/useStations";
import { useLocation } from "@/hooks/useLocation";
import { useRecentStations } from "@/hooks/useRecentStations";
import { calculateDistance } from "@/utils/distance";

export default function Index() {
  const { data: stations = [], isLoading, error } = useStations();
  const { location, loading: locationLoading, error: locationError } = useLocation();
  const { recentStations } = useRecentStations();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
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

    // Apply filters
    if (activeFilter === "available") {
      filtered = filtered.filter(station => 
        station.chargers.some(charger => charger.current_status === "Available")
      );
    } else if (activeFilter === "fast") {
      filtered = filtered.filter(station => 
        station.chargers.some(charger => charger.max_power_kw >= 50)
      );
    } else if (activeFilter === "recent" && recentStations.length > 0) {
      const recentIds = new Set(recentStations.map(r => r.station_id));
      filtered = filtered.filter(station => recentIds.has(station.station_id));
    }

    return filtered;
  }, [stations, searchQuery, activeFilter, recentStations]);

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
      <div className="min-h-screen bg-background">
        <OfflineIndicator />
        
        <div className="container mx-auto p-4 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              EV Charging Stations
            </h1>
            <p className="text-muted-foreground">
              Find and update electric vehicle charging stations near you
            </p>
          </div>

          <div className="space-y-4">
            <SearchBar 
              onSearch={setSearchQuery} 
              placeholder="Search by station name, address, or plug type..."
              className="max-w-md mx-auto"
            />
            
            <FilterChips 
              activeFilter={activeFilter} 
              onFilterChange={setActiveFilter}
              locationEnabled={!!location}
              hasRecentStations={recentStations.length > 0}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-300px)]">
            <div className="bg-card rounded-lg shadow-sm border">
              <div className="h-full">
                <Map 
                  stations={sortedStations} 
                  userLocation={location ? { lat: location.latitude, lng: location.longitude } : null} 
                />
              </div>
            </div>
            
            <div className="overflow-hidden">
              <StationsList 
                stations={sortedStations} 
                userLocation={location ? { lat: location.latitude, lng: location.longitude } : null}
                isLoading={isLoading}
                error={error}
                searchQuery={searchQuery}
              />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
