// src/hooks/useInstallPrompt.js
import { useState, useEffect } from 'react';

const useInstallPrompt = () => {
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    const beforeInstallPromptHandler = (e) => {
      e.preventDefault(); // Prevent the mini-infobar from appearing on mobile
      setInstallPromptEvent(e);
    };

    const appInstalledHandler = () => {
      setIsAppInstalled(true);
      setInstallPromptEvent(null);
    };

    window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler);
    window.addEventListener('appinstalled', appInstalledHandler);

    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsAppInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallPromptHandler);
      window.removeEventListener('appinstalled', appInstalledHandler);
    };
  }, []);

  const promptInstall = () => {
    if (!installPromptEvent) return;
    installPromptEvent.prompt();
  };

  return { promptInstall, canInstall: !!installPromptEvent, isAppInstalled };
};

export default useInstallPrompt;