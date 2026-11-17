import { useCallback, useEffect, useState } from 'react';
import { useStore } from '../state/store';
import { appBlockSupported, blockStatus, pickBlockedApps, requestBlockPermission } from '../lib/appBlock';
import { t } from '../i18n';

/** App blocking state and actions, shared by the Focus screen and Settings. */
export function useAppBlock() {
  const { state, dispatch } = useStore();
  const supported = appBlockSupported();
  const [info, setInfo] = useState({ authorization: 'notDetermined', count: 0 });
  useEffect(() => { if (supported) blockStatus().then(setInfo); }, [supported]);

  const set = useCallback((on) => dispatch({ type: 'settings', patch: { blockApps: on } }), [dispatch]);

  /** Opens Apple's picker; turns blocking off when nothing is selected. Resolves the count. */
  const choose = useCallback(async () => {
    const count = await pickBlockedApps({ title: t('Block During Focus'), done: t('Done'), cancel: t('Cancel') });
    setInfo((i) => ({ ...i, count }));
    if (count === 0) set(false);
    return count;
  }, [set]);

  /** Asks for Screen Time access, then lets the person pick apps (if none yet). Resolves true when on. */
  const enable = useCallback(async () => {
    const ok = await requestBlockPermission();
    setInfo((i) => ({ ...i, authorization: ok ? 'approved' : 'denied' }));
    if (!ok) return false;
    const count = info.count || await choose();
    set(count > 0);
    return count > 0;
  }, [info.count, choose, set]);

  const disable = useCallback(() => set(false), [set]);

  return { supported, on: supported && state.settings.blockApps, ...info, enable, disable, choose };
}
