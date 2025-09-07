import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LegendItem {
  color: string;
  label: string;
  shape?: "circle" | "square";
}

interface PlugShareLegendProps {
  onBack: () => void;
}

export const PlugShareLegend = ({ onBack }: PlugShareLegendProps) => {
  const legendItems: LegendItem[] = [
    { color: "#22c55e", label: "Public", shape: "circle" },
    { color: "#f97316", label: "High Power", shape: "circle" },
    { color: "#8b4513", label: "Restricted", shape: "circle" },
    { color: "#6b7280", label: "In Use", shape: "circle" },
    { color: "#1f2937", label: "Under Repair", shape: "circle" },
    { color: "#14b8a6", label: "Residential", shape: "circle" },
    { color: "#8b5cf6", label: "Place", shape: "square" },
  ];

  return (
    <div className="h-full bg-background">
      <div className="p-4 border-b flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mr-2 p-1"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">Legend</h2>
      </div>
      
      <div className="p-4 space-y-3">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div
              className={`w-4 h-4 flex-shrink-0 ${
                item.shape === "square" ? "rounded-sm" : "rounded-full"
              }`}
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm">{item.label}</span>
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <Badge variant="secondary" className="bg-green-500 text-white text-xs px-2 py-1">
              10
            </Badge>
            <span className="text-sm">PlugScore</span>
          </div>
          <p className="text-xs text-muted-foreground">
            PlugScore rates the reliability and user experience of charging locations
          </p>
        </div>
      </div>
    </div>
  );
};