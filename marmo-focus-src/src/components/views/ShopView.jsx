import { useState } from 'react';
import { Check, ChevronRight, Home, Lock, Shirt, Sparkles } from 'lucide-react';
import { useStore, isEraUnlocked, placedIn } from '../../state/store';
import { ERAS, eraById } from '../../data/eras';
import { SHOP, SLOT_LABEL, itemById } from '../../data/shop';
import { fmtHours } from '../../lib/feedback';
import Room, { ItemThumb } from '../Room';
import { BananaCoin, Button, CoinPill, LargeTitle, Segmented, Sheet } from '../ui';
import { num, t } from '../../i18n';

export default function ShopView({ notify }) {
  const { state } = useStore();
  const [eraId, setEraId] = useState(state.activeEra);
  const [kind, setKind] = useState('decor');
  const [selected, setSelected] = useState(null);
  const era = eraById(eraId);
  const unlocked = isEraUnlocked(state, era);
  const items = SHOP.filter((i) => i.era === eraId && i.type === kind);
  const ownedCount = SHOP.filter((i) => state.owned.includes(i.id)).length;
  const nextLocked = ERAS.find((e) => !isEraUnlocked(state, e));
  const minutesTo = (e) => Math.max(0, e.hours * 60 - state.focusMinutes);

  return (
    <div className="pb-6">
      <LargeTitle title={t('Shop')} subtitle={t('{n} of {total} collected', { n: ownedCount, total: SHOP.length })} right={<CoinPill coins={state.coins} />} />

      {/* Era chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-2" role="tablist" aria-label={t('Eras')}>
        {ERAS.map((e) => {
          const on = e.id === eraId;
          const open = isEraUnlocked(state, e);
          return (
            <button key={e.id} role="tab" aria-selected={on} onClick={() => setEraId(e.id)}
              className={`pressable shrink-0 flex items-center gap-1.5 h-9 px-4 rounded-full t-subhead font-medium transition-colors ${on ? 'btn-tint' : 'card !rounded-full text-label'}`}>
              {!open && <Lock size={13} strokeWidth={2.4} className={on ? '' : 'text-label2'} />}
              {t(e.name)}
            </button>
          );
        })}
      </div>

      <div className="px-4 mt-2">
        <Segmented value={kind} onChange={setKind} options={[{ value: 'decor', label: t('Furniture & Decor') }, { value: 'outfit', label: t('Outfits') }]} />
      </div>

      {!unlocked && (
        <div className="mx-4 mt-4 card-tinted p-5">
          <div className="flex gap-3 items-center">
            <span className="grid place-items-center w-10 h-10 rounded-full bg-fill2 shrink-0"><Lock size={18} /></span>
            <div className="min-w-0">
              <p className="t-subhead font-semibold">{t('{era} is still in the future', { era: t(era.name) })}</p>
              <p className="t-footnote text-label2 mt-0.5">{t('Focus {time} more to travel here and reveal its collection.', { time: fmtHours(minutesTo(era)) })}</p>
            </div>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-fill2 overflow-hidden">
            <div className="h-full rounded-full bg-tint" style={{ width: `${Math.min(100, (state.focusMinutes / 60 / era.hours) * 100)}%` }} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3.5 px-4 mt-5">
        {items.map((item) =>
          unlocked
            ? <ItemCard key={item.id} item={item} onOpen={() => setSelected(item.id)} />
            : <TeaserCard key={item.id} item={item} onOpen={() => setSelected(item.id)} />)}
      </div>

      {kind === 'outfit' && unlocked && (
        <p className="t-footnote text-label2 px-8 mt-4 text-center">{t('Outfits travel with {pet}. Wear any of them in any era.', { pet: state.petName })}</p>
      )}

      {/* Coming up: a fogged peek at the next era */}
      {unlocked && nextLocked && (
        <section className="mt-7" aria-label={t('Coming up in {era}', { era: t(nextLocked.name) })}>
          <button onClick={() => setEraId(nextLocked.id)} className="w-full flex items-end justify-between px-4 text-left">
            <span>
              <span className="t-footnote font-semibold text-tint flex items-center gap-1"><Sparkles size={13} />{t('Coming up')}</span>
              <span className="t-title2 block">{t(nextLocked.name)}</span>
            </span>
            <span className="t-subhead text-label2 flex items-center tabular">{t('in {time}', { time: fmtHours(minutesTo(nextLocked)) })}<ChevronRight size={18} className="text-label3" /></span>
          </button>
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 mt-3 pb-1">
            {SHOP.filter((i) => i.era === nextLocked.id).slice(0, 8).map((item) => (
              <div key={item.id} className="w-[132px] shrink-0"><TeaserCard item={item} onOpen={() => setSelected(item.id)} compact /></div>
            ))}
          </div>
        </section>
      )}

      <ItemSheet id={selected} onClose={() => setSelected(null)} notify={notify} />
    </div>
  );
}

function ItemCard({ item, onOpen }) {
  const { state } = useStore();
  const era = eraById(item.era);
  const owned = state.owned.includes(item.id);
  const inUse = item.type === 'outfit' ? state.outfit === item.id : placedIn(state, item.era)[item.slot] === item.id;
  return (
    <button onClick={onOpen} className="pressable text-left card !rounded-[24px] overflow-hidden flex flex-col">
      <div className="relative aspect-square p-4 flex items-center justify-center" style={{ background: `linear-gradient(180deg, ${era.scene.wall[0]}, ${era.scene.wall[1]})` }}>
        <div className="w-full h-full"><ItemThumb item={item} /></div>
        <span className="absolute left-2 top-2 h-6 px-2 rounded-full bg-black/30 text-white backdrop-blur-md t-caption font-semibold flex items-center">{t(SLOT_LABEL[item.slot])}</span>
      </div>
      <div className="p-3 pt-2.5">
        <p className="t-subhead font-semibold leading-tight truncate">{t(item.name)}</p>
        <div className="mt-1 flex items-center gap-1 t-footnote">
          {owned ? (
            <span className="flex items-center gap-1 text-success font-semibold">
              <Check size={14} strokeWidth={3} />{inUse ? (item.type === 'outfit' ? t('Wearing') : t('In room')) : t('Owned')}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-label2 tabular"><BananaCoin size={14} />{num(item.price)}</span>
          )}
        </div>
      </div>
    </button>
  );
}

/** Locked future item: blurred art under drifting fog, a lock, and its category. */
function TeaserCard({ item, onOpen, compact = false }) {
  const era = eraById(item.era);
  return (
    <button onClick={onOpen} className="pressable w-full text-left card !rounded-[24px] overflow-hidden flex flex-col" aria-label={t('Locked {slot} from {era}', { slot: t(SLOT_LABEL[item.slot]), era: t(era.name) })}>
      <div className="relative aspect-square overflow-hidden" style={{ background: `linear-gradient(180deg, ${era.scene.wall[0]}, ${era.scene.wall[1]})` }}>
        <div className={`absolute inset-0 ${compact ? 'p-3' : 'p-4'} teaser-art`}><ItemThumb item={item} /></div>
        <div className="absolute inset-0 teaser-fog" />
        <span className={`absolute inset-0 m-auto grid place-items-center rounded-full bg-black/40 text-white backdrop-blur-md ${compact ? 'w-9 h-9' : 'w-11 h-11'}`}>
          <Lock size={compact ? 15 : 18} strokeWidth={2.4} />
        </span>
      </div>
      <div className={compact ? 'p-2.5' : 'p-3 pt-2.5'}>
        <p className={`${compact ? 't-footnote' : 't-subhead'} font-semibold leading-tight truncate text-label2`}>{t('Mystery {slot}', { slot: t(SLOT_LABEL[item.slot]).toLowerCase() })}</p>
        <p className="t-caption text-label3 mt-0.5 flex items-center gap-1 tabular"><BananaCoin size={12} />{num(item.price)}</p>
      </div>
    </button>
  );
}

function ItemSheet({ id, onClose, notify }) {
  const { state, dispatch } = useStore();
  const item = id ? itemById(id) : null;
  if (!item) return null;
  const era = eraById(item.era);
  const owned = state.owned.includes(item.id);
  const unlocked = isEraUnlocked(state, era);
  const affordable = state.coins >= item.price;
  const room = placedIn(state, item.era);
  const inUse = item.type === 'outfit' ? state.outfit === item.id : room[item.slot] === item.id;
  const replaces = item.type === 'decor' && room[item.slot] && room[item.slot] !== item.id ? itemById(room[item.slot]) : null;

  if (!unlocked) {
    const togo = Math.max(0, era.hours * 60 - state.focusMinutes);
    return (
      <Sheet open onClose={onClose} title={t('Locked')} detent="medium">
        <div className="px-4">
          <div className="relative rounded-[20px] overflow-hidden aspect-[6/5]">
            <div className="absolute inset-0 teaser-art"><Room era={era} placed={{ [item.slot]: item.id }} outfit={item.type === 'outfit' ? item.id : null} /></div>
            <div className="absolute inset-0 teaser-fog" />
            <span className="absolute inset-0 m-auto grid place-items-center w-14 h-14 rounded-full bg-black/40 text-white backdrop-blur-md"><Lock size={24} /></span>
          </div>
          <p className="t-footnote text-label2 font-medium mt-4">{t(era.name)} · {t(SLOT_LABEL[item.slot])}</p>
          <h3 className="t-title2 mt-0.5">{t('Something is waiting in {era}', { era: t(era.name) })}</h3>
          <p className="t-subhead text-label2 mt-1">{t('Focus {time} more to travel there and reveal it. It costs {n} Banana Coins.', { time: fmtHours(togo), n: num(item.price) })}</p>
          <div className="mt-4 h-1.5 rounded-full bg-fill2 overflow-hidden">
            <div className="h-full rounded-full bg-tint" style={{ width: `${Math.min(100, (state.focusMinutes / 60 / era.hours) * 100)}%` }} />
          </div>
          <Button className="w-full mt-6" variant="gray" onClick={onClose}>{t('Got It')}</Button>
        </div>
      </Sheet>
    );
  }

  const buy = () => {
    dispatch({ type: 'buy', id: item.id });
    notify({ text: t('{item} added', { item: t(item.name) }), icon: <Check size={16} strokeWidth={3} className="text-success" /> });
  };

  return (
    <Sheet open onClose={onClose} title={t(item.name)}>
      <div className="px-4">
        <div className="rounded-[20px] overflow-hidden aspect-[6/5]">
          <Room era={era} placed={room} outfit={state.outfit} preview={item.id} />
        </div>
        <div className="mt-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="t-footnote text-label2 font-medium">{t(era.name)} · {t(SLOT_LABEL[item.slot])}</p>
            <h3 className="t-title2 mt-0.5">{t(item.name)}</h3>
            <p className="t-subhead text-label2 mt-1">{t(item.desc)}</p>
          </div>
          {!owned && (
            <span className="shrink-0 flex items-center gap-1 h-8 px-3 rounded-full bg-bg2 t-subhead font-semibold tabular"><BananaCoin size={18} />{num(item.price)}</span>
          )}
        </div>
        {replaces && <p className="t-footnote text-label2 mt-3 flex items-center gap-1.5"><Home size={14} />{t('Replaces {item} in this spot. You keep both.', { item: t(replaces.name) })}</p>}

        <div className="mt-6">
          {!owned ? (
            <>
              <Button className="w-full" onClick={buy} disabled={!affordable}>{affordable ? t('Buy') : t('Need {n} more', { n: num(item.price - state.coins) })}</Button>
              {!affordable && <p className="t-footnote text-label2 text-center mt-2">{t('Longer focus sessions earn more coins per minute.')}</p>}
            </>
          ) : item.type === 'outfit' ? (
            <Button className="w-full" variant={inUse ? 'gray' : 'filled'} onClick={() => dispatch({ type: 'wear', id: item.id })}>
              <Shirt size={18} />{inUse ? t('Take Off') : t('Wear')}
            </Button>
          ) : (
            <Button className="w-full" variant={inUse ? 'gray' : 'filled'} onClick={() => dispatch({ type: inUse ? 'putAway' : 'place', id: item.id })}>
              {inUse ? t('Put Away') : t('Place in Room')}
            </Button>
          )}
        </div>
      </div>
    </Sheet>
  );
}
