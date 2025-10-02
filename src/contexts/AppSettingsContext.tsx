
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface AppSettings {
  language: string;
  theme: string;
  fontSize: number;
  fontFamily: string;
}

interface AppSettingsContextType {
  settings: AppSettings;
  updateSetting: (key: keyof AppSettings, value: string | number) => void;
}

const defaultSettings: AppSettings = {
  language: 'en',
  theme: 'light',
  fontSize: 16,
  fontFamily: 'system'
};

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
};

interface AppSettingsProviderProps {
  children: ReactNode;
}

export const AppSettingsProvider = ({ children }: AppSettingsProviderProps) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const savedSettings = localStorage.getItem('ratTracker_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        return { ...defaultSettings, ...parsed };
      } catch (error) {
        console.error('Error loading settings:', error);
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  // Safely access i18n after component mounts
  const { i18n } = useTranslation();

  // Apply language to i18n after it's initialized
  useEffect(() => {
    if (settings.language && i18n.isInitialized) {
      i18n.changeLanguage(settings.language);
    }
  }, [settings.language, i18n]);

  useEffect(() => {
    // Apply settings to document
    document.documentElement.style.fontSize = `${settings.fontSize}px`;
    document.documentElement.setAttribute('data-theme', settings.theme);
    // document.documentElement.setAttribute('data-language', settings.language); // i18next handles this

    // Apply font family
    if (settings.fontFamily !== 'system') {
      document.documentElement.style.fontFamily = settings.fontFamily;
    } else {
      document.documentElement.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    }

    // Save to localStorage
    localStorage.setItem('ratTracker_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key: keyof AppSettings, value: string | number) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      if (key === 'language' && typeof value === 'string') {
        i18n.changeLanguage(value);
      }
      return newSettings;
    });
  };

  return (
    <AppSettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </AppSettingsContext.Provider>
  );
};
