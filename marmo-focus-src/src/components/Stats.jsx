// Focus statistics: last 7 days (bars), a 12-week calendar heatmap, and focus by hour of day.
// One series everywhere, so one hue (the era tint): bars in tint, heatmap steps from light to full tint.
import { useMemo, useState } from 'react';
import { BarChart3, ChevronRight } from 'lucide-react';
import { useStore } from '../state/store';
import { dayNumber } from '../lib/economy';
import { fmtHours } from '../lib/feedback';
import { Sheet } from './ui';
import { locale, t } from '../i18n';

const WEEKS = 12;

/** Minutes per day number, and per hour of day (by session start). */
function useBuckets() {
  const { state } = useStore();
  return useMemo(() => {
    const byDay = new Map();
    const byHour = Array(24).fill(0);
    for (const h of state.history) {
      const d = dayNumber(h.t);
      byDay.set(d, (byDay.get(d) ?? 0) + h.m);
      byHour[new Date(h.t - h.m * 60000).getHours()] += h.m;
    }
    return { byDay, byHour };
  }, [state.history]);
}

const dateOf = (day) => { const d = new Date(day * 864e5); return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()); };
const weekday = (day, style = 'short') => dateOf(day).toLocaleDateString(locale(), { weekday: style });
const dateLabel = (day) => dateOf(day).toLocaleDateString(locale(), { weekday: 'short', month: 'short', day: 'numeric' });
const hourLabel = (h) => new Date(2000, 0, 1, h).toLocaleTimeString(locale(), { hour: 'numeric' });

/** Compact card for the Journey tab: this week's bars, opens the full sheet. */
export function StatsSummary({ onOpen }) {
  const { byDay } = useBuckets();
  const today = dayNumber();
  const days = Array.from({ length: 7 }, (_, i) => today - 6 + i);
  const total = days.reduce((s, d) => s + (byDay.get(d) ?? 0), 0);
  const max = Math.max(1, ...days.map((d) => byDay.get(d) ?? 0));
  return (
    <button onClick={onOpen} className="pressable card w-full text-left p-5">
      <div className="flex items-baseline justify-between">
        <span className="t-headline flex items-center gap-1.5"><BarChart3 size={17} className="text-tint" />{t('Statistics')}</span>
        <span className="t-footnote text-label2 tabular flex items-center">{t('Last 7 days')} · {fmtHours(total)}<ChevronRight size={16} className="text-label3" /></span>
      </div>
      <div className="flex items-end gap-1.5 h-14 mt-3" aria-hidden="true">
        {days.map((d) => {
          const v = byDay.get(d) ?? 0;
          return <span key={d} className="flex-1 rounded-t-[4px]" style={{ height: v ? `${Math.max(8, (v / max) * 100)}%` : 2, background: v ? 'var(--tint)' : 'var(--sys-fill)', opacity: d === today ? 1 : 0.7 }} />;
        })}
      </div>
    </button>
  );
}

export default function StatsSheet({ open, onClose }) {
  return (
    <Sheet open={open} onClose={onClose} title={t('Statistics')}>
      {open && <StatsBody />}
    </Sheet>
  );
}

function StatsBody() {
  const { state } = useStore();
  const { byDay, byHour } = useBuckets();
  const today = dayNumber();
  const week = Array.from({ length: 7 }, (_, i) => today - 6 + i);
  const weekTotal = week.reduce((s, d) => s + (byDay.get(d) ?? 0), 0);
  const best = week.reduce((b, d) => ((byDay.get(d) ?? 0) > (byDay.get(b) ?? 0) ? d : b), week[0]);
  const activeDays = week.filter((d) => byDay.get(d)).length;

  const tiles = [
    { label: t('This week'), value: fmtHours(weekTotal) },
    { label: t('Daily average'), value: fmtHours(Math.round(weekTotal / 7)) },
    { label: t('Active days'), value: `${activeDays} / 7` },
  ];

  return (
    <div className="px-4 pb-4">
      <div className="grid grid-cols-3 gap-2.5">
        {tiles.map((t) => (
          <div key={t.label} className="card !rounded-[20px] px-3 py-3">
            <p className="t-caption text-label2">{t.label}</p>
            <p className="t-headline tabular mt-0.5">{t.value}</p>
          </div>
        ))}
      </div>

      <ChartCard title={t('Last 7 days')} note={byDay.get(best) ? t('Best day: {day}, {time}', { day: weekday(best, 'long'), time: fmtHours(byDay.get(best)) }) : t('No sessions this week yet')}>
        <Bars data={week.map((d) => ({ key: d, value: byDay.get(d) ?? 0, label: weekday(d, 'narrow'), tip: dateLabel(d), strong: d === today }))} height={140} />
      </ChartCard>

      <ChartCard title={t('Focus calendar')} note={`${t('Last {n} weeks', { n: WEEKS })} · ${state.streak.count ? t('current streak {n} days', { n: state.streak.count }) : t('focus on consecutive days to build a streak')}`}>
        <Heatmap byDay={byDay} today={today} />
      </ChartCard>

      <ChartCard title={t('Time of day')} note={peakNote(byHour)}>
        <Bars data={byHour.map((v, h) => ({ key: h, value: v, label: h % 6 === 0 ? hourLabel(h) : '', tip: `${hourLabel(h)}–${hourLabel((h + 1) % 24)}` }))} height={110} gap={2} />
      </ChartCard>
    </div>
  );
}

function peakNote(byHour) {
  const max = Math.max(...byHour);
  if (!max) return t('Finish a few sessions to see when you focus best');
  const h = byHour.indexOf(max);
  return t('You focus most around {hour}', { hour: hourLabel(h) });
}

function ChartCard({ title, note, children }) {
  return (
    <section className="card !rounded-[22px] p-4 mt-3">
      <h3 className="t-headline">{title}</h3>
      <p className="t-footnote text-label2 mt-0.5">{note}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/** Single-series bars with rounded tops, a hairline baseline, and a tap/hover readout. */
function Bars({ data, height, gap = 6 }) {
  const [sel, setSel] = useState(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const active = data.find((d) => d.key === sel);
  return (
    <div>
      <p className="t-footnote tabular h-[18px] text-label2" aria-live="polite">
        {active ? <><span className="text-label font-semibold">{fmtHours(active.value)}</span> · {active.tip}</> : t('Tap a bar for details')}
      </p>
      <div className="relative flex items-end mt-1.5 hairline-b" style={{ height, gap }} onMouseLeave={() => setSel(null)}>
        {data.map((d) => (
          <button key={d.key} onClick={() => setSel(d.key === sel ? null : d.key)} onMouseEnter={() => setSel(d.key)}
            aria-label={`${d.tip}: ${fmtHours(d.value)}`} className="flex-1 h-full flex items-end min-w-0">
            <span className="w-full rounded-t-[4px] transition-opacity"
              style={{ height: d.value ? `${Math.max(3, (d.value / max) * 100)}%` : 0, background: 'var(--tint)', opacity: sel == null ? (d.strong === false ? 0.7 : 1) : d.key === sel ? 1 : 0.45 }} />
          </button>
        ))}
      </div>
      <div className="flex mt-1.5" style={{ gap }} aria-hidden="true">
        {data.map((d) => <span key={d.key} className="flex-1 min-w-0 text-center t-caption text-label2 whitespace-nowrap overflow-visible">{d.label}</span>)}
      </div>
    </div>
  );
}

/** GitHub-style calendar: columns are weeks (Monday first), cells are days, color steps by minutes. */
function Heatmap({ byDay, today }) {
  const [sel, setSel] = useState(null);
  const dow = (dateOf(today).getDay() + 6) % 7;      // 0 = Monday
  const start = today - dow - (WEEKS - 1) * 7;
  const cells = Array.from({ length: WEEKS * 7 }, (_, i) => start + i);
  const level = (m) => (!m ? 0 : m < 30 ? 1 : m < 60 ? 2 : m < 120 ? 3 : 4);
  const fill = ['var(--sys-fill2)', 'color-mix(in srgb, var(--tint) 30%, var(--sys-bg2))', 'color-mix(in srgb, var(--tint) 55%, var(--sys-bg2))', 'color-mix(in srgb, var(--tint) 80%, var(--sys-bg2))', 'var(--tint)'];
  return (
    <div>
      <p className="t-footnote tabular h-[18px] text-label2" aria-live="polite">
        {sel != null ? <><span className="text-label font-semibold">{fmtHours(byDay.get(sel) ?? 0)}</span> · {dateLabel(sel)}</> : t('Tap a day for details')}
      </p>
      <div className="grid grid-flow-col gap-[3px] mt-1.5" style={{ gridTemplateRows: 'repeat(7, 1fr)', gridTemplateColumns: `repeat(${WEEKS}, 1fr)` }}>
        {cells.map((d) => (
          <button key={d} disabled={d > today} onClick={() => setSel(d === sel ? null : d)} onMouseEnter={() => d <= today && setSel(d)}
            aria-label={`${dateLabel(d)}: ${fmtHours(byDay.get(d) ?? 0)}`}
            className="aspect-square rounded-[4px] disabled:opacity-0"
            style={{ background: fill[level(byDay.get(d))], boxShadow: d === sel ? '0 0 0 2px var(--sys-label)' : d === today ? 'inset 0 0 0 1.5px var(--sys-label3)' : undefined }} />
        ))}
      </div>
      <div className="flex items-center justify-end gap-1 mt-2 t-caption text-label2" aria-hidden="true">
        {t('Less')}{fill.map((f, i) => <span key={i} className="w-3 h-3 rounded-[3px]" style={{ background: f }} />)}{t('More')}
      </div>
    </div>
  );
}
