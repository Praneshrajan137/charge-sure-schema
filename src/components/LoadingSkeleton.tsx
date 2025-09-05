import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const StationCardSkeleton = () => (
  <Card className="hover-lift">
    <CardContent className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
      
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-24" />
      </div>
    </CardContent>
  </Card>
);

export const StationsListSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-4 w-24" />
    </div>
    
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <StationCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export const MapSkeleton = () => (
  <div className="relative w-full h-full bg-muted rounded-lg animate-pulse">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-muted-foreground text-sm font-medium">Loading map...</div>
    </div>
  </div>
);