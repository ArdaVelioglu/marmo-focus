import { useEffect, useRef, useState } from 'react';
import { useStore } from '../state/store';
import { chime, haptic } from '../lib/feedback';
import { now as clockNow } from '../lib/clock';

/** Drives the countdown from an absolute end timestamp, so it stays accurate in background tabs. */
export function useTimer() {
  const { state, dispatch } = useStore();
  const { timer, devSpeed, settings } = state;
  const [now, setNow] = useState(clockNow());
  const fired = useRef(0);

  useEffect(() => {
    if (timer.status !== 'running') return;
    const id = setInterval(() => setNow(clockNow()), 200);
    return () => clearInterval(id);
  }, [timer.status]);

  const remaining = timer.status === 'running' ? Math.max(0, (timer.endsAt - now) * devSpeed) : timer.remaining;

  useEffect(() => {
    if (timer.status === 'running' && remaining <= 0 && fired.current !== timer.endsAt) {
      fired.current = timer.endsAt;
      if (settings.sound) chime(timer.mode === 'focus' ? 'focus' : 'break');
      if (settings.haptics) haptic([20, 60, 20]);
      dispatch({ type: 'timer/complete' });
    }
  }, [remaining, timer.status, timer.endsAt, timer.mode, settings.sound, settings.haptics, dispatch]);

  const total = timer.minutes * 60000;
  return { remaining, total, progress: total ? 1 - remaining / total : 0 };
}
