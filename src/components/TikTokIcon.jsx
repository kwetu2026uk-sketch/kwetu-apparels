import React from 'react';

export function TikTokIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.5 3c.3 2.1 1.6 3.6 3.5 3.9v2.4c-1.2.1-2.4-.2-3.5-.8v5.9c0 3.2-2.3 5.6-5.4 5.6-3 0-5.4-2.4-5.4-5.4 0-3.1 2.6-5.4 5.7-5.2v2.5c-.4-.1-.8-.2-1.3-.2-1.6 0-2.9 1.3-2.9 2.9s1.3 2.8 2.9 2.8c1.7 0 3-1.3 3-3V3h2.4z" />
    </svg>
  );
}

export default TikTokIcon;