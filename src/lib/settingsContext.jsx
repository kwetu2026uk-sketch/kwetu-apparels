import React, { createContext, useContext, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const DEFAULT_SETTINGS = {
  phone: '+254140910889',
  email: 'Kwetu2025uk@gmail.com',
  working_hours: '10:30 AM - 5:30 PM, every day',
  tiktok: '',
  instagram: '',
  facebook: '',
  address: 'Ridgeways Mall, Kiambu Road, Nairobi',
  map_query: 'Ridgeways Mall Nairobi',
  mission: '',
  vision: '',
  ceo_name: '',
  ceo_photo: '',
  ceo_message: '',
};

const SettingsContext = createContext(DEFAULT_SETTINGS);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  useEffect(() => {
    base44.entities.SiteSettings.list('-created_date', 1)
      .then((r) => {
        if (r && r[0]) setSettings({ ...DEFAULT_SETTINGS, ...r[0] });
      })
      .catch(() => {});
  }, []);
  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext) || DEFAULT_SETTINGS;
}

export const waMe = (phone) => 'https://wa.me/' + String(phone || '').replace(/[^0-9]/g, '');
export const telLink = (phone) => 'tel:' + String(phone || '').replace(/\s+/g, '');