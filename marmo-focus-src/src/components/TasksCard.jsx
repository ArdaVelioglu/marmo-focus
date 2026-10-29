import { useState } from 'react';
import { Check, Crosshair, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../state/store';
import { t } from '../i18n';

/**
 * A plain to-do list for planning what each session is for.
 * Completing tasks never pays coins — it only keeps your focus clear.
 * The task marked with the crosshair is the one your next session is "for".
 */
export default function TasksCard({ compact = false }) {
  const { state, dispatch } = useStore();
  const [text, setText] = useState('');
  const open = state.tasks.filter((x) => !x.done);
  const done = state.tasks.filter((x) => x.done);
  const shown = compact ? [...open.slice(0, 4)] : [...open, ...done];

  const add = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    dispatch({ type: 'task/add', text });
    setText('');
  };

  return (
    <section className="card p-5" aria-label={t('Tasks')}>
      <div className="flex items-baseline justify-between">
        <h2 className="t-headline">{t('What are you focusing on?')}</h2>
        <span className="t-footnote text-label2 tabular">{t('{n} open', { n: open.length })}</span>
      </div>

      <form onSubmit={add} className="mt-3 flex items-center gap-2">
        <label htmlFor="task-input" className="sr-only">{t('New task')}</label>
        <input id="task-input" value={text} onChange={(e) => setText(e.target.value)} maxLength={120} placeholder={t('Add a task, e.g. Outline chapter 3')}
          className="flex-1 min-w-0 h-11 rounded-[14px] bg-bg3 px-3.5 t-subhead outline-none focus:ring-2 focus:ring-tint" />
        <button type="submit" disabled={!text.trim()} aria-label={t('Add task')} className="pressable grid place-items-center w-11 h-11 rounded-[14px] btn-tint disabled:opacity-40 shrink-0">
          <Plus size={20} strokeWidth={2.6} />
        </button>
      </form>

      {shown.length > 0 ? (
        <ul className="mt-2">
          {shown.map((task) => {
            const current = state.currentTask === task.id;
            return (
              <li key={task.id} className="group flex items-center gap-3 py-2.5 hairline-b last:shadow-none">
                <button onClick={() => dispatch({ type: 'task/toggle', id: task.id })} aria-label={task.done ? t('Mark “{task}” as not done', { task: task.text }) : t('Complete “{task}”', { task: task.text })}
                  className="check-circle shrink-0 pressable" data-on={task.done}>
                  {task.done && <Check size={14} strokeWidth={3.2} />}
                </button>
                <span className={`flex-1 min-w-0 t-subhead break-words ${task.done ? 'line-through text-label3' : ''}`}>{task.text}</span>
                {!task.done && (
                  <button onClick={() => dispatch({ type: 'task/focus', id: task.id })} aria-pressed={current} aria-label={current ? t('Unpin from next session') : t('Focus on this next')}
                    className={`pressable h-7 px-2.5 rounded-full t-caption font-semibold flex items-center gap-1 shrink-0 ${current ? 'chip-soft' : 'text-label3'}`}>
                    <Crosshair size={13} strokeWidth={2.4} />{current && t('Next')}
                  </button>
                )}
                <button onClick={() => dispatch({ type: 'task/remove', id: task.id })} aria-label={t('Delete “{task}”', { task: task.text })} className="pressable text-label3 shrink-0 p-1 -mr-1">
                  <Trash2 size={16} />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="t-footnote text-label2 mt-3">{t('Write down one thing to work on. Pin it with the crosshair and {pet} will keep it beside the timer.', { pet: state.petName })}</p>
      )}

      {!compact && done.length > 0 && (
        <button onClick={() => dispatch({ type: 'task/clearDone' })} className="pressable mt-3 t-footnote font-semibold text-tint">{t('Clear {n} completed', { n: done.length })}</button>
      )}
      {compact && open.length > 4 && <p className="t-footnote text-label2 mt-2">{t('+{n} more', { n: open.length - 4 })}</p>}
    </section>
  );
}
