// App blocking during focus sessions (iOS 16+, App Store build only).
//
// Talks to the native AppBlock plugin (ios/App/App/AppBlockPlugin.swift), which uses Apple's
// Screen Time API. The person chooses apps with Apple's own picker; Apple gives the app only
// opaque tokens, so Marmo Focus never learns which apps were chosen, and nothing leaves the device.
import { Capacitor, registerPlugin } from '@capacitor/core';
import { now } from './clock';

const AppBlock = registerPlugin('AppBlock');

/** True in the iOS app; false on the web, where the feature is hidden. */
export const appBlockSupported = () => Capacitor.getPlatform() === 'ios' && Capacitor.isPluginAvailable('AppBlock');

/** { authorization: 'approved' | 'denied' | 'notDetermined', count } */
export async function blockStatus() {
  if (!appBlockSupported()) return { authorization: 'denied', count: 0 };
  try { return await AppBlock.status(); } catch { return { authorization: 'denied', count: 0 }; }
}

/** Shows Apple's Screen Time permission prompt. Resolves true when allowed. */
export async function requestBlockPermission() {
  try { return (await AppBlock.requestAuthorization()).authorization === 'approved'; } catch { return false; }
}

/** Opens Apple's app picker. Resolves the number of selected apps, categories and websites. */
export async function pickBlockedApps(texts) {
  try { return (await AppBlock.pickApps(texts)).count ?? 0; } catch { return 0; }
}

/** Locks the chosen apps until `endsAt` (trusted time, clock.now() units). */
export async function startBlocking(endsAt, texts) {
  if (!appBlockSupported()) return;
  const deviceAt = Date.now() + (endsAt - now());   // the OS schedules on the device clock
  try { await AppBlock.start({ endsAt: deviceAt, ...texts }); } catch { /* unavailable */ }
}

export async function stopBlocking() {
  if (!appBlockSupported()) return;
  try { await AppBlock.stop(); } catch { /* unavailable */ }
}
