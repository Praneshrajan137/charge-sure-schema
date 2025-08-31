import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MapPin, Zap, Clock, AlertCircle, CheckCircle, Loader, Navigation, RefreshCw } from 'lucide-react';
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

const formatTimeAgo = (timestamp: string) => {
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

  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`;
    window.open(url, '_blank');
  };

  const handleUpdateStatus = () => {
    // TODO: Navigate to UpdateStatusScreen
    console.log('Navigate to update status for station:', station.station_id);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-xl font-bold">
            {station.name}
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            {station.address}
          </SheetDescription>
        </SheetHeader>

        <Separator className="my-4" />

        <div className="space-y-4">
          {station.chargers.map((charger) => (
            <div key={charger.charger_id} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">
                    Charger {charger.charger_id}: {charger.plug_type} ({charger.max_power_kw} kW)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Updated {formatTimeAgo(charger.last_update_timestamp)}
                </div>
              </div>
              <Badge variant={getStatusBadgeVariant(charger.current_status)}>
                {charger.current_status}
              </Badge>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-6 mt-auto">
          <Button 
            onClick={handleGetDirections}
            className="flex-1 flex items-center gap-2"
          >
            <Navigation className="h-4 w-4" />
            Get Directions
          </Button>
          <Button 
            variant="secondary"
            onClick={handleUpdateStatus}
            className="flex-1 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Update Status
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default StationDetailsModal;