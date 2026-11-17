// Time of day and weather for the room. "auto" follows the device clock and a
// gentle daily forecast (same weather all day, so the room doesn't flicker).

export const TIMES = [
  { value: 'auto', label: 'Auto' },
  { value: 'morning', label: 'Dawn' },
  { value: 'day', label: 'Day' },
  { value: 'evening', label: 'Dusk' },
  { value: 'night', label: 'Night' },
];
export const WEATHERS = [
  { value: 'auto', label: 'Auto' },
  { value: 'clear', label: 'Clear' },
  { value: 'rain', label: 'Rain' },
  { value: 'snow', label: 'Snow' },
];

export function phaseFor(date = new Date()) {
  const h = date.getHours();
  if (h >= 5 && h < 10) return 'morning';
  if (h >= 10 && h < 17) return 'day';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

/** Deterministic daily forecast: ~25% rain, snow on some winter days, otherwise clear. */
export function forecastFor(date = new Date()) {
  const key = date.getFullYear() * 1000 + Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 864e5);
  const r = ((Math.sin(key * 12.9898) * 43758.5453) % 1 + 1) % 1;
  const winter = [11, 0, 1].includes(date.getMonth());
  if (winter && r < 0.22) return 'snow';
  if (r < 0.47 && r >= 0.22) return 'rain';
  return 'clear';
}

export function resolveAtmosphere(pref = { time: 'auto', weather: 'auto' }, date = new Date()) {
  return {
    phase: pref.time === 'auto' ? phaseFor(date) : pref.time,
    weather: pref.weather === 'auto' ? forecastFor(date) : pref.weather,
  };
}

export const PHASE_LABEL = { morning: 'Morning', day: 'Daytime', evening: 'Evening', night: 'Night' };
export const WEATHER_LABEL = { clear: 'Clear', rain: 'Rain', snow: 'Snow' };
