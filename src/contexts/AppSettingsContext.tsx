
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AppSettings {
  language: string;
  theme: string;
  fontSize: number;
}

interface AppSettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  signOut: () => void;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
};

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>({
    language: 'en',
    theme: 'light',
    fontSize: 16,
  });

  useEffect(() => {
    // Load settings from localStorage on mount
    const savedSettings = localStorage.getItem('app_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        applySettings(parsed);
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  const applySettings = (newSettings: AppSettings) => {
    // Apply theme
    document.documentElement.setAttribute('data-theme', newSettings.theme);
    
    // Apply font size
    document.documentElement.style.setProperty('--base-font-size', `${newSettings.fontSize}px`);
    
    // Apply language (this would typically involve i18n)
    document.documentElement.setAttribute('lang', newSettings.language);
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('app_settings', JSON.stringify(updatedSettings));
    applySettings(updatedSettings);
  };

  const signOut = () => {
    // Clear all user data from localStorage
    localStorage.removeItem('app_settings');
    localStorage.removeItem('ratTracker_tasks');
    localStorage.removeItem('ratTracker_user');
    
    // Reset settings to defaults
    const defaultSettings = {
      language: 'en',
      theme: 'light',
      fontSize: 16,
    };
    setSettings(defaultSettings);
    applySettings(defaultSettings);
  };

  return (
    <AppSettingsContext.Provider value={{ settings, updateSettings, signOut }}>
      {children}
    </AppSettingsContext.Provider>
  );
};
