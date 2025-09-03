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
    <div className="w-full animate-fade-in">
      <div className="bg-background/95 backdrop-blur-md rounded-xl border border-border/50 shadow-lg p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-foreground mb-2 w-full text-center">
            Filter by Plug Type
          </span>
          
          <div className="flex flex-wrap gap-2 justify-center w-full">
            {availablePlugTypes.map((plugType) => {
              const isSelected = selectedPlugTypes.includes(plugType);
              return (
                <Badge
                  key={plugType}
                  variant={isSelected ? "default" : "secondary"}
                  className={cn(
                    "cursor-pointer transition-all duration-300 hover-lift",
                    isSelected 
                      ? "bg-primary text-primary-foreground shadow-glow" 
                      : "hover:bg-secondary/80 hover:shadow-md"
                  )}
                  onClick={() => togglePlugType(plugType)}
                >
                  {plugTypeDisplayNames[plugType] || plugType}
                </Badge>
              );
            })}
          </div>
          
          {selectedPlugTypes.length > 0 && (
            <div className="w-full flex justify-center mt-2">
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-all duration-300"
                onClick={clearAll}
              >
                Clear All
              </Badge>
            </div>
          )}
        </div>
        
        {selectedPlugTypes.length > 0 && (
          <div className="mt-3 text-xs text-muted-foreground text-center">
            Showing {selectedPlugTypes.length} of {availablePlugTypes.length} plug types
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterChips;