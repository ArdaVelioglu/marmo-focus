import { useEffect, useRef } from 'react';
import { useStore } from '../state/store';
import { now } from '../lib/clock';
import { nudgeAway, cancelNudge } from '../lib/notifications';

export const GRACE_MS = 10_000;

/**
 * Focus guard: leaving Marmo during a focus session for more than GRACE_MS wakes the marmoset
 * and the session pays plain minutes with no bonus.
 *
 * Only time the phone was awake counts. A locked phone goes to sleep, and the monotonic clock
 * (performance.now) does not advance while it sleeps, so locking the screen is forgiven while
 * switching to another app is not.
 */
export function useFocusGuard(onWoken) {
  const { state, dispatch } = useStore();
  const { timer, settings, petName } = state;
  const guarding = settings.focusGuard && timer.mode === 'focus' && timer.status === 'running' && !timer.disturbed;
  const left = useRef(null);

  useEffect(() => {
    if (!guarding) { left.current = null; return; }
    const onVis = () => {
      if (document.visibilityState === 'hidden') {
        left.current = { wall: now(), mono: performance.now() };
        if (settings.notify) nudgeAway(petName, GRACE_MS);
        return;
      }
      cancelNudge();
      const l = left.current;
      left.current = null;
      if (!l) return;
      const awake = Math.min(performance.now() - l.mono, now() - l.wall);
      if (awake > GRACE_MS) {
        dispatch({ type: 'focus/disturbed', ms: awake });
        onWoken?.(awake);
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [guarding, petName, settings.notify, dispatch, onWoken]);
}
