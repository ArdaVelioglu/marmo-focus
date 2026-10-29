import { CalendarClock, Coins, FastForward, Flame, Gauge, RotateCcw, Timer, Trophy, Unlock, UserPlus } from 'lucide-react';
import { useStore, isEraUnlocked, makeCode, INVITE_REWARD } from '../state/store';
import { ACHIEVEMENTS } from '../data/achievements';
import { ERAS } from '../data/eras';
import { fmtHours } from '../lib/feedback';
import { useState } from 'react';
import { BananaCoin, ConfirmSheet, Row, Section, Segmented, Sheet, Switch } from './ui';

export default function DevPanel({ open, onClose, notify }) {
  const { state, dispatch } = useStore();
  const [ask, setAsk] = useState(null);
  const inject = () => {
    dispatch({ type: 'dev/coins', amount: 10000 });
    notify({ text: '+10,000 Banana Coins', icon: <BananaCoin size={18} /> });
  };

  return (
    <Sheet open={open} onClose={onClose} title="Developer">
      <div className="px-4">
        <div className="card p-4 flex items-center gap-3">
          <BananaCoin size={36} />
          <div className="flex-1">
            <p className="t-title2 tabular">{state.coins.toLocaleString()}</p>
            <p className="t-footnote text-label2">{fmtHours(state.focusMinutes)} focused · {state.sessions} sessions</p>
          </div>
          <button onClick={inject} className="pressable h-9 px-4 rounded-full btn-tint t-subhead font-semibold flex items-center gap-1.5">
            <Coins size={16} strokeWidth={2.4} />+10,000
          </button>
        </div>
      </div>

      <Section header="Era Switcher" footer="Jumping to an era also unlocks all eras so every shop is testable.">
        <div className="grid grid-cols-2 gap-2 p-3">
          {ERAS.map((e) => {
            const on = state.activeEra === e.id;
            return (
              <button key={e.id} onClick={() => dispatch({ type: 'dev/era', id: e.id })}
                className={`pressable h-14 rounded-[12px] px-3 text-left flex flex-col justify-center ${on ? 'text-white' : 'bg-fill2'}`}
                style={on ? { background: e.tint.light } : undefined}>
                <span className="t-caption opacity-70">Era {e.index + 1} · {e.hours}h{!isEraUnlocked(state, e) && ' · locked'}</span>
                <span className="t-subhead font-semibold truncate">{e.name}</span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section header="Progress">
        <Row icon={Unlock} iconBg="#34c759" title="Unlock All Eras" right={<Switch label="Unlock all eras" checked={state.devUnlockAll} onChange={(v) => dispatch({ type: 'dev/unlockAll', on: v })} />} />
        <Row icon={Timer} iconBg="#ff9500" title="Add 1 Hour of Focus" onClick={() => dispatch({ type: 'dev/minutes', amount: 60 })} chevron />
        <Row icon={FastForward} iconBg="#007aff" title="Complete Current Session" onClick={() => dispatch({ type: 'dev/finish' })} chevron />
        <Row icon={UserPlus} iconBg="#5856d6" title="Simulate Friend Joining" detail={`+${INVITE_REWARD}`} onClick={() => {
          const code = makeCode();
          dispatch({ type: 'referral/joined', code });
          notify({ text: `${code} joined with your code · +${INVITE_REWARD}`, icon: <BananaCoin size={18} /> });
        }} chevron />
        <Row icon={Trophy} iconBg="#ff9500" title="Unlock All Badges" onClick={() => dispatch({ type: 'achievements/unlock', ids: ACHIEVEMENTS.map((a) => a.id) })} chevron />
        <Row icon={Flame} iconBg="#ff6b3d" title="Add 1 Streak Day" detail={`${state.streak.count}d`} onClick={() => dispatch({ type: 'dev/streak' })} chevron />
        <Row icon={CalendarClock} iconBg="#34aadc" title="Show Daily Bonus Again" onClick={() => { dispatch({ type: 'dev/daily' }); onClose(); }} chevron last />
      </Section>

      <Section header="Timer Speed" footer="Speeds up the countdown to test session completion and era transitions.">
        <div className="p-3 flex items-center gap-3">
          <Gauge size={20} className="text-label2 shrink-0" />
          <Segmented className="flex-1" value={state.devSpeed} onChange={(v) => dispatch({ type: 'dev/speed', speed: v })}
            options={[{ value: 1, label: '1×' }, { value: 60, label: '60×' }, { value: 600, label: '600×' }]} />
        </div>
      </Section>

      <Section>
        <Row icon={RotateCcw} iconBg="#ff3b30" title="Reset Progress" destructive
          onClick={() => setAsk({ title: 'Reset progress?', message: 'Coins, focus time, items and eras go back to zero.', action: 'Reset', onConfirm: () => dispatch({ type: 'reset' }) })} />
        <Row title="Turn Off Developer Mode" onClick={() => { dispatch({ type: 'dev/toggle', on: false }); onClose(); }} last />
      </Section>
      <ConfirmSheet request={ask} onClose={() => setAsk(null)} />
    </Sheet>
  );
}
