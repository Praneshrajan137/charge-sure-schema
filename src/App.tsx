import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"
import React, { useEffect, Suspense } from "react"
import { ErrorBoundary } from "./components/ErrorBoundary"
import { useAppStore } from "./store/useAppStore"
import { stationsApi } from "./services/api"
import { Header } from "./components/Header"
import { Sidebar } from "./components/Sidebar"
import { StationList } from "./components/StationList"
import { LocationButton } from "./components/LocationButton"
import { LoadingSpinner } from "./components/LoadingSpinner"

// Lazy load the map component for better performance
const MapComponent = React.lazy(() =>
  import("./components/Map/MapComponent").then((module) => ({ default: module.MapComponent })),
)

function App() {
  const { isLoading, error, mapBounds, filters, setStations, setLoading, setError } = useAppStore()

  // Load initial data
  useEffect(() => {
    const loadStations = async () => {
      try {
        setLoading(true)
        setError(null)
        const stations = await stationsApi.getStations(mapBounds || undefined, filters)
        setStations(stations)
      } catch (err) {
        console.error("[v0] Failed to load stations:", err)
        setError(err instanceof Error ? err.message : "Failed to load charging stations")
      } finally {
        setLoading(false)
      }
    }

    loadStations()
  }, [mapBounds, filters, setStations, setLoading, setError])

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(
      async () => {
        try {
          const stations = await stationsApi.getStations(mapBounds || undefined, filters)
          setStations(stations)
        } catch (err) {
          console.error("[v0] Failed to refresh stations:", err)
        }
      },
      5 * 60 * 1000,
    ) // 5 minutes

    return () => clearInterval(interval)
  }, [mapBounds, filters, setStations])

  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col bg-gray-50 font-sans">
        <Header />

        <div className="flex flex-1 overflow-hidden">
          <Sidebar />

          <main className="flex-1 relative flex">
            {/* Map Section */}
            <div className="flex-1 relative">
              <Suspense
                fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <LoadingSpinner size="lg" />
                  </div>
                }
              >
                <ErrorBoundary>
                  <MapComponent />
                </ErrorBoundary>
              </Suspense>

              {/* Map Controls */}
              <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                <LocationButton />
                {["Map", "Terrain", "Satellite"].map((control) => (
                  <Button
                    key={control}
                    variant="outline"
                    size="sm"
                    className="bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200 border-gray-200 font-medium min-w-[80px]"
                  >
                    {control}
                  </Button>
                ))}
              </div>

              {isLoading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 shadow-xl">
                    <LoadingSpinner className="mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading charging stations...</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="absolute top-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-50">
                  <p className="text-red-800 font-medium">{error}</p>
                  <button onClick={() => setError(null)} className="mt-2 text-sm text-red-600 hover:text-red-800">
                    Dismiss
                  </button>
                </div>
              )}
            </div>

            {/* Station List Panel - Hidden on mobile, shown on larger screens */}
            <div className="hidden lg:block w-96 bg-white border-l border-gray-200 overflow-y-auto">
              <StationList />
            </div>
          </main>
        </div>

        <Toaster position="bottom-right" />
      </div>
    </ErrorBoundary>
  )
}

export default App
