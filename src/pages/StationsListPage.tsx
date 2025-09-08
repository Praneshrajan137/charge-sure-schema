import { useState } from "react";
import { ChargeSureHeader } from "@/components/ChargeSureHeader";
import { BottomNavigation } from "@/components/BottomNavigation";
import StationsList from "@/components/StationsList";
import { LeafletMap } from "@/components/LeafletMap";
import { useStations } from "@/hooks/useStations";
import { useLocation } from "@/hooks/useLocation";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function StationsListPage() {
  const [activeTab, setActiveTab] = useState("list");
  const { data: stations = [], isLoading, error } = useStations();
  const { location } = useLocation();

  const renderContent = () => {
    switch (activeTab) {
      case "map":
        return (
          <div className="flex-1 relative">
            <LeafletMap 
              stations={stations}
              userLocation={location ? { latitude: location.latitude, longitude: location.longitude } : null}
              onStationClick={(station) => console.log('Station clicked:', station)}
            />
          </div>
        );
      case "list":
        return (
          <div className="flex-1 flex flex-col">
            <StationsList 
              stations={stations} 
              selectedPlugTypes={[]}
              showAvailableOnly={false}
              userLocation={location}
              onStationClick={() => {}}
            />
          </div>
        );
      case "profile":
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Profile</h2>
              <p className="text-muted-foreground">Profile section coming soon</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2 text-destructive">Error Loading Stations</h2>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background flex flex-col">
        <ChargeSureHeader />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">Loading stations...</p>
            </div>
          ) : (
            renderContent()
          )}
        </main>
        
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </ErrorBoundary>
  );
}