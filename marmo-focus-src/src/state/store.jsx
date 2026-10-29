import { createContext, useContext, useEffect, useReducer } from 'react';
import { ERAS, eraForMinutes, eraById } from '../data/eras';
import { now, rewardsLocked } from '../lib/clock';
import { flush, readDurable, readLocal, requestPersistence, save } from '../lib/storage';
import { DEV_TOOLS } from '../lib/devtools';
import { SHOP, itemById } from '../data/shop';
import { FREEZE_PRICE, MAX_FREEZES, MAX_MINUTES, MIN_MINUTES, STREAK_TIERS, breakFor, coinsFor, dailyBonusFor, dayNumber, liveStreak, streakAfterFocus, streakMult } from '../lib/economy';

const KEY = 'marmo-focus:v1';
export const INVITE_REWARD = 250;     // you, when a friend joins with your code
export const WELCOME_REWARD = 100;    // the new friend, when they redeem a code
export const SAMPLE_FRIEND_CODES = ['LUNA42', 'KAITO7', 'ELIF88'];

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const makeCode = () => Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
export const normalizeCode = (c) => c.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
const uid = () => Math.random().toString(36).slice(2, 10);
export const DEFAULT_PET_NAME = 'Mango';

export const DEFAULT_SETTINGS = {
  session: 15,          // chosen focus length in minutes (15–180)
  breaks: false,        // offer a break after each session (off by default since 1.6)
  breakAuto: true,      // break = one fifth of the session (5–30 min)
  breakMinutes: 5,      // used when breakAuto is off
  autoBreaks: false,    // start the break automatically
  focusGuard: true,     // leaving the app during focus wakes the marmoset and drops the bonus
  notify: false,        // local notification when a session ends (asks permission when turned on)
  theme: 'light', sound: true, haptics: true,   // new installs start in light mode
  lang: 'auto',          // 'auto' | 'en' | 'ja' | 'es' | 'it'
};

const idleTimer = (minutes) => ({ mode: 'focus', status: 'idle', minutes, endsAt: 0, remaining: minutes * 60000 });

const initial = {
  profile: null,                 // null → onboarding. { mode: 'guest' | 'local', name }
  petName: DEFAULT_PET_NAME,
  coins: 0,
  focusMinutes: 0,
  sessions: 0,
  history: [],                   // [{ t, m, c, task?, note? }] timestamp, minutes, coins, task, reflection
  owned: [],                     // item ids
  placed: {},                    // { [eraId]: { [slot]: itemId } } — what stands in each room
  outfit: null,                  // equipped outfit id (worn across eras)
  activeEra: 'stone',
  devMode: false,
  devUnlockAll: false,
  devSpeed: 1,
  settings: DEFAULT_SETTINGS,
  timer: idleTimer(DEFAULT_SETTINGS.session),
  lastReward: null,              // { coins, minutes, streak, streakMult, tier } of the last finished session
  celebrate: null,

  // 1.3
  tasks: [],                     // [{ id, text, done, createdAt, doneAt }]
  currentTask: null,             // task id the next session is for
  doneTaskCount: 0,              // completed tasks that were cleared from the list
  myCode: null,                  // this player's friend / invite code
  friends: SAMPLE_FRIEND_CODES.map((code) => ({ code, addedAt: 0, sample: true })),
  redeemedInvite: null,          // code redeemed once for the welcome bonus
  referrals: [],                 // codes of friends who joined with my code
  achievements: {},              // { [id]: unlockedAt }
  coinsSpent: 0,
  breaksTaken: 0,
  ambience: { master: 0.8, rain: 0.6, forest: 0.5, fire: 0.6, lofi: 0.45 },
  atmosphere: { time: 'day', weather: 'clear' },   // 'auto' follows the clock and a daily forecast
  v: 3,                          // save format; 2 = room starts at day / clear, 3 = breaks off by default

  // 1.4
  streak: { count: 0, last: null }, // consecutive focus days; `last` = dayNumber of the latest one
  lastBonusDay: null,               // dayNumber when the daily bonus was last collected
  noteFor: null,                    // history timestamp waiting for a "what did you get done?" note

  // 1.6
  freezes: 0,                       // streak freezes held (max MAX_FREEZES)
  freezeUsed: null,                 // { days, on } — last time freezes covered missed days, for a notice
};

const clampMinutes = (m) => Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, Math.round(m)));
const breakMinutesOf = (s, focusMin) => (s.breakAuto ? breakFor(focusMin) : s.breakMinutes);
export const isEraUnlocked = (state, era) => state.devUnlockAll || state.focusMinutes / 60 >= era.hours;
export const placedIn = (state, eraId) => state.placed[eraId] ?? {};

function reducer(state, a) {
  if (!DEV_TOOLS && a.type.startsWith('dev/')) return state;   // release builds ignore developer actions
  switch (a.type) {
    case 'profile': return { ...state, profile: a.profile, petName: a.petName?.trim() || state.petName };
    case 'petName': return { ...state, petName: a.name.trim().slice(0, 20) || DEFAULT_PET_NAME };

    // ---- session setup ----
    case 'session': {
      const session = clampMinutes(a.minutes);
      const settings = { ...state.settings, session };
      const timer = state.timer.status === 'idle' && state.timer.mode === 'focus' ? idleTimer(session) : state.timer;
      return { ...state, settings, timer };
    }

    // ---- timer ----
    case 'timer/start': {
      const t = state.timer;
      const remaining = t.status === 'idle' ? t.minutes * 60000 : t.remaining;
      return { ...state, timer: { ...t, status: 'running', remaining, endsAt: now() + remaining / state.devSpeed } };
    }
    case 'timer/pause': {
      const t = state.timer;
      return { ...state, timer: { ...t, status: 'paused', remaining: Math.max(0, (t.endsAt - now()) * state.devSpeed) } };
    }
    case 'focus/disturbed': {      // the person left the app mid-session for longer than the grace period
      const t = state.timer;
      if (t.mode !== 'focus' || t.status === 'idle' || t.disturbed) return state;
      return { ...state, timer: { ...t, disturbed: true, awayMs: a.ms }, wakeups: (state.wakeups ?? 0) + 1 };
    }
    case 'timer/cancel':            // give up a focus session (no reward) or skip a break
      return { ...state, timer: idleTimer(state.settings.session) };
    case 'timer/break': {           // start a break manually
      const m = breakMinutesOf(state.settings, state.settings.session);
      return { ...state, timer: { mode: 'break', status: 'running', minutes: m, remaining: m * 60000, endsAt: now() + (m * 60000) / state.devSpeed } };
    }
    case 'timer/complete': {
      const t = state.timer;
      if (t.mode !== 'focus') return { ...state, breaksTaken: state.breaksTaken + 1, timer: idleTimer(state.settings.session) };

      const minutes = t.minutes;
      if (rewardsLocked()) {      // device clock was turned back: the session ends without coins, time or streak
        const next = { ...state, lastReward: { coins: 0, minutes, blocked: true }, sessions: state.sessions };
        return { ...next, timer: idleTimer(state.settings.session) };
      }
      const today = dayNumber();
      const days = streakAfterFocus(state.streak, today);
      const sm = streakMult(days);
      const coins = t.disturbed ? minutes : coinsFor(minutes, sm);   // woken up: plain minutes, no bonus
      const tier = days > state.streak.count && STREAK_TIERS.find((x) => x.days === days);
      const at = now();
      const before = eraForMinutes(state.focusMinutes);
      const after = eraForMinutes(state.focusMinutes + minutes);
      let next = {
        ...state,
        coins: state.coins + coins,
        focusMinutes: state.focusMinutes + minutes,
        sessions: state.sessions + 1,
        history: [...state.history, { t: at, m: minutes, c: coins, task: state.tasks.find((x) => x.id === state.currentTask)?.text }].slice(-500),
        lastReward: { coins, minutes, streak: days, streakMult: sm, tier: tier || null, disturbed: Boolean(t.disturbed) },
        streak: { count: days, last: today },
        noteFor: at,
      };
      if (after.index > before.index) next = { ...next, activeEra: after.id, celebrate: after.id };

      if (!state.settings.breaks) return { ...next, timer: idleTimer(state.settings.session) };
      const bm = breakMinutesOf(state.settings, minutes);
      const run = state.settings.autoBreaks;
      return {
        ...next,
        timer: { mode: 'break', status: run ? 'running' : 'idle', minutes: bm, remaining: bm * 60000, endsAt: run ? now() + (bm * 60000) / state.devSpeed : 0 },
      };
    }

    // ---- economy ----
    case 'buy': {
      const item = itemById(a.id);
      if (!item || state.owned.includes(item.id) || state.coins < item.price) return state;
      const next = { ...state, coins: state.coins - item.price, coinsSpent: state.coinsSpent + item.price, owned: [...state.owned, item.id] };
      return item.type === 'outfit' ? { ...next, outfit: item.id } : reducer(next, { type: 'place', id: item.id });
    }
    case 'place': {                 // put a decor item into its slot (replaces whatever was there)
      const item = itemById(a.id);
      const room = { ...placedIn(state, item.era), [item.slot]: item.id };
      return { ...state, placed: { ...state.placed, [item.era]: room } };
    }
    case 'putAway': {
      const item = itemById(a.id);
      const room = { ...placedIn(state, item.era) };
      if (room[item.slot] === item.id) delete room[item.slot];
      return { ...state, placed: { ...state.placed, [item.era]: room } };
    }
    case 'wear': return { ...state, outfit: state.outfit === a.id ? null : a.id };
    case 'era': return { ...state, activeEra: a.id };
    case 'celebrate/done': return { ...state, celebrate: null };
    case 'reward/seen': return { ...state, lastReward: null };

    // ---- daily bonus / session notes ----
    case 'daily/claim': {
      const today = dayNumber();
      if (state.lastBonusDay === today || rewardsLocked()) return state;
      return { ...state, coins: state.coins + dailyBonusFor(liveStreak(state.streak, today)), lastBonusDay: today };
    }
    case 'note/save': {
      const note = a.text.trim().slice(0, 240);
      const history = note ? state.history.map((h) => (h.t === a.t ? { ...h, note } : h)) : state.history;
      return { ...state, history, noteFor: null };
    }
    case 'note/skip': return { ...state, noteFor: null };

    // ---- streak freeze ----
    case 'freeze/buy': {
      if (state.freezes >= MAX_FREEZES || state.coins < FREEZE_PRICE) return state;
      return { ...state, freezes: state.freezes + 1, coins: state.coins - FREEZE_PRICE, coinsSpent: state.coinsSpent + FREEZE_PRICE };
    }
    case 'freeze/seen': return { ...state, freezeUsed: null };
    case 'streak/check': {           // on open and at each new day: cover missed days with freezes
      const today = dayNumber();
      const { count, last } = state.streak;
      const missed = last == null ? 0 : today - last - 1;
      if (!count || missed < 1 || missed > state.freezes || rewardsLocked()) return state;
      return { ...state, freezes: state.freezes - missed, streak: { count, last: today - 1 }, freezeUsed: { days: missed, on: today } };
    }

    // ---- tasks (no coin rewards: they are for clarity, not currency) ----
    case 'task/add': {
      const text = a.text.trim().slice(0, 120);
      if (!text) return state;
      const task = { id: uid(), text, done: false, createdAt: now(), doneAt: null };
      return { ...state, tasks: [...state.tasks, task], currentTask: state.currentTask ?? task.id };
    }
    case 'task/toggle': {
      const tasks = state.tasks.map((x) => (x.id === a.id ? { ...x, done: !x.done, doneAt: x.done ? null : now() } : x));
      const t = tasks.find((x) => x.id === a.id);
      return { ...state, tasks, currentTask: t?.done && state.currentTask === a.id ? null : state.currentTask };
    }
    case 'task/remove':
      return { ...state, tasks: state.tasks.filter((x) => x.id !== a.id), currentTask: state.currentTask === a.id ? null : state.currentTask };
    case 'task/clearDone': {
      const tasks = state.tasks.filter((x) => !x.done);
      return { ...state, tasks, doneTaskCount: state.doneTaskCount + state.tasks.length - tasks.length };
    }
    case 'task/focus': return { ...state, currentTask: state.currentTask === a.id ? null : a.id };

    // ---- friends ----
    case 'friend/add': {
      const code = normalizeCode(a.code);
      if (!code || code === state.myCode || state.friends.some((f) => f.code === code)) return state;
      return { ...state, friends: [...state.friends, { code, addedAt: now() }] };
    }
    case 'friend/remove': return { ...state, friends: state.friends.filter((f) => f.code !== a.code) };
    case 'invite/redeem': {      // a new player enters the code of whoever invited them
      const code = normalizeCode(a.code);
      if (!code || state.redeemedInvite || code === state.myCode) return state;
      const next = reducer({ ...state, redeemedInvite: code, coins: state.coins + WELCOME_REWARD }, { type: 'friend/add', code });
      return next;
    }
    case 'referral/joined': {    // reported by the server when someone signs up with my code
      const code = normalizeCode(a.code);
      if (state.referrals.includes(code)) return state;
      const next = { ...state, referrals: [...state.referrals, code], coins: state.coins + INVITE_REWARD };
      return reducer(next, { type: 'friend/add', code });
    }

    // ---- achievements / ambience / atmosphere ----
    case 'achievements/unlock': {
      const at = now();
      const achievements = { ...state.achievements };
      a.ids.forEach((id) => { achievements[id] ??= at; });
      return { ...state, achievements };
    }
    case 'ambience/volume': return { ...state, ambience: { ...state.ambience, [a.id]: a.value } };
    case 'atmosphere': return { ...state, atmosphere: { ...state.atmosphere, ...a.patch } };

    // ---- settings ----
    case 'settings': return { ...state, settings: { ...state.settings, ...a.patch } };

    // ---- developer ----
    case 'dev/toggle': return { ...state, devMode: a.on ?? !state.devMode };
    case 'dev/era': return { ...state, activeEra: a.id, devUnlockAll: true };
    case 'dev/coins': return { ...state, coins: state.coins + a.amount };
    case 'dev/minutes': return { ...state, focusMinutes: Math.max(0, state.focusMinutes + a.amount) };
    case 'dev/unlockAll': return { ...state, devUnlockAll: a.on };
    case 'dev/speed': {
      const t = state.timer;
      const timer = t.status === 'running' ? { ...t, endsAt: now() + ((t.endsAt - now()) * state.devSpeed) / a.speed } : t;
      return { ...state, devSpeed: a.speed, timer };
    }
    case 'dev/streak': return { ...state, streak: { count: liveStreak(state.streak) + 1, last: dayNumber() } };
    case 'dev/daily': return { ...state, lastBonusDay: null };
    case 'dev/finish': return reducer({ ...state, timer: { ...state.timer, status: 'running' } }, { type: 'timer/complete' });
    case 'reset': return { ...initial, profile: state.profile, petName: state.petName, settings: state.settings, myCode: state.myCode, friends: state.friends, tasks: state.tasks, lastBonusDay: state.lastBonusDay };
    case 'signout': return { ...initial, myCode: makeCode() };
    case 'hydrate': return a.state;
    default: return state;
  }
}

/** Loads saved state and upgrades data saved by version 1.0 of the app. */
let bootSavedAt = 0;   // when the localStorage copy we started from was written
function load() {
  const raw = readLocal(KEY);
  try { bootSavedAt = JSON.parse(raw)?.savedAt ?? 0; } catch { bootSavedAt = 0; }
  return fromSaved(raw);
}

function fromSaved(raw) {
  try {
    if (!raw) return { ...initial, myCode: makeCode() };
    const saved = JSON.parse(raw);
    const settings = { ...DEFAULT_SETTINGS, ...saved.settings };
    if (saved.settings?.focus && !saved.settings.session) settings.session = clampMinutes(saved.settings.focus);
    for (const k of ['focus', 'short', 'long', 'longEvery']) delete settings[k];
    settings.session = clampMinutes(settings.session);   // 1.5 raised the minimum to 15 min
    if ((saved.v ?? 1) < 3) settings.breaks = false;     // 1.6 turned break suggestions off

    const owned = (saved.owned ?? []).filter((id) => itemById(id));
    let placed = saved.placed;
    if (!placed) {                  // 1.0 stored "everything owned is shown unless hidden"
      placed = {};
      const hidden = saved.hidden ?? [];
      for (const id of owned) {
        const it = itemById(id);
        if (it.type === 'decor' && !hidden.includes(id)) (placed[it.era] ??= {})[it.slot] = id;
      }
    }
    const idle = !saved.timer?.minutes || (saved.timer.status === 'idle' && saved.timer.mode === 'focus')
      || ((saved.v ?? 1) < 3 && saved.timer.mode === 'break');   // drop a break suggestion left over from before 1.6
    const timer = idle ? idleTimer(settings.session) : saved.timer;
    const { hidden: _h, ...rest } = saved;
    return {
      ...initial, ...rest, owned, placed, settings, timer, celebrate: null, lastReward: null,
      myCode: saved.myCode ?? makeCode(),
      streak: saved.streak ?? streakFromHistory(saved.history ?? []),
      noteFor: null,
      ambience: { ...initial.ambience, ...saved.ambience },
      // Before v2 the room defaulted to auto time and weather; start those saves at day / clear too.
      atmosphere: (saved.v ?? 1) < 2 && saved.atmosphere?.time === 'auto' && saved.atmosphere?.weather === 'auto'
        ? initial.atmosphere : { ...initial.atmosphere, ...saved.atmosphere },
      v: 3,
      ...(DEV_TOOLS ? {} : { devMode: false, devUnlockAll: false, devSpeed: 1 }),
    };
  } catch {
    return { ...initial, myCode: makeCode() };
  }
}

/** Current run of consecutive focus days, for saves from before streaks were stored. */
function streakFromHistory(history) {
  const days = [...new Set(history.map((h) => dayNumber(h.t)))].sort((a, b) => b - a);
  let count = 0;
  while (count < days.length && days[count] === days[0] - count) count++;
  return { count, last: days[0] ?? null };
}

const Ctx = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => { save(KEY, JSON.stringify({ ...state, savedAt: Date.now() })); }, [state]);

  // Restore the durable copy if it is newer than localStorage (e.g. website data was cleared).
  useEffect(() => {
    requestPersistence();
    readDurable(KEY).then((raw) => {
      if (!raw) return;
      const backup = JSON.parse(raw);
      if ((backup.savedAt ?? 0) > bootSavedAt && backup.profile) dispatch({ type: 'hydrate', state: fromSaved(raw) });
    }).catch(() => {});
    const onHide = () => { if (document.visibilityState === 'hidden') flush(); };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', flush);
    return () => { document.removeEventListener('visibilitychange', onHide); window.removeEventListener('pagehide', flush); };
  }, []);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}

export function useDerived() {
  const { state } = useStore();
  const era = eraById(state.activeEra);
  const earnedEra = eraForMinutes(state.focusMinutes);
  const nextEra = ERAS[earnedEra.index + 1] ?? null;
  const hours = state.focusMinutes / 60;
  const progress = nextEra ? (hours - earnedEra.hours) / (nextEra.hours - earnedEra.hours) : 1;
  const startOfDay = new Date(now()); startOfDay.setHours(0, 0, 0, 0);
  const todayMinutes = state.history.filter((h) => h.t >= startOfDay.getTime()).reduce((s, h) => s + h.m, 0);
  const weekMinutes = state.history.filter((h) => h.t >= now() - 7 * 864e5).reduce((s, h) => s + h.m, 0);
  const streakDays = liveStreak(state.streak);
  const todaySessions = state.history.filter((h) => h.t >= startOfDay.getTime()).length;
  return { streakDays, todaySessions, era, earnedEra, nextEra, hours, progress: Math.min(1, Math.max(0, progress)), todayMinutes, weekMinutes, totalItems: SHOP.length };
}
