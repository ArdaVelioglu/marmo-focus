import { useState } from 'react';
import { ERAS } from '../data/eras';
import { useStore } from '../state/store';
import Room from './Room';
import { Button } from './ui';
import { t } from '../i18n';

/** First launch: start instantly as a guest, or create an optional on-device profile. */
export default function Onboarding() {
  const { dispatch } = useStore();
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState('');
  const [pet, setPet] = useState('');

  return (
    <div className="min-h-dvh flex flex-col max-w-[520px] mx-auto px-6" style={{ paddingTop: 'max(env(safe-area-inset-top), 24px)', paddingBottom: 'max(env(safe-area-inset-bottom), 24px)' }}>
      <div className="flex-1 flex flex-col justify-center">
        <div className="relative rounded-[32px] overflow-hidden aspect-[6/5] shadow-[var(--float-shadow)] ring-1 ring-white/25 a-pop">
          <Room era={ERAS[0]} placed={{ left: 'stone.left', rug: 'stone.rug', small: 'stone.small' }} outfit="stone.outfit" />
        </div>
        <div className="flex justify-center gap-1.5 mt-5" aria-hidden="true">
          {ERAS.map((e) => <span key={e.id} className="w-1.5 h-1.5 rounded-full" style={{ background: e.tint.light, opacity: e.index === 0 ? 1 : 0.35 }} />)}
        </div>
        <h1 className="t-large-title text-center mt-5">Marmo Focus</h1>
        <p className="t-body text-label2 text-center mt-2 text-balance">
          {t('Focus to earn Banana Coins. Decorate your marmoset’s home and travel through eight eras — from the Stone Age to after the apocalypse.')}
        </p>
      </div>

      {naming ? (
        <form className="a-fade" onSubmit={(e) => { e.preventDefault(); if (name.trim()) dispatch({ type: 'profile', profile: { mode: 'local', name: name.trim() }, petName: pet }); }}>
          <label className="t-footnote text-label2 px-1" htmlFor="name">{t('Your name')}</label>
          <input id="name" autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={24} placeholder={t('e.g. Alex')}
            className="mt-1.5 w-full h-[52px] rounded-[16px] card px-4 t-body outline-none focus:ring-2 focus:ring-tint" />
          <label className="t-footnote text-label2 px-1 block mt-3" htmlFor="pet">{t('Your marmoset’s name')}</label>
          <input id="pet" value={pet} onChange={(e) => setPet(e.target.value)} maxLength={20} placeholder="Mango"
            className="mt-1.5 w-full h-[52px] rounded-[16px] card px-4 t-body outline-none focus:ring-2 focus:ring-tint" />
          <Button type="submit" className="w-full mt-4" disabled={!name.trim()}>{t('Create Profile')}</Button>
          <Button type="button" variant="plain" className="w-full mt-1" onClick={() => setNaming(false)}>{t('Back')}</Button>
          <p className="t-footnote text-label3 text-center mt-1">{t('Your profile and progress stay on this device. You can rename your marmoset anytime.')}</p>
        </form>
      ) : (
        <div className="a-fade">
          <Button className="w-full" onClick={() => dispatch({ type: 'profile', profile: { mode: 'guest' } })}>{t('Start as Guest')}</Button>
          <Button variant="gray" className="w-full mt-3" onClick={() => setNaming(true)}>{t('Create a Profile')}</Button>
        </div>
      )}
    </div>
  );
}

export function ProfileSheetContent({ onDone }) {
  const { state, dispatch } = useStore();
  const [name, setName] = useState(state.profile?.name ?? '');
  return (
    <form className="px-4" onSubmit={(e) => { e.preventDefault(); dispatch({ type: 'profile', profile: name.trim() ? { mode: 'local', name: name.trim() } : { mode: 'guest' } }); onDone(); }}>
      <label className="t-footnote text-label2 px-1" htmlFor="pname">{t('Name')}</label>
      <input id="pname" autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={24} placeholder={t('Leave empty to stay a guest')}
        className="mt-1.5 w-full h-[52px] rounded-[16px] card px-4 t-body outline-none focus:ring-2 focus:ring-tint" />
      <Button type="submit" className="w-full mt-4">{t('Save')}</Button>
      <p className="t-footnote text-label3 text-center mt-2">{t('Saved on this device. Your progress is kept.')}</p>
    </form>
  );
}
