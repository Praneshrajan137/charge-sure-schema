"use client"

import type React from "react"
import { useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import {
  Search,
  X,
  ChevronRight,
  Filter,
  Plus,
  Car,
  Clock,
  Settings,
  HelpCircle,
  MessageSquare,
  ShoppingCart,
  Download,
  Apple,
  Smartphone,
  Utensils,
  Users,
  ShoppingBag,
  Bed,
  Trees,
  ShoppingBasket,
  Wifi,
  ParkingCircle,
  Mountain,
  Tent,
  DollarSign,
  Menu,
  
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "../store/useAppStore"

type IconComponent = React.ComponentType<{ className?: string }>

const SafeIcon: React.FC<{ icon: IconComponent; className?: string }> = ({ icon: Icon, className }) => {
  try {
    return <Icon className={className} />
  } catch {
    return <div className={cn("w-5 h-5 bg-gray-300 rounded", className)} />
  }
}

export function Sidebar() {
  const {
    sidebarOpen,
    activeSection,
    searchQuery,
    filters,
    filteredStations,
    setSidebarOpen,
    setActiveSection,
    setSearchQuery,
    updateFilters,
    resetFilters,
  } = useAppStore()

  const toggleSection = useCallback(
    (section: string) => {
      try {
        console.log("[v0] Toggling section:", section, "Current active:", activeSection)
        const newSection = activeSection === section ? null : section
        console.log("[v0] Setting new section:", newSection)
        setActiveSection(newSection)
      } catch (error) {
        console.error("[v0] Error in toggleSection:", error)
      }
    },
    [activeSection, setActiveSection],
  )

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(!sidebarOpen)
  }, [sidebarOpen, setSidebarOpen])

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value)
    },
    [setSearchQuery],
  )

  const clearSearch = useCallback(() => {
    setSearchQuery("")
  }, [setSearchQuery])

  const amenities = useMemo(
    () => [
      { id: "dining", label: "Dining", icon: Utensils, ariaLabel: "Filter by dining amenities" },
      { id: "restrooms", label: "Restrooms", icon: Users, ariaLabel: "Filter by restroom availability" },
      { id: "shopping", label: "Shopping", icon: ShoppingBag, ariaLabel: "Filter by shopping amenities" },
      { id: "lodging", label: "Lodging", icon: Bed, ariaLabel: "Filter by lodging options" },
      { id: "park", label: "Park", icon: Trees, ariaLabel: "Filter by park amenities" },
      { id: "grocery", label: "Grocery", icon: ShoppingBasket, ariaLabel: "Filter by grocery stores" },
      { id: "wifi", label: "WiFi", icon: Wifi, ariaLabel: "Filter by WiFi availability" },
      { id: "valet", label: "Valet Parking", icon: ParkingCircle, ariaLabel: "Filter by valet parking" },
      { id: "hiking", label: "Hiking", icon: Mountain, ariaLabel: "Filter by hiking trails" },
      { id: "camping", label: "Camping", icon: Tent, ariaLabel: "Filter by camping facilities" },
      { id: "free", label: "Free Charging", icon: DollarSign, ariaLabel: "Filter by free charging stations" },
    ],
    [],
  )

  const parkingOptions = useMemo(
    () => ["Accessible", "Covered", "Garage", "Illuminated", "Pull in", "Pull through", "Trailer friendly"],
    [],
  )

  // Legend items moved to MapComponent for better integration

  const toggleAmenity = useCallback(
    (amenityId: string) => {
      const newAmenities = filters.amenities.includes(amenityId)
        ? filters.amenities.filter((id) => id !== amenityId)
        : [...filters.amenities, amenityId]
      updateFilters({ amenities: newAmenities })
    },
    [filters.amenities, updateFilters],
  )

  const toggleParking = useCallback(
    (option: string) => {
      const newParking = filters.parking.includes(option)
        ? filters.parking.filter((p) => p !== option)
        : [...filters.parking, option]
      updateFilters({ parking: newParking })
    },
    [filters.parking, updateFilters],
  )

  return (
    <>
      {/* Mobile sidebar toggle */}
      <Button
        onClick={toggleSidebar}
        variant="outline"
        size="sm"
        className="absolute top-4 left-4 z-20 bg-white shadow-lg hover:shadow-xl transition-all duration-200 border-gray-200 md:hidden"
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </Button>

      <aside
        className={cn(
          "bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col shadow-sm",
          "absolute md:relative z-10 h-full",
          sidebarOpen ? "w-80" : "w-0 md:w-0",
        )}
        aria-label="Navigation and filters"
      >
        {sidebarOpen && (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search for a Charging Location"
                  className="pl-10 pr-10 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  aria-label="Search for charging locations"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Results counter */}
              <div className="mt-2 text-sm text-gray-600">{filteredStations.length} charging locations found</div>
            </div>

            <nav className="flex-1 overflow-y-auto" aria-label="Main navigation">
              {/* Legend moved to Map component - Custom legend button with better functionality */}

              {/* Filters Section */}
              <div className="border-b border-gray-100">
                <button
                  onClick={() => toggleSection("filters")}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors duration-150 focus:outline-none focus:bg-gray-50"
                  aria-expanded={activeSection === "filters"}
                  aria-controls="filters-content"
                >
                  <div className="flex items-center gap-3">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-800">Filters</span>
                  </div>
                  <ChevronRight
                    className={cn(
                      "w-4 h-4 text-gray-400 transition-transform duration-200",
                      activeSection === "filters" && "rotate-90",
                    )}
                  />
                </button>
                {activeSection === "filters" && (
                  <div id="filters-content" className="px-4 pb-4 space-y-6">
                    {/* PlugScore Filter */}
                    <div>
                      <h4 className="font-semibold mb-3 text-gray-800">PlugScore</h4>
                      <div className="space-y-3">
                        <Slider
                          value={filters.plugScore}
                          onValueChange={(value) => updateFilters({ plugScore: value })}
                          max={10}
                          step={1}
                          className="w-full"
                          aria-label="PlugScore filter"
                        />
                        <div className="flex justify-center">
                          <span className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                            {filters.plugScore[0] === 0
                              ? "Locations will not be filtered by PlugScore"
                              : `Minimum PlugScore: ${filters.plugScore[0]}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Kilowatt Range Filter */}
                    <div>
                      <h4 className="font-semibold mb-3 text-gray-800">
                        Kilowatt Range: {filters.kilowattRange[0]} kW -{" "}
                        {filters.kilowattRange[1] >= 350 ? "350+" : filters.kilowattRange[1]} kW
                      </h4>
                      <div className="space-y-3">
                        <Slider
                          value={filters.kilowattRange}
                          onValueChange={(value) => updateFilters({ kilowattRange: value })}
                          max={350}
                          step={1}
                          className="w-full"
                          aria-label="Kilowatt range filter"
                        />
                        <div className="flex justify-between text-xs text-gray-500 font-medium">
                          <span>0</span>
                          <span>350+</span>
                        </div>
                      </div>
                    </div>

                    {/* Station Count Filter */}
                    <div>
                      <h4 className="font-semibold mb-4 text-gray-800">Station Count</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {["Any", "2+", "4+", "6+"].map((count) => (
                          <Button
                            key={count}
                            variant={filters.stationCount === count ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateFilters({ stationCount: count })}
                            className={cn(
                              "transition-all duration-200 font-medium",
                              filters.stationCount === count
                                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm transform scale-105"
                                : "hover:bg-gray-50 border-gray-200",
                            )}
                            aria-pressed={filters.stationCount === count}
                          >
                            {count}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Amenities Filter */}
                    <div>
                      <h4 className="font-semibold mb-4 text-gray-800">Amenities</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {amenities.map((amenity) => (
                          <button
                            key={amenity.id}
                            onClick={() => toggleAmenity(amenity.id)}
                            className={cn(
                              "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200",
                              filters.amenities.includes(amenity.id)
                                ? "bg-blue-50 border-blue-300 shadow-sm transform scale-105"
                                : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300",
                            )}
                            aria-pressed={filters.amenities.includes(amenity.id)}
                            aria-label={amenity.ariaLabel}
                          >
                            <SafeIcon
                              icon={amenity.icon}
                              className={cn(
                                "w-6 h-6 transition-colors duration-200",
                                filters.amenities.includes(amenity.id) ? "text-blue-600" : "text-gray-600",
                              )}
                            />
                            <span
                              className={cn(
                                "text-xs text-center font-medium transition-colors duration-200",
                                filters.amenities.includes(amenity.id) ? "text-blue-700" : "text-gray-700",
                              )}
                            >
                              {amenity.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Parking Options */}
                    <div>
                      <h4 className="font-semibold mb-4 text-gray-800">
                        Parking ({filters.parking.length} of {parkingOptions.length})
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {parkingOptions.map((option) => (
                          <Button
                            key={option}
                            variant={filters.parking.includes(option) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleParking(option)}
                            className={cn(
                              "text-xs h-9 transition-all duration-200 font-medium",
                              filters.parking.includes(option)
                                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                : "hover:bg-gray-50 border-gray-200",
                            )}
                            aria-pressed={filters.parking.includes(option)}
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Reset Filters */}
                    <div className="space-y-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={resetFilters}
                        className="w-full bg-white hover:bg-gray-50 transition-colors font-medium"
                      >
                        Reset Filters
                      </Button>
                      <Button variant="link" className="w-full text-blue-600 hover:text-blue-700 font-medium">
                        Share Feedback
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Menu Items */}
              {[
                {
                  id: "addstation",
                  icon: Plus,
                  label: "Add Station",
                  expandable: true,
                  items: ["Add Public Location", "Share Home Charger"],
                },
                { id: "tripplanner", icon: Car, label: "Trip Planner", expandable: true, items: ["Plan a New Trip"] },
                { id: "recent", icon: Clock, label: "Recent Activity", expandable: false },
                { id: "settings", icon: Settings, label: "Settings", expandable: false },
                { id: "help", icon: HelpCircle, label: "Help", expandable: false },
                { id: "feedback", icon: MessageSquare, label: "Submit Feedback", expandable: false },
                { id: "store", icon: ShoppingCart, label: "PlugShare Store", expandable: false },
                {
                  id: "getapp",
                  icon: Download,
                  label: "Get the App",
                  expandable: true,
                  items: [
                    { label: "Apple App Store", icon: Apple },
                    { label: "Google Play Store", icon: Smartphone },
                  ],
                },
              ].map((item) => (
                <div key={item.id} className="border-b border-gray-100">
                  <button
                    onClick={item.expandable ? () => toggleSection(item.id) : undefined}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors duration-150 focus:outline-none focus:bg-gray-50"
                    aria-expanded={item.expandable ? activeSection === item.id : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <SafeIcon icon={item.icon} className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-800">{item.label}</span>
                    </div>
                    {item.expandable && (
                      <ChevronRight
                        className={cn(
                          "w-4 h-4 text-gray-400 transition-transform duration-200",
                          activeSection === item.id && "rotate-90",
                        )}
                      />
                    )}
                  </button>
                  {item.expandable && activeSection === item.id && item.items && (
                    <div className="px-4 pb-4 space-y-1">
                      {item.items.map((subItem, index) => (
                        <button
                          key={index}
                          className={cn(
                            "w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2",
                            item.id === "tripplanner" ? "text-blue-600 font-semibold" : "text-gray-700",
                          )}
                        >
                          {typeof subItem === "object" && subItem.icon && (
                            <SafeIcon icon={subItem.icon} className="w-4 h-4" />
                          )}
                          {typeof subItem === "string" ? subItem : subItem.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        )}
      </aside>
    </>
  )
}
