// Daily streak: the once-a-day bonus popup, the flame chip in the header and the streak sheet.
import { Check, Flame, Snowflake } from 'lucide-react';
import { useStore, useDerived } from '../state/store';
import { FREEZE_PRICE, MAX_FREEZES, STREAK_TIERS, dailyBonusFor, dayNumber, nextStreakTier, streakMult } from '../lib/economy';
import { haptic } from '../lib/feedback';
import { BananaCoin, Button, Sheet } from './ui';
import { useClockLock } from '../hooks/useClockLock';
import { t, tp } from '../i18n';

const FLAME = '#f08a5d';

/** Shown on the first open of each day; collecting adds the bonus to the balance. */
export function DailyBonus({ today }) {
  const { state, dispatch } = useStore();
  const { streakDays } = useDerived();
  const locked = useClockLock();
  if (!state.profile || state.lastBonusDay === today || state.celebrate || locked) return null;

  const bonus = dailyBonusFor(streakDays);
  const focusedToday = state.streak.last === dayNumber();
  const collect = () => { if (state.settings.haptics) haptic(10); dispatch({ type: 'daily/claim' }); };

  return (
    <div className="fixed inset-0 z-[55] grid place-items-center p-6" role="alertdialog" aria-label={t('Daily bonus')}>
      <div className="absolute inset-0 bg-black/40 a-fade" onClick={collect} />
      <div className="relative w-full max-w-[340px] card !rounded-[30px] p-6 text-center a-pop shadow-[var(--float-shadow)]">
        <span className="mx-auto grid place-items-center w-20 h-20 rounded-full chip-soft"><BananaCoin size={48} /></span>
        <p className="t-footnote font-semibold text-tint mt-4">{t('Daily bonus')}</p>
        <h2 className="t-title2 mt-0.5">{t('+{n} Banana Coins', { n: bonus })}</h2>
        <p className="t-subhead text-label2 mt-1.5">
          {streakDays > 0
            ? `${t('{n}-day streak.', { n: streakDays })} ${focusedToday ? t('Today already counts.') : t('Finish a session today to keep it going.')}`
            : t('Welcome back! Focus today to start a streak with {pet}.', { pet: state.petName })}
        </p>
        <StreakDots days={streakDays} className="mt-4" />
        <Button className="w-full mt-5" onClick={collect}>{t('Collect')}</Button>
      </div>
    </div>
  );
}

/** Flame chip for the header. Dimmed while today hasn't counted yet. */
export function StreakChip({ onClick }) {
  const { state } = useStore();
  const { streakDays } = useDerived();
  const lit = streakDays > 0 && state.streak.last === dayNumber();
  return (
    <button onClick={onClick} aria-label={t('{n}-day streak', { n: streakDays })}
      className="pressable card !rounded-full flex items-center gap-1 h-9 pl-2.5 pr-3.5">
      <Flame size={18} strokeWidth={2.4} style={{ color: lit ? FLAME : 'var(--sys-label3)' }} fill={lit ? FLAME : 'none'} />
      <span className="t-subhead font-semibold tabular">{streakDays}</span>
      {state.freezes > 0 && <Snowflake size={13} strokeWidth={2.6} className="text-[#5ea8d8] ml-0.5" aria-label={t('{n} streak freezes', { n: state.freezes })} />}
    </button>
  );
}

export function StreakSheet({ open, onClose }) {
  const { state, dispatch } = useStore();
  const full = state.freezes >= MAX_FREEZES;
  const afford = state.coins >= FREEZE_PRICE;
  const { streakDays } = useDerived();
  const next = nextStreakTier(streakDays);
  const focusedToday = state.streak.last === dayNumber();
  return (
    <Sheet open={open} onClose={onClose} title={t('Focus Streak')} detent="large">
      <div className="px-5 text-center">
        <Flame size={56} strokeWidth={1.6} className="mx-auto" style={{ color: FLAME }} fill={streakDays ? FLAME : 'none'} />
        <p className="t-large-title tabular mt-1">{tp(streakDays, '{n} day', '{n} days')}</p>
        <p className="t-subhead text-label2 mt-1">
          {focusedToday ? t('Today counts. See you tomorrow!') : streakDays ? t('Finish one session today to keep your streak.') : t('Finish a session on consecutive days to build a streak.')}
        </p>
        <StreakDots days={streakDays} className="mt-4" />
        {next && <p className="t-footnote text-label2 mt-3">{tp(next.days - streakDays, '{n} more day to ×{mult} coins', '{n} more days to ×{mult} coins', { mult: next.mult.toFixed(2) })}</p>}
      </div>

      <h2 className="t-section px-9 mt-7 pb-2">{t('Streak freeze')}</h2>
      <div className="px-4">
        <div className="card !rounded-[22px] p-4">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-11 h-11 rounded-full shrink-0" style={{ background: 'color-mix(in srgb, #5ea8d8 18%, var(--sys-bg2))', color: '#3f8fc4' }}><Snowflake size={22} strokeWidth={2.2} /></span>
            <div className="flex-1 min-w-0">
              <p className="t-headline">{t('{n} of {max} owned', { n: state.freezes, max: MAX_FREEZES })}</p>
              <p className="t-footnote text-label2">{t('Missed a day? A freeze is used automatically and your streak stays.')}</p>
            </div>
          </div>
          <div className="flex gap-1.5 mt-3" aria-hidden="true">
            {Array.from({ length: MAX_FREEZES }, (_, i) => (
              <span key={i} className="flex-1 h-1.5 rounded-full" style={{ background: i < state.freezes ? '#5ea8d8' : 'var(--sys-fill2)' }} />
            ))}
          </div>
          <Button className="w-full mt-4 !h-11" variant={full || !afford ? 'gray' : 'filled'} disabled={full || !afford} onClick={() => dispatch({ type: 'freeze/buy' })}>
            {full ? t('Freezes full') : <><BananaCoin size={18} />{afford ? t('Buy for {n}', { n: FREEZE_PRICE }) : t('Need {n} more', { n: FREEZE_PRICE - state.coins })}</>}
          </Button>
        </div>
      </div>

      <h2 className="t-section px-9 mt-7 pb-2">{t('Streak rewards')}</h2>
      <div className="px-4">
        <div className="card !rounded-[22px] overflow-hidden">
          {STREAK_TIERS.map((tier, i) => {
            const on = streakDays >= tier.days;
            return (
              <div key={tier.days} className={`flex items-center gap-3 px-4 min-h-[56px] ${i < STREAK_TIERS.length - 1 ? 'hairline-b' : ''}`}>
                <span className={`grid place-items-center w-8 h-8 rounded-full ${on ? 'btn-tint' : 'bg-fill2 text-label2'}`}>
                  {on ? <Check size={16} strokeWidth={3} /> : <Flame size={15} strokeWidth={2.4} />}
                </span>
                <span className="flex-1 t-body">{t('{n}-day streak', { n: tier.days })}</span>
                <span className="t-subhead font-semibold tabular" style={{ color: on ? 'var(--tint)' : 'var(--sys-label2)' }}>{t('×{mult} coins', { mult: tier.mult.toFixed(2) })}</span>
              </div>
            );
          })}
        </div>
        <p className="t-footnote text-label2 px-4 pt-1.5">
          {t('The streak bonus stacks with the session bonus, up to ×5.00 in total. Every day you also collect a daily bonus of {min}–{max} coins, more with a longer streak. Current bonus: ×{mult}.', { min: dailyBonusFor(0), max: dailyBonusFor(10), mult: streakMult(streakDays).toFixed(2) })}
        </p>
      </div>
    </Sheet>
  );
}

/** Seven dots for the current week of the streak. */
function StreakDots({ days, className = '' }) {
  const filled = days === 0 ? 0 : ((days - 1) % 7) + 1;
  return (
    <div className={`flex justify-center gap-1.5 ${className}`} aria-hidden="true">
      {Array.from({ length: 7 }, (_, i) => (
        <span key={i} className="w-7 h-7 rounded-full grid place-items-center"
          style={{ background: i < filled ? FLAME : 'var(--sys-fill2)', color: '#fff' }}>
          {i < filled && <Flame size={14} strokeWidth={2.6} fill="#fff" />}
        </span>
      ))}
    </div>
  );
}
