import { Map, List, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const tabs = [
    { id: "map", label: "Map", icon: Map },
    { id: "list", label: "List", icon: List },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="bg-card border-t border-border h-16 flex items-center justify-around shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors",
              "hover:bg-muted",
              isActive && "text-primary"
            )}
          >
            <Icon className={cn("h-6 w-6", isActive ? "stroke-[2]" : "stroke-[1.5]")} />
            <span className={cn("text-xs", isActive ? "font-medium" : "font-normal")}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};