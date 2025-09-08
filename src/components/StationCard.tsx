import { Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StationCardProps {
  station: {
    id: string;
    name: string;
    address: string;
    chargers_available?: number;
    max_power_kw?: number;
    distance?: number;
  };
}

export const StationCard = ({ station }: StationCardProps) => {
  return (
    <Card className="p-4 mb-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center">
            <Zap className="h-6 w-6 text-success-foreground fill-current" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm mb-1 truncate">
            {station.name}
          </h3>
          <p className="text-muted-foreground text-xs mb-2 truncate">
            {station.address}
          </p>
          
          <div className="flex gap-2 flex-wrap">
            {station.chargers_available !== undefined && (
              <Badge 
                variant="secondary"
                className="bg-success text-success-foreground text-xs px-2 py-0.5"
              >
                {station.chargers_available} available
              </Badge>
            )}
            
            {station.max_power_kw && (
              <Badge 
                variant="secondary"
                className="bg-info text-info-foreground text-xs px-2 py-0.5"
              >
                {station.max_power_kw} kW
              </Badge>
            )}
            
            {station.distance !== undefined && (
              <Badge 
                variant="outline"
                className="text-xs px-2 py-0.5"
              >
                {station.distance.toFixed(1)} mi
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};