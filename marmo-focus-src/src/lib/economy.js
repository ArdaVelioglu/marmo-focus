import { now } from './clock';
import { locale, t } from '../i18n';

// Focus economy: longer sessions pay more per minute, up to a ×5.0 cap.
//   t             = (m − 15) / (180 − 15)          → 0 at 15 min, 1 at 3 h
//   multiplier(m) = 1 + (MAX_MULT − 1) · t^CURVE    → smooth, gently accelerating, never above ×5.0
//   coins(m)      = round(m × min(MAX_MULT, multiplier(m) × streak bonus))
//
//   15m ×1.00 → 15 · 25m ×1.12 → 28 · 1h ×1.79 → 107 · 2h ×3.27 → 393 · 3h ×5.00 → 900
export const MIN_MINUTES = 15;
export const MAX_MINUTES = 180;
export const STEP_MINUTES = 5;
export const PRESETS = [15, 25, 45, 60, 90, 120];

export const MAX_MULT = 5.0;   // hard cap on the total bonus, streak included
const CURVE = 1.25;            // 1 = linear; higher = more of the bonus saved for long sessions

export const multiplier = (m) => {
  const t = Math.min(1, Math.max(0, (m - MIN_MINUTES) / (MAX_MINUTES - MIN_MINUTES)));
  return Math.min(MAX_MULT, 1 + (MAX_MULT - 1) * t ** CURVE);
};
/** Session multiplier × streak bonus, never above the cap. */
export const totalMultiplier = (m, streakMult = 1) => Math.min(MAX_MULT, multiplier(m) * streakMult);
export const coinsFor = (m, streakMult = 1) => Math.round(Math.max(MIN_MINUTES, m) * totalMultiplier(m, streakMult));

/** Break length that fits a session: one fifth of it, between 5 and 30 minutes. */
export const breakFor = (m) => Math.min(30, Math.max(5, Math.round(m / 5)));

export const presetLabel = (m) => (m < 60 ? t('{m}m', { m }) : t('{h}h', { h: m % 60 ? (m / 60).toLocaleString(locale(), { maximumFractionDigits: 1 }) : m / 60 }));

/** Compact form for the preset chips: 15m · 1.5h (minutes localized, hours as h everywhere). */
export const presetShort = (m) => (m < 60 ? t('{m}m|short', { m }) : `${(m / 60).toLocaleString(locale(), { maximumFractionDigits: 1 })}h`);

export const fmtMultiplier = (m, streakMult = 1) => `×${totalMultiplier(m, streakMult).toFixed(2)}`;

// ---- Daily streak ----
// A day counts when at least one focus session is finished. Missing a day resets the streak.
export const STREAK_TIERS = [
  { days: 3, mult: 1.1 },
  { days: 7, mult: 1.25 },
  { days: 14, mult: 1.4 },
  { days: 30, mult: 1.5 },
];
export const streakMult = (days) => STREAK_TIERS.reduce((m, t) => (days >= t.days ? t.mult : m), 1);
export const nextStreakTier = (days) => STREAK_TIERS.find((t) => days < t.days) ?? null;

/** Streak freeze: bought with coins, used up automatically for each missed day. */
export const FREEZE_PRICE = 200;
export const MAX_FREEZES = 2;

/** Daily login bonus: 10 coins, +2 per streak day, up to 30. */
export const dailyBonusFor = (streakDays) => Math.min(30, 10 + 2 * streakDays);

/** Local calendar day as an integer, so consecutive days differ by exactly 1. */
export const dayNumber = (t = now()) => {
  const d = new Date(t);
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5;
};

/** Streak still alive today: counts if the last focus day was today or yesterday. */
export const liveStreak = (streak, today = dayNumber()) => (streak.last != null && today - streak.last <= 1 ? streak.count : 0);

/** Streak length once a session is finished today. */
export const streakAfterFocus = (streak, today = dayNumber()) =>
  streak.last === today ? streak.count : streak.last === today - 1 ? streak.count + 1 : 1;
