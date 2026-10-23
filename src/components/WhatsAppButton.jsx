import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useSettings, waMe } from '@/lib/settingsContext';

export default function WhatsAppButton() {
  const s = useSettings();
  if (!s?.phone) return null;
  return (
    <a
      href={waMe(s.phone)}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 transition-transform"
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  );
}