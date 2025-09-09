import { useState, useMemo, useEffect, Suspense, lazy } from "react";
import StationsList from "@/components/StationsList";
import { FilterChips } from "@/components/FilterChips";
import OfflineIndicator from "@/components/OfflineIndicator";
import { EnhancedSearch } from "@/components/EnhancedSearch";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { StationsListSkeleton, MapSkeleton } from "@/components/LoadingSkeleton";
import { useLocation } from "@/hooks/useLocation";
import { useRecentStations } from "@/hooks/useRecentStations";
import { calculateDistance } from "@/utils/distance";
import { supabase } from "@/integrations/supabase/client";
import type { Station } from "@/hooks/useStations";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import PlugShareHeader from "@/components/PlugShareHeader";

const MapComponent = lazy(() =>
	import("@/components/Map/MapComponent").then((m) => ({ default: m.MapComponent })),
);

export default function Index() {
	// 1) State Management
	const [stations, setStations] = useState<Station[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [activeFilter, setActiveFilter] = useState<"available" | "fast" | "recent" | "all">("all");

	const { location } = useLocation();
	const { recentStations } = useRecentStations();
	const safeRecentStations = Array.isArray(recentStations) ? recentStations : [];

	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

	// Debounce search input
	useEffect(() => {
		const id = setTimeout(() => setDebouncedSearchQuery(searchQuery.trim()), 300);
		return () => clearTimeout(id);
	}, [searchQuery]);

	// 2) Data Fetching Logic
	useEffect(() => {
		let isMounted = true;

		const fetchStations = async () => {
			try {
				const { data, error: supabaseError } = await supabase
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

				if (supabaseError) {
					throw new Error(`Failed to fetch stations: ${supabaseError.message}`);
				}

				if (!isMounted) return;

				const formatted: Station[] = (data || []).map((s) => ({
					station_id: s.station_id,
					name: s.name,
					address: s.address,
					latitude: Number(s.latitude),
					longitude: Number(s.longitude),
					chargers: (s.chargers || []).map((c: any) => ({
						charger_id: c.charger_id,
						plug_type: c.plug_type,
						max_power_kw: c.max_power_kw,
						current_status: (c.current_status as "Available" | "In Use" | "Out of Service") ?? "Out of Service",
						last_update_timestamp: String(c.last_update_timestamp ?? ""),
						last_verified_at: c.last_verified_at ?? undefined,
						verification_count: c.verification_count ?? undefined,
						rating_score: c.rating_score ?? undefined,
						rating_count: c.rating_count ?? undefined,
					})),
				}));

				setStations(formatted);
			} catch (err) {
				if (!isMounted) return;
				setError(err as Error);
			} finally {
				if (!isMounted) return;
				setIsLoading(false);
			}
		};

		fetchStations();
		return () => {
			isMounted = false;
		};
	}, []);

	// 3) useMemo Hook Correction (guard + deps)
	const filteredStations = useMemo(() => {
		if (!stations || stations.length === 0) return [];

		let result = stations;

		// Text search (debounced)
		if (debouncedSearchQuery) {
			const q = debouncedSearchQuery.toLowerCase();
			result = result.filter(
				(station) =>
					station?.name?.toLowerCase().includes(q) ||
					station?.address?.toLowerCase().includes(q) ||
					(Array.isArray(station?.chargers) &&
						station.chargers.some((c) => c?.plug_type?.toLowerCase().includes(q))),
			);
		}

		// Filters
		if (activeFilter === "available") {
			result = result.filter(
				(station) =>
					Array.isArray(station?.chargers) &&
					stations &&
					station.chargers.some((c) => c?.current_status === "Available"),
			);
		} else if (activeFilter === "fast") {
			result = result.filter(
				(station) =>
					Array.isArray(station?.chargers) &&
					station.chargers.some((c) => (c?.max_power_kw ?? 0) >= 50),
			);
		} else if (activeFilter === "recent" && safeRecentStations.length > 0) {
			const recentIds = new Set(safeRecentStations.map((r) => r.station_id));
			result = result.filter((station) => recentIds.has(station?.station_id));
		}

		return result;
	}, [stations, debouncedSearchQuery, activeFilter, safeRecentStations]);

	// Sort by distance
	const sortedStations = useMemo(() => {
		if (!location || filteredStations.length === 0) return filteredStations;

		return [...filteredStations].sort((a, b) => {
			if (!a?.latitude || !a?.longitude || !b?.latitude || !b?.longitude) return 0;

			const distanceA = calculateDistance(
				{ latitude: location.latitude, longitude: location.longitude },
				{ latitude: a.latitude, longitude: a.longitude },
			);
			const distanceB = calculateDistance(
				{ latitude: location.latitude, longitude: location.longitude },
				{ latitude: b.latitude, longitude: b.longitude },
			);
			return distanceA - distanceB;
		});
	}, [filteredStations, location]);

	// 4) Conditional Rendering
	if (isLoading) {
		return (
			<ErrorBoundary>
				<div className="min-h-screen bg-background">
					<OfflineIndicator />
					<div className="container mx-auto p-4 space-y-6">
						<div className="space-y-4">
							<div className="max-w-md mx-auto h-10 bg-muted rounded animate-pulse" />
							<div className="flex gap-2 justify-center">
								<div className="h-8 w-20 bg-muted rounded animate-pulse" />
								<div className="h-8 w-16 bg-muted rounded animate-pulse" />
								<div className="h-8 w-18 bg-muted rounded animate-pulse" />
							</div>
						</div>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-300px)]">
							<div className="bg-card rounded-lg shadow-sm border">
								<MapSkeleton />
							</div>
							<div className="overflow-hidden">
								<StationsListSkeleton />
							</div>
						</div>
					</div>
				</div>
			</ErrorBoundary>
		);
	}

	if (error) {
		return (
			<ErrorBoundary>
				<div className="min-h-screen bg-background">
					<OfflineIndicator />
					<div className="container mx-auto p-4 space-y-6">
						<div className="flex items-center justify-center min-h-[400px] p-4">
							<Card className="max-w-md w-full">
								<CardContent className="p-6 text-center space-y-4">
									<div className="mx-auto h-12 w-12 text-destructive">
										<AlertTriangle size={48} />
									</div>
									<div className="space-y-2">
										<h3 className="font-semibold text-lg">Failed to Load Stations</h3>
										<p className="text-muted-foreground text-sm">{error.message}</p>
									</div>
									<Button onClick={() => window.location.reload()} className="w-full">
										<RefreshCw className="mr-2 h-4 w-4" />
										Try Again
									</Button>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</ErrorBoundary>
		);
	}

	// Main UI
	return (
		<ErrorBoundary>
			<div className="min-h-screen bg-background flex flex-col">
				<OfflineIndicator />

				<PlugShareHeader onSearch={(q) => setSearchQuery(q)} />

				<div className="container mx-auto p-4 space-y-6">
					<div className="space-y-4">
						<EnhancedSearch
							value={searchQuery}
							onChange={setSearchQuery}
							placeholder="Search by station name, address, or plug type..."
							stations={stations}
							showFilters={false}
							className="max-w-md mx-auto"
						/>

						<FilterChips
							activeFilter={activeFilter}
							onFilterChange={(f) => setActiveFilter((f ?? "all") as any)}
							locationEnabled={!!location}
							hasRecentStations={safeRecentStations.length > 0}
						/>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-300px)]">
						<div className="bg-card rounded-lg shadow-sm border">
							<div className="h-full">
								<Suspense fallback={<MapSkeleton />}>
									<MapComponent />
								</Suspense>
							</div>
						</div>

						<div className="overflow-hidden">
							<StationsList
								stations={sortedStations}
								selectedPlugTypes={[]}
								showAvailableOnly={false}
								userLocation={location ? { latitude: location.latitude, longitude: location.longitude } : null}
								onStationClick={() => {}}
							/>
						</div>
					</div>
				</div>
			</div>
		</ErrorBoundary>
	);
}
