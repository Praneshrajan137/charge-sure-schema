<<<<<<< HEAD
import React from 'react';
import { Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PlugShareHeaderProps {
  onMenuClick: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
}

const PlugShareHeader: React.FC<PlugShareHeaderProps> = ({
  onMenuClick,
  searchQuery,
  onSearchChange,
  onSearch
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <header className="bg-[#1e4d8b] text-white shadow-lg relative z-50">
      <div className="flex items-center px-4 py-3">
        {/* Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="text-white hover:bg-white/20 mr-3"
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* PlugShare Logo */}
        <div className="flex items-center mr-4">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-2">
            <div className="w-5 h-5 bg-[#1e4d8b] rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <span className="text-xl font-bold">PlugShare</span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for a Charging Location"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-4 pr-10 py-2 border-0 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white/20"
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={onSearch}
              className="absolute right-0 top-0 h-full px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PlugShareHeader;

=======
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PlugShareSidebar } from "./PlugShareSidebar";

interface PlugShareHeaderProps {
  onSearch: (query: string) => void;
}

export const PlugShareHeader = ({ onSearch }: PlugShareHeaderProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <header className="bg-primary text-primary-foreground h-16 flex items-center px-4 relative z-50">
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary/90 mr-3">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          
          <div className="flex-1 max-w-md">
            <SearchBar 
              onSearch={onSearch}
              placeholder="Search for a Charging Location"
              className="w-full"
            />
          </div>

          <SheetContent side="left" className="w-80 p-0">
            <PlugShareSidebar onClose={() => setIsSidebarOpen(false)} />
          </SheetContent>
        </Sheet>
      </header>
    </>
  );
};
>>>>>>> 62fe526454f3ea9e436e9defb8bb67902930024d
