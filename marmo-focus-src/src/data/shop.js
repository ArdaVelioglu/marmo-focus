import { ERAS } from './eras';

// Shop catalog: 11 items per era, 88 in total.
// Decor slots: wall (upper left wall) · left / right (floor) · rug (center) · small (front prop).
// Each slot has variants; one item per slot stands in the room at a time. Two outfits per era.
const BASE = { small: 50, rug: 60, wall: 120, right: 150, left: 180, outfit: 250 };

const RAW = {
  stone: [
    ['rug', 'Fur Pelt Rug', 'Soft, warm, slightly smells of mammoth.'],
    ['wall', 'Cave Painting', 'The first recorded productivity chart.'],
    ['left', 'Fire Pit', 'Crackling warmth for long focus sessions.'],
    ['right', 'Stone Totem', 'Balanced rocks. Balanced mind.'],
    ['outfit', 'Leaf Wrap', 'Hand-woven from the finest jungle leaves.'],
  ],
  egypt: [
    ['rug', 'Woven Reed Mat', 'Papyrus-grade comfort.'],
    ['wall', 'Eye of Horus', 'Watches over your deep work.'],
    ['left', 'Golden Urn', 'Filled with nothing but good intentions.'],
    ['right', 'Obelisk', 'A monument to finished tasks.'],
    ['outfit', 'Pharaoh Nemes', 'Blue-and-gold royal headdress.'],
  ],
  medieval: [
    ['rug', 'Tapestry Rug', 'Embroidered by very patient monks.'],
    ['wall', 'Royal Banner', 'House Marmoset. Words: "Just one more session."'],
    ['left', 'Stone Hearth', 'A fireplace that never runs out of logs.'],
    ['right', 'Candelabra', 'Three candles, zero distractions.'],
    ['outfit', 'Knight’s Helm', 'Polished steel with a red plume.'],
  ],
  pirate: [
    ['rug', 'Sailcloth Rug', 'Salvaged from a very fast ship.'],
    ['wall', 'Treasure Map', 'X marks the end of your task list.'],
    ['left', 'Treasure Chest', 'Overflowing with banana coins.'],
    ['right', 'Navigator’s Globe', 'Brass compass rose included.'],
    ['outfit', 'Captain’s Tricorn', 'With a skull, crossbones, and feather.'],
  ],
  steampunk: [
    ['rug', 'Copper Plate', 'Riveted. Warm from the boiler.'],
    ['wall', 'Gear Clock', 'Every tick turns a gear.'],
    ['left', 'Steam Boiler', 'Puffs steam when you are on a roll.'],
    ['right', 'Tesla Coil', 'Crackles with focused energy.'],
    ['outfit', 'Goggles & Top Hat', 'Brass goggles, mandatory for inventors.'],
  ],
  modern: [
    ['rug', 'Wool Rug', 'Neutral tones. Very calming.'],
    ['wall', 'Abstract Print', 'It means whatever you need it to.'],
    ['left', 'Monstera', 'Grows a new leaf every deadline.'],
    ['right', 'Smart Arc Lamp', 'Warm white, adapts to your focus.'],
    ['outfit', 'Hoodie & Headphones', 'Noise cancelling. Distraction cancelling.'],
  ],
  cyber: [
    ['rug', 'Light Pad', 'Anti-gravity floor glow.'],
    ['wall', 'Holo Screen', 'Shows your stats in three dimensions.'],
    ['left', 'Server Rack', 'Running 10,000 banana simulations.'],
    ['right', 'Neon Bonsai', 'Bio-luminescent. Needs no water.'],
    ['outfit', 'Neon Visor', 'HUD displays nothing but focus.'],
  ],
  apoc: [
    ['rug', 'Patchwork Rug', 'Stitched from the old world’s flags.'],
    ['wall', 'Hanging Vines', 'Nature always finds a way.'],
    ['left', 'Barrel Stove', 'Cozy fire in a salvaged drum.'],
    ['right', 'Salvage Shelf', 'An old radio that still plays lo-fi.'],
    ['outfit', 'Scavenger Gear', 'Scarf, goggles, and survival grit.'],
  ],
};

// Second wave: [key, slot, name, description]. Variants cost 25% more than the originals.
const MORE = {
  stone: [
    ['wall2', 'wall', 'Hand Prints', 'Signed by the whole tribe.'],
    ['left2', 'left', 'Hay Nest', 'The coziest bed of the Pleistocene.'],
    ['right2', 'right', 'Tusk Arch', 'Two mammoth tusks, one grand entrance.'],
    ['rug2', 'rug', 'Pebble Circle', 'Smooth river stones, arranged with care.'],
    ['small', 'small', 'Flint Tools', 'A hand axe for chopping tasks into pieces.'],
    ['outfit2', 'outfit', 'Fur Cap & Bone Necklace', 'Warm ears, fierce look.'],
  ],
  egypt: [
    ['wall2', 'wall', 'Papyrus Scroll', 'A to-do list written in hieroglyphs.'],
    ['left2', 'left', 'Lotus Pool', 'A calm basin of blue lotus flowers.'],
    ['right2', 'right', 'Cat Statue', 'Bastet approves of your focus.'],
    ['rug2', 'rug', 'Sun Disk Rug', 'Ra’s warmth under your feet.'],
    ['small', 'small', 'Scarab Box', 'Holds your most precious coins.'],
    ['outfit2', 'outfit', 'Cobra Crown', 'A golden circlet with a royal uraeus.'],
  ],
  medieval: [
    ['wall2', 'wall', 'Shield & Swords', 'Defends against distractions.'],
    ['left2', 'left', 'Oak Bookcase', 'Illuminated manuscripts, carefully shelved.'],
    ['right2', 'right', 'Minstrel’s Lute', 'Plays a gentle tune between sessions.'],
    ['rug2', 'rug', 'Chessboard Rug', 'Think three moves ahead.'],
    ['small', 'small', 'Potion Bottles', 'Elixirs of focus. Mostly juice.'],
    ['outfit2', 'outfit', 'Wizard Hat', 'Midnight blue with silver stars.'],
  ],
  pirate: [
    ['wall2', 'wall', 'Ship’s Wheel', 'Steer your day with confidence.'],
    ['left2', 'left', 'Barrel Stack', 'Full of banana juice. Allegedly.'],
    ['right2', 'right', 'Parrot Perch', 'A loyal parrot who repeats “focus”.'],
    ['rug2', 'rug', 'Rope Coil Mat', 'Hand-coiled by the deckhands.'],
    ['small', 'small', 'Spyglass', 'Spot your goals from far away.'],
    ['outfit2', 'outfit', 'Bandana & Eyepatch', 'For the deckhand on the rise.'],
  ],
  steampunk: [
    ['wall2', 'wall', 'Pressure Gauges', 'Measures focus in kilopascals.'],
    ['left2', 'left', 'Gramophone', 'Spins brass-band lo-fi on wax.'],
    ['right2', 'right', 'Clockwork Birdcage', 'Its tin bird chirps on the hour.'],
    ['rug2', 'rug', 'Cog Rug', 'Interlocking gears, woven in wool.'],
    ['small', 'small', 'Oil Can', 'Keeps every gear running smooth.'],
    ['outfit2', 'outfit', 'Monocle & Bowler', 'A gentleman inventor’s finest.'],
  ],
  modern: [
    ['wall2', 'wall', 'Floating Shelf', 'Books, a candle, and a tiny plant.'],
    ['left2', 'left', 'Lounge Chair', 'Mid-century curves, modern comfort.'],
    ['right2', 'right', 'Cactus Trio', 'Low maintenance, high personality.'],
    ['rug2', 'rug', 'Jute Rug', 'Natural fibers, round and soft.'],
    ['small', 'small', 'Coffee Mug', 'Oat latte, still warm.'],
    ['outfit2', 'outfit', 'Beanie & Glasses', 'The café regular look.'],
  ],
  cyber: [
    ['wall2', 'wall', 'Neon Sign', 'Glows FOCUS in hot pink.'],
    ['left2', 'left', 'Cryo Pod', 'For very long breaks.'],
    ['right2', 'right', 'Drone Buddy', 'Hovers nearby and beeps encouragement.'],
    ['rug2', 'rug', 'Hex Grid Pad', 'Magnetic floor tiles that hum.'],
    ['small', 'small', 'Glow Cube', 'A data crystal storing your stats.'],
    ['outfit2', 'outfit', 'Space Helmet', 'Bubble glass, stellar view.'],
  ],
  apoc: [
    ['wall2', 'wall', 'Rusty Road Sign', 'Points to “NO DISTRACTIONS, 0 km”.'],
    ['left2', 'left', 'Tire Garden', 'Old tires, new tomatoes.'],
    ['right2', 'right', 'Overgrown TV', 'Now broadcasting ferns.'],
    ['rug2', 'rug', 'Moss Rug', 'It grew there on its own.'],
    ['small', 'small', 'Canned Rations', 'Banana flavor, best before never.'],
    ['outfit2', 'outfit', 'Leaf Poncho', 'Stitched from giant leaves.'],
  ],
};

export const SHOP = ERAS.flatMap((era) => {
  const price = (slot, variant) => Math.round((BASE[slot] * (1 + era.index * 0.6) * (variant ? 1.25 : 1)) / 10) * 10;
  const base = RAW[era.id].map(([slot, name, desc]) => ({ id: `${era.id}.${slot}`, slot, name, desc, price: price(slot, false) }));
  const more = MORE[era.id].map(([key, slot, name, desc]) => ({ id: `${era.id}.${key}`, slot, name, desc, price: price(slot, key !== 'small') }));
  return [...base, ...more].map((it) => ({ ...it, era: era.id, type: it.slot === 'outfit' ? 'outfit' : 'decor' }));
});

const BY_ID = new Map(SHOP.map((i) => [i.id, i]));
export const itemById = (id) => BY_ID.get(id);
export const DECOR_SLOTS = ['rug', 'wall', 'left', 'right', 'small'];
export const SLOT_LABEL = { wall: 'Wall', left: 'Floor, left', right: 'Floor, right', rug: 'Rug', small: 'Small prop', outfit: 'Outfit' };
