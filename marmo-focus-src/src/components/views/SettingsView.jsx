import { BellRing, ShieldCheck, Bell, Clock, Coffee, Headphones, Moon, PawPrint, UserRound, Volume2, Vibrate, Wrench, Hourglass, LogOut } from 'lucide-react';
import { useStore } from '../../state/store';
import { useState } from 'react';
import { ConfirmSheet, LargeTitle, Row, Section, Segmented, Switch } from '../ui';
import PetNameSheet from '../PetNameSheet';
import AmbienceSheet from '../AmbienceSheet';
import { TIMES, WEATHERS } from '../../lib/atmosphere';
import { notificationsSupported, requestPermission } from '../../lib/notifications';
import { LANGUAGES, t } from '../../i18n';
import { DEV_TOOLS } from '../../lib/devtools';
import { Check } from 'lucide-react';

export default function SettingsView({ onOpenDev, onEditProfile }) {
  const { state, dispatch } = useStore();
  const s = state.settings;
  const set = (patch) => dispatch({ type: 'settings', patch });
  const p = state.profile;
  const [ask, setAsk] = useState(null);
  const [renaming, setRenaming] = useState(false);
  const [sounds, setSounds] = useState(false);
  const atm = state.atmosphere;
  const [denied, setDenied] = useState(false);
  const toggleNotify = async (on) => {
    if (!on) return set({ notify: false });
    const ok = await requestPermission();
    setDenied(!ok);
    set({ notify: ok });
  };

  return (
    <div className="pb-10">
      <LargeTitle title={t('Settings')} />

      <Section>
        <button onClick={onEditProfile} className="w-full flex items-center gap-3 p-4 active:bg-fill2 text-left">
          <span className="grid place-items-center w-[58px] h-[58px] rounded-full btn-tint t-title2">
            {p?.mode === 'local' && p.name ? p.name[0].toUpperCase() : <UserRound size={28} />}
          </span>
          <span className="flex-1 min-w-0">
            <span className="block t-title2 truncate">{p?.mode === 'local' ? p.name : t('Guest')}</span>
            <span className="block t-footnote text-label2">{p?.mode === 'local' ? t('Profile saved on this device') : t('Create a profile to personalize')}</span>
          </span>
        </button>
      </Section>

      <Section header={t('Your Marmoset')}>
        <Row icon={PawPrint} iconBg="#8b7b6a" title={t('Name')} detail={state.petName} onClick={() => setRenaming(true)} chevron last />
      </Section>

      <Section header={t('Focus')} footer={denied ? t('Notifications are blocked. Allow them for Marmo in your device settings.') : t('Focus Guard: leaving Marmo for more than 10 seconds wakes {pet}, and that session pays no bonus. Locking your phone is fine.', { pet: state.petName })}>
        <Row icon={ShieldCheck} iconBg="#5a9b7b" title={t('Focus Guard')} right={<Switch label={t('Focus Guard')} checked={s.focusGuard} onChange={(v) => set({ focusGuard: v })} />} last={!notificationsSupported()} />
        {notificationsSupported() && <Row icon={BellRing} iconBg="#ff9500" title={t('Notify When Done')} right={<Switch label={t('Notify When Done')} checked={s.notify} onChange={toggleNotify} />} last />}
      </Section>

      <Section header={t('Breaks')} footer={!s.breaks ? t('Turn on to get a break suggestion after each focus session.') : s.breakAuto ? t('Break length follows the session: one fifth of it, between 5 and 30 minutes.') : t('Pick session length on the Focus tab.')}>
        <Row icon={Coffee} iconBg="#34c759" title={t('Breaks After Focus')} right={<Switch label={t('Breaks After Focus')} checked={s.breaks} onChange={(v) => set({ breaks: v })} />} last={!s.breaks} />
        {s.breaks && <>
          <Row icon={Moon} iconBg="#5856d6" title={t('Match Session Length')} right={<Switch label={t('Match Session Length')} checked={s.breakAuto} onChange={(v) => set({ breakAuto: v })} />} />
          {!s.breakAuto && <Row icon={Clock} iconBg="#ff3b30" title={t('Break')} right={<Stepper value={s.breakMinutes} min={1} max={30} step={1} unit={t('min')} onChange={(v) => set({ breakMinutes: v })} />} />}
          <Row icon={Hourglass} iconBg="#ff9500" title={t('Auto-start Breaks')} right={<Switch label={t('Auto-start Breaks')} checked={s.autoBreaks} onChange={(v) => set({ autoBreaks: v })} />} last />
        </>}
      </Section>

      <Section header={t('Feedback')}>
        <Row icon={Volume2} iconBg="#ff2d55" title={t('Sounds')} right={<Switch label={t('Sounds')} checked={s.sound} onChange={(v) => set({ sound: v })} />} />
        <Row icon={Vibrate} iconBg="#af52de" title={t('Haptics')} right={<Switch label={t('Haptics')} checked={s.haptics} onChange={(v) => set({ haptics: v })} />} />
        <Row icon={Headphones} iconBg="#6f97c9" title={t('Ambient Sounds')} detail={t('Rain, forest, fire, lo-fi')} onClick={() => setSounds(true)} chevron last />
      </Section>

      <Section header={t('Room Atmosphere')} footer={t('The room starts in daylight with clear skies. Auto follows your clock, with a gentle forecast that changes once a day.')}>
        <div className="p-3 grid gap-3">
          <div>
            <p className="t-footnote text-label2 px-1 pb-1.5">{t('Time of day')}</p>
            <Segmented value={atm.time} onChange={(v) => dispatch({ type: 'atmosphere', patch: { time: v } })} options={TIMES.map((o) => ({ ...o, label: t(o.label) }))} />
          </div>
          <div>
            <p className="t-footnote text-label2 px-1 pb-1.5">{t('Weather')}</p>
            <Segmented value={atm.weather} onChange={(v) => dispatch({ type: 'atmosphere', patch: { weather: v } })} options={WEATHERS.map((o) => ({ ...o, label: t(o.label) }))} />
          </div>
        </div>
      </Section>

      <Section header={t('Language')}>
        {[{ id: 'auto', label: t('Automatic') }, ...LANGUAGES].map((l, i, all) => (
          <Row key={l.id} title={l.label} onClick={() => set({ lang: l.id })}
            right={(s.lang ?? 'auto') === l.id ? <Check size={18} strokeWidth={2.6} className="text-tint" /> : null} last={i === all.length - 1} />
        ))}
      </Section>

      <Section header={t('Appearance')}>
        <div className="p-3">
          <Segmented value={s.theme} onChange={(v) => set({ theme: v })}
            options={[{ value: 'system', label: t('Automatic') }, { value: 'light', label: t('Light') }, { value: 'dark', label: t('Dark') }]} />
        </div>
      </Section>

      {DEV_TOOLS && (
        <Section header={t('Advanced')} footer={t('Developer Mode adds testing tools: era switcher, coin injector and timer speed-up.')}>
          <Row icon={Wrench} iconBg="#8e8e93" title={t('Developer Mode')} right={<Switch label={t('Developer Mode')} checked={state.devMode} onChange={(v) => dispatch({ type: 'dev/toggle', on: v })} />} last={!state.devMode} />
          {state.devMode && <Row title={t('Open Developer Panel')} onClick={onOpenDev} chevron last />}
        </Section>
      )}

      <Section>
        <Row icon={LogOut} iconBg="#ff3b30" title={p?.mode === 'local' ? t('Sign Out & Erase') : t('Erase Guest Data')} destructive last
          onClick={() => setAsk({ title: t('Erase everything?'), message: t('Progress, coins and items on this device will be deleted.'), action: t('Erase'), onConfirm: () => dispatch({ type: 'signout' }) })} />
      </Section>

      <p className="t-footnote text-label3 text-center mt-6 flex items-center justify-center gap-1"><Bell size={12} />Marmo Focus 1.7.1</p>
      <ConfirmSheet request={ask} onClose={() => setAsk(null)} />
      <PetNameSheet open={renaming} onClose={() => setRenaming(false)} />
      <AmbienceSheet open={sounds} onClose={() => setSounds(false)} />
    </div>
  );
}

function Stepper({ value, min, max, step, unit, onChange }) {
  const dec = () => onChange(Math.max(min, value - step === 0 ? 1 : value - step));
  const inc = () => onChange(Math.min(max, value === 1 && step > 1 ? step : value + step));
  return (
    <span className="flex items-center gap-2.5">
      <span className="t-body text-label2 tabular min-w-[54px] text-right">{value}{unit && ` ${unit}`}</span>
      <span className="flex h-8 rounded-[8px] bg-fill2 overflow-hidden">
        <button onClick={dec} disabled={value <= min} aria-label={t('Decrease')} className="w-[47px] grid place-items-center t-title2 font-normal disabled:opacity-30 active:bg-fill">−</button>
        <span className="w-px my-1.5 bg-sep" />
        <button onClick={inc} disabled={value >= max} aria-label={t('Increase')} className="w-[47px] grid place-items-center t-title2 font-normal disabled:opacity-30 active:bg-fill">+</button>
      </span>
    </span>
  );
}
