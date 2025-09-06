import { useState, useCallback, useEffect } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OfflineUpdate {
  chargerId: string;
  status: string;
  timestamp: string;
}

export const useOfflineCache = <T = any>() => {
  const { isOnline } = useOnlineStatus();
  const { toast } = useToast();
  const [pendingUpdates, setPendingUpdates] = useState<OfflineUpdate[]>([]);

  // Load pending updates from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('offline-charger-updates');
    if (stored) {
      try {
        const updates = JSON.parse(stored);
        setPendingUpdates(updates);
      } catch (error) {
        console.error('Failed to parse stored offline updates:', error);
        localStorage.removeItem('offline-charger-updates');
      }
    }
  }, []);

  const setCacheData = useCallback((key: string, data: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }, []);

  const getCacheData = useCallback((key: string): T | null => {
    try {
      const cached = localStorage.getItem(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  }, []);

  const queueStatusUpdate = useCallback((chargerId: string, status: string) => {
    const update: OfflineUpdate = {
      chargerId,
      status,
      timestamp: new Date().toISOString()
    };

    const currentUpdates = JSON.parse(localStorage.getItem('offline-charger-updates') || '[]');
    const newUpdates = [...currentUpdates, update];
    
    localStorage.setItem('offline-charger-updates', JSON.stringify(newUpdates));
    setPendingUpdates(newUpdates);

    toast({
      title: "Update Queued",
      description: "Status will be updated when you are back online.",
    });
  }, [toast]);

  const syncOfflineUpdates = useCallback(async () => {
    if (!isOnline || pendingUpdates.length === 0) return;

    toast({
      title: "Syncing...",
      description: `Syncing ${pendingUpdates.length} pending update(s)`,
    });

    const successfulUpdates: string[] = [];
    
    for (const update of pendingUpdates) {
      try {
        const { error } = await supabase
          .from('chargers')
          .update({
            current_status: update.status,
            last_update_timestamp: update.timestamp
          })
          .eq('charger_id', update.chargerId);

        if (!error) {
          successfulUpdates.push(update.chargerId);
        } else {
          console.error('Failed to sync update:', error, update);
        }
      } catch (error) {
        console.error('Network error during sync:', error, update);
      }
    }

    if (successfulUpdates.length > 0) {
      // Remove successfully synced updates
      const remainingUpdates = pendingUpdates.filter(
        update => !successfulUpdates.includes(update.chargerId)
      );
      
      localStorage.setItem('offline-charger-updates', JSON.stringify(remainingUpdates));
      setPendingUpdates(remainingUpdates);

      toast({
        title: "Sync Complete",
        description: `Successfully synced ${successfulUpdates.length} update(s)`,
      });
    }
  }, [isOnline, pendingUpdates, toast]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingUpdates.length > 0) {
      const timer = setTimeout(() => {
        syncOfflineUpdates();
      }, 2000); // Wait 2 seconds after coming online

      return () => clearTimeout(timer);
    }
  }, [isOnline, pendingUpdates.length, syncOfflineUpdates]);

  return {
    setCacheData,
    getCacheData,
    queueStatusUpdate,
    syncOfflineUpdates,
    pendingUpdatesCount: pendingUpdates.length
  };
};
