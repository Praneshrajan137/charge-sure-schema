import { MapPin, Zap, DollarSign, Wifi, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ChargingStation } from "../types"
import { cn } from "@/lib/utils"

interface StationCardProps {
	station: ChargingStation
	onSelect?: (station: ChargingStation) => void
	onGetDirections?: (station: ChargingStation) => void
}

export function StationCard({ station, onSelect, onGetDirections }: StationCardProps) {
	const getStatusColor = (status: ChargingStation["status"]) => {
		switch (status) {
			case "available":
				return "text-green-600 bg-green-50"
			case "in-use":
				return "text-yellow-600 bg-yellow-50"
			case "out-of-order":
				return "text-red-600 bg-red-50"
			case "restricted":
				return "text-gray-600 bg-gray-50"
			default:
				return "text-gray-600 bg-gray-50"
		}
	}

	const formatPrice = () => {
		if (station.pricing.free) return "Free"
		if (station.pricing.pricePerKwh) return `$${station.pricing.pricePerKwh.toFixed(2)}/kWh`
		if (station.pricing.pricePerMinute) return `$${station.pricing.pricePerMinute.toFixed(2)}/min`
		return "Pricing varies"
	}

	return (
		<div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
			<div className="flex items-start justify-between mb-3">
				<div className="flex-1">
					<h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{station.name}</h3>
					<p className="text-sm text-gray-600 mb-2 line-clamp-2">{station.address}</p>
					<div className="flex items-center gap-2 text-xs text-gray-500">
						<span>{station.network}</span>
						<span>•</span>
						<span>{new Date(station.lastUpdated).toLocaleDateString()}</span>
					</div>
				</div>
				<div className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(station.status))}>
					{station.status.replace("-", " ")}
				</div>
			</div>

			<div className="grid grid-cols-2 gap-4 mb-4">
				<div className="flex items-center gap-2">
					<Zap className="w-4 h-4 text-orange-500" />
					<span className="text-sm font-medium">{station.maxPower} kW</span>
				</div>
				<div className="flex items-center gap-2">
					<Car className="w-4 h-4 text-blue-500" />
					<span className="text-sm font-medium">{station.plugCount} plugs</span>
				</div>
				<div className="flex items-center gap-2">
					<DollarSign className="w-4 h-4 text-green-500" />
					<span className="text-sm font-medium">{formatPrice()}</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
						<span className="text-xs text-white font-bold">{station.plugScore}</span>
					</div>
					<span className="text-sm font-medium">PlugScore</span>
				</div>
			</div>

			{station.amenities.length > 0 && (
				<div className="mb-4">
					<div className="flex flex-wrap gap-1">
						{station.amenities.slice(0, 3).map((amenity) => (
							<span
								key={amenity}
								className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700 font-medium"
							>
								{amenity === "wifi" && <Wifi className="w-3 h-3 mr-1" />}
								{amenity.charAt(0).toUpperCase() + amenity.slice(1)}
							</span>
						))}
						{station.amenities.length > 3 && (
							<span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600 font-medium">
								+{station.amenities.length - 3} more
							</span>
						)}
					</div>
				</div>
			)}

			<div className="flex gap-2">
				<Button variant="outline" size="sm" onClick={() => onSelect?.(station)} className="flex-1">
					<MapPin className="w-4 h-4 mr-1" />
					View Details
				</Button>
				<Button size="sm" onClick={() => onGetDirections?.(station)} className="flex-1">
					Get Directions
				</Button>
			</div>
		</div>
	)
}
