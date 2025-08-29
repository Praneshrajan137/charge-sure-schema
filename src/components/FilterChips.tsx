import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FilterChipsProps {
  availablePlugTypes: string[];
  selectedPlugTypes: string[];
  onSelectionChange: (selected: string[]) => void;
}

const plugTypeDisplayNames: Record<string, string> = {
  'CCS': 'CCS',
  'CHAdeMO': 'CHAdeMO',
  'Type 2': 'Type 2',
  'J-1772': 'J1772',
};

const FilterChips: React.FC<FilterChipsProps> = ({ 
  availablePlugTypes, 
  selectedPlugTypes, 
  onSelectionChange 
}) => {
  const togglePlugType = (plugType: string) => {
    if (selectedPlugTypes.includes(plugType)) {
      onSelectionChange(selectedPlugTypes.filter(type => type !== plugType));
    } else {
      onSelectionChange([...selectedPlugTypes, plugType]);
    }
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
      <div className="bg-background/95 backdrop-blur-sm rounded-lg border border-border shadow-lg p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-foreground">Filter by Plug Type:</span>
          
          {availablePlugTypes.map((plugType) => {
            const isSelected = selectedPlugTypes.includes(plugType);
            return (
              <Badge
                key={plugType}
                variant={isSelected ? "default" : "secondary"}
                className={cn(
                  "cursor-pointer transition-all hover:scale-105",
                  isSelected 
                    ? "bg-primary text-primary-foreground hover:bg-primary/80" 
                    : "hover:bg-secondary/80"
                )}
                onClick={() => togglePlugType(plugType)}
              >
                {plugTypeDisplayNames[plugType] || plugType}
              </Badge>
            );
          })}
          
          {selectedPlugTypes.length > 0 && (
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
              onClick={clearAll}
            >
              Clear All
            </Badge>
          )}
        </div>
        
        {selectedPlugTypes.length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            Showing {selectedPlugTypes.length} of {availablePlugTypes.length} plug types
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterChips;