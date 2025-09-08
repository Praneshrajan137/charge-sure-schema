<<<<<<< HEAD
import React from 'react';
import { X, Wrench, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LegendItem {
  color: string;
  icon?: React.ReactNode;
  label: string;
  description?: string;
}

interface PlugShareLegendProps {
  isOpen: boolean;
  onClose: () => void;
}

const PinIcon: React.FC<{ color: string; icon?: React.ReactNode; size?: number }> = ({ 
  color, 
  icon, 
  size = 20 
}) => (
  <div 
    className="relative flex items-center justify-center rounded-full border-2 border-white shadow-md"
    style={{ 
      backgroundColor: color, 
      width: size, 
      height: size 
    }}
  >
    {icon && (
      <span className="text-white text-xs">
        {icon}
      </span>
    )}
  </div>
);

const PlugScoreIndicator: React.FC = () => (
  <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
    10
  </div>
);

const PlugShareLegend: React.FC<PlugShareLegendProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const legendItems: LegendItem[] = [
    {
      color: '#22c55e', // Green
      label: 'Public',
      description: 'Publicly accessible charging stations'
    },
    {
      color: '#f97316', // Orange
      label: 'High Power',
      description: 'Fast charging stations (50kW+)'
    },
    {
      color: '#8b4513', // Brown
      label: 'Restricted',
      description: 'Limited access or membership required'
    },
    {
      color: '#6b7280', // Gray
      label: 'In Use',
      description: 'Currently occupied charging stations'
    },
    {
      color: '#1f2937', // Dark gray/black
      icon: <Wrench className="h-3 w-3" />,
      label: 'Under Repair',
      description: 'Temporarily out of service'
    },
    {
      color: '#14b8a6', // Teal
      icon: <Home className="h-3 w-3" />,
      label: 'Residential',
      description: 'Private home charging locations'
    },
    {
      color: '#8b5cf6', // Purple
      label: 'Place',
      description: 'Points of interest and destinations'
    }
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      
      {/* Legend Panel */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Legend</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Legend Content */}
        <div className="p-4 space-y-4">
          {/* Station Types */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Station Types</h3>
            <div className="space-y-3">
              {legendItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <PinIcon color={item.color} icon={item.icon} />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.label}</div>
                    {item.description && (
                      <div className="text-sm text-gray-600">{item.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PlugScore */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Quality Rating</h3>
            <div className="flex items-center space-x-3">
              <PlugScoreIndicator />
              <div className="flex-1">
                <div className="font-medium text-gray-900">PlugScore</div>
                <div className="text-sm text-gray-600">
                  Station reliability rating (0-10)
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="border-t border-gray-200 pt-4">
            <div className="text-sm text-gray-600 space-y-2">
              <p>Pin colors indicate station type and current status.</p>
              <p>Larger pins represent higher power charging stations.</p>
              <p>PlugScore shows community-rated station reliability.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlugShareLegend;

=======
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
>>>>>>> 62fe526454f3ea9e436e9defb8bb67902930024d
