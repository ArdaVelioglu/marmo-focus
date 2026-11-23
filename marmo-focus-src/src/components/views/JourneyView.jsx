import { Check, Crosshair, Flame, Lock, MapPin, NotebookPen } from 'lucide-react';
import { presetLabel } from '../../lib/economy';
import { BananaCoin, Button, Sheet } from '../ui';
import { StreakSheet } from '../Streak';
import StatsSheet, { StatsSummary } from '../Stats';
import { useStore, useDerived, isEraUnlocked, placedIn } from '../../state/store';
import { ERAS } from '../../data/eras';
import { SHOP } from '../../data/shop';
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
  const [preview, setPreview] = useState(null);   // locked era shown in the preview sheet
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

              <button
                onClick={() => {
                  if (!open) { setPreview(era); return; }
                  dispatch({ type: 'era', id: era.id });
                  notify({ text: t('Traveled to {era}', { era: t(era.name) }), icon: <MapPin size={16} className="text-tint" /> });
                }}
                className={`pressable w-full text-left card !rounded-[22px] overflow-hidden flex items-stretch ${here ? 'ring-2 ring-tint' : ''}`}>
                <div className={`w-[112px] shrink-0 aspect-[6/5] ${open ? '' : 'grayscale opacity-50'}`}>
                  <Room era={era} placed={placedIn(state, era.id)} outfit={state.outfit} />
                </div>
                <div className="flex-1 min-w-0 px-3 py-2.5 flex flex-col justify-center">
                  <p className="t-footnote text-label2">{t('Era {n}', { n: i + 1 })}</p>
                  <p className="t-headline truncate">{t(era.name)}</p>
                  <p className="t-footnote mt-0.5" style={{ color: here ? 'var(--tint)' : 'var(--sys-label2)' }}>
                    {here ? t('You are here') : home ? t('Home era') : open ? t('Tap to visit') : t('Unlocks at {h}h focus · tap to preview', { h: era.hours })}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
      <EraPreview era={preview} onClose={() => setPreview(null)} />
    </div>
  );
}

/** Clear preview of a locked era: its room with the base decor, and everything it adds to the Shop. */
function EraPreview({ era, onClose }) {
  const { state } = useStore();
  if (!era) return null;
  const items = SHOP.filter((i) => i.era === era.id);
  const decor = items.filter((i) => i.type === 'decor');
  const outfits = items.filter((i) => i.type === 'outfit');
  const showcase = Object.fromEntries(decor.filter((i) => i.id === `${era.id}.${i.slot}`).map((i) => [i.slot, i.id]));
  const togo = Math.max(0, era.hours * 60 - state.focusMinutes);
  return (
    <Sheet open onClose={onClose} title={t('Preview')}>
      <div className="px-4 pb-4">
        <div className="rounded-[20px] overflow-hidden aspect-[6/5]">
          <Room era={era} placed={showcase} outfit={outfits[0]?.id ?? null} />
        </div>
        <p className="t-footnote text-label2 font-medium mt-4">{t('Era {n}', { n: era.index + 1 })}</p>
        <h3 className="t-title2 mt-0.5">{t(era.name)}</h3>
        <p className="t-subhead text-label2 mt-1">{t(era.tagline)}</p>
        <p className="t-subhead mt-3 flex items-start gap-1.5"><Lock size={15} className="text-label2 shrink-0 mt-[3px]" />
          {t('Unlocks after {h} hours of total focus ({time} to go). Then all of its items can be bought with Banana Coins.', { h: era.hours, time: fmtHours(togo) })}
        </p>
        <h4 className="t-section mt-5 mb-1.5">{tp(items.length, '{n} item', '{n} items')}</h4>
        <ul className="flex flex-wrap gap-1.5">
          {[...decor, ...outfits].map((i) => (
            <li key={i.id} className="t-footnote h-7 px-2.5 rounded-full bg-fill2 flex items-center gap-1">
              {t(i.name)}<span className="text-label2 tabular flex items-center gap-0.5"> · <BananaCoin size={12} />{i.price}</span>
            </li>
          ))}
        </ul>
        <Button className="w-full mt-6" variant="gray" onClick={onClose}>{t('Got It')}</Button>
      </div>
    </Sheet>
  );
}
