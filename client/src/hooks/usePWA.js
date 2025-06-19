import { useState, useEffect } from 'react';

// Global flag to ensure service worker is only registered once
let isServiceWorkerRegistered = false;
let globalSwRegistration = null;

/**
 * Custom hook for Progressive Web App functionality
 * Handles service worker registration, installation prompts, and offline status
 */
export const usePWA = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstallable, setIsInstallable] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [swRegistration, setSwRegistration] = useState(globalSwRegistration);
  const [swUpdate, setSwUpdate] = useState(null);

  // Register Service Worker only once globally
  useEffect(() => {
    const registerSW = async () => {
      if ('serviceWorker' in navigator && !isServiceWorkerRegistered) {
        try {
          console.log('🌱 Registering service worker...');
          isServiceWorkerRegistered = true;
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          });
          
          globalSwRegistration = registration;
          setSwRegistration(registration);
          console.log('🌱 Service worker registered successfully');

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // New update available
                    setSwUpdate(registration);
                    console.log('🌱 New app version available');
                  }
                }
              });
            }
          });
        } catch (error) {
          console.error('🌱 Service worker registration failed:', error);
          isServiceWorkerRegistered = false;
        }
      } else if (globalSwRegistration) {
        // Use the existing registration
        setSwRegistration(globalSwRegistration);
      }
    };

    registerSW();
  }, []);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🌱 Back online');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('🌱 Gone offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      console.log('🌱 Install prompt available');
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      console.log('🌱 PWA installed successfully');
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Install PWA
  const installPWA = async () => {
    if (!installPrompt) return false;

    try {
      const result = await installPrompt.prompt();
      console.log('🌱 Install prompt result:', result);
      
      if (result.outcome === 'accepted') {
        setIsInstallable(false);
        setInstallPrompt(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('🌱 Install failed:', error);
      return false;
    }
  };

  // Update app
  const updateApp = () => {
    if (swUpdate && swUpdate.waiting) {
      swUpdate.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  // Background sync for offline actions
  const syncOfflineData = async (tag, data) => {
    if (swRegistration && swRegistration.sync) {
      try {
        // Store data for sync
        localStorage.setItem(`offline-${tag}`, JSON.stringify(data));
        
        // Register background sync
        await swRegistration.sync.register(tag);
        console.log(`🌱 Background sync registered for ${tag}`);
        return true;
      } catch (error) {
        console.error(`🌱 Background sync failed for ${tag}:`, error);
        return false;
      }
    }
    return false;
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  // Subscribe to push notifications
  const subscribeToPush = async () => {
    if (!swRegistration) return null;

    try {
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY || '')
      });
      
      console.log('🌱 Push subscription created:', subscription);
      return subscription;
    } catch (error) {
      console.error('🌱 Push subscription failed:', error);
      return null;
    }
  };

  // Utility function for VAPID key conversion
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  return {
    // Status
    isOnline,
    isInstallable,
    isInstalled,
    swRegistration,
    hasUpdate: !!swUpdate,
    
    // Actions
    installPWA,
    updateApp,
    syncOfflineData,
    requestNotificationPermission,
    subscribeToPush
  };
};

export default usePWA;
