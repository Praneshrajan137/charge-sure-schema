import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChargerRating } from '@/hooks/useChargerRating';
import { useAnalytics, ANALYTICS_EVENTS } from '@/hooks/useAnalytics';

interface ChargerRatingProps {
  chargerId: string;
  ratingScore?: number;
  ratingCount?: number;
  className?: string;
}

export const ChargerRating: React.FC<ChargerRatingProps> = ({
  chargerId,
  ratingScore,
  ratingCount,
  className = "",
}) => {
  const { userRating, isSubmitting, submitRating } = useChargerRating(chargerId);
  const { trackEvent } = useAnalytics();

  const handleRating = (rating: 'up' | 'down') => {
    submitRating(rating);
    trackEvent({
      event_type: ANALYTICS_EVENTS.CHARGER_RATING,
      charger_id: chargerId,
      event_data: { rating }
    });
  };

  const upPercentage = ratingScore || 0;
  const totalRatings = ratingCount || 0;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleRating('up')}
          disabled={isSubmitting}
          className={`h-8 w-8 p-0 ${
            userRating?.rating === 'up'
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'text-muted-foreground hover:text-green-600 hover:bg-green-50'
          }`}
        >
          <ThumbsUp className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleRating('down')}
          disabled={isSubmitting}
          className={`h-8 w-8 p-0 ${
            userRating?.rating === 'down'
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'text-muted-foreground hover:text-red-600 hover:bg-red-50'
          }`}
        >
          <ThumbsDown className="h-4 w-4" />
        </Button>
      </div>
      
      {totalRatings > 0 && (
        <div className="text-xs text-muted-foreground">
          {upPercentage}% positive ({totalRatings} ratings)
        </div>
      )}
    </div>
  );
};