import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import type { ChargingStation, User, FilterState, MapBounds } from "../types"

interface AppState {
  // UI State
  sidebarOpen: boolean
  activeSection: string | null
  isLoading: boolean
  error: string | null

  // User State
  user: User | null
  isAuthenticated: boolean

  // Map State
  mapCenter: [number, number]
  mapZoom: number
  mapBounds: MapBounds | null

  // Data State
  stations: ChargingStation[]
  filteredStations: ChargingStation[]
  selectedStation: ChargingStation | null

  // Filter State
  filters: FilterState
  searchQuery: string

  // Actions
  setSidebarOpen: (open: boolean) => void
  setActiveSection: (section: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setUser: (user: User | null) => void
  setMapCenter: (center: [number, number]) => void
  setMapZoom: (zoom: number) => void
  setMapBounds: (bounds: MapBounds) => void
  setStations: (stations: ChargingStation[]) => void
  setSelectedStation: (station: ChargingStation | null) => void
  updateFilters: (filters: Partial<FilterState>) => void
  setSearchQuery: (query: string) => void
  applyFilters: () => void
  resetFilters: () => void
}

const defaultFilters: FilterState = {
  plugScore: [0],
  kilowattRange: [0, 350],
  stationCount: "Any",
  amenities: [],
  parking: [],
  networks: [],
  plugTypes: [],
  priceRange: [0, 100],
  availability: "all",
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        sidebarOpen: true,
        activeSection: null,
        isLoading: false,
        error: null,
        user: null,
        isAuthenticated: false,
        mapCenter: [39.8283, -98.5795], // Center of US
        mapZoom: 4,
        mapBounds: null,
        stations: [],
        filteredStations: [],
        selectedStation: null,
        filters: defaultFilters,
        searchQuery: "",

        // Actions
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        setActiveSection: (section) => set({ activeSection: section }),
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        setMapCenter: (center) => set({ mapCenter: center }),
        setMapZoom: (zoom) => set({ mapZoom: zoom }),
        setMapBounds: (bounds) => set({ mapBounds: bounds }),
        setStations: (stations) => {
          set({ stations })
          get().applyFilters()
        },
        setSelectedStation: (station) => set({ selectedStation: station }),
        updateFilters: (newFilters) => {
          set({ filters: { ...get().filters, ...newFilters } })
          get().applyFilters()
        },
        setSearchQuery: (query) => {
          set({ searchQuery: query })
          get().applyFilters()
        },
        applyFilters: () => {
          const { stations, filters, searchQuery } = get()
          let filtered = [...stations]

          // Apply search filter
          if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(
              (station) =>
                station.name.toLowerCase().includes(query) ||
                station.address.toLowerCase().includes(query) ||
                station.network.toLowerCase().includes(query),
            )
          }

          // Apply kilowatt range filter
          filtered = filtered.filter(
            (station) => station.maxPower >= filters.kilowattRange[0] && station.maxPower <= filters.kilowattRange[1],
          )

          // Apply station count filter
          if (filters.stationCount !== "Any") {
            const minCount = Number.parseInt(filters.stationCount.replace("+", ""))
            filtered = filtered.filter((station) => station.plugCount >= minCount)
          }

          // Apply amenities filter
          if (filters.amenities.length > 0) {
            filtered = filtered.filter((station) =>
              filters.amenities.every((amenity) => station.amenities.includes(amenity)),
            )
          }

          // Apply plug score filter
          if (filters.plugScore[0] > 0) {
            filtered = filtered.filter((station) => station.plugScore >= filters.plugScore[0])
          }

          set({ filteredStations: filtered })
        },
        resetFilters: () => {
          set({ filters: defaultFilters, searchQuery: "" })
          get().applyFilters()
        },
      }),
      {
        name: "plugshare-storage",
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          filters: state.filters,
          mapCenter: state.mapCenter,
          mapZoom: state.mapZoom,
        }),
      },
    ),
    { name: "PlugShare Store" },
  ),
)
