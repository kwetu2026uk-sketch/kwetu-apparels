import React from 'react';
import { swatchBackground, isPatternColour } from '@/lib/colours';

export default function Swatch({ colour, size = 16, selected, onClick, className = '' }) {
  const bg = swatchBackground(colour);
  return (
    <span
      onClick={onClick}
      title={colour}
      style={{
        width: size,
        height: size,
        background: bg,
        backgroundSize: isPatternColour(colour) ? 8 : undefined,
      }}
      className={`inline-block rounded-full border shrink-0 ${
        selected ? 'border-accent ring-2 ring-accent/40' : 'border-border'
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    />
  );
}