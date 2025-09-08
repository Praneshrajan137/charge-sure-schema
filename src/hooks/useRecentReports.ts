import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RecentReport {
  id: string;
  charger_id: string;
  old_status: string;
  new_status: string;
  reported_by?: string;
  notes?: string | null;
  reported_at: string;
}

export const useRecentReports = (chargerId?: string, limit: number = 5) => {
  return useQuery({
    queryKey: ['recent-reports', chargerId, limit],
    queryFn: async (): Promise<RecentReport[]> => {
      let query = supabase
        .from('charger_status_updates')
        .select('*')
        .order('reported_at', { ascending: false })
        .limit(limit);

      if (chargerId) {
        query = query.eq('charger_id', chargerId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch recent reports: ${error.message}`);
      }

      const safe = (data || []).map((r) => ({
        ...r,
        reported_by: r.reported_by ?? undefined,
      }));
      return safe;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};