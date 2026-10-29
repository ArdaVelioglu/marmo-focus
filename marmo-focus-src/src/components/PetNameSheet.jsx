import { useEffect, useState } from 'react';
import { useStore, DEFAULT_PET_NAME } from '../state/store';
import { Button, Sheet } from './ui';
import Marmoset from './art/Marmoset';
import { t } from '../i18n';

const IDEAS = ['Mango', 'Pip', 'Biscuit', 'Nova', 'Kiwi', 'Taro'];

/** Rename the pet marmoset. Saved in the store (and so in the profile on this device). */
export default function PetNameSheet({ open, onClose }) {
  const { state, dispatch } = useStore();
  const [name, setName] = useState(state.petName);
  useEffect(() => { if (open) setName(state.petName); }, [open, state.petName]);

  const save = (e) => {
    e.preventDefault();
    dispatch({ type: 'petName', name });
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title={t('Name Your Marmoset')} detent="medium">
      <form className="px-4" onSubmit={save}>
        <div className="mx-auto w-24 h-24"><svg viewBox="0 0 120 130" className="w-full h-full"><Marmoset outfit={state.outfit} /></svg></div>
        <label className="t-footnote text-label2 px-1" htmlFor="pet-name">{t('Name')}</label>
        <input id="pet-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={20} placeholder={DEFAULT_PET_NAME}
          className="mt-1.5 w-full h-[52px] rounded-[16px] card px-4 t-body outline-none focus:ring-2 focus:ring-tint" />
        <div className="flex flex-wrap gap-2 mt-3" aria-label={t('Suggestions')}>
          {IDEAS.map((n) => (
            <button key={n} type="button" onClick={() => setName(n)}
              className={`pressable h-8 px-3.5 rounded-full t-subhead font-medium ${name === n ? 'btn-tint' : 'bg-bg2'}`}>{n}</button>
          ))}
        </div>
        <Button type="submit" className="w-full mt-5" disabled={!name.trim()}>{t('Save Name')}</Button>
      </form>
    </Sheet>
  );
}
