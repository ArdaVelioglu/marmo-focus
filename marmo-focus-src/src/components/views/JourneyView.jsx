import { Check, Crosshair, Flame, Lock, MapPin, NotebookPen } from 'lucide-react';
import { presetLabel } from '../../lib/economy';
import { BananaCoin } from '../ui';
import { StreakSheet } from '../Streak';
import StatsSheet, { StatsSummary } from '../Stats';
import { useStore, useDerived, isEraUnlocked, placedIn } from '../../state/store';
import { ERAS } from '../../data/eras';
import { fmtHours } from '../../lib/feedback';
import Room from '../Room';
import { LargeTitle } from '../ui';
import AchievementsSheet, { AchievementsSummary } from '../Achievements';
import { useState } from 'react';
import { locale, t, tp } from '../../i18n';

export default function JourneyView({ notify }) {
  const { state, dispatch } = useStore();
  const { todayMinutes, earnedEra, streakDays } = useDerived();
  const [badges, setBadges] = useState(false);
  const [streakOpen, setStreakOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const recent = state.history.slice(-8).reverse();

  const stats = [
    { label: t('Today'), value: fmtHours(todayMinutes) },
    { label: t('Total'), value: fmtHours(state.focusMinutes) },
    { label: t('Sessions'), value: state.sessions },
  ];
  const dayLabel = (ts) => {
    const d = new Date(ts), now = new Date();
    const time = d.toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' });
    if (d.toDateString() === now.toDateString()) return t('Today, {time}', { time });
    now.setDate(now.getDate() - 1);
    if (d.toDateString() === now.toDateString()) return t('Yesterday, {time}', { time });
    return `${d.toLocaleDateString(locale(), { month: 'short', day: 'numeric' })}, ${time}`;
  };

  return (
    <div className="pb-6">
      <LargeTitle title={t('Journey')} subtitle={t('Through time, one focus at a time')} />

      <div className="grid grid-cols-3 gap-3 px-4 mt-2">
        {stats.map((s) => (
          <div key={s.label} className="card !rounded-[22px] px-3.5 py-3.5">
            <p className="t-footnote text-label2">{s.label}</p>
            <p className="t-title2 tabular mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="px-4 mt-3">
        <button onClick={() => setStreakOpen(true)} className="pressable w-full card !rounded-[22px] px-4 py-3.5 flex items-center gap-3 text-left">
          <span className="grid place-items-center w-10 h-10 rounded-full chip-soft"><Flame size={20} strokeWidth={2.4} /></span>
          <span className="flex-1 min-w-0">
            <span className="block t-headline">{tp(streakDays, '{n}-day streak', '{n}-day streak')}</span>
            <span className="block t-footnote text-label2">{t('Focus every day for bonus coins')}</span>
          </span>
        </button>
      </div>
      <StreakSheet open={streakOpen} onClose={() => setStreakOpen(false)} />

      <div className="px-4 mt-3"><StatsSummary onOpen={() => setStatsOpen(true)} /></div>
      <StatsSheet open={statsOpen} onClose={() => setStatsOpen(false)} />

      <div className="px-4 mt-4"><AchievementsSummary onOpen={() => setBadges(true)} /></div>
      <AchievementsSheet open={badges} onClose={() => setBadges(false)} />

      {recent.length > 0 && (
        <>
          <h2 className="t-section px-8 mt-7 pb-1.5">{t('Recent sessions')}</h2>
          <div className="px-4">
            <ul className="card !rounded-[22px] overflow-hidden">
              {recent.map((h, i) => (
                <li key={h.t} className={`px-4 py-3 ${i < recent.length - 1 ? 'hairline-b' : ''}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="t-subhead font-semibold">{t('{time} focus', { time: presetLabel(h.m) })}</span>
                    <span className="t-footnote text-label2 tabular flex items-center gap-1">{dayLabel(h.t)} · <BananaCoin size={13} />{h.c}</span>
                  </div>
                  {h.task && <p className="t-footnote text-label2 mt-0.5 flex items-center gap-1.5"><Crosshair size={12} className="shrink-0" />{h.task}</p>}
                  {h.note && <p className="t-subhead mt-1.5 flex gap-1.5"><NotebookPen size={14} className="text-tint shrink-0 mt-[3px]" /><span className="italic">{h.note}</span></p>}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <h2 className="t-section px-8 mt-7 pb-1.5">{t('Eras')}</h2>
      <ol className="px-4 relative">
        {ERAS.map((era, i) => {
          const open = isEraUnlocked(state, era);
          const here = state.activeEra === era.id;
          const home = earnedEra.id === era.id;
          return (
            <li key={era.id} className="relative pl-8 pb-3">
              {/* timeline rail */}
              {i < ERAS.length - 1 && <span className="absolute left-[11px] top-7 bottom-0 w-[2px] rounded-full" style={{ background: open ? 'var(--tint)' : 'var(--sys-fill)' }} />}
              <span className={`absolute left-0 top-4 grid place-items-center w-6 h-6 rounded-full ${open ? 'btn-tint' : 'bg-fill2 text-label2'}`}>
                {open ? <Check size={14} strokeWidth={3} /> : <Lock size={12} strokeWidth={2.6} />}
              </span>

              <button disabled={!open}
                onClick={() => { dispatch({ type: 'era', id: era.id }); notify({ text: t('Traveled to {era}', { era: t(era.name) }), icon: <MapPin size={16} className="text-tint" /> }); }}
                className={`pressable w-full text-left card !rounded-[22px] overflow-hidden flex items-stretch ${here ? 'ring-2 ring-tint' : ''}`}>
                <div className={`w-[112px] shrink-0 aspect-[6/5] ${open ? '' : 'grayscale opacity-50'}`}>
                  <Room era={era} placed={placedIn(state, era.id)} outfit={state.outfit} />
                </div>
                <div className="flex-1 min-w-0 px-3 py-2.5 flex flex-col justify-center">
                  <p className="t-footnote text-label2">{t('Era {n}', { n: i + 1 })}</p>
                  <p className="t-headline truncate">{t(era.name)}</p>
                  <p className="t-footnote mt-0.5" style={{ color: here ? 'var(--tint)' : 'var(--sys-label2)' }}>
                    {here ? t('You are here') : home ? t('Home era') : open ? t('Tap to visit') : t('Unlocks at {h}h focus', { h: era.hours })}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
