import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const ChargeSureHeader = () => {
  return (
    <header className="bg-card border-b border-border h-16 flex items-center justify-between px-4 shadow-sm">
      <h1 className="text-xl font-bold text-foreground">ChargeSure</h1>
      <Avatar className="h-8 w-8">
        <AvatarImage src="/placeholder.svg" alt="Profile" />
        <AvatarFallback className="bg-primary text-primary-foreground text-sm">U</AvatarFallback>
      </Avatar>
    </header>
  );
};