import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Charger {
  charger_id: string;
  plug_type: string;
  max_power_kw: number;
  current_status: "Available" | "In Use" | "Out of Service";
  last_update_timestamp: string;
  last_verified_at?: string;
  verification_count?: number;
  rating_score?: number;
  rating_count?: number;
}

export interface Station {
  station_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  chargers: Charger[];
}

export const useStations = () => {
  return useQuery({
    queryKey: ["stations"],
    queryFn: async (): Promise<Station[]> => {
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
        `);

      if (error) {
        throw new Error(`Failed to fetch stations: ${error.message}`);
      }

      return (data || []).map(station => ({
        ...station,
        latitude: Number(station.latitude),
        longitude: Number(station.longitude),
        chargers: (station.chargers || []).map(charger => ({
          ...charger,
          current_status: charger.current_status as "Available" | "In Use" | "Out of Service",
          last_update_timestamp: String(charger.last_update_timestamp ?? ""),
          last_verified_at: charger.last_verified_at ?? undefined,
          verification_count: charger.verification_count ?? undefined,
          rating_score: charger.rating_score ?? undefined,
          rating_count: charger.rating_count ?? undefined
        }))
      })) || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: (failureCount, error) => {
      // Retry up to 3 times with exponential backoff
      if (failureCount >= 3) return false;
      
      // Don't retry on authentication errors
      if (error?.message?.includes('JWT') || error?.message?.includes('auth')) {
        return false;
      }
      
      return true;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};