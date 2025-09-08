"use client"
import { Navigation, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useGeolocation } from "../hooks/useGeolocation"
import { useAppStore } from "../store/useAppStore"
import { toast } from "sonner"

export function LocationButton() {
  const { latitude, longitude, error, loading } = useGeolocation()
  const { setMapCenter, setMapZoom } = useAppStore()

  const handleLocationClick = () => {
    if (error) {
      toast.error("Location access denied", {
        description: "Please enable location access to find nearby charging stations.",
      })
      return
    }

    if (latitude && longitude) {
      setMapCenter([latitude, longitude])
      setMapZoom(12)
      toast.success("Location found", {
        description: "Map centered on your current location.",
      })
    }
  }

  return (
    <Button
      onClick={handleLocationClick}
      variant="outline"
      size="sm"
      disabled={loading || !!error}
      className="bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200 border-gray-200 font-medium"
      aria-label="Center map on current location"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
      {loading ? "Finding..." : "My Location"}
    </Button>
  )
}
