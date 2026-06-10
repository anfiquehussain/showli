import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/useToast';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const useInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(display-mode: standalone)').matches || 
             ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true);
    }
    return false;
  });
  const { success, error } = useToast();

  useEffect(() => {
    if (isInstalled) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsInstalled(true);
      success('ShowLi has been installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [success, isInstalled]);

  const install = async () => {
    if (!deferredPrompt) {
      error('Installation is not supported on this browser or the app is already installed.');
      return;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        success('Installing ShowLi…');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during installation';
      error(`Installation failed: ${errorMessage}`);
    } finally {
      // We've used the prompt, and can't use it again
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  return { isInstallable, isInstalled, install };
};
