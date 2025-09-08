import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Star, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface RecentLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  lastVisited: string;
  visitCount: number;
  rating?: number;
}

interface RecentLocationsProps {
  onLocationSelect: (location: RecentLocation) => void;
  className?: string;
}

export const RecentLocations: React.FC<RecentLocationsProps> = ({
  onLocationSelect,
  className = ""
}) => {
  const [recentLocations, setRecentLocations] = useState<RecentLocation[]>([]);

  useEffect(() => {
    // Load recent locations from localStorage
    const stored = localStorage.getItem('recent-locations');
    if (stored) {
      const locations = JSON.parse(stored);
      // Sort by last visited (most recent first)
      locations.sort((a: RecentLocation, b: RecentLocation) => 
        new Date(b.lastVisited).getTime() - new Date(a.lastVisited).getTime()
      );
      setRecentLocations(locations.slice(0, 5)); // Keep only top 5
    }
  }, []);

  const addRecentLocation = (location: Omit<RecentLocation, 'lastVisited' | 'visitCount'>) => {
    const stored = localStorage.getItem('recent-locations') || '[]';
    const existing = JSON.parse(stored) as RecentLocation[];
    
    const existingIndex = existing.findIndex(l => l.id === location.id);
    const now = new Date().toISOString();
    
    if (existingIndex >= 0) {
      // Update existing location
      existing[existingIndex] = {
        ...existing[existingIndex],
        lastVisited: now,
        visitCount: existing[existingIndex].visitCount + 1
      };
    } else {
      // Add new location
      existing.push({
        ...location,
        lastVisited: now,
        visitCount: 1
      });
    }
    
    // Keep only last 10 locations
    existing.sort((a, b) => new Date(b.lastVisited).getTime() - new Date(a.lastVisited).getTime());
    const trimmed = existing.slice(0, 10);
    
    localStorage.setItem('recent-locations', JSON.stringify(trimmed));
    setRecentLocations(trimmed.slice(0, 5));
  };

  const getDirections = (location: RecentLocation, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
    window.open(url, '_blank');
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  // Expose addRecentLocation function globally for other components to use
  React.useEffect(() => {
    (window as unknown as { addRecentLocation?: typeof addToRecentLocations }).addRecentLocation = addRecentLocation;
  }, []);

  if (recentLocations.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex items-center space-x-2 mb-3">
        <Clock className="h-4 w-4 text-gray-600" />
        <h3 className="text-sm font-medium text-gray-900">Recent Locations</h3>
      </div>
      
      <div className="space-y-2">
        {recentLocations.map((location) => (
          <Card 
            key={location.id}
            className="p-3 cursor-pointer hover:bg-gray-50 transition-colors touch-manipulation active:scale-98"
            onClick={() => onLocationSelect(location)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <MapPin className="h-3 w-3 text-gray-500 flex-shrink-0 mt-0.5" />
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {location.name}
                  </h4>
                  {location.rating && (
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-gray-600">{location.rating}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-600 truncate mb-1">
                  {location.address}
                </p>
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <span>{formatTimeAgo(location.lastVisited)}</span>
                  <span>•</span>
                  <span>{location.visitCount} visit{location.visitCount !== 1 ? 's' : ''}</span>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 ml-2 flex-shrink-0 touch-manipulation"
                onClick={(e) => getDirections(location, e)}
              >
                <Navigation className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Utility function to add location from anywhere in the app
export const addToRecentLocations = (location: {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating?: number;
}) => {
  const globalWindow = window as unknown as { addRecentLocation?: typeof addToRecentLocations };
  if (globalWindow.addRecentLocation) {
    globalWindow.addRecentLocation(location);
  }
};

