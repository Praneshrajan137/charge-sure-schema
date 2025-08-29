import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Zap, Clock, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Charger {
  charger_id: string;
  plug_type: string;
  max_power_kw: number;
  current_status: string;
  last_update_timestamp: string;
}

interface Station {
  station_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  chargers: Charger[];
}

interface StationDetailsModalProps {
  station: Station | null;
  isOpen: boolean;
  onClose: () => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Available':
      return <CheckCircle className="h-4 w-4 text-ev-available" />;
    case 'In Use':
      return <Loader className="h-4 w-4 text-ev-in-use" />;
    case 'Out of Service':
      return <AlertCircle className="h-4 w-4 text-ev-out-of-service" />;
    default:
      return <AlertCircle className="h-4 w-4 text-ev-unknown" />;
  }
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'Available':
      return 'default';
    case 'In Use':
      return 'secondary';
    case 'Out of Service':
      return 'destructive';
    default:
      return 'outline';
  }
};

const formatLastUpdate = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return 'Just updated';
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }
};

const StationDetailsModal: React.FC<StationDetailsModalProps> = ({
  station,
  isOpen,
  onClose,
}) => {
  if (!station) return null;

  const statusCounts = station.chargers.reduce((acc, charger) => {
    acc[charger.current_status] = (acc[charger.current_status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const availableChargers = station.chargers.filter(c => c.current_status === 'Available');
  const totalChargers = station.chargers.length;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2 text-left">
            <MapPin className="h-5 w-5 text-primary" />
            {station.name}
          </SheetTitle>
          <SheetDescription className="text-left">
            {station.address}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Status Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Charging Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="default" className="bg-ev-available text-white">
                  {statusCounts['Available'] || 0} Available
                </Badge>
                <Badge variant="secondary" className="bg-ev-in-use text-white">
                  {statusCounts['In Use'] || 0} In Use
                </Badge>
                <Badge variant="destructive" className="bg-ev-out-of-service text-white">
                  {statusCounts['Out of Service'] || 0} Out of Service
                </Badge>
                <Badge variant="outline" className="bg-ev-unknown text-white border-ev-unknown">
                  {statusCounts['Unknown'] || 0} Unknown
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {availableChargers.length} of {totalChargers} chargers available
              </p>
            </CardContent>
          </Card>

          {/* Chargers List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Available Chargers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {station.chargers.map((charger) => (
                  <div
                    key={charger.charger_id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border",
                      charger.current_status === 'Available' 
                        ? "border-ev-available/20 bg-ev-available/5"
                        : charger.current_status === 'In Use'
                        ? "border-ev-in-use/20 bg-ev-in-use/5"
                        : charger.current_status === 'Out of Service'
                        ? "border-ev-out-of-service/20 bg-ev-out-of-service/5"
                        : "border-ev-unknown/20 bg-ev-unknown/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(charger.current_status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{charger.plug_type}</span>
                          <Badge variant="outline">
                            <Zap className="h-3 w-3 mr-1" />
                            {charger.max_power_kw}kW
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatLastUpdate(charger.last_update_timestamp)}
                        </div>
                      </div>
                    </div>
                    
                    <Badge variant={getStatusBadgeVariant(charger.current_status)}>
                      {charger.current_status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default StationDetailsModal;