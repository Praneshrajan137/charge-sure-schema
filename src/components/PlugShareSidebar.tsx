import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  MapPin, Filter, Plus, Navigation, Clock, Settings, 
  HelpCircle, MessageSquare, ShoppingCart, Download,
  ChevronRight, ChevronDown, Apple, Smartphone
} from "lucide-react";
import { cn } from "@/lib/utils";
import PlugShareLegend from "./PlugShareLegend";

interface PlugShareSidebarProps {
	onClose: () => void;
}

type SubItem = {
	label: string;
	icon?: React.ComponentType<{ className?: string }>;
};

type MenuItem = {
	id: string;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
	onClick?: () => void;
	href?: string;
	expandable?: boolean;
	subItems?: SubItem[];
};

export const PlugShareSidebar = ({ onClose }: PlugShareSidebarProps) => {
	const [expandedItems, setExpandedItems] = useState<string[]>([]);
	const [showLegend, setShowLegend] = useState(false);

	const toggleExpanded = (item: string) => {
		setExpandedItems(prev => 
			prev.includes(item) 
				? prev.filter(i => i !== item)
				: [...prev, item]
		);
	};

	const menuItems: MenuItem[] = [
		{
			id: "legend",
			label: "Legend",
			icon: MapPin,
			onClick: () => setShowLegend(true)
		},
		{
			id: "filters",
			label: "Filters",
			icon: Filter,
			href: "/filters"
		},
		{
			id: "add-station",
			label: "Add Station",
			icon: Plus,
			expandable: true,
			subItems: [
				{ label: "Add Public Location" },
				{ label: "Share Home Charger" }
			]
		},
		{
			id: "trip-planner", 
			label: "Trip Planner",
			icon: Navigation,
			expandable: true,
			subItems: [
				{ label: "Plan a New Trip" }
			]
		},
		{
			id: "recent-activity",
			label: "Recent Activity", 
			icon: Clock
		},
		{
			id: "settings",
			label: "Settings",
			icon: Settings
		},
		{
			id: "help",
			label: "Help",
			icon: HelpCircle
		},
		{
			id: "feedback",
			label: "Submit Feedback",
			icon: MessageSquare
		},
		{
			id: "store",
			label: "PlugShare Store",
			icon: ShoppingCart
		},
		{
			id: "get-app",
			label: "Get the App",
			icon: Download,
			expandable: true,
			subItems: [
				{ label: "Apple App Store", icon: Apple },
				{ label: "Google Play Store", icon: Smartphone }
			]
		}
	];

	if (showLegend) {
		return <PlugShareLegend isOpen={true} onClose={() => setShowLegend(false)} />;
	}

	return (
		<div className="h-full bg-background">
			<div className="p-4 border-b">
				<h2 className="text-lg font-semibold">PlugShare</h2>
			</div>
			
			<div className="flex-1 overflow-y-auto">
				{menuItems.map((item) => (
					<div key={item.id}>
						<Button
							variant="ghost"
							className={cn(
								"w-full justify-start px-4 py-3 h-auto text-left rounded-none border-b border-border/50",
								"hover:bg-muted/50"
							)}
							onClick={() => {
								if (item.expandable) {
									toggleExpanded(item.id);
								} else if (item.onClick) {
									item.onClick();
								} else {
									onClose();
								}
							}}
						>
							<item.icon className="h-5 w-5 mr-3 text-muted-foreground" />
							<span className="flex-1">{item.label}</span>
							{item.expandable && (
								expandedItems.includes(item.id) ? 
									<ChevronDown className="h-4 w-4" /> : 
									<ChevronRight className="h-4 w-4" />
							)}
						</Button>
						
						{item.expandable && expandedItems.includes(item.id) && item.subItems && (
							<div className="bg-muted/30">
								{item.subItems.map((subItem, index) => (
									<Button
										key={index}
										variant="ghost"
										className="w-full justify-start px-12 py-2 h-auto text-left rounded-none text-sm"
										onClick={onClose}
									>
										{subItem.icon ? <subItem.icon className="h-4 w-4 mr-2" /> : null}
										{subItem.label}
									</Button>
								))}
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
};