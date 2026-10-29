import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { Clock3, CloudRain, CloudSnow, Coffee, Crosshair, Flame, Headphones, Moon, NotebookPen, Pause, Pencil, Play, SkipForward, Sun, Sunrise, Sunset, Wrench, X } from 'lucide-react';
import { useStore, useDerived, placedIn } from '../../state/store';
import { fmt, fmtHours, haptic, unlockAudio } from '../../lib/feedback';
import { MAX_MINUTES, MAX_MULT, MIN_MINUTES, PRESETS, STEP_MINUTES, coinsFor, fmtMultiplier, presetLabel, presetShort, streakAfterFocus, streakMult, totalMultiplier } from '../../lib/economy';
import Room from '../Room';
import { BananaCoin, Button, CoinPill, ConfirmSheet } from '../ui';
import PetNameSheet from '../PetNameSheet';
import TasksCard from '../TasksCard';
import AmbienceSheet, { SoundBars, usePlaying } from '../AmbienceSheet';
import { StreakChip, StreakSheet } from '../Streak';
import { useClockLock } from '../../hooks/useClockLock';
import { locale, num, t } from '../../i18n';
import { DEV_TOOLS } from '../../lib/devtools';
import { PHASE_LABEL, WEATHER_LABEL, resolveAtmosphere } from '../../lib/atmosphere';

const PHASE_ICON = { morning: Sunrise, day: Sun, evening: Sunset, night: Moon };

/** Re-renders once a minute so "auto" time of day follows the clock. */
function useMinuteClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(id); }, []);
  return now;
}

export default function FocusView({ timer, onOpenDev, onGoShop }) {
  const { state, dispatch } = useStore();
  const { era, earnedEra, nextEra, progress } = useDerived();
  const [renaming, setRenaming] = useState(false);
  const [sounds, setSounds] = useState(false);
  const [streakOpen, setStreakOpen] = useState(false);
  const playing = usePlaying();
  const now = useMinuteClock();
  const atmo = resolveAtmosphere(state.atmosphere, now);
  const PhaseIcon = atmo.weather === 'rain' ? CloudRain : atmo.weather === 'snow' ? CloudSnow : PHASE_ICON[atmo.phase];
  const { status, mode } = state.timer;
  const running = status === 'running';
  const cheer = useWakeUp(state.sessions);
  // Asleep for the whole focus session (paused too), awake on breaks, then a happy wake-up when a session ends.
  const mood = cheer ?? (mode === 'focus' && status !== 'idle' ? (state.timer.disturbed ? 'grumpy' : 'sleep') : 'idle');

  // Easter egg: tap the logo 5× quickly to turn on Developer Mode.
  const taps = useRef([]);
  const onLogo = () => {
    if (!DEV_TOOLS) return;
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < 1500), now];
    if (taps.current.length >= 5) {
      taps.current = [];
      haptic([10, 40, 10]);
      dispatch({ type: 'dev/toggle', on: true });
      onOpenDev();
    }
  };

  const left = nextEra ? nextEra.hours * 60 - state.focusMinutes : 0;
  const statusText = cheer ? t('Awake!') : running ? (mode === 'focus' ? (state.timer.disturbed ? t('Woken up') : t('Sleeping')) : t('On a break')) : status === 'paused' ? t('Paused') : null;

  return (
    <div className="pb-6">
      <header className="flex items-center justify-between px-5 pt-7">
        <button onClick={onLogo} className="flex items-center gap-2.5 select-none" aria-label="Marmo Focus">
          <Logo size={34} />
          <span className="font-rounded text-[19px] font-bold tracking-tight">Marmo</span>
        </button>
        <div className="flex items-center gap-2">
          {state.devMode && (
            <button onClick={onOpenDev} aria-label={t('Developer panel')} className="pressable card !rounded-full grid place-items-center w-9 h-9 text-tint">
              <Wrench size={16} strokeWidth={2.4} />
            </button>
          )}
          <StreakChip onClick={() => setStreakOpen(true)} />
          <CoinPill coins={state.coins} onClick={onGoShop} />
        </div>
      </header>

      <div className="px-5 mt-6 mb-4">
        <p className="t-subhead text-label2 font-medium">{state.profile?.mode === 'local' && state.profile.name ? t('{greeting}, {name}', { greeting: greeting(), name: state.profile.name }) : greeting()}</p>
        <h1 className="t-large-title mt-0.5">{headline(state.timer, state.petName)}</h1>
      </div>

      {/* Room */}
      <div className="px-4">
        <div className="relative overflow-hidden rounded-[30px] aspect-[6/5] shadow-[var(--float-shadow)] ring-1 ring-white/25">
          <Room era={era} placed={placedIn(state, era.id)} outfit={state.outfit} mood={mood} atmosphere={atmo} />
          <button onClick={() => setRenaming(true)} aria-label={t('Rename {pet}', { pet: state.petName })}
            className="pressable absolute left-3 top-3 flex items-center gap-1.5 h-8 pl-3 pr-2.5 rounded-full bg-black/35 text-white backdrop-blur-md t-subhead font-semibold">
            {state.petName}<Pencil size={12} strokeWidth={2.6} className="opacity-75" />
          </button>
          <div className="absolute right-3 top-3 h-8 px-3 rounded-full bg-black/35 text-white backdrop-blur-md t-footnote font-semibold flex items-center">
            {statusText ?? t(era.name)}
          </div>
          <div className="absolute left-3 bottom-3 h-8 px-3 rounded-full bg-black/35 text-white backdrop-blur-md t-footnote font-semibold flex items-center gap-1.5" title={t('Change in Settings → Room Atmosphere')}>
            <PhaseIcon size={14} strokeWidth={2.4} />{t(PHASE_LABEL[atmo.phase])}{atmo.weather !== 'clear' && ` · ${t(WEATHER_LABEL[atmo.weather])}`}
          </div>
          <button onClick={() => setSounds(true)} aria-label={playing.length ? t('Sounds playing: {n}', { n: playing.length }) : t('Open sounds')}
            className={`pressable absolute right-3 bottom-3 h-10 rounded-full backdrop-blur-md flex items-center gap-2 font-semibold t-footnote ${playing.length ? 'btn-tint pl-3 pr-3.5' : 'bg-black/35 text-white w-10 justify-center'}`}>
            {playing.length ? <><SoundBars active />{playing.length > 1 ? t('{n} sounds', { n: playing.length }) : t('Sound on')}</> : <Headphones size={18} strokeWidth={2.2} />}
          </button>
        </div>
      </div>

      <ClockBanner />

      {state.noteFor && <div className="px-4 mt-5"><NoteCard key={state.noteFor} /></div>}

      <div className="px-4 mt-5">
        {mode === 'break' ? <BreakCard timer={timer} /> : status === 'idle' ? <SessionCard /> : <RunningCard timer={timer} />}
      </div>

      <div className="px-4 mt-4"><TasksCard /></div>

      {/* Era progress */}
      <div className="px-4 mt-4">
        <div className="card-tinted p-5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="t-subhead font-semibold">{nextEra ? t('Next era: {era}', { era: t(nextEra.name) }) : t('All eras unlocked')}</span>
            <span className="t-footnote text-label2 tabular shrink-0">{nextEra ? t('{time} to go', { time: fmtHours(left) }) : fmtHours(state.focusMinutes)}</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-fill2 overflow-hidden">
            <div className="h-full rounded-full btn-tint !shadow-none transition-[width] duration-700" style={{ width: `${progress * 100}%` }} />
          </div>
          <p className="t-footnote text-label2 mt-2.5">{era.id === earnedEra.id ? t(era.tagline) : t('{pet} is visiting {era}. Home era: {home}.', { pet: state.petName, era: t(era.name), home: t(earnedEra.name) })}</p>
        </div>
      </div>

      <PetNameSheet open={renaming} onClose={() => setRenaming(false)} />
      <AmbienceSheet open={sounds} onClose={() => setSounds(false)} />
      <StreakSheet open={streakOpen} onClose={() => setStreakOpen(false)} />
    </div>
  );
}

/* ───────────── Session setup: big time, scroll ruler, presets ───────────── */

const DAILY_GOAL = 4;   // sessions a day shown as "Session n of 4"

/** Streak bonus the next finished session will get (today's session extends the streak). */
const upcomingStreakMult = (state) => streakMult(streakAfterFocus(state.streak));

function SessionCard() {
  const { state, dispatch } = useStore();
  const { todaySessions } = useDerived();
  const m = state.settings.session;
  const set = (v) => dispatch({ type: 'session', minutes: v });
  const sm = upcomingStreakMult(state);
  const days = streakAfterFocus(state.streak);
  const n = todaySessions + 1;

  const start = () => {
    if (state.settings.sound) unlockAudio();
    if (state.settings.haptics) haptic(8);
    dispatch({ type: 'timer/start' });
  };

  return (
    <section className="card p-5" aria-label={t('Focus session')}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="t-footnote font-semibold text-label2 uppercase tracking-[.4px]">{t('Focus Session')}</p>
          <p className="t-subhead font-semibold mt-0.5">{n <= DAILY_GOAL ? t('Session {n} of {total}', { n, total: DAILY_GOAL }) : t('Session {n} today', { n })}</p>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center gap-1.5 h-9 pl-1.5 pr-3.5 rounded-full chip-soft">
            <BananaCoin size={20} /><span className="t-headline tabular">{num(coinsFor(m, sm))}</span>
          </span>
          <p className="t-caption font-semibold mt-1 tabular" style={{ color: bonusColor() }}>
            {totalMultiplier(m, sm) >= MAX_MULT ? t('Max bonus {mult}', { mult: fmtMultiplier(m, sm) }) : t('{mult} bonus', { mult: fmtMultiplier(m, sm) })}
          </p>
        </div>
      </div>

      <p className="font-rounded tabular font-bold text-center tracking-tight leading-none mt-1 text-[64px]" aria-live="polite">
        {m >= 60 ? `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}:00` : `${String(m).padStart(2, '0')}:00`}
      </p>

      <MinuteRuler value={m} onChange={set} haptics={state.settings.haptics} />

      {/* Presets */}
      <div className="flex gap-1.5 mt-3" role="radiogroup" aria-label={t('Preset lengths')}>
        {PRESETS.map((p) => {
          const on = p === m;
          return (
            <button key={p} role="radio" aria-checked={on} onClick={() => set(p)}
              className={`pressable flex-1 h-10 rounded-full t-subhead font-semibold tabular transition-colors ${on ? 'btn-tint' : 'bg-bg3 text-label2'}`}>
              {presetShort(p)}
            </button>
          );
        })}
      </div>

      {sm > 1 ? (
        <p className="t-footnote text-label2 mt-3 flex items-center justify-center gap-1">
          <Flame size={14} strokeWidth={2.4} className="text-tint" />{t('{days}-day streak · coins ×{mult}', { days, mult: sm.toFixed(2) })}
        </p>
      ) : (
        <p className="t-footnote text-label2 mt-3 text-center">{t('Focus 3 days in a row for a streak bonus')}</p>
      )}

      <CurrentTask />
      <Button className="w-full mt-4 !rounded-full" onClick={start}><Play size={18} fill="currentColor" strokeWidth={0} />{t('Start focusing')}</Button>
    </section>
  );
}

/** Horizontal ruler you swipe (or drag / scroll-wheel) to pick the length in 5-minute steps. */
const STEP_W = 16;
const STEPS = (MAX_MINUTES - MIN_MINUTES) / STEP_MINUTES;

function MinuteRuler({ value, onChange, haptics }) {
  const ref = useRef(null);
  const last = useRef(value);
  const drag = useRef(null);
  const user = useRef(false);    // scroll events only change the value after a touch, drag or wheel
  const indexOf = (m) => (m - MIN_MINUTES) / STEP_MINUTES;
  const minutesAt = (left) => MIN_MINUTES + Math.min(STEPS, Math.max(0, Math.round(left / STEP_W))) * STEP_MINUTES;

  // Start on the saved length before the first paint, and stay there if layout shifts (fonts, resize).
  useLayoutEffect(() => {
    const el = ref.current;
    const place = () => { if (!user.current) el.scrollLeft = indexOf(last.current) * STEP_W; };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Follow outside changes (presets, keyboard) without fighting the user's own scroll.
  useEffect(() => {
    const el = ref.current;
    if (!el || minutesAt(el.scrollLeft) === value) return;
    last.current = value;
    user.current = false;
    el.scrollTo({ left: indexOf(value) * STEP_W, behavior: 'smooth' });
  }, [value]);

  // A vertical mouse wheel moves the ruler sideways instead of the page.
  useEffect(() => {
    const el = ref.current;
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      user.current = true;
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const onScroll = (e) => {
    if (!user.current) return;
    const m = minutesAt(e.currentTarget.scrollLeft);
    if (m === last.current) return;
    last.current = m;
    if (haptics) haptic(4);
    onChange(m);
  };

  // Mouse drag (touch already scrolls natively).
  const onPointerDown = (e) => {
    user.current = true;
    if (e.pointerType !== 'mouse') return;
    drag.current = { x: e.clientX, left: ref.current.scrollLeft };
    ref.current.style.scrollSnapType = 'none';
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => { if (drag.current) ref.current.scrollLeft = drag.current.left - (e.clientX - drag.current.x); };
  const onPointerUp = () => {
    if (!drag.current) return;
    drag.current = null;
    const el = ref.current;
    el.style.scrollSnapType = '';
    el.scrollTo({ left: indexOf(minutesAt(el.scrollLeft)) * STEP_W, behavior: 'smooth' });
  };

  const onKeyDown = (e) => {
    const d = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key];
    if (!d) return;
    e.preventDefault();
    onChange(Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, value + d * STEP_MINUTES)));
  };

  return (
    <div className="relative mt-3 -mx-5">
      <div ref={ref} onScroll={onScroll} onTouchStart={() => { user.current = true; }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
        role="slider" tabIndex={0} aria-label={t('Session length')} aria-valuemin={MIN_MINUTES} aria-valuemax={MAX_MINUTES} aria-valuenow={value}
        aria-valuetext={t('{n} minutes', { n: value })} onKeyDown={onKeyDown}
        className="ruler no-scrollbar overflow-x-auto cursor-grab active:cursor-grabbing select-none focus-visible:outline-none">
        <div className="flex items-start h-[44px] pt-1" style={{ paddingInline: `calc(50% - ${STEP_W / 2}px)`, width: 'max-content' }}>
          {Array.from({ length: STEPS + 1 }, (_, i) => {
            const m = MIN_MINUTES + i * STEP_MINUTES;
            const major = m % 30 === 0;
            const mid = !major && m % 15 === 0;
            return (
              <div key={m} className="ruler-step relative flex justify-center h-full" style={{ width: STEP_W }}>
                <span className="w-[2px] rounded-full" style={{ height: major ? 18 : mid ? 13 : 8, background: 'var(--sys-label3)' }} />
                {(major || m === MIN_MINUTES) && <span className="absolute top-[24px] left-1/2 -translate-x-1/2 t-caption text-label3 tabular whitespace-nowrap">{presetLabel(m)}</span>}
              </div>
            );
          })}
        </div>
      </div>
      {/* center needle */}
      <span className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 w-[3px] h-[24px] rounded-full bg-tint" />
    </div>
  );
}

const bonusColor = () => 'color-mix(in srgb, var(--tint) 80%, var(--sys-label))';

/** After each finished session: a short stretch ('wake'), then a few seconds of celebration ('happy'). */
function useWakeUp(sessions) {
  const [phase, setPhase] = useState(null);
  const seen = useRef(sessions);
  useEffect(() => {
    if (sessions <= seen.current) { seen.current = sessions; return; }
    seen.current = sessions;
    setPhase('wake');
    const a = setTimeout(() => setPhase('happy'), 1100);
    const b = setTimeout(() => setPhase(null), 5200);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [sessions]);
  return phase;
}

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? t('Late night') : h < 12 ? t('Good morning') : h < 18 ? t('Good afternoon') : t('Good evening');
}

function headline(timer, pet) {
  if (timer.mode === 'break') return timer.status === 'running' ? t('Time to rest') : t('Nicely done');
  if (timer.status === 'running') return timer.disturbed ? t('{pet} is awake now', { pet }) : t('Shh… {pet} is asleep', { pet });
  if (timer.status === 'paused') return t('Take a breath');
  return t('Ready to focus?');
}

/* ───────────── Running / paused focus ───────────── */

function Ring({ progress, children }) {
  const R = 46, C = 2 * Math.PI * R;
  return (
    <div className="relative w-[196px] h-[196px] mx-auto">
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
        <circle cx="50" cy="50" r={R} fill="none" stroke="var(--sys-fill2)" strokeWidth="3.5" />
        <circle cx="50" cy="50" r={R} fill="none" stroke="var(--tint)" strokeWidth="3.5" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - progress)} style={{ transition: 'stroke-dashoffset .3s linear' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

function RunningCard({ timer }) {
  const { state, dispatch } = useStore();
  const [ask, setAsk] = useState(null);
  const running = state.timer.status === 'running';
  const m = state.timer.minutes;
  const sm = upcomingStreakMult(state);
  const woken = state.timer.disturbed;
  const pay = woken ? m : coinsFor(m, sm);

  return (
    <section className="card p-5" aria-label={t('Focus in progress')}>
      <div className="flex items-center justify-between">
        <p className="t-footnote font-semibold text-label2"><span className="uppercase tracking-[.4px]">{running ? t('Focusing') : t('Paused')}</span> · {presetLabel(m)}</p>
        <span className="inline-flex items-center gap-1 t-footnote font-semibold tabular"><BananaCoin size={16} />{pay} · {woken ? '×1.00' : fmtMultiplier(m, sm)}</span>
      </div>
      <div className="mt-3">
        <Ring progress={timer.progress}>
          <span className="font-rounded tabular font-light tracking-tight" style={{ fontSize: m >= 60 ? 44 : 54, lineHeight: 1 }}>
            {m >= 60 ? fmtLong(timer.remaining) : fmt(timer.remaining)}
          </span>
          <span className="t-footnote text-label2 mt-2">{woken ? t('{pet} woke up', { pet: state.petName }) : running ? t('{pet} is sleeping', { pet: state.petName }) : t('Tap play to continue')}</span>
        </Ring>
      </div>
      {woken ? (
        <p className="t-footnote text-label2 text-center mt-3">{t('You left Marmo, so {pet} woke up. Finish the session for {n} coins, without the bonus.', { pet: state.petName, n: pay })}</p>
      ) : state.settings.focusGuard && (
        <p className="t-footnote text-label2 text-center mt-3">{t('Stay in Marmo to keep {pet} asleep. Locking your phone is fine.', { pet: state.petName })}</p>
      )}
      <CurrentTask running />
      <div className="grid grid-cols-2 gap-2 mt-4">
        <Button variant="gray" onClick={() => setAsk({
          title: t('{pet} wants to rest a little longer, I think. End the session now?', { pet: state.petName }),
          message: t('You won’t earn the {n} coins for this session.', { n: pay }), action: t('End Session'),
          onConfirm: () => dispatch({ type: 'timer/cancel' }),
        })}><X size={18} strokeWidth={2.6} />{t('End')}</Button>
        <Button onClick={() => { if (state.settings.haptics) haptic(8); dispatch({ type: running ? 'timer/pause' : 'timer/start' }); }}>
          {running ? <><Pause size={18} fill="currentColor" strokeWidth={0} />{t('Pause')}</> : <><Play size={18} fill="currentColor" strokeWidth={0} />{t('Resume')}</>}
        </Button>
      </div>
      <ConfirmSheet request={ask} onClose={() => setAsk(null)} />
    </section>
  );
}

/* ───────────── Break ───────────── */

function BreakCard({ timer }) {
  const { state, dispatch } = useStore();
  const { status, minutes } = state.timer;
  const reward = state.lastReward;

  if (status === 'idle') {
    return (
      <section className="card p-5 a-pop" aria-label={t('Session complete')}>
        <div className="flex items-center gap-3">
          <span className="grid place-items-center w-12 h-12 rounded-full chip-soft"><BananaCoin size={30} /></span>
          <div className="min-w-0">
            <p className="t-headline">{t('Session complete')}</p>
            <p className="t-subhead text-label2">{reward ? t('+{n} Banana Coins for {time}', { n: reward.coins, time: presetLabel(reward.minutes) }) : t('Coins added to your balance')}</p>
          </div>
        </div>
        <p className="t-subhead mt-4">{t('{pet} suggests a {n}-minute break.', { pet: state.petName, n: minutes })}</p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <Button variant="gray" onClick={() => dispatch({ type: 'timer/cancel' })}><SkipForward size={18} />{t('Skip')}</Button>
          <Button onClick={() => dispatch({ type: 'timer/start' })}><Coffee size={18} />{t('Start Break')}</Button>
        </div>
      </section>
    );
  }

  return (
    <section className="card p-5" aria-label={t('Break')}>
      <p className="t-footnote font-semibold text-label2 uppercase tracking-[.4px]">{t('Break · {n} min', { n: minutes })}</p>
      <div className="mt-3">
        <Ring progress={timer.progress}>
          <span className="font-rounded tabular font-light tracking-tight" style={{ fontSize: 54, lineHeight: 1 }}>{fmt(timer.remaining)}</span>
          <span className="t-footnote text-label2 mt-2">{t('Rest your eyes')}</span>
        </Ring>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4">
        <Button variant="gray" onClick={() => dispatch({ type: 'timer/cancel' })}><SkipForward size={18} />{t('End Break')}</Button>
        <Button onClick={() => dispatch({ type: status === 'running' ? 'timer/pause' : 'timer/start' })}>
          {status === 'running' ? <><Pause size={18} fill="currentColor" strokeWidth={0} />{t('Pause')}</> : <><Play size={18} fill="currentColor" strokeWidth={0} />{t('Resume')}</>}
        </Button>
      </div>
    </section>
  );
}

const fmtLong = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

/** App logo (C1 "glowing ring"): sleeping Marmo inside a focus-timer ring. Same art as public/icon.svg. */
export function Logo({ size = 30 }) {
  const id = useId().replace(/:/g, '');
  const C = 2 * Math.PI * 38;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id={`lb${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2c3356" /><stop offset="1" stopColor="#191d2c" /></linearGradient>
        <linearGradient id={`lr${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffd27a" /><stop offset=".5" stopColor="#ff9b5e" /><stop offset="1" stopColor="#ff6f91" /></linearGradient>
        <filter id={`lg${id}`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <clipPath id={`lc${id}`}><rect width="100" height="100" rx="22.5" /></clipPath>
      </defs>
      <g clipPath={`url(#lc${id})`}>
        <rect width="100" height="100" fill={`url(#lb${id})`} />
        <circle cx="50" cy="51" r="38" fill="none" stroke="#fff" strokeOpacity=".12" strokeWidth="7" />
        <circle cx="50" cy="51" r="38" fill="none" stroke={`url(#lr${id})`} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={`${C * 0.62} 999`} transform="rotate(-90 50 51)" filter={`url(#lg${id})`} />
        <g transform="translate(50 53) scale(.88) translate(-60 -52)">
          <g fill="#fffbf4"><circle cx="31" cy="44" r="11" /><circle cx="22" cy="50" r="9" /><circle cx="25" cy="59" r="7.5" /><circle cx="89" cy="44" r="11" /><circle cx="98" cy="50" r="9" /><circle cx="95" cy="59" r="7.5" /></g>
          <g fill="#f9cdc8"><circle cx="34" cy="50" r="5" /><circle cx="86" cy="50" r="5" /></g>
          <circle cx="60" cy="52" r="27" fill="#ad9078" /><ellipse cx="60" cy="58" rx="19.5" ry="18.5" fill="#f5dec4" /><ellipse cx="60" cy="33.5" rx="6.5" ry="4" fill="#fffbf4" />
          <g stroke="#2b1d16" strokeWidth="2.6" fill="none" strokeLinecap="round"><path d="M45 57.5 Q50 62 55 57.5" /><path d="M65 57.5 Q70 62 75 57.5" /></g>
          <ellipse cx="60" cy="65" rx="2.4" ry="1.7" fill="#e08c88" />
          <ellipse cx="45" cy="65.5" rx="4.5" ry="2.8" fill="#ff9fa0" opacity=".75" /><ellipse cx="75" cy="65.5" rx="4.5" ry="2.8" fill="#ff9fa0" opacity=".75" />
        </g>
      </g>
    </svg>
  );
}

/** The task pinned for this session, shown beside the timer. */
function CurrentTask({ running = false }) {
  const { state } = useStore();
  const task = state.tasks.find((x) => x.id === state.currentTask && !x.done);
  if (!task) return null;
  return (
    <div className="mt-4 flex items-center gap-2.5 px-3.5 py-2.5 rounded-[16px] chip-soft">
      <Crosshair size={16} strokeWidth={2.4} className="shrink-0" />
      <span className="t-footnote min-w-0"><span className="font-semibold">{running ? t('Working on:') : t('This session:')}</span> {task.text}</span>
    </div>
  );
}

/** Soft prompt after a focus session: one or two sentences about what got done. */
function NoteCard() {
  const { state, dispatch } = useStore();
  const [text, setText] = useState('');
  const entry = state.history.find((h) => h.t === state.noteFor);
  if (!entry) return null;
  const save = () => dispatch({ type: 'note/save', t: entry.t, text });

  return (
    <section className="card-tinted p-5 a-pop" aria-label={t('Session note')}>
      <div className="flex items-center gap-2.5">
        <span className="grid place-items-center w-9 h-9 rounded-full chip-soft shrink-0"><NotebookPen size={17} strokeWidth={2.2} /></span>
        <div className="min-w-0">
          <p className="t-headline">{t('What did you get done this session?')}</p>
          <p className="t-footnote text-label2">{presetLabel(entry.m)}{entry.task ? ` · ${entry.task}` : ''}</p>
        </div>
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={240} rows={2} autoFocus
        placeholder={t('e.g. Finished the intro and outlined part two.')}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); save(); } }}
        className="mt-3 w-full resize-none rounded-[16px] bg-bg2 px-3.5 py-3 t-subhead placeholder:text-label3 outline-none focus:ring-2 focus:ring-tint/40" />
      <div className="flex items-center justify-between mt-2">
        <span className="t-caption text-label3 tabular">{text.length}/240</span>
        <div className="flex gap-2">
          <button onClick={() => dispatch({ type: 'note/skip' })} className="pressable h-9 px-4 rounded-full t-subhead font-semibold text-label2">{t('Skip')}</button>
          <button onClick={save} disabled={!text.trim()} className="pressable h-9 px-4 rounded-full btn-tint t-subhead font-semibold disabled:opacity-40">{t('Save note')}</button>
        </div>
      </div>
    </section>
  );
}

/** Shown while rewards are paused because the device clock was turned back. */
function ClockBanner() {
  const until = useClockLock();
  if (!until) return null;
  const when = new Date(until).toLocaleString(locale(), { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  return (
    <div className="px-4 mt-5">
      <div className="card p-4 flex gap-3 items-start" role="status">
        <span className="grid place-items-center w-9 h-9 rounded-full bg-fill2 text-danger shrink-0"><Clock3 size={18} /></span>
        <div className="min-w-0">
          <p className="t-subhead font-semibold">{t('Your device clock changed')}</p>
          <p className="t-footnote text-label2 mt-0.5">{t('Coins, streaks and the daily bonus are paused until {when}. Set the clock to the correct time and they come back on their own.', { when })}</p>
        </div>
      </div>
    </div>
  );
}
