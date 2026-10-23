export const COLOUR_SWATCHES = {
  'White': '#ffffff',
  'Navy Blue': '#1a2740',
  'Navy': '#1a2740',
  'Black': '#000000',
  'Grey': '#9ca3af',
  'Gray': '#9ca3af',
  'Red': '#b91c1c',
  'Blue': '#2563eb',
  'Green': '#15803d',
  'Maroon': '#7b1e2b',
  'Sky Blue': '#7dd3fc',
  'Pink': '#f9a8d4',
};

export const PATTERN_COLOURS = ['Checkered', 'Striped'];

export function isPatternColour(c) {
  return PATTERN_COLOURS.includes(c);
}

export function swatchBackground(colour) {
  if (colour === 'Checkered') {
    return 'conic-gradient(#1a2740 90deg, #ffffff 90deg 180deg, #1a2740 180deg 270deg, #ffffff 270deg)';
  }
  if (colour === 'Striped') {
    return 'repeating-linear-gradient(45deg, #1a2740 0 4px, #ffffff 4px 8px)';
  }
  return COLOUR_SWATCHES[colour] || colour || '#cccccc';
}