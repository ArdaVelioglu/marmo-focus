import { Hourglass, Settings, Store, Timer, Users } from 'lucide-react';
import { t } from '../i18n';

export const TABS = [
  { id: 'focus', label: 'Focus', icon: Timer },
  { id: 'journey', label: 'Journey', icon: Hourglass },
  { id: 'shop', label: 'Shop', icon: Store },
  { id: 'friends', label: 'Friends', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

/** Floating capsule tab bar on a frosted material, inset from the screen edges. */
export default function TabBar({ tab, onChange }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 px-4 pointer-events-none"
      style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }} aria-label={t('Tabs')}>
      <div className="pointer-events-auto max-w-[460px] mx-auto grid grid-cols-5 h-[62px] p-1.5 rounded-[31px] material-bar shadow-[var(--float-shadow)] ring-1 ring-[var(--card-edge)]">
        {TABS.map(({ id, label, icon: Icon }) => {
          const on = tab === id;
          return (
            <button key={id} onClick={() => onChange(id)} aria-current={on ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center gap-[3px] rounded-[26px] transition-colors duration-200 ${on ? 'text-tint' : 'text-label2'}`}>
              {on && <span className="absolute inset-0 rounded-[26px] bg-[color-mix(in_srgb,var(--tint)_13%,transparent)] a-fade" />}
              <Icon size={22} strokeWidth={on ? 2.3 : 1.9} className="relative" />
              <span className="relative text-[10.5px] leading-3 font-semibold tracking-[.1px]">{t(label)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
