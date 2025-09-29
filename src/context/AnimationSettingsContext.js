import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const defaultAnimationSettings = {
  general: {
    showPlasma: true,
    showNetwork: false,
  },
  plasma: {
    primaryColor: '#359ed0',
    secondaryColor: '#040e21',
    noiseScale: 0.005,
    timeScale: 0.0005,
    scalingFactor: 8,
    heightRatio: 0.6,
  },
  network: {
    pointColor: '#3fbaf3',
    pointOpacity: 0.5,
    pointSize: 1.5,
    lineColor: '#1e90ff',
    maxLineOpacity: 1,
    connectionDistance: 150,
    speed: 0.15,
    pointDensity: 20000,
    lineWidth: 1,
    backgroundBlur: 0,
  },
};

const AnimationSettingsContext = createContext();

const cloneSettings = (settings) => ({
  general: { ...settings.general },
  plasma: { ...settings.plasma },
  network: { ...settings.network },
});

const loadStoredSettings = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem('animation-settings');
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    return {
      general: { ...defaultAnimationSettings.general, ...(parsed.general || {}) },
      plasma: { ...defaultAnimationSettings.plasma, ...(parsed.plasma || {}) },
      network: { ...defaultAnimationSettings.network, ...(parsed.network || {}) },
    };
  } catch (error) {
    console.warn('Failed to load animation settings from localStorage:', error);
    return null;
  }
};

export const AnimationSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => loadStoredSettings() || cloneSettings(defaultAnimationSettings));

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem('animation-settings', JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to persist animation settings to localStorage:', error);
    }
  }, [settings]);

  const updateSettings = (section, values) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...values,
      },
    }));
  };

  const resetSettings = () => {
    setSettings(cloneSettings(defaultAnimationSettings));
  };

  const value = useMemo(
    () => ({ settings, updateSettings, resetSettings, defaultSettings: cloneSettings(defaultAnimationSettings) }),
    [settings],
  );

  return (
    <AnimationSettingsContext.Provider value={value}>
      {children}
    </AnimationSettingsContext.Provider>
  );
};

export const useAnimationSettings = () => {
  const context = useContext(AnimationSettingsContext);
  if (!context) {
    throw new Error('useAnimationSettings must be used within an AnimationSettingsProvider');
  }
  return context;
};

export { defaultAnimationSettings };
