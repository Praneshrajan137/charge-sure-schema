import { supabase } from "../integrations/supabase/client"
import type { ChargingStation, User, MapBounds } from "../types"

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export const stationsApi = {
  async getStations(bounds?: MapBounds, _filters?: any): Promise<ChargingStation[]> {
    try {
      let query = supabase
        .from("stations")
        .select(`
          station_id,
          name,
          address,
          latitude,
          longitude,
          chargers (
            charger_id,
            plug_type,
            max_power_kw,
            current_status,
            last_update_timestamp,
            last_verified_at,
            verification_count,
            rating_score,
            rating_count
          )
        `)

      // Apply bounds filter if provided
      if (bounds) {
        query = query
          .gte('latitude', bounds.south)
          .lte('latitude', bounds.north)
          .gte('longitude', bounds.west)
          .lte('longitude', bounds.east)
      }

      const { data, error } = await query

      if (error) {
        throw new ApiError(500, `Failed to fetch stations: ${error.message}`)
      }

      // Transform Supabase data to match ChargingStation interface
      const stations: ChargingStation[] = (data || []).map(station => ({
        id: station.station_id,
        name: station.name,
        address: station.address,
        latitude: Number(station.latitude),
        longitude: Number(station.longitude),
        status: getStationStatus(station.chargers),
        plugTypes: station.chargers?.map(charger => ({
          type: charger.plug_type as ChargingStation["plugTypes"][number]["type"],
          power: charger.max_power_kw,
          available: charger.current_status === "Available"
        })) || [],
        amenities: [], // TODO: Add amenities from database
        pricing: {
          free: false, // TODO: Add pricing from database
          pricePerKwh: 0.25
        },
        network: "ChargeSure", // TODO: Add network from database
        maxPower: Math.max(...(station.chargers?.map(c => c.max_power_kw) || [0])),
        plugCount: station.chargers?.length || 0,
        plugScore: calculatePlugScore(station.chargers),
        lastUpdated: station.chargers?.[0]?.last_update_timestamp || new Date().toISOString(),
      }))

      return stations
  } catch (error) {
      console.error("[ChargeSure] Failed to fetch stations:", error)
      throw error instanceof ApiError ? error : new ApiError(500, "Failed to fetch stations")
    }
  },

  async getStationById(id: string): Promise<ChargingStation> {
    try {
      const { data, error } = await supabase
        .from("stations")
        .select(`
          station_id,
          name,
          address,
          latitude,
          longitude,
          chargers (
            charger_id,
            plug_type,
            max_power_kw,
            current_status,
            last_update_timestamp,
            last_verified_at,
            verification_count,
            rating_score,
            rating_count
          )
        `)
        .eq('station_id', id)
        .single()

      if (error) {
        throw new ApiError(404, `Station not found: ${error.message}`)
      }

      // Transform to ChargingStation format
      const station: ChargingStation = {
        id: data.station_id,
        name: data.name,
        address: data.address,
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        status: getStationStatus(data.chargers),
        plugTypes: data.chargers?.map(charger => ({
          type: charger.plug_type as ChargingStation["plugTypes"][number]["type"],
          power: charger.max_power_kw,
          available: charger.current_status === "Available"
        })) || [],
        amenities: [],
        pricing: { free: false, pricePerKwh: 0.25 },
        network: "ChargeSure",
        maxPower: Math.max(...(data.chargers?.map(c => c.max_power_kw) || [0])),
        plugCount: data.chargers?.length || 0,
        plugScore: calculatePlugScore(data.chargers),
        lastUpdated: data.chargers?.[0]?.last_update_timestamp || new Date().toISOString(),
      }

      return station
    } catch (error) {
      console.error("[ChargeSure] Failed to fetch station:", error)
      throw error instanceof ApiError ? error : new ApiError(500, "Failed to fetch station")
    }
  },

  async searchStations(query: string, bounds?: MapBounds): Promise<ChargingStation[]> {
    try {
      let supabaseQuery = supabase
        .from("stations")
        .select(`
          station_id,
          name,
          address,
          latitude,
          longitude,
          chargers (
            charger_id,
            plug_type,
            max_power_kw,
            current_status,
            last_update_timestamp,
            last_verified_at,
            verification_count,
            rating_score,
            rating_count
          )
        `)
        .or(`name.ilike.%${query}%,address.ilike.%${query}%`)

      // Apply bounds filter if provided
    if (bounds) {
        supabaseQuery = supabaseQuery
          .gte('latitude', bounds.south)
          .lte('latitude', bounds.north)
          .gte('longitude', bounds.west)
          .lte('longitude', bounds.east)
      }

      const { data, error } = await supabaseQuery

      if (error) {
        throw new ApiError(500, `Search failed: ${error.message}`)
      }

      // Transform results
      const stations: ChargingStation[] = (data || []).map(station => ({
        id: station.station_id,
        name: station.name,
        address: station.address,
        latitude: Number(station.latitude),
        longitude: Number(station.longitude),
        status: getStationStatus(station.chargers),
        plugTypes: station.chargers?.map(charger => ({
          type: charger.plug_type as ChargingStation["plugTypes"][number]["type"],
          power: charger.max_power_kw,
          available: charger.current_status === "Available"
        })) || [],
        amenities: [],
        pricing: { free: false, pricePerKwh: 0.25 },
        network: "ChargeSure",
        maxPower: Math.max(...(station.chargers?.map(c => c.max_power_kw) || [0])),
        plugCount: station.chargers?.length || 0,
        plugScore: calculatePlugScore(station.chargers),
        lastUpdated: station.chargers?.[0]?.last_update_timestamp || new Date().toISOString(),
      }))

      return stations
    } catch (error) {
      console.error("[ChargeSure] Search failed:", error)
      throw error instanceof ApiError ? error : new ApiError(500, "Search failed")
    }
  },
}

// Helper functions
function getStationStatus(chargers: any[]): "available" | "in-use" | "out-of-order" | "restricted" {
  if (!chargers || chargers.length === 0) return "out-of-order"
  
  const availableCount = chargers.filter(c => c.current_status === "Available").length
  const inUseCount = chargers.filter(c => c.current_status === "In Use").length
  
  if (availableCount > 0) return "available"
  if (inUseCount > 0) return "in-use"
  return "out-of-order"
}

function calculatePlugScore(chargers: any[]): number {
  if (!chargers || chargers.length === 0) return 1
  
  // Calculate score based on charger count, power, and ratings
  const avgRating = chargers.reduce((sum, c) => sum + (c.rating_score || 5), 0) / chargers.length
  const maxPower = Math.max(...chargers.map(c => c.max_power_kw))
  const chargerCount = chargers.length
  
  // Simple scoring algorithm (1-10 scale)
  const score = Math.min(10, Math.round((avgRating * 0.4) + (maxPower / 50) + (chargerCount * 0.5)))
  return Math.max(1, score)
}

export const userApi = {
  async login(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) throw new ApiError(401, error?.message || "Login failed")
    return { id: data.user.id, email: data.user.email ?? "" } as User
  },

  async register(email: string, password: string, name: string): Promise<User> {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } })
    if (error || !data.user) throw new ApiError(400, error?.message || "Register failed")
    return { id: data.user.id, email: data.user.email ?? "" } as User
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw new ApiError(400, error.message)
  },

  async getProfile(): Promise<User> {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) throw new ApiError(401, error?.message || "Not authenticated")
    return { id: user.id, email: user.email ?? "" } as User
  },
}

// Mock data generator for demo
// eslint-disable-next-line @typescript-eslint/no-unused-vars
/*
// Keeping for future demo needs
function generateMockStations(bounds?: MapBounds): ChargingStation[] {
  const stations: ChargingStation[] = []
  const stationCount = 50

  for (let i = 0; i < stationCount; i++) {
    const lat = bounds ? bounds.south + Math.random() * (bounds.north - bounds.south) : 25 + Math.random() * 25 // US bounds roughly

    const lng = bounds ? bounds.west + Math.random() * (bounds.east - bounds.west) : -125 + Math.random() * 50 // US bounds roughly

    stations.push({
      id: `station-${i}`,
      name: `Charging Station ${i + 1}`,
      address: `${Math.floor(Math.random() * 9999)} Main St, City, State`,
      latitude: lat,
      longitude: lng,
      status: ["available", "in-use", "out-of-order", "restricted"][Math.floor(Math.random() * 4)] as any,
      plugTypes: [
        { type: "CCS", power: 150, available: Math.random() > 0.3 },
        { type: "CHAdeMO", power: 50, available: Math.random() > 0.5 },
      ],
      amenities: ["dining", "restrooms", "wifi"].filter(() => Math.random() > 0.5),
      pricing: {
        free: Math.random() > 0.7,
        pricePerKwh: Math.random() > 0.7 ? undefined : 0.25 + Math.random() * 0.5,
      },
      network: ["Tesla", "ChargePoint", "EVgo", "Electrify America"][Math.floor(Math.random() * 4)],
      maxPower: [50, 150, 250, 350][Math.floor(Math.random() * 4)],
      plugCount: Math.floor(Math.random() * 8) + 1,
      plugScore: Math.floor(Math.random() * 10) + 1,
      lastUpdated: new Date().toISOString(),
    })
  }

  return stations
}
*/
