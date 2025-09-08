export interface ChargingStation {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  status: "available" | "in-use" | "out-of-order" | "restricted"
  plugTypes: PlugType[]
  amenities: string[]
  pricing: {
    free: boolean
    pricePerKwh?: number
    pricePerMinute?: number
  }
  network: string
  maxPower: number
  plugCount: number
  plugScore: number
  lastUpdated: string
}

export interface PlugType {
  type: "CCS" | "CHAdeMO" | "Tesla" | "Type2" | "J1772"
  power: number
  available: boolean
}

export interface User {
  id: string
  email: string
  name: string
  vehicle?: {
    make: string
    model: string
    year: number
    plugTypes: string[]
  }
  preferences: {
    favoriteStations: string[]
    defaultFilters: FilterState
  }
}

export interface FilterState {
  plugScore: number[]
  kilowattRange: number[]
  stationCount: string
  amenities: string[]
  parking: string[]
  networks: string[]
  plugTypes: string[]
  priceRange: number[]
  availability: "all" | "available" | "fast-charging"
}

export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
}
