import React, { useState } from 'react';
import { X, Utensils, Car, ShoppingBag, Bed, Trees, Store, Wifi, ParkingCircle, Mountain, Tent, Zap, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface FilterState {
  plugScore: number;
  kilowattRange: [number, number];
  stationCount: string;
  amenities: Set<string>;
  parking: Set<string>;
  plugTypes: Set<string>;
  country: string;
}

interface PlugShareFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

interface AmenityItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface ParkingOption {
  id: string;
  label: string;
}

const PlugShareFilters: React.FC<PlugShareFiltersProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange
}) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  if (!isOpen) return null;

  const amenities: AmenityItem[] = [
    { id: 'dining', label: 'Dining', icon: <Utensils className="h-5 w-5" /> },
    { id: 'restrooms', label: 'Restrooms', icon: <Car className="h-5 w-5" /> },
    { id: 'shopping', label: 'Shopping', icon: <ShoppingBag className="h-5 w-5" /> },
    { id: 'lodging', label: 'Lodging', icon: <Bed className="h-5 w-5" /> },
    { id: 'park', label: 'Park', icon: <Trees className="h-5 w-5" /> },
    { id: 'grocery', label: 'Grocery', icon: <Store className="h-5 w-5" /> },
    { id: 'wifi', label: 'WiFi', icon: <Wifi className="h-5 w-5" /> },
    { id: 'valet', label: 'Valet Parking', icon: <ParkingCircle className="h-5 w-5" /> },
    { id: 'hiking', label: 'Hiking', icon: <Mountain className="h-5 w-5" /> },
    { id: 'camping', label: 'Camping', icon: <Tent className="h-5 w-5" /> },
    { id: 'free', label: 'Free Charging', icon: <Zap className="h-5 w-5" /> },
  ];

  const parkingOptions: ParkingOption[] = [
    { id: 'accessible', label: 'Accessible' },
    { id: 'covered', label: 'Covered' },
    { id: 'garage', label: 'Garage' },
    { id: 'illuminated', label: 'Illuminated' },
    { id: 'pullin', label: 'Pull in' },
    { id: 'pullthrough', label: 'Pull through' },
    { id: 'trailer', label: 'Trailer friendly' },
  ];

  const plugTypes = [
    'CCS', 'CHAdeMO', 'J-1772', 'Type 2', 'Tesla Supercharger',
    'Tesla Destination', 'NEMA 14-50', 'Wall Outlet'
  ];

  const updateFilters = (updates: Partial<FilterState>) => {
    const newFilters = { ...localFilters, ...updates };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const resetFilters = () => {
    const resetState: FilterState = {
      plugScore: 0,
      kilowattRange: [0, 350],
      stationCount: 'any',
      amenities: new Set(),
      parking: new Set(),
      plugTypes: new Set(),
      country: 'current'
    };
    setLocalFilters(resetState);
    onFiltersChange(resetState);
  };

  const toggleAmenity = (amenityId: string) => {
    const newAmenities = new Set(localFilters.amenities);
    if (newAmenities.has(amenityId)) {
      newAmenities.delete(amenityId);
    } else {
      newAmenities.add(amenityId);
    }
    updateFilters({ amenities: newAmenities });
  };

  const toggleParking = (parkingId: string) => {
    const newParking = new Set(localFilters.parking);
    if (newParking.has(parkingId)) {
      newParking.delete(parkingId);
    } else {
      newParking.add(parkingId);
    }
    updateFilters({ parking: newParking });
  };

  const togglePlugType = (plugType: string) => {
    const newPlugTypes = new Set(localFilters.plugTypes);
    if (newPlugTypes.has(plugType)) {
      newPlugTypes.delete(plugType);
    } else {
      newPlugTypes.add(plugType);
    }
    updateFilters({ plugTypes: newPlugTypes });
  };

  const toggleAllPlugTypes = () => {
    const allSelected = plugTypes.every(type => localFilters.plugTypes.has(type));
    const newPlugTypes = allSelected ? new Set<string>() : new Set(plugTypes);
    updateFilters({ plugTypes: newPlugTypes });
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      
      {/* Filters Panel */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Filters Content */}
        <div className="p-4 space-y-6">
          {/* PlugScore */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">PlugScore</h3>
            <div className="space-y-2">
              <Slider
                value={[localFilters.plugScore]}
                onValueChange={(value) => updateFilters({ plugScore: value[0] })}
                max={10}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="text-sm text-gray-600">
                {localFilters.plugScore === 0 
                  ? "Locations will not be filtered by PlugScore"
                  : `Minimum PlugScore: ${localFilters.plugScore}`
                }
              </div>
            </div>
          </div>

          {/* Kilowatt Range */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Kilowatt Range: {localFilters.kilowattRange[0]} kW - {localFilters.kilowattRange[1] >= 350 ? '350+' : localFilters.kilowattRange[1]} kW
            </h3>
            <Slider
              value={localFilters.kilowattRange}
              onValueChange={(value) => updateFilters({ kilowattRange: value as [number, number] })}
              max={350}
              min={0}
              step={10}
              className="w-full"
            />
          </div>

          {/* Station Count */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Station Count</h3>
            <div className="grid grid-cols-4 gap-2">
              {['Any', '2+', '4+', '6+'].map((count) => (
                <Button
                  key={count}
                  variant={localFilters.stationCount === count.toLowerCase() ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilters({ stationCount: count.toLowerCase() })}
                  className="text-sm"
                >
                  {count}
                </Button>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Amenities</h3>
            <div className="grid grid-cols-3 gap-3">
              {amenities.map((amenity) => (
                <button
                  key={amenity.id}
                  onClick={() => toggleAmenity(amenity.id)}
                  className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${
                    localFilters.amenities.has(amenity.id)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {amenity.icon}
                  <span className="text-xs mt-1 text-center">{amenity.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Parking */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Parking ({localFilters.parking.size} of {parkingOptions.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {parkingOptions.map((option) => (
                <Badge
                  key={option.id}
                  variant={localFilters.parking.has(option.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleParking(option.id)}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Vehicle & Plugs */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Vehicle & Plugs</h3>
            <p className="text-sm text-gray-600 mb-3">
              Your vehicle is used to determine compatible charging stations
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">
                  Plugs ({localFilters.plugTypes.size} of {plugTypes.length})
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAllPlugTypes}
                >
                  Toggle All
                </Button>
              </div>
              
              <div className="space-y-2">
                {plugTypes.map((plugType) => (
                  <div key={plugType} className="flex items-center justify-between">
                    <label className="text-sm text-gray-700">{plugType}</label>
                    <Switch
                      checked={localFilters.plugTypes.has(plugType)}
                      onCheckedChange={() => togglePlugType(plugType)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Country */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Country</h3>
            <p className="text-sm text-gray-600 mb-3">
              Country is used to determine the networks and vehicles available to your region
            </p>
            
            <div className="relative">
              <select
                value={localFilters.country}
                onChange={(e) => updateFilters({ country: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md bg-white appearance-none"
              >
                <option value="current">Use My Current Location</option>
                <option value="us">United States</option>
                <option value="ca">Canada</option>
                <option value="uk">United Kingdom</option>
                <option value="de">Germany</option>
                <option value="fr">France</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Reset Filters */}
          <Button
            variant="outline"
            onClick={resetFilters}
            className="w-full"
          >
            Reset Filters
          </Button>
        </div>
        
        {/* Bottom Share Feedback */}
        <div className="border-t border-gray-200 p-4">
          <button className="text-blue-600 hover:text-blue-800 font-medium text-center w-full">
            Share Feedback
          </button>
        </div>
      </div>
    </>
  );
};

export default PlugShareFilters;

