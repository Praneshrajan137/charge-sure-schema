import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  MapPin, 
  Zap, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Loader, 
  Navigation, 
  RefreshCw,
  Star,
  TrendingUp,
  Users,
  Award
} from 'lucide-react';

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
      return <Loader className="h-4 w-4 text-ev-in-use animate-spin" />;
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('status');
  
  if (!station) return null;

  // Simulate golden station (would be based on real reliability data)
  const isGoldenStation = station.station_id.endsWith('1') || station.station_id.endsWith('3');
  
  // Simulate predictive data
  const currentHour = new Date().getHours();
  const busyHours = [8, 9, 17, 18, 19]; // Rush hours
  const likelyAvailable = !busyHours.includes(currentHour);
  const estimatedWait = busyHours.includes(currentHour) ? Math.floor(Math.random() * 20) + 5 : 0;

  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`;
    window.open(url, '_blank');
  };

  const handleUpdateStatus = () => {
    onClose();
    navigate(`/station/${station.station_id}/update`);
  };

  const availableCount = station.chargers.filter(c => c.current_status === 'Available').length;
  const totalCount = station.chargers.length;
  const maxPower = Math.max(...station.chargers.map(c => c.max_power_kw));

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl animate-slide-in-right">
        {/* Dynamic Header Banner */}
        {isGoldenStation && (
          <div className="absolute top-0 left-0 right-0 bg-gradient-golden text-white text-center py-2 rounded-t-3xl">
            <div className="flex items-center justify-center gap-2">
              <Award className="h-4 w-4" />
              <span className="text-sm font-medium">Community Trusted Station</span>
            </div>
          </div>
        )}
        
        <SheetHeader className={cn("pb-4", isGoldenStation && "pt-10")}>
          <SheetTitle className="text-2xl font-bold">
            {station.name}
          </SheetTitle>
          <SheetDescription className="text-muted-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {station.address}
          </SheetDescription>
          
          {/* Predictive Wait-Time Bar */}
          <div className="mt-4 p-3 bg-muted/50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Availability Prediction</span>
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            {likelyAvailable ? (
              <div className="text-sm text-ev-available font-medium">
                ✓ Likely available upon arrival
              </div>
            ) : (
              <div className="text-sm text-ev-waiting font-medium">
                ⏳ {estimatedWait} min estimated wait
              </div>
            )}
            <Progress value={likelyAvailable ? 85 : 25} className="mt-2" />
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="status" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Live Status
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Community
            </TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="mt-4 space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-xl">
                <div className="text-2xl font-bold text-ev-available">{availableCount}</div>
                <div className="text-xs text-muted-foreground">Available</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-xl">
                <div className="text-2xl font-bold">{maxPower}</div>
                <div className="text-xs text-muted-foreground">Max kW</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-xl">
                <div className="text-2xl font-bold">{totalCount}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>

            {/* Chargers List */}
            <div className="space-y-3">
              {station.chargers.map((charger) => (
                <div
                  key={charger.charger_id}
                  className="flex items-center justify-between p-4 rounded-xl border hover-lift transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(charger.current_status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{charger.plug_type}</span>
                        <Badge variant="outline" className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          {charger.max_power_kw}kW
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(charger.last_update_timestamp)}
                      </div>
                    </div>
                  </div>
                  
                  <Badge variant={getStatusBadgeVariant(charger.current_status)}>
                    {charger.current_status}
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="community" className="mt-4 space-y-4">
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Community Feed</h3>
              <p className="text-muted-foreground text-sm">
                See what other drivers are saying about this station
              </p>
              <Button variant="outline" className="mt-4">
                Coming Soon
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 mt-auto border-t">
          <Button 
            onClick={handleGetDirections}
            className="flex-1 flex items-center gap-2 bg-gradient-primary hover:opacity-90"
          >
            <Navigation className="h-4 w-4" />
            Get Directions
          </Button>
          <Button 
            variant="outline"
            onClick={handleUpdateStatus}
            className="flex-1 flex items-center gap-2 hover:bg-muted"
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