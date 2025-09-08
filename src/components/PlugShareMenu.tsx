import React, { useState } from 'react';
import { X, ChevronDown, ChevronRight, MapPin, Filter, Plus, Route, Clock, Settings, HelpCircle, MessageSquare, Store, Download, Apple, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PlugShareMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLegendClick: () => void;
  onFiltersClick: () => void;
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  isExpandable?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  subItems?: Array<{ icon?: React.ReactNode; label: string; onClick?: () => void }>;
  className?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  onClick,
  isExpandable = false,
  isExpanded = false,
  onToggleExpand,
  subItems = [],
  className
}) => {
  const handleClick = () => {
    if (isExpandable && onToggleExpand) {
      onToggleExpand();
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div className={cn("border-b border-gray-100", className)}>
      <button
        onClick={handleClick}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-left"
      >
        <div className="flex items-center space-x-3">
          <span className="text-gray-600">{icon}</span>
          <span className="text-gray-900 font-medium">{label}</span>
        </div>
        {isExpandable && (
          <span className="text-gray-400">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
        )}
      </button>
      
      {isExpandable && isExpanded && subItems.length > 0 && (
        <div className="bg-gray-50">
          {subItems.map((subItem, index) => (
            <button
              key={index}
              onClick={subItem.onClick}
              className="w-full flex items-center space-x-3 px-8 py-2 hover:bg-gray-100 text-left"
            >
              {subItem.icon && <span className="text-gray-500">{subItem.icon}</span>}
              <span className="text-gray-700">{subItem.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const PlugShareMenu: React.FC<PlugShareMenuProps> = ({
  isOpen,
  onClose,
  onLegendClick,
  onFiltersClick
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemKey: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemKey)) {
      newExpanded.delete(itemKey);
    } else {
      newExpanded.add(itemKey);
    }
    setExpandedItems(newExpanded);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      
      {/* Menu Panel */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          <MenuItem
            icon={<MapPin className="h-5 w-5" />}
            label="Legend"
            onClick={onLegendClick}
          />
          
          <MenuItem
            icon={<Filter className="h-5 w-5" />}
            label="Filters"
            onClick={onFiltersClick}
          />
          
          <MenuItem
            icon={<Plus className="h-5 w-5" />}
            label="Add Station"
            isExpandable
            isExpanded={expandedItems.has('addStation')}
            onToggleExpand={() => toggleExpanded('addStation')}
            subItems={[
              { label: "Add Public Location" },
              { label: "Share Home Charger" }
            ]}
          />
          
          <MenuItem
            icon={<Route className="h-5 w-5" />}
            label="Trip Planner"
            isExpandable
            isExpanded={expandedItems.has('tripPlanner')}
            onToggleExpand={() => toggleExpanded('tripPlanner')}
            subItems={[
              { label: "Plan a New Trip" }
            ]}
          />
          
          <MenuItem
            icon={<Clock className="h-5 w-5" />}
            label="Recent Activity"
          />
          
          <MenuItem
            icon={<Settings className="h-5 w-5" />}
            label="Settings"
          />
          
          <MenuItem
            icon={<HelpCircle className="h-5 w-5" />}
            label="Help"
          />
          
          <MenuItem
            icon={<MessageSquare className="h-5 w-5" />}
            label="Submit Feedback"
          />
          
          <MenuItem
            icon={<Store className="h-5 w-5" />}
            label="PlugShare Store"
          />
          
          <MenuItem
            icon={<Download className="h-5 w-5" />}
            label="Get the App"
            isExpandable
            isExpanded={expandedItems.has('getApp')}
            onToggleExpand={() => toggleExpanded('getApp')}
            subItems={[
              { 
                icon: <Apple className="h-4 w-4" />, 
                label: "Apple App Store" 
              },
              { 
                icon: <Smartphone className="h-4 w-4" />, 
                label: "Google Play Store" 
              }
            ]}
          />
        </div>
        
        {/* Bottom Share Feedback Link */}
        <div className="mt-8 px-4 pb-4">
          <button className="text-blue-600 hover:text-blue-800 font-medium">
            Share Feedback
          </button>
        </div>
      </div>
    </>
  );
};

export default PlugShareMenu;

