import { useState, useMemo, useEffect } from "react";
import { MapComponent } from "@/components/Map/MapComponent";
import StationsList from "@/components/StationsList";
import { FilterChips } from "@/components/FilterChips";
import OfflineIndicator from "@/components/OfflineIndicator";
import { EnhancedSearch } from "@/components/EnhancedSearch";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { StationsListSkeleton, MapSkeleton } from "@/components/LoadingSkeleton";
import { useLocation } from "@/hooks/useLocation";
import { useRecentStations } from "@/hooks/useRecentStations";
import { calculateDistance } from "@/utils/distance";
import { supabase } from "@/integrations/supabase/client";
import type { Station } from "@/hooks/useStations";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Index() {
  // 1. State Initialization
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { location } = useLocation();
  const { recentStations } = useRecentStations();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // 2. Data Fetching Logic
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const { data, error: supabaseError } = await supabase
          .from("stations")
          .select(`
            station_id,
            name,
            address,
            latitude,
            longitude,
            chargers (
              charger_id,
              plug_type,
              max_power_kw,
              current_status,
              last_update_timestamp,
              last_verified_at,
              verification_count,
              rating_score,
              rating_count
            )
          `);

        if (supabaseError) {
          throw new Error(`Failed to fetch stations: ${supabaseError.message}`);
        }

        const formattedStations: Station[] = (data || []).map(station => ({
          station_id: station.station_id,
          name: station.name,
          address: station.address,
          latitude: Number(station.latitude),
          longitude: Number(station.longitude),
          chargers: (station.chargers || []).map(charger => ({
            charger_id: charger.charger_id,
            plug_type: charger.plug_type,
            max_power_kw: charger.max_power_kw,
            current_status: charger.current_status as "Available" | "In Use" | "Out of Service",
            last_update_timestamp: String(charger.last_update_timestamp ?? ""),
            last_verified_at: charger.last_verified_at ?? undefined,
            verification_count: charger.verification_count ?? undefined,
            rating_score: charger.rating_score ?? undefined,
            rating_count: charger.rating_count ?? undefined,
          }))
        }));

        setStations(formattedStations);
      } catch (fetchError) {
        setError(fetchError as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStations();
  }, []);

  // Filter and search stations
  const filteredStations = useMemo(() => {
    if (!Array.isArray(stations)) return [];
    
    let filtered = stations;

    // Apply text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(station => 
        station?.name?.toLowerCase().includes(query) ||
        station?.address?.toLowerCase().includes(query) ||
        (station?.chargers && Array.isArray(station.chargers) && station.chargers.some(charger => 
          charger?.plug_type?.toLowerCase().includes(query)
        ))
      );
    }

    // Apply filters
    if (activeFilter === "available") {
      filtered = filtered.filter(station => 
        station?.chargers && Array.isArray(station.chargers) && station.chargers.some(charger => charger?.current_status === "Available")
      );
    } else if (activeFilter === "fast") {
      filtered = filtered.filter(station => 
        station?.chargers && Array.isArray(station.chargers) && station.chargers.some(charger => charger?.max_power_kw >= 50)
      );
    } else if (activeFilter === "recent" && recentStations.length > 0) {
      const recentIds = new Set(recentStations.map(r => r.station_id));
      filtered = filtered.filter(station => recentIds.has(station?.station_id));
    }

    return filtered;
  }, [stations, searchQuery, activeFilter, recentStations]);

  // Sort stations by distance if location is available
  const sortedStations = useMemo(() => {
    if (!location || !Array.isArray(filteredStations)) return filteredStations;
    
    return [...filteredStations].sort((a, b) => {
      if (!a?.latitude || !a?.longitude || !b?.latitude || !b?.longitude) return 0;
      
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

  // 3. Conditional Rendering in UI
  if (isLoading) {
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
              <div className="max-w-md mx-auto h-10 bg-muted rounded animate-pulse" />
              <div className="flex gap-2 justify-center">
                <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                <div className="h-8 w-18 bg-muted rounded animate-pulse" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-300px)]">
              <div className="bg-card rounded-lg shadow-sm border">
                <MapSkeleton />
              </div>
              
              <div className="overflow-hidden">
                <StationsListSkeleton />
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  if (error) {
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

            <div className="flex items-center justify-center min-h-[400px] p-4">
              <Card className="max-w-md w-full">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="mx-auto h-12 w-12 text-destructive">
                    <AlertTriangle size={48} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Failed to Load Stations</h3>
                    <p className="text-muted-foreground text-sm">
                      {error.message}
                    </p>
                  </div>
                  <Button onClick={() => window.location.reload()} className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

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
            <EnhancedSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by station name, address, or plug type..."
              stations={stations}
              showFilters={false}
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
                <MapComponent />
              </div>
            </div>
            
            <div className="overflow-hidden">
              <StationsList 
                stations={sortedStations} 
                selectedPlugTypes={[]}
                showAvailableOnly={false}
                userLocation={location ? { latitude: location.latitude, longitude: location.longitude } : null}
                onStationClick={() => {}}
              />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
