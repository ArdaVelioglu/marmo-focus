import { useEffect, useState } from 'react';
import { CloudRain, Flame, Music2, Pause, Play, Trees, Volume2 } from 'lucide-react';
import { useStore } from '../state/store';
import * as audio from '../lib/ambience';
import { Sheet } from './ui';
import { t } from '../i18n';

const ICONS = { rain: CloudRain, forest: Trees, fire: Flame, lofi: Music2 };
const COLORS = { rain: '#6f97c9', forest: '#6fa86a', fire: '#e08452', lofi: '#a77fc8' };

/** Which channels are playing right now (kept in sync with the audio engine). */
export function usePlaying() {
  const [list, setList] = useState(audio.playing());
  useEffect(() => audio.subscribe(setList), []);
  return list;
}

export default function AmbienceSheet({ open, onClose }) {
  const { state, dispatch } = useStore();
  const amb = state.ambience;
  const list = usePlaying();
  const setVol = (id, value) => {
    dispatch({ type: 'ambience/volume', id, value });
    if (id === 'master') audio.setMaster(value); else audio.setVolume(id, value);
  };

  return (
    <Sheet open={open} onClose={onClose} title={t('Sounds')} detent="medium">
      <div className="px-4">
        <p className="t-footnote text-label2 px-1">{t('Mix any sounds together. They keep playing while you switch tabs.')}</p>
        <div className="card mt-3 overflow-hidden">
          {audio.SOUNDS.map((s, i) => {
            const Icon = ICONS[s.id];
            const on = list.includes(s.id);
            return (
              <div key={s.id} className={`flex items-center gap-3 px-4 py-3 ${i < audio.SOUNDS.length - 1 ? 'hairline-b' : ''}`}>
                <button onClick={() => audio.toggle(s.id, amb[s.id], amb.master)} aria-pressed={on} aria-label={`${on ? t('Pause') : t('Play')} ${t(s.name)}`}
                  className="pressable relative grid place-items-center w-11 h-11 rounded-[14px] shrink-0 text-white"
                  style={{ background: on ? `linear-gradient(180deg, color-mix(in srgb, ${COLORS[s.id]} 75%, #fff), ${COLORS[s.id]})` : 'var(--sys-fill2)', color: on ? '#fff' : COLORS[s.id] }}>
                  <Icon size={20} strokeWidth={2.2} />
                  <span className="absolute -right-1 -bottom-1 grid place-items-center w-5 h-5 rounded-full bg-bg2 text-label shadow-sm">
                    {on ? <Pause size={10} fill="currentColor" strokeWidth={0} /> : <Play size={10} fill="currentColor" strokeWidth={0} className="ml-px" />}
                  </span>
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="t-subhead font-semibold">{t(s.name)}</span>
                    <span className="t-caption text-label2 truncate">{on ? t('Playing') : t(s.hint)}</span>
                  </div>
                  <input id={`vol-${s.id}`} type="range" min="0" max="1" step="0.01" value={amb[s.id]} aria-label={t('{sound} volume', { sound: t(s.name) })}
                    onChange={(e) => setVol(s.id, Number(e.target.value))}
                    className="hig-slider hig-slider-sm mt-1" style={{ '--p': `${amb[s.id] * 100}%`, '--tint-override': COLORS[s.id] }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="card mt-3 px-4 py-3 flex items-center gap-3">
          <Volume2 size={20} className="text-label2 shrink-0" />
          <input id="vol-master" type="range" min="0" max="1" step="0.01" value={amb.master} aria-label={t('Master volume')}
            onChange={(e) => setVol('master', Number(e.target.value))} className="hig-slider hig-slider-sm flex-1" style={{ '--p': `${amb.master * 100}%` }} />
          <button onClick={audio.stopAll} disabled={!list.length} className="pressable t-subhead font-semibold text-tint disabled:opacity-40 shrink-0">{t('Stop All')}</button>
        </div>
      </div>
    </Sheet>
  );
}

/** Three little bars that bounce while any sound plays. */
export function SoundBars({ active }) {
  return (
    <span className="flex items-end gap-[2px] h-3.5" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span key={i} className={`w-[3px] rounded-full bg-current ${active ? 'a-eq' : ''}`} style={{ height: active ? '100%' : '40%', animationDelay: `${i * 0.18}s` }} />
      ))}
    </span>
  );
}
