import { Sparkles } from 'lucide-react';
import { eraById } from '../data/eras';
import { useStore, placedIn } from '../state/store';
import Room from './Room';
import { Button } from './ui';
import { t } from '../i18n';

export default function Celebration() {
  const { state, dispatch } = useStore();
  if (!state.celebrate) return null;
  const era = eraById(state.celebrate);
  const close = () => dispatch({ type: 'celebrate/done' });
  return (
    <div className="fixed inset-0 z-[55] grid place-items-center p-6" role="alertdialog" aria-label={t('{era} unlocked', { era: t(era.name) })}>
      <div className="absolute inset-0 bg-black/50 a-fade" onClick={close} />
      <div className="relative w-full max-w-[360px] card !rounded-[30px] overflow-hidden a-pop shadow-[var(--float-shadow)]">
        <div className="aspect-[6/5]"><Room era={era} placed={placedIn(state, era.id)} outfit={state.outfit} /></div>
        <div className="p-5 text-center">
          <p className="t-footnote font-semibold text-tint flex items-center justify-center gap-1"><Sparkles size={14} />{t('New Era Unlocked')}</p>
          <h2 className="t-title2 mt-1">{t(era.name)}</h2>
          <p className="t-subhead text-label2 mt-1">{t(era.tagline)}</p>
          <Button className="w-full mt-5" onClick={close}>{t('Explore')}</Button>
        </div>
      </div>
    </div>
  );
}
