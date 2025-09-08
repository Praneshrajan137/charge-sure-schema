import React, { useState, useEffect } from 'react';
import { BottomSheet } from './BottomSheet';
import { Heart, Navigation, MapPin, Clock, Zap, Star, Phone, Globe, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

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

interface EnhancedStationDetailsProps {
  station: Station | null;
  isOpen: boolean;
  onClose: () => void;
}

// Mock data for demonstration
const mockReviews = [
  { id: 1, user: "ElectricDreamer", rating: 5, comment: "Super fast charging! Clean facilities and easy to find.", time: "2 days ago", helpful: 12 },
  { id: 2, user: "EVRoadTripper", rating: 4, comment: "Good location but can get busy on weekends.", time: "1 week ago", helpful: 8 },
  { id: 3, user: "GreenCommuter", rating: 5, comment: "Love this spot! Always reliable and well-maintained.", time: "2 weeks ago", helpful: 15 }
];

const mockCheckIns = [
  { id: 1, user: "TeslaFan", status: "Charging now", time: "5 min ago", duration: "30 min", energy: "45 kWh" },
  { id: 2, user: "LeafOwner", status: "Just finished", time: "1 hour ago", duration: "45 min", energy: "32 kWh" },
  { id: 3, user: "BoltDriver", status: "Quick top-up", time: "3 hours ago", duration: "15 min", energy: "12 kWh" }
];

export const EnhancedStationDetails: React.FC<EnhancedStationDetailsProps> = ({
  station,
  isOpen,
  onClose
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  // Load favorite status from localStorage
  useEffect(() => {
    if (station) {
      const favorites = JSON.parse(localStorage.getItem('favorite-stations') || '[]');
      setIsFavorite(favorites.includes(station.station_id));
    }
  }, [station]);

  const toggleFavorite = () => {
    if (!station) return;
    
    const favorites = JSON.parse(localStorage.getItem('favorite-stations') || '[]');
    let newFavorites;
    
    if (isFavorite) {
      newFavorites = favorites.filter((id: string) => id !== station.station_id);
    } else {
      newFavorites = [...favorites, station.station_id];
    }
    
    localStorage.setItem('favorite-stations', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  const getDirections = () => {
    if (!station) return;
    
    const url = `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`;
    window.open(url, '_blank');
  };

  const getAvailabilityInfo = () => {
    if (!station || !station.chargers || !Array.isArray(station.chargers)) {
      return { available: 0, total: 0, status: 'unknown' };
    }
    
    const available = station.chargers.filter(c => c && c.current_status === 'Available').length;
    const total = station.chargers.length;
    const hasOutOfService = station.chargers.some(c => c && c.current_status === 'Out of Service');
    
    let status = 'available';
    if (available === 0) status = hasOutOfService ? 'maintenance' : 'busy';
    else if (available < total / 2) status = 'limited';
    
    return { available, total, status };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-50 border-green-200';
      case 'limited': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'busy': return 'text-red-600 bg-red-50 border-red-200';
      case 'maintenance': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!station) return null;

  const { available, total, status } = getAvailabilityInfo();
  
  // Safety checks for power
  const maxPower = station?.chargers && Array.isArray(station.chargers) && station.chargers.length > 0
    ? Math.max(...station.chargers.map(c => c.max_power_kw || 0))
    : 0;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={[0.4, 0.7, 0.95]}
      initialSnap={1}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                {station.name}
              </h2>
              <p className="text-gray-600 mt-1 leading-relaxed">{station.address}</p>
            </div>
            
            {/* Touch-friendly favorite button */}
            <button
              onClick={toggleFavorite}
              className={cn(
                "p-3 rounded-full transition-all duration-200 touch-manipulation",
                "active:scale-95 hover:scale-105",
                isFavorite 
                  ? "text-red-500 bg-red-50" 
                  : "text-gray-400 bg-gray-50 hover:text-red-500 hover:bg-red-50"
              )}
            >
              <Heart 
                className={cn("h-6 w-6 transition-all", isFavorite && "fill-current")} 
              />
            </button>
          </div>

          {/* Availability Status */}
          <div className={cn(
            "flex items-center justify-between p-3 rounded-lg border-2",
            getStatusColor(status)
          )}>
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span className="font-semibold">
                {available} of {total} available
              </span>
            </div>
            <Badge variant="secondary" className="bg-white/80">
              Up to {maxPower} kW
            </Badge>
          </div>

          {/* Action Buttons - Touch-friendly */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={getDirections}
              className="h-12 text-base font-semibold touch-manipulation active:scale-95"
              size="lg"
            >
              <Navigation className="h-5 w-5 mr-2" />
              Directions
            </Button>
            <Button 
              variant="outline"
              className="h-12 text-base font-semibold touch-manipulation active:scale-95"
              size="lg"
            >
              <Camera className="h-5 w-5 mr-2" />
              Check In
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-12 mb-4">
            <TabsTrigger value="info" className="text-base touch-manipulation">Info</TabsTrigger>
            <TabsTrigger value="activity" className="text-base touch-manipulation">Activity</TabsTrigger>
            <TabsTrigger value="reviews" className="text-base touch-manipulation">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-4">
            {/* Chargers */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Charging Ports</h3>
              <div className="space-y-2">
                {station.chargers && Array.isArray(station.chargers) ? station.chargers.map((charger) => (
                  <div key={charger.charger_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{charger.plug_type}</span>
                      <span className="text-gray-600 ml-2">{charger.max_power_kw} kW</span>
                    </div>
                    <Badge 
                      variant={
                        charger.current_status === 'Available' ? 'default' : 
                        charger.current_status === 'In Use' ? 'secondary' : 'destructive'
                      }
                    >
                      {charger.current_status}
                    </Badge>
                  </div>
                )) : (
                  <div className="text-center text-gray-500 py-4">
                    No charging ports information available
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="text-sm">24/7 Access</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-sm">Public Station</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  <span className="text-sm">Contact Available</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Globe className="h-4 w-4 mr-2" />
                  <span className="text-sm">Network Station</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-3">
            <h3 className="font-semibold text-gray-900">Recent Check-ins</h3>
            {mockCheckIns.map((checkin) => (
              <div key={checkin.id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-gray-900">{checkin.user}</span>
                  <span className="text-sm text-gray-500">{checkin.time}</span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{checkin.status}</p>
                <div className="flex space-x-4 text-xs text-gray-500">
                  <span>Duration: {checkin.duration}</span>
                  <span>Energy: {checkin.energy}</span>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Reviews</h3>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">4.7</span>
                <span className="text-sm text-gray-500">(23 reviews)</span>
              </div>
            </div>
            
            {mockReviews.map((review) => (
              <div key={review.id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-medium text-gray-900">{review.user}</span>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={cn(
                            "h-3 w-3",
                            i < review.rating ? "text-yellow-500 fill-current" : "text-gray-300"
                          )} 
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{review.time}</span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{review.comment}</p>
                <div className="flex items-center justify-between">
                  <button className="text-xs text-blue-600 hover:text-blue-800">
                    👍 Helpful ({review.helpful})
                  </button>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </BottomSheet>
  );
};
