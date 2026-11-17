// Tiny i18n: the English text is the key, `strings.js` holds the other languages.
//   t('Session {n} of {total}', { n: 2, total: 4 })
//   tp(n, '{n} day', '{n} days')            → picks the plural form (Japanese has one form)
// The active language is set once per render by the app shell (`setLanguage`), so plain
// modules (data, notifications) can call t() too.
import { STRINGS } from './strings';

export const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'ja', label: '日本語' },
  { id: 'es', label: 'Español' },
  { id: 'it', label: 'Italiano' },
];
const CODES = LANGUAGES.map((l) => l.id);
const COLUMN = { ja: 1, es: 2, it: 3 };

const TABLES = {};
for (const [lang, col] of Object.entries(COLUMN)) {
  TABLES[lang] = new Map(STRINGS.map((row) => [row[0], row[col]]));
}

let current = 'en';

/** 'auto' follows the device language when we support it, English otherwise. */
export function resolveLanguage(pref) {
  if (pref && pref !== 'auto' && CODES.includes(pref)) return pref;
  const device = (navigator.languages?.[0] ?? navigator.language ?? 'en').slice(0, 2).toLowerCase();
  return CODES.includes(device) ? device : 'en';
}

export function setLanguage(lang) {
  current = lang;
  if (typeof document !== 'undefined') document.documentElement.lang = lang;
}
export const language = () => current;
/** Locale for Intl formatting (dates, weekdays, numbers). */
export const locale = () => current;

const fill = (s, vars) => (vars ? s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m)) : s);

/** A key may carry a context after "|" (e.g. '{m}m|short') when English text is shared but translations differ. */
export function t(key, vars) {
  const s = (current !== 'en' && TABLES[current]?.get(key)) || key.split('|')[0];
  return fill(s, vars);
}

export function tp(n, one, other, vars) {
  return t(n === 1 ? one : other, { n, ...vars });
}

export const num = (n) => Number(n).toLocaleString(current);
