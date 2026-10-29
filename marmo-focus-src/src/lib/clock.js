// Trusted time for rewards. Everything that pays coins, counts a day or ends a session
// reads `now()` instead of Date.now(), so changing the device clock does not pay out.
//
//  · Server time: set TIME_URL to an endpoint that returns JSON { now: <ms> } (or any URL that
//    sends a Date header). On the web build the app's own origin is used automatically.
//    With server time, every clock trick below is covered, including changes made while the app was closed.
//  · Without a server:
//      - a clock jump while the app is open is cancelled out (offset), so the timer and day keep going normally;
//      - turning the clock back (e.g. after jumping ahead to collect a bonus) pauses rewards until real time
//        catches up with the latest time the app has already seen.
//    A jump forward made while the app is closed cannot be detected without a server.

export const TIME_URL = null;          // e.g. 'https://api.example.com/time'

const KEY = 'marmo-focus:clock';
const JUMP_MS = 90_000;                // larger gaps between 1-second ticks are clock changes
const BACK_TOLERANCE_MS = 120_000;

let saved = {};
try { saved = JSON.parse(localStorage.getItem(KEY)) ?? {}; } catch { /* storage unavailable */ }

let offset = saved.offset ?? 0;        // trusted − device
let lastSeen = saved.lastSeen ?? 0;    // latest trusted time ever observed
let lockUntil = saved.lockUntil ?? 0;  // rewards paused until trusted time passes this
let synced = false;
const listeners = new Set();

export const now = () => Date.now() + offset;
export const rewardsLocked = () => now() < lockUntil;
export const lockedUntil = () => (rewardsLocked() ? lockUntil : 0);
export const isServerSynced = () => synced;

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify({ offset, lastSeen, lockUntil })); } catch { /* storage unavailable */ }
}
function emit() { listeners.forEach((fn) => fn()); }
export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

/** Records the current time; locks rewards if the clock is behind something we've already seen. */
function check() {
  const t = now();
  if (!synced && lastSeen && t < lastSeen - BACK_TOLERANCE_MS && lockUntil < lastSeen) {
    lockUntil = lastSeen;
    emit();
  }
  if (t > lastSeen) lastSeen = t;
  if (lockUntil && t >= lockUntil) { lockUntil = 0; emit(); }
  persist();
}

/** Server time, if available. Same-origin Date header on the web, TIME_URL anywhere. */
export async function syncClock() {
  const url = TIME_URL ?? (/^https?:$/.test(location.protocol) && !/^(localhost|127\.|\[::1\])/.test(location.hostname) ? location.origin + '/' : null);
  if (!url) return false;
  try {
    const sent = Date.now();
    const res = await fetch(url, { method: TIME_URL ? 'GET' : 'HEAD', cache: 'no-store' });
    const back = Date.now();
    let server = null;
    if (TIME_URL && res.headers.get('content-type')?.includes('json')) server = (await res.json())?.now ?? null;
    server ??= Date.parse(res.headers.get('date') ?? '');
    if (!Number.isFinite(server)) return false;
    const device = (sent + back) / 2;
    const diff = server - device;
    offset = Math.abs(diff) > 5_000 ? diff : 0;   // ignore normal drift and the Date header's 1 s precision
    synced = true;
    lastSeen = Math.max(lastSeen, now());
    if (lockUntil && now() >= lockUntil) lockUntil = 0;
    persist();
    emit();
    return true;
  } catch {
    return false;
  }
}

/** Starts the watcher: 1-second ticks, jump correction, re-sync when the app comes back. */
export function startClock() {
  check();
  syncClock();
  let wall = Date.now();
  let mono = performance.now();
  const tick = () => {
    const w = Date.now(), m = performance.now();
    const drift = (w - wall) - (m - mono);
    // Only trust the comparison while visible and ticking on time (not after sleep or suspension).
    if (document.visibilityState === 'visible' && m - mono < 5_000 && Math.abs(drift) > JUMP_MS) {
      offset -= drift;          // cancel the jump: trusted time carries on smoothly
      emit();
    }
    wall = w; mono = m;
    check();
  };
  const id = setInterval(tick, 1000);
  const onVis = () => {
    wall = Date.now(); mono = performance.now();
    if (document.visibilityState === 'visible') { check(); syncClock(); }
  };
  document.addEventListener('visibilitychange', onVis);
  return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVis); };
}
