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