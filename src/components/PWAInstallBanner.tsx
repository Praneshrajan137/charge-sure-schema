import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, X } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

const PWAInstallBanner = () => {
  const { canInstall, promptInstall } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) {
    return null;
  }

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      setDismissed(true);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <Card className="p-4 bg-card border border-border shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Install ChargeSure</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setDismissed(true)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Install the app for faster access and offline features.
        </p>
        <Button onClick={handleInstall} className="w-full" size="sm">
          Install App
        </Button>
      </Card>
    </div>
  );
};

export default PWAInstallBanner;
