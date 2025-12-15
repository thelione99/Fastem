import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSettings } from '../services/storage';
import { AppSettings } from '../types';

const defaultSettings: AppSettings = {
  eventName: 'RUSSOLOCO',
  eventSubtitle: 'Private Access Only',
  eventDate: '25 Dic 2025',
  eventTime: '01:00 - 06:00',
  eventLocation: 'Secret Location',
  enableLocation: 'true',
  eventDescription: 'Il rosso ci avvolge, il ritmo ci guida.',
  instagramUrl: 'https://www.instagram.com/',
  enablePromoterCode: 'true',
  
  // Grafica Defaults
  designStyle: 'glass',
  bgType: 'dots',
  bgColor: '#000000',
  bgDotColor: '#262626', 
  bgDotActiveColor: '#ef4444',
  primaryColor: '#ffffff',
  secondaryColor: '#9ca3af',
  accentColor: '#ef4444',
  buttonColor: '#ef4444',

  // Limiti Defaults
  maxGuests: '500',
  maxPromoters: '20'
};

const SettingsContext = createContext<AppSettings>(defaultSettings);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getSettings();
        if (data) setSettings({ ...defaultSettings, ...data });
      } catch (error) {
        console.error("Failed to load settings", error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);