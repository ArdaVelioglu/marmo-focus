import { useCallback, useEffect, useRef, useState } from 'react';
import { StoreProvider, useStore, useDerived } from './state/store';
import { useTimer } from './hooks/useTimer';
import { useAppearance } from './hooks/useAppearance';
import { fmt } from './lib/feedback';
import TabBar from './components/TabBar';
import FocusView from './components/views/FocusView';
import ShopView from './components/views/ShopView';
import JourneyView from './components/views/JourneyView';
import SettingsView from './components/views/SettingsView';
import FriendsView from './components/views/FriendsView';
import { evaluate } from './data/achievements';
import { Flame, Snowflake, Trophy } from 'lucide-react';
import { dayNumber } from './lib/economy';
import { startClock } from './lib/clock';
import { resolveLanguage, setLanguage, t, tp } from './i18n';
import { useFocusGuard } from './hooks/useFocusGuard';
import { cancelEnd, scheduleEnd } from './lib/notifications';
import { coinsFor, streakAfterFocus, streakMult } from './lib/economy';
import { Clock3 } from 'lucide-react';
import { DailyBonus } from './components/Streak';
import DevPanel from './components/DevPanel';
import { DEV_TOOLS } from './lib/devtools';
import Onboarding, { ProfileSheetContent } from './components/Onboarding';
import Celebration from './components/Celebration';
import { BananaCoin, Sheet, Toast } from './components/ui';

function Shell() {
  const { state, dispatch } = useStore();
  const { era } = useDerived();
  useAppearance(state.settings.theme, era);
  const lang = resolveLanguage(state.settings.lang);
  setLanguage(lang);   // before children render, so every t() call below uses it

  const [tab, setTab] = useState('focus');
  const [devOpen, setDevOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const timer = useTimer();

  useEffect(() => startClock(), []);
  const notify = useCallback((t) => setToast({ ...t, id: Date.now() }), []);

  // Focus guard: leaving the app mid-session wakes the marmoset.
  const onWoken = useCallback(() => notify({ text: t('{pet} woke up · no bonus this session', { pet: state.petName }), icon: <Clock3 size={16} className="text-danger" /> }), [state.petName, notify]);
  useFocusGuard(onWoken);

  // "Session complete" notification at the end time while a timer runs.
  const tm = state.timer;
  useEffect(() => {
    if (!state.settings.notify || tm.status !== 'running') { cancelEnd(); return; }
    const pay = tm.disturbed ? tm.minutes : coinsFor(tm.minutes, streakMult(streakAfterFocus(state.streak)));
    if (tm.mode === 'focus') scheduleEnd(tm.endsAt, t('{pet} is awake!', { pet: state.petName }), t('Session complete · +{n} Banana Coins', { n: pay }));
    else scheduleEnd(tm.endsAt, t('Break’s over'), t('{pet} is ready for the next session.', { pet: state.petName }));
  }, [tm.status, tm.endsAt, tm.mode, tm.minutes, tm.disturbed, state.settings.notify, state.petName, state.streak, lang]);

  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(null), 2900); return () => clearTimeout(id); }, [toast]);

  // Reward toast after each completed focus session.
  const sessions = useRef(state.sessions);
  useEffect(() => {
    const r = state.lastReward;
    if (state.sessions > sessions.current && r) {
      notify(r.tier
        ? { text: t('{days}-day streak! +{coins} · coins ×{mult}', { days: r.tier.days, coins: r.coins, mult: r.tier.mult.toFixed(2) }), icon: <Flame size={16} className="text-tint" /> }
        : { text: t('{pet} earned +{coins}', { pet: state.petName, coins: r.coins }), icon: <BananaCoin size={18} /> });
    }
    sessions.current = state.sessions;
  }, [state.sessions, state.lastReward, state.petName, notify]);

  // A session that ended while the clock was turned back pays nothing; say why.
  useEffect(() => {
    if (state.lastReward?.blocked) notify({ text: t('Clock changed · no reward this time'), icon: <Clock3 size={16} className="text-danger" /> });
  }, [state.lastReward, notify]);

  // Achievements: unlock anything newly reached and celebrate it with a toast.
  useEffect(() => {
    if (!state.profile) return;
    const fresh = evaluate(state).filter((a) => a.value >= a.target && !state.achievements[a.id]);
    if (!fresh.length) return;
    dispatch({ type: 'achievements/unlock', ids: fresh.map((a) => a.id) });
    notify({ text: fresh.length > 1 ? t('{n} badges unlocked', { n: fresh.length }) : t('Badge unlocked: {title}', { title: t(fresh[0].title) }), icon: <Trophy size={16} className="text-tint" /> });
  }, [state, dispatch, notify]);

  // Today's day number, refreshed each minute and on return to the tab, so the daily bonus shows after midnight.
  const [today, setToday] = useState(dayNumber);
  useEffect(() => {
    const tick = () => setToday(dayNumber());
    const id = setInterval(tick, 60000);
    document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', tick); };
  }, []);

  // Streak freezes cover missed days once per day change.
  useEffect(() => { if (state.profile) dispatch({ type: 'streak/check' }); }, [today, state.profile, dispatch]);
  useEffect(() => {
    if (!state.freezeUsed) return;
    notify({ text: tp(state.freezeUsed.days, 'Streak freeze used · streak saved', '{n} streak freezes used · streak saved'), icon: <Snowflake size={16} className="text-tint" /> });
    dispatch({ type: 'freeze/seen' });
  }, [state.freezeUsed, notify, dispatch]);

  // Live countdown in the browser tab title.
  useEffect(() => {
    document.title = state.timer.status === 'running' ? `${fmt(timer.remaining)} · Marmo` : 'Marmo Focus';
  }, [state.timer.status, timer.remaining]);

  const go = (t) => { setTab(t); window.scrollTo({ top: 0 }); };

  if (!state.profile) return <Onboarding />;

  return (
    <>
      <main className="max-w-[520px] mx-auto" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'calc(62px + max(12px, env(safe-area-inset-bottom)) + 24px)' }}>
        <div key={`${tab}-${lang}`} className="a-fade">
          {tab === 'focus' && <FocusView timer={timer} onOpenDev={() => setDevOpen(true)} onGoShop={() => go('shop')} />}
          {tab === 'journey' && <JourneyView notify={notify} />}
          {tab === 'shop' && <ShopView notify={notify} />}
          {tab === 'friends' && <FriendsView notify={notify} />}
          {tab === 'settings' && <SettingsView onOpenDev={() => setDevOpen(true)} onEditProfile={() => setProfileOpen(true)} />}
        </div>
      </main>
      <TabBar tab={tab} onChange={go} />
      {DEV_TOOLS && <DevPanel open={devOpen} onClose={() => setDevOpen(false)} notify={notify} />}
      <Sheet open={profileOpen} onClose={() => setProfileOpen(false)} title={t('Profile')} detent="medium">
        <ProfileSheetContent onDone={() => setProfileOpen(false)} />
      </Sheet>
      <Celebration />
      <DailyBonus today={today} />
      <Toast toast={toast} />
    </>
  );
}

export default function App() {
  return <StoreProvider><Shell /></StoreProvider>;
}
