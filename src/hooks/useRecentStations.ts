import { useState, useEffect } from "react";

const RECENT_STATIONS_KEY = "ev-charger-recent-stations";
const MAX_RECENT_STATIONS = 5;

export interface RecentStation {
  station_id: string;
  name: string;
  address: string;
  visitedAt: string;
}

export const useRecentStations = () => {
  const [recentStations, setRecentStations] = useState<RecentStation[]>([]);

  // Load recent stations from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_STATIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecentStations(parsed);
      }
    } catch (error) {
      console.error("Error loading recent stations:", error);
    }
  }, []);

  const addRecentStation = (station: Omit<RecentStation, "visitedAt">) => {
    const newRecentStation: RecentStation = {
      ...station,
      visitedAt: new Date().toISOString(),
    };

    setRecentStations(prev => {
      // Remove existing entry if it exists
      const filtered = prev.filter(s => s.station_id !== station.station_id);
      
      // Add new entry at the beginning
      const updated = [newRecentStation, ...filtered];
      
      // Keep only the most recent entries
      const trimmed = updated.slice(0, MAX_RECENT_STATIONS);
      
      // Save to localStorage
      try {
        localStorage.setItem(RECENT_STATIONS_KEY, JSON.stringify(trimmed));
      } catch (error) {
        console.error("Error saving recent stations:", error);
      }
      
      return trimmed;
    });
  };

  const clearRecentStations = () => {
    setRecentStations([]);
    try {
      localStorage.removeItem(RECENT_STATIONS_KEY);
    } catch (error) {
      console.error("Error clearing recent stations:", error);
    }
  };

  return {
    recentStations,
    addRecentStation,
    clearRecentStations,
  };
};
