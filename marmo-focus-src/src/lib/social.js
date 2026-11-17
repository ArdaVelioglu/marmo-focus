// Social service — the single place the app talks to "other players".
//
// This build has no server, so `localSocialService` invents believable, *deterministic*
// friend profiles from their friend code (the same code always gives the same marmoset,
// and their focus totals change day by day). Everything the UI needs goes through the
// async functions below, so a real backend can replace this file without touching views:
//
//   lookupFriend(code)            → Promise<Profile | null>
//   getProfiles(codes)            → Promise<Profile[]>
//   reportReferral(myCode)        → Promise<void>        (server credits the inviter)
//
// Profile = { code, name, petName, eraId, placed, outfit, totalMinutes, todayMinutes,
//             weekMinutes, sessions, joinedDays, sample? }

import { ERAS } from '../data/eras';
import { SHOP } from '../data/shop';
import { t } from '../i18n';

const NAMES = ['Ada', 'Mert', 'Zeynep', 'Noah', 'Mina', 'Arda', 'Sofia', 'Deniz', 'Leo', 'Ece', 'Yuki', 'Can', 'Iris', 'Omar', 'Lara', 'Emre'];
const PETS = ['Biscuit', 'Pip', 'Nova', 'Kiwi', 'Taro', 'Mochi', 'Pepper', 'Sunny', 'Fig', 'Olive', 'Bean', 'Coco'];
const SAMPLES = {
  LUNA42: { name: 'Luna', petName: 'Mochi', eraIndex: 5 },
  KAITO7: { name: 'Kaito', petName: 'Pepper', eraIndex: 3 },
  ELIF88: { name: 'Elif', petName: 'Fig', eraIndex: 2 },
};

/** Small seeded PRNG (mulberry32) so a code always produces the same friend. */
function rng(seedStr) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) { h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = h >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const dayKey = (d = new Date()) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

function buildProfile(code) {
  const r = rng(code);
  const sample = SAMPLES[code];
  const eraIndex = sample?.eraIndex ?? Math.min(7, Math.floor(r() ** 1.6 * 8));
  const era = ERAS[eraIndex];
  const next = ERAS[eraIndex + 1];
  const totalMinutes = Math.round((era.hours + r() * ((next?.hours ?? era.hours + 20) - era.hours)) * 60);

  // Decorate their room from their era's catalog.
  const placed = {};
  for (const slot of ['rug', 'wall', 'left', 'right', 'small']) {
    const options = SHOP.filter((i) => i.era === era.id && i.slot === slot);
    if (options.length && r() < 0.8) placed[slot] = options[Math.floor(r() * options.length)].id;
  }
  const outfits = SHOP.filter((i) => i.type === 'outfit' && ERAS.findIndex((e) => e.id === i.era) <= eraIndex);
  const outfit = r() < 0.85 ? outfits[Math.floor(r() * outfits.length)]?.id ?? null : null;

  // Today / this week vary by day but stay stable within a day.
  const today = rng(code + dayKey());
  const todayMinutes = Math.round(today() < 0.2 ? 0 : 25 + today() * 140);
  let weekMinutes = todayMinutes;
  for (let d = 1; d < 7; d++) {
    const day = rng(code + dayKey(new Date(Date.now() - d * 864e5)));
    weekMinutes += Math.round(day() < 0.25 ? 0 : 20 + day() * 130);
  }

  return {
    code,
    name: sample?.name ?? NAMES[Math.floor(r() * NAMES.length)],
    petName: sample?.petName ?? PETS[Math.floor(r() * PETS.length)],
    eraId: era.id,
    placed,
    outfit,
    totalMinutes,
    todayMinutes,
    weekMinutes,
    sessions: Math.round(totalMinutes / (28 + r() * 20)),
    joinedDays: 5 + Math.floor(r() * 300),
    sample: Boolean(sample),
  };
}

export const isValidCode = (code) => /^[A-Z0-9]{5,8}$/.test(code);

export async function lookupFriend(code) {
  return isValidCode(code) ? buildProfile(code) : null;
}

export async function getProfiles(codes) {
  return codes.filter(isValidCode).map(buildProfile);
}

export async function reportReferral() {
  // With a backend: POST /referrals { inviterCode } and the server credits the inviter.
}

export const inviteMessage = (code, pet) =>
  t('Focus with me on Marmo Focus! {pet} and I are traveling through time one session at a time. Use my code {code} when you join and we both get bonus Banana Coins.', { pet, code });
