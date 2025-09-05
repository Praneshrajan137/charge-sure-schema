import { Badge } from "@/components/ui/badge";
import { MapPin, Zap, CheckCircle, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilterChipsProps {
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
  locationEnabled?: boolean;
  hasRecentStations?: boolean;
}

export const FilterChips = ({ 
  activeFilter, 
  onFilterChange, 
  locationEnabled,
  hasRecentStations 
}: FilterChipsProps) => {
  const filters = [
    {
      id: "available",
      label: "Available Now",
      icon: CheckCircle,
      description: "Show only stations with available chargers"
    },
    {
      id: "fast",
      label: "Fast Charging",
      icon: Zap,
      description: "50kW+ charging stations"
    },
    ...(locationEnabled ? [{
      id: "nearby",
      label: "Nearby",
      icon: MapPin,
      description: "Closest stations first"
    }] : []),
    ...(hasRecentStations ? [{
      id: "recent",
      label: "Recent",
      icon: Clock,
      description: "Previously visited stations"
    }] : [])
  ];

  const handleFilterClick = (filterId: string) => {
    if (activeFilter === filterId) {
      onFilterChange(null);
    } else {
      onFilterChange(filterId);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center items-center">
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isActive = activeFilter === filter.id;
        
        return (
          <Badge
            key={filter.id}
            variant={isActive ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/10 transition-colors px-3 py-2 text-sm touch-target"
            onClick={() => handleFilterClick(filter.id)}
          >
            <Icon className="w-4 h-4 mr-1.5" />
            {filter.label}
          </Badge>
        );
      })}
      
      {activeFilter && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFilterChange(null)}
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
};