import PlugShareFilters from "@/components/PlugShareFilters";

export default function FiltersPage() {
	return <PlugShareFilters isOpen={true} onClose={() => {}} filters={{ plugScore: 0, kilowattRange: [0,350], stationCount: 'any', amenities: new Set(), parking: new Set(), plugTypes: new Set(), country: 'current' }} onFiltersChange={() => {}} />;
}