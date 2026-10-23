import React from 'react';
import { Instagram, Facebook } from 'lucide-react';
import { TikTokIcon } from './TikTokIcon';

export function SocialIcons({ settings, className = '', iconClass = 'w-4 h-4' }) {
  const items = [
    { url: settings?.tiktok, Icon: TikTokIcon, label: 'TikTok' },
    { url: settings?.instagram, Icon: Instagram, label: 'Instagram' },
    { url: settings?.facebook, Icon: Facebook, label: 'Facebook' },
  ].filter((i) => i.url);
  if (!items.length) return null;
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {items.map((i) => (
        <a key={i.label} href={i.url} target="_blank" rel="noreferrer" aria-label={i.label} className="hover:text-accent transition-colors">
          <i.Icon className={iconClass} />
        </a>
      ))}
    </div>
  );
}

export default SocialIcons;