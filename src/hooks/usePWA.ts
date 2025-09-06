import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{outcome: 'accepted' | 'dismissed'}>;
}

export const usePWA = () => {
  const [canInstall, setCanInstall] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-info bar from appearing
      e.preventDefault();
      
      const installEvent = e as BeforeInstallPromptEvent;
      setInstallPrompt(installEvent);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setCanInstall(false);
      setInstallPrompt(null);
    };

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setCanInstall(false);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!installPrompt) return false;

    try {
      await installPrompt.prompt();
      const result = await installPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        setCanInstall(false);
        setInstallPrompt(null);
        return true;
      }
    } catch (error) {
      console.error('Error prompting for install:', error);
    }

    return false;
  };

  return {
    canInstall,
    promptInstall
  };
};
