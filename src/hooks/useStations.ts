import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Charger {
  charger_id: string;
  plug_type: string;
  max_power_kw: number;
  current_status: string;
  last_update_timestamp: string;
}

interface Station {
  station_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  chargers: Charger[];
}

export const useStations = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStations = async () => {
    try {
      setLoading(true);
      
      // Fetch stations with their chargers
      const { data: stationsData, error: stationsError } = await supabase
        .from('stations')
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
            last_update_timestamp
          )
        `);

      if (stationsError) {
        console.error('Error fetching stations:', stationsError);
        toast({
          title: "Error",
          description: "Failed to load charging stations",
          variant: "destructive",
        });
        return;
      }

      const formattedStations: Station[] = (stationsData || []).map(station => ({
        station_id: station.station_id,
        name: station.name,
        address: station.address,
        latitude: Number(station.latitude),
        longitude: Number(station.longitude),
        chargers: station.chargers || [],
      }));

      setStations(formattedStations);
    } catch (error) {
      console.error('Error in fetchStations:', error);
      toast({
        title: "Error",
        description: "Failed to load charging stations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  // Set up real-time subscription for charger status updates
  useEffect(() => {
    const channel = supabase
      .channel('chargers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chargers'
        },
        () => {
          // Refetch stations when charger data changes
          fetchStations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    stations,
    loading,
    refetch: fetchStations,
  };
};