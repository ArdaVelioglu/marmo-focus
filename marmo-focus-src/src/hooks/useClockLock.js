import { useSyncExternalStore } from 'react';
import { lockedUntil, subscribe } from '../lib/clock';

/** Trusted time until which rewards are paused (0 when they aren't). */
export const useClockLock = () => useSyncExternalStore(subscribe, lockedUntil);
