import { SceneBase, SceneOverlay } from './art/scenes';
import { ITEM_ART, SLOT_POS } from './art/items';
import Marmoset from './art/Marmoset';
import { itemById } from '../data/shop';
import Atmosphere from './art/Atmosphere';
import { t } from '../i18n';

const BEHIND = ['rug', 'wall', 'left', 'right'];   // drawn before the marmoset
const FRONT = ['small'];                            // drawn in front of him

/**
 * The marmoset's living space for one era.
 * `placed` maps slot → item id. `preview` shows an item in place (shop) before it is bought.
 * `atmosphere` = { phase, weather } adds time-of-day light and rain/snow (omit for plain thumbnails).
 */
export default function Room({ era, placed = {}, outfit, mood = 'idle', preview = null, atmosphere = null, className = '' }) {
  const p = preview ? itemById(preview) : null;
  const slots = { ...placed };
  if (p?.type === 'decor' && p.era === era.id) slots[p.slot] = p.id;
  const wearing = p?.type === 'outfit' ? p.id : outfit;

  const draw = (slot) => {
    const id = slots[slot];
    if (!id || !ITEM_ART[id]) return null;
    return (
      <g key={slot} transform={SLOT_POS[slot]}>
        <g className={id === preview ? 'a-pop' : ''} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>{ITEM_ART[id]}</g>
      </g>
    );
  };

  return (
    <svg key={era.id} viewBox="0 0 360 300" className={`room-art a-scene block w-full h-full ${className}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label={t('{era} room', { era: t(era.name) })}>
      <SceneBase era={era} phase={atmosphere?.phase} />
      {BEHIND.map(draw)}
      <Marmoset mood={mood} outfit={wearing} x="104" y="84" width="152" height="165" />
      {FRONT.map(draw)}
      {atmosphere && <Atmosphere phase={atmosphere.phase} weather={atmosphere.weather} />}
      <SceneOverlay />
    </svg>
  );
}

const THUMB_BOX = { rug: '-90 -24 180 48', wall: '-6 -8 112 104', small: '-4 -4 58 58' };

/** Small standalone picture of one shop item. */
export function ItemThumb({ item }) {
  if (item.type === 'outfit') {
    return (
      <svg viewBox="0 -14 120 144" className="w-full h-full" aria-hidden="true">
        <Marmoset outfit={item.id} x="10" y="6" width="100" height="112" />
      </svg>
    );
  }
  return (
    <svg viewBox={THUMB_BOX[item.slot] ?? '-6 -6 112 122'} className="w-full h-full" aria-hidden="true">
      {ITEM_ART[item.id]}
    </svg>
  );
}
