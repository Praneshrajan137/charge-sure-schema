import React from 'react';
import { Clock, Users, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface TrustIndicatorsProps {
  lastVerifiedAt?: string;
  verificationCount?: number;
  ratingScore?: number;
  ratingCount?: number;
  lastUpdateTimestamp?: string;
  className?: string;
}

export const TrustIndicators: React.FC<TrustIndicatorsProps> = ({
  lastVerifiedAt,
  verificationCount,
  ratingScore,
  ratingCount,
  // lastUpdateTimestamp,
  className = "",
}) => {
  const getVerificationBadge = () => {
    if (!lastVerifiedAt) {
      return (
        <Badge variant="secondary" className="text-xs">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Not verified
        </Badge>
      );
    }

    const lastVerified = new Date(lastVerifiedAt);
    const hoursAgo = (Date.now() - lastVerified.getTime()) / (1000 * 60 * 60);

    if (hoursAgo < 24) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Recently verified
        </Badge>
      );
    } else if (hoursAgo < 168) { // 1 week
      return (
        <Badge variant="secondary" className="text-xs">
          <Clock className="h-3 w-3 mr-1" />
          Verified {formatDistanceToNow(lastVerified, { addSuffix: true })}
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="border-amber-200 text-amber-700 text-xs">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Last verified {formatDistanceToNow(lastVerified, { addSuffix: true })}
        </Badge>
      );
    }
  };

  const getTrustScore = () => {
    let score = 0;
    
    // Recent verification (0-40 points)
    if (lastVerifiedAt) {
      const hoursAgo = (Date.now() - new Date(lastVerifiedAt).getTime()) / (1000 * 60 * 60);
      if (hoursAgo < 24) score += 40;
      else if (hoursAgo < 168) score += 20;
    }
    
    // Multiple verifications (0-20 points)
    if (verificationCount && verificationCount > 1) {
      score += Math.min(20, verificationCount * 2);
    }
    
    // Good ratings (0-40 points)
    if (ratingScore && ratingCount && ratingCount >= 3) {
      score += Math.min(40, (ratingScore / 100) * 40);
    }

    return Math.round(score);
  };

  const trustScore = getTrustScore();
  const getTrustLabel = (score: number) => {
    if (score >= 80) return { label: 'Highly trusted', color: 'bg-green-100 text-green-800' };
    if (score >= 60) return { label: 'Trusted', color: 'bg-blue-100 text-blue-800' };
    if (score >= 40) return { label: 'Somewhat trusted', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Limited data', color: 'bg-gray-100 text-gray-600' };
  };

  const trustInfo = getTrustLabel(trustScore);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2 flex-wrap">
        {getVerificationBadge()}
        
        {trustScore > 0 && (
          <Badge variant="secondary" className={`text-xs ${trustInfo.color}`}>
            <Users className="h-3 w-3 mr-1" />
            {trustInfo.label}
          </Badge>
        )}
      </div>

      {(verificationCount || ratingCount) && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {verificationCount && verificationCount > 0 && (
            <span>{verificationCount} report{verificationCount !== 1 ? 's' : ''}</span>
          )}
          {ratingCount && ratingCount > 0 && (
            <span>{ratingCount} rating{ratingCount !== 1 ? 's' : ''}</span>
          )}
        </div>
      )}
    </div>
  );
};