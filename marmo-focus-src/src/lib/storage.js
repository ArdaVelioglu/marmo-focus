// Saves progress in two places so it survives the browser or iOS clearing website data.
//
//  · localStorage: synchronous, read at startup so the app opens instantly.
//  · A durable copy: Capacitor Preferences (iOS UserDefaults / Android SharedPreferences) in the
//    App Store build, IndexedDB on the web (with navigator.storage.persist() requested).
// On startup the app compares the two by `savedAt` and restores the durable copy if it is newer,
// e.g. after localStorage was wiped.

const DB = 'marmo-focus';
const STORE = 'kv';
const prefs = () => window.Capacitor?.isNativePlatform?.() && window.Capacitor.Plugins?.Preferences;

export function readLocal(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function idb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function durableSet(key, value) {
  const p = prefs();
  if (p) return p.set({ key, value });
  const db = await idb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function readDurable(key) {
  try {
    const p = prefs();
    if (p) return (await p.get({ key })).value ?? null;
    const db = await idb();
    const value = await new Promise((resolve, reject) => {
      const req = db.transaction(STORE).objectStore(STORE).get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return value;
  } catch {
    return null;
  }
}

let pending = null;
let timer = null;
/** Writes localStorage now and the durable copy shortly after (batched). */
export function save(key, value) {
  try { localStorage.setItem(key, value); } catch { /* storage unavailable */ }
  pending = [key, value];
  clearTimeout(timer);
  timer = setTimeout(flush, 800);
}
export function flush() {
  clearTimeout(timer);
  if (!pending) return;
  const [key, value] = pending;
  pending = null;
  durableSet(key, value).catch(() => { /* durable copy unavailable */ });
}

/** Ask the browser not to evict our data under storage pressure (web only). */
export function requestPersistence() {
  try { navigator.storage?.persist?.(); } catch { /* unsupported */ }
}
