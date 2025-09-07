import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { 
  Utensils, Users, ShoppingBag, Bed, Trees, ShoppingCart,
  Wifi, Car, Mountain, Tent, Zap
} from "lucide-react";

export const PlugShareFilters = () => {
  const [plugScore, setPlugScore] = useState([0]);
  const [kilowattRange, setKilowattRange] = useState([0, 350]);
  const [stationCount, setStationCount] = useState("Any");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedParking, setSelectedParking] = useState<string[]>([]);

  const stationCounts = ["Any", "2+", "4+", "6+"];
  
  const amenities = [
    { id: "dining", label: "Dining", icon: Utensils },
    { id: "restrooms", label: "Restrooms", icon: Users },
    { id: "shopping", label: "Shopping", icon: ShoppingBag },
    { id: "lodging", label: "Lodging", icon: Bed },
    { id: "park", label: "Park", icon: Trees },
    { id: "grocery", label: "Grocery", icon: ShoppingCart },
    { id: "wifi", label: "WiFi", icon: Wifi },
    { id: "valet", label: "Valet Parking", icon: Car },
    { id: "hiking", label: "Hiking", icon: Mountain },
    { id: "camping", label: "Camping", icon: Tent },
    { id: "free", label: "Free Charging", icon: Zap },
  ];

  const parkingOptions = [
    "Accessible", "Covered", "Garage", "Illuminated", 
    "Pull in", "Pull through", "Trailer friendly"
  ];

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenityId) 
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const toggleParking = (option: string) => {
    setSelectedParking(prev => 
      prev.includes(option) 
        ? prev.filter(opt => opt !== option)
        : [...prev, option]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto bg-white">
        {/* PlugScore Section */}
        <div className="p-4 border-b">
          <h3 className="font-semibold mb-4">PlugScore</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-muted-foreground">
                {plugScore[0]}
              </span>
            </div>
            <Slider
              value={plugScore}
              onValueChange={setPlugScore}
              max={10}
              step={1}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Locations will not be filtered by PlugScore
            </p>
          </div>
        </div>

        {/* Kilowatt Range Section */}
        <div className="p-4 border-b">
          <h3 className="font-semibold mb-4">
            Kilowatt Range: {kilowattRange[0]} kW - {kilowattRange[1] >= 350 ? "350+" : kilowattRange[1]} kW
          </h3>
          <Slider
            value={kilowattRange}
            onValueChange={setKilowattRange}
            max={350}
            step={1}
            className="w-full"
          />
        </div>

        {/* Station Count Section */}
        <div className="p-4 border-b">
          <h3 className="font-semibold mb-4">Station Count</h3>
          <div className="grid grid-cols-4 gap-2">
            {stationCounts.map((count) => (
              <Button
                key={count}
                variant={stationCount === count ? "default" : "outline"}
                size="sm"
                onClick={() => setStationCount(count)}
                className="text-sm"
              >
                {count}
              </Button>
            ))}
          </div>
        </div>

        {/* Amenities Section */}
        <div className="p-4 border-b">
          <h3 className="font-semibold mb-4">Amenities</h3>
          <div className="grid grid-cols-3 gap-3">
            {amenities.map((amenity) => (
              <Toggle
                key={amenity.id}
                pressed={selectedAmenities.includes(amenity.id)}
                onPressedChange={() => toggleAmenity(amenity.id)}
                className="flex flex-col items-center gap-2 h-auto p-3 data-[state=on]:bg-primary/10"
              >
                <amenity.icon className="h-6 w-6" />
                <span className="text-xs text-center leading-tight">
                  {amenity.label}
                </span>
              </Toggle>
            ))}
          </div>
        </div>

        {/* Additional Filters */}
        <div className="p-4 border-b">
          <h3 className="font-semibold mb-4">Additional Filters (1 of 7)</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Hide Dealerships</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Hide Restricted Access</span>
              <Button variant="outline" size="sm" className="text-orange-500 border-orange-500">
                ⊖
              </Button>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Show Private Homes</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Available Now</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Hide Tesla Only Locations</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Hide Rivian Only Locations</span>
            </div>
          </div>
        </div>

        {/* Parking Section */}
        <div className="p-4 border-b">
          <h3 className="font-semibold mb-4">Parking (0 of 7)</h3>
          <div className="grid grid-cols-3 gap-2">
            {parkingOptions.map((option) => (
              <Button
                key={option}
                variant={selectedParking.includes(option) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleParking(option)}
                className="text-xs h-8"
              >
                {option}
              </Button>
            ))}
          </div>
        </div>

        {/* Vehicle & Plugs Section */}
        <div className="p-4 border-b">
          <h3 className="font-semibold mb-4">Vehicle & Plugs</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your vehicle is used to determine compatible charging stations
          </p>
          
          <div className="border rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Plugs (14 of 15)</span>
              <Button variant="outline" size="sm">
                Toggle All
              </Button>
            </div>
          </div>
        </div>

        {/* Country Section */}
        <div className="p-4">
          <h3 className="font-semibold mb-4">Country</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Country is used to determine the networks and vehicles available to your region
          </p>
          
          <Button variant="outline" className="w-full justify-between">
            Use My Current Location
            <span>▼</span>
          </Button>
          
          <div className="mt-6 space-y-4">
            <Button variant="outline" className="w-full">
              Reset Filters
            </Button>
            
            <Button variant="link" className="w-full text-primary">
              Share Feedback
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};