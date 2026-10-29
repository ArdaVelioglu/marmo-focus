// The 8 eras. `hours` = total focus hours needed to unlock.
// `tint` is the app accent for light / dark UI. `scene` drives the room art palette.
export const ERAS = [
  {
    id: 'stone', index: 0, hours: 0,
    name: 'Stone Age',
    tagline: 'A sunny valley, a smoking volcano, and a very friendly dinosaur.',
    tint: { light: '#cc6c3d', dark: '#f0a07a' },
    scene: { wall: ['#ffd6b8', '#f6e3c0'], floor: ['#a9d58f', '#86bd70'], accent: '#e8a25a', glow: '#fff1c4' },
  },
  {
    id: 'egypt', index: 1, hours: 2,
    name: 'Ancient Egypt',
    tagline: 'Sandstone halls, gold leaf, and a pharaoh with ear tufts.',
    tint: { light: '#b9852c', dark: '#f2c46e' },
    scene: { wall: ['#e2c08d', '#b98d55'], floor: ['#c59a5e', '#9a7140'], accent: '#d4a017', glow: '#ffd76a' },
  },
  {
    id: 'medieval', index: 2, hours: 5,
    name: 'Medieval',
    tagline: 'Stone walls, a hearth, and candlelight for long study nights.',
    tint: { light: '#b04a5c', dark: '#f08a99' },
    scene: { wall: ['#7b7f86', '#555a61'], floor: ['#6b4a33', '#4b3322'], accent: '#a8323e', glow: '#ffb05a' },
  },
  {
    id: 'pirate', index: 3, hours: 10,
    name: 'Pirate Age',
    tagline: "The captain's cabin. Charts, treasure, and a sea breeze.",
    tint: { light: '#3a8aa0', dark: '#7cc7d8' },
    scene: { wall: ['#8a5a36', '#5e3b22'], floor: ['#6b4426', '#472c18'], accent: '#c8a24a', glow: '#ffcf7a' },
  },
  {
    id: 'steampunk', index: 4, hours: 18,
    name: 'Steampunk',
    tagline: 'Brass, steam, and clockwork that ticks with every minute you focus.',
    tint: { light: '#a97d36', dark: '#e2b867' },
    scene: { wall: ['#5b4636', '#3a2c22'], floor: ['#4a382b', '#2e231b'], accent: '#c9943f', glow: '#ffbf5e' },
  },
  {
    id: 'modern', index: 5, hours: 30,
    name: 'Modern Loft',
    tagline: 'Clean lines, city lights, and plants that like you back.',
    tint: { light: '#4f86cf', dark: '#8db8f0' },
    scene: { wall: ['#eceae6', '#d9d6d0'], floor: ['#c7a782', '#a88762'], accent: '#2f3a45', glow: '#fff1d0' },
  },
  {
    id: 'cyber', index: 6, hours: 45,
    name: 'Cyberpunk',
    tagline: 'An orbital station. Holograms, neon, and silent stars.',
    tint: { light: '#a257cc', dark: '#d59af0' },
    scene: { wall: ['#1a1640', '#0b0a1f'], floor: ['#1d1a3d', '#0e0c24'], accent: '#22e1ff', glow: '#ff3df2' },
  },
  {
    id: 'apoc', index: 7, hours: 65,
    name: 'Post-Apocalyptic',
    tagline: 'Nature took it back. A cozy bunker, vines, and salvaged treasures.',
    tint: { light: '#66913c', dark: '#a9d27a' },
    scene: { wall: ['#6a6a5a', '#44463a'], floor: ['#5a4f3c', '#3a3326'], accent: '#7aa846', glow: '#ffd27a' },
  },
];

export const eraById = (id) => ERAS.find((e) => e.id === id) ?? ERAS[0];

/** Highest era unlocked for a given amount of focus minutes. */
export const eraForMinutes = (minutes) => {
  const hours = minutes / 60;
  return [...ERAS].reverse().find((e) => hours >= e.hours) ?? ERAS[0];
};
