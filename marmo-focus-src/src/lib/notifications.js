// Local notifications: "session complete" at the end time, and a nudge when you leave mid-session.
//
// In the App Store build (Capacitor) this uses @capacitor/local-notifications, so the alert shows
// even when the app is closed. On the web it falls back to the Notification API, which can only
// fire while the page is still alive in a background tab.
import { now } from './clock';
import { t } from '../i18n';

const IDS = { end: 1001, nudge: 1002 };
const native = () => window.Capacitor?.isNativePlatform?.() && window.Capacitor.Plugins?.LocalNotifications;
const timers = {};

export const notificationsSupported = () => Boolean(native() || 'Notification' in window);

/** Asks for permission. Resolves true when notifications may be shown. */
export async function requestPermission() {
  try {
    const ln = native();
    if (ln) return (await ln.requestPermissions()).display === 'granted';
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    return (await Notification.requestPermission()) === 'granted';
  } catch {
    return false;
  }
}

/** `at` is trusted time (clock.now() units); converted to the device clock for the OS scheduler. */
async function schedule(key, at, title, body) {
  cancel(key);
  const deviceAt = Date.now() + (at - now());
  const ln = native();
  if (ln) {
    try { await ln.schedule({ notifications: [{ id: IDS[key], title, body, schedule: { at: new Date(deviceAt), allowWhileIdle: true } }] }); } catch { /* not permitted */ }
    return;
  }
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  timers[key] = setTimeout(() => {
    if (document.visibilityState === 'hidden') {
      try { new Notification(title, { body, tag: `marmo-${key}` }); } catch { /* unsupported (e.g. iOS Safari tab) */ }
    }
  }, Math.max(0, deviceAt - Date.now()));
}

function cancel(key) {
  clearTimeout(timers[key]);
  delete timers[key];
  const ln = native();
  if (ln) ln.cancel({ notifications: [{ id: IDS[key] }] }).catch(() => {});
}

export const scheduleEnd = (at, title, body) => schedule('end', at, title, body);
export const cancelEnd = () => cancel('end');

/** A gentle warning a moment after leaving the app during a guarded session. */
export function nudgeAway(petName, graceMs) {
  schedule('nudge', now() + 2000, t('{pet} is waking up 👀', { pet: petName }), t('Come back within {s} seconds to keep your focus bonus.', { s: Math.round(graceMs / 1000) }));
}
export const cancelNudge = () => cancel('nudge');
