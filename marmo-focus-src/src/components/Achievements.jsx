import { useMemo, useState } from 'react';
import { Lock } from 'lucide-react';
import { useStore } from '../state/store';
import { evaluate, formatProgress } from '../data/achievements';
import { Segmented, Sheet } from './ui';
import { locale, t } from '../i18n';

export function Badge({ a, size = 56 }) {
  const Icon = a.icon;
  return (
    <span className="relative grid place-items-center rounded-full shrink-0"
      style={{
        width: size, height: size,
        background: a.done ? `radial-gradient(circle at 35% 30%, color-mix(in srgb, ${a.color} 55%, #fff), ${a.color})` : 'var(--sys-fill2)',
        boxShadow: a.done ? `0 8px 18px -8px ${a.color}, inset 0 1px 0 rgba(255,255,255,.35)` : 'inset 0 0 0 1.5px var(--sys-fill)',
        color: a.done ? '#fff' : 'var(--sys-label3)',
      }}>
      <Icon size={size * 0.44} strokeWidth={2.1} />
      {!a.done && (
        <span className="absolute -right-0.5 -bottom-0.5 grid place-items-center w-5 h-5 rounded-full bg-bg2 text-label2 shadow-sm"><Lock size={10} strokeWidth={2.6} /></span>
      )}
    </span>
  );
}

/** Compact summary card for the Journey tab. */
export function AchievementsSummary({ onOpen }) {
  const { state } = useStore();
  const list = useMemo(() => evaluate(state), [state]);
  const done = list.filter((a) => a.done);
  const preview = [...done.sort((x, y) => (y.unlockedAt ?? 0) - (x.unlockedAt ?? 0)), ...list.filter((a) => !a.done).sort((x, y) => y.value / y.target - x.value / x.target)].slice(0, 5);
  return (
    <button onClick={onOpen} className="pressable card w-full text-left p-5">
      <div className="flex items-baseline justify-between">
        <span className="t-headline">{t('Badges')}</span>
        <span className="t-footnote text-label2 tabular">{t('{n} of {total} unlocked', { n: done.length, total: list.length })}</span>
      </div>
      <div className="flex gap-3 mt-3.5">
        {preview.map((a) => <Badge key={a.id} a={a} size={48} />)}
      </div>
      <div className="mt-3.5 h-1.5 rounded-full bg-fill2 overflow-hidden">
        <div className="h-full rounded-full btn-tint !shadow-none" style={{ width: `${(done.length / list.length) * 100}%` }} />
      </div>
    </button>
  );
}

export default function AchievementsSheet({ open, onClose }) {
  const { state } = useStore();
  const [filter, setFilter] = useState('all');
  const list = useMemo(() => evaluate(state), [state]);
  const shown = list.filter((a) => (filter === 'all' ? true : filter === 'done' ? a.done : !a.done));

  return (
    <Sheet open={open} onClose={onClose} title={t('Badges')}>
      <div className="px-4">
        <Segmented value={filter} onChange={setFilter} options={[
          { value: 'all', label: t('All') },
          { value: 'done', label: t('Unlocked ({n})', { n: list.filter((a) => a.done).length }) },
          { value: 'todo', label: t('In Progress') },
        ]} />
        <ul className="mt-4 grid gap-3">
          {shown.map((a) => (
            <li key={a.id} className="card !rounded-[22px] p-4 flex items-center gap-4">
              <Badge a={a} />
              <div className="flex-1 min-w-0">
                <p className="t-headline">{t(a.title)}</p>
                <p className="t-footnote text-label2 mt-0.5">{t(a.desc)}</p>
                {a.done ? (
                  <p className="t-caption font-semibold mt-2" style={{ color: `color-mix(in srgb, ${a.color} 80%, var(--sys-label))` }}>
                    {t('Unlocked')}{a.unlockedAt ? ` · ${new Date(a.unlockedAt).toLocaleDateString(locale(), { month: 'short', day: 'numeric' })}` : ''}
                  </p>
                ) : (
                  <div className="mt-2 flex items-center gap-2.5">
                    <div className="flex-1 h-1.5 rounded-full bg-fill2 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(a.value / a.target) * 100}%`, background: a.color }} />
                    </div>
                    <span className="t-caption text-label2 tabular shrink-0">{formatProgress(a)}</span>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
        {shown.length === 0 && <p className="t-subhead text-label2 text-center mt-8">{t('Nothing here yet. Finish a session to start collecting.')}</p>}
      </div>
    </Sheet>
  );
}
