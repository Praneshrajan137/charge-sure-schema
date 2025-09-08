import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface AnalyticsEvent {
  event_type: string;
  event_data?: Record<string, unknown>;
  station_id?: string;
  charger_id?: string;
}

export const useAnalytics = () => {
  const trackEvent = useCallback(async (event: AnalyticsEvent) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('user_analytics')
        .insert({
          user_id: user?.id || null,
          event_type: event.event_type,
          event_data: (event.event_data as unknown as Json) ?? null,
          station_id: event.station_id || null,
          charger_id: event.charger_id || null,
        });

      if (error) {
        console.error('Analytics tracking error:', error);
      }
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  }, []);

  return { trackEvent };
};

// Pre-defined event types for consistency
export const ANALYTICS_EVENTS = {
  STATION_VIEW: 'station_view',
  CHARGER_STATUS_UPDATE: 'charger_status_update',
  CHARGER_RATING: 'charger_rating',
  DIRECTIONS_REQUEST: 'directions_request',
  SEARCH_QUERY: 'search_query',
  FILTER_APPLIED: 'filter_applied',
  MAP_INTERACTION: 'map_interaction',
  ERROR_ENCOUNTERED: 'error_encountered',
} as const;