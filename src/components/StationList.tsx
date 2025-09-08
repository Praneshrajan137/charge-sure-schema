import { useMemo } from "react"
import { useAppStore } from "../store/useAppStore"
import { StationCard } from "./StationCard"
import { LoadingSpinner } from "./LoadingSpinner"
import type { ChargingStation } from "../types"

export function StationList() {
  const { filteredStations, isLoading, setSelectedStation } = useAppStore()

  const sortedStations = useMemo(() => {
    return [...filteredStations].sort((a, b) => {
      // Sort by status (available first), then by PlugScore
      const statusOrder = { available: 0, "in-use": 1, restricted: 2, "out-of-order": 3 }
      const statusDiff = statusOrder[a.status] - statusOrder[b.status]
      if (statusDiff !== 0) return statusDiff

      return b.plugScore - a.plugScore
    })
  }, [filteredStations])

  const handleGetDirections = (station: ChargingStation) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`
    window.open(url, "_blank")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (sortedStations.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔍</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No stations found</h3>
        <p className="text-gray-600">Try adjusting your filters or search in a different area.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      <div className="text-sm text-gray-600 mb-4">
        Showing {sortedStations.length} charging station{sortedStations.length !== 1 ? "s" : ""}
      </div>
      {sortedStations.map((station) => (
        <StationCard
          key={station.id}
          station={station}
          onSelect={setSelectedStation}
          onGetDirections={handleGetDirections}
        />
      ))}
    </div>
  )
}
