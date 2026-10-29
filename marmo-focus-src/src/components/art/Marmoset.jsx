// The marmoset, drawn in SVG (viewBox 0 0 120 130).
// Common marmoset traits: white ear tufts, white forehead blaze, banded tail — drawn with baby proportions
// (big head, small body), a light honey face and big shiny eyes.
// mood: 'idle' | 'sleep' (during focus) | 'wake' (stretch + yawn) | 'happy' (hops, confetti) | 'grumpy' (woken by leaving the app)
// outfit: shop item id, or null. Outfit art is drawn for the base 1× layout; the head and body groups
// scale it along with the marmoset.

const FUR = '#ad9078';
const FUR_DARK = '#7d6352';
const FACE = '#f5dec4';
const BELLY = '#f2e2cd';
const TUFT = '#fffbf4';
const INNER_EAR = '#f9cdc8';
const INK = '#2b1d16';
const MOUTH = '#8a5446';
const NOSE = '#e08c88';
const BLUSH = '#ff9fa0';
const TAIL = ['#dccdb9', '#7d6352'];

const HEAD_SCALE = 1.18, HEAD_DROP = 6, BODY_SCALE = 0.82;
const HEAD_T = `translate(60 ${52 + HEAD_DROP}) scale(${HEAD_SCALE}) translate(-60 -52)`;
const BODY_T = `translate(60 126) scale(${BODY_SCALE}) translate(-60 -126)`;
const EY = 57.5, LX = 50, RX = 70;          // eye centers (head space)
const TAIL_D = 'M76 118 C104 122 116 98 106 80 C98 66 102 52 112 52 C120 52 121 62 114 64 C108 66 107 58 112 58';

const sparkle = (x, y) => `M${x} ${y - 6} L${x + 1.6} ${y - 1.6} L${x + 6} ${y} L${x + 1.6} ${y + 1.6} L${x} ${y + 6} L${x - 1.6} ${y + 1.6} L${x - 6} ${y} L${x - 1.6} ${y - 1.6}Z`;

export default function Marmoset({ mood = 'idle', outfit = null, className = '', ...svgProps }) {
  const sleeping = mood === 'sleep';
  const waking = mood === 'wake';
  const happy = mood === 'happy';
  const grumpy = mood === 'grumpy';
  const armsUp = waking || happy;
  const fit = FIT[outfit] ?? FIT[outfit?.replace('.outfit', '')] ?? {};
  return (
    <svg viewBox="0 0 120 130" className={className} aria-hidden="true" overflow="visible" {...svgProps}>
      <ellipse cx="60" cy="126" rx="32" ry="4" fill="#000" opacity=".2" />

      {/* tail — banded, curled at the tip */}
      <g className="a-tail">
        <path d={TAIL_D} fill="none" stroke={TAIL[0]} strokeWidth="9" strokeLinecap="round" />
        <path d={TAIL_D} fill="none" stroke={TAIL[1]} strokeWidth="9" strokeLinecap="butt" strokeDasharray="5 6" />
      </g>

      <g className={happy ? 'a-hop' : sleeping ? 'a-doze' : waking ? 'a-stretch' : ''}>
        <g className="a-breathe" style={sleeping ? { animationDuration: '5s' } : undefined}>
          {/* capes and anything hanging behind the whole marmoset */}
          <g transform={fit.back === 'head' ? HEAD_T : BODY_T}><OutfitLayer outfit={outfit} layer="back" /></g>

          {/* body */}
          <g transform={BODY_T}>
            <ellipse cx="60" cy="100" rx="25" ry="25" fill={FUR} />
            <path d="M42 92 Q60 86 78 92 M40 102 Q60 96 80 102 M42 112 Q60 106 78 112" stroke={FUR_DARK} strokeWidth="2" fill="none" opacity=".3" strokeLinecap="round" />
            <ellipse cx="60" cy="106" rx="14" ry="15" fill={BELLY} opacity=".85" />
            {/* feet & hands */}
            <ellipse cx="45" cy="123" rx="8" ry="4.5" fill={FUR_DARK} />
            <ellipse cx="75" cy="123" rx="8" ry="4.5" fill={FUR_DARK} />
            {armsUp ? (
              <>
                <ellipse cx="32" cy="78" rx="5.5" ry="9" fill={FUR_DARK} transform="rotate(-38 32 78)" />
                <ellipse cx="88" cy="78" rx="5.5" ry="9" fill={FUR_DARK} transform="rotate(38 88 78)" />
              </>
            ) : (
              <>
                <ellipse cx="48" cy="104" rx="5" ry="7" fill={FUR_DARK} transform="rotate(-18 48 104)" />
                <ellipse cx="72" cy="104" rx="5" ry="7" fill={FUR_DARK} transform="rotate(18 72 104)" />
              </>
            )}
            <g transform={fit.body}><OutfitLayer outfit={outfit} layer="body" /></g>
          </g>

          {/* head */}
          <g transform={HEAD_T}>
            {/* fluffy ear tufts */}
            <g fill={TUFT}>
              <circle cx="31" cy="44" r="11" /><circle cx="22" cy="50" r="9" /><circle cx="25" cy="59" r="7.5" />
              <circle cx="89" cy="44" r="11" /><circle cx="98" cy="50" r="9" /><circle cx="95" cy="59" r="7.5" />
            </g>
            <g fill={INNER_EAR}><circle cx="34" cy="50" r="5" /><circle cx="86" cy="50" r="5" /></g>

            <circle cx="60" cy="52" r="27" fill={FUR} />
            <ellipse cx="60" cy="58" rx="19.5" ry="18.5" fill={FACE} />
            <ellipse cx="60" cy="33.5" rx="6.5" ry="4" fill={TUFT} />

            {/* eyes */}
            {sleeping ? (
              <g stroke={INK} strokeWidth="2.3" fill="none" strokeLinecap="round">
                <path d={`M${LX - 5} ${EY} Q${LX} ${EY + 4.5} ${LX + 5} ${EY}`} />
                <path d={`M${RX - 5} ${EY} Q${RX} ${EY + 4.5} ${RX + 5} ${EY}`} />
              </g>
            ) : happy ? (
              <g stroke={INK} strokeWidth="2.6" fill="none" strokeLinecap="round">
                <path d={`M${LX - 5} ${EY + 2} Q${LX} ${EY - 5} ${LX + 5} ${EY + 2}`} />
                <path d={`M${RX - 5} ${EY + 2} Q${RX} ${EY - 5} ${RX + 5} ${EY + 2}`} />
              </g>
            ) : waking ? (
              <g fill={INK}>
                <ellipse cx={LX} cy={EY} rx="6" ry="2.4" />
                <ellipse cx={RX} cy={EY} rx="6" ry="2.4" />
              </g>
            ) : (
              <g className={grumpy ? '' : 'a-blink'}>
                {[LX, RX].map((x) => (
                  <g key={x}>
                    <circle cx={x} cy={EY} r={grumpy ? 6.4 : 7.4} fill={INK} />
                    <circle cx={x + 2.4} cy={EY - 2.8} r={grumpy ? 2 : 2.7} fill="#fff" />
                    <circle cx={x - 2.8} cy={EY + 2.7} r="1.2" fill="#fff" opacity=".85" />
                  </g>
                ))}
                {grumpy && (
                  <g>
                    {/* lids pulled down + frowning brows */}
                    <path d={`M${LX - 8} ${EY - 8} L${LX + 7} ${EY - 4} L${LX + 7} ${EY - 10} L${LX - 8} ${EY - 10}Z`} fill={FACE} />
                    <path d={`M${RX + 8} ${EY - 8} L${RX - 7} ${EY - 4} L${RX - 7} ${EY - 10} L${RX + 8} ${EY - 10}Z`} fill={FACE} />
                    <path d={`M${LX - 7} ${EY - 8.5} L${LX + 6} ${EY - 5}`} stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
                    <path d={`M${RX + 7} ${EY - 8.5} L${RX - 6} ${EY - 5}`} stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
                  </g>
                )}
              </g>
            )}

            {/* nose, mouth, cheeks */}
            <ellipse cx="60" cy="65" rx="2.4" ry="1.7" fill={NOSE} />
            {happy ? (
              <path d="M54.5 69 Q60 77 65.5 69Z" fill="#b5524c" stroke={MOUTH} strokeWidth="1.2" strokeLinejoin="round" />
            ) : waking ? (
              <ellipse cx="60" cy="71.5" rx="3" ry="4" fill="#b5524c" stroke={MOUTH} strokeWidth="1.2" />
            ) : sleeping ? (
              <path d="M57 71 Q60 72 63 71" stroke={MOUTH} strokeWidth="1.5" fill="none" strokeLinecap="round" />
            ) : grumpy ? (
              <path d="M56 72 Q60 69 64 72" stroke={MOUTH} strokeWidth="1.6" fill="none" strokeLinecap="round" />
            ) : (
              <path d="M56 68.5 Q58 71 60 68.5 Q62 71 64 68.5" stroke={MOUTH} strokeWidth="1.5" fill="none" strokeLinecap="round" />
            )}
            <ellipse cx={LX - 5} cy={EY + 8} rx="4.5" ry="2.8" fill={BLUSH} opacity={happy ? 0.9 : 0.7} />
            <ellipse cx={RX + 5} cy={EY + 8} rx="4.5" ry="2.8" fill={BLUSH} opacity={happy ? 0.9 : 0.7} />

            <g transform={fit.head}><OutfitLayer outfit={outfit} layer="head" /></g>
          </g>
        </g>
      </g>

      {sleeping && (
        <g fill="currentColor" fontFamily="ui-rounded, system-ui" fontWeight="700" className="text-white">
          <text x="90" y="22" fontSize="13" className="a-z">Z</text>
          <text x="100" y="10" fontSize="10" className="a-z" style={{ animationDelay: '.8s' }}>z</text>
          <text x="108" y="0" fontSize="8" className="a-z" style={{ animationDelay: '1.6s' }}>z</text>
        </g>
      )}
      {happy && (
        <g aria-hidden="true">
          {CONFETTI.map(([x, y, c, dx, d], i) => (
            <rect key={i} x={x} y={y} width="4" height="7" rx="1.2" fill={c} className="a-confetti" style={{ '--dx': `${dx}px`, animationDelay: `${d}s` }} />
          ))}
          {[[12, 30], [108, 24], [20, 4], [100, 0]].map(([x, y], i) => (
            <path key={i} d={sparkle(x, y)} fill="#ffd34d" className="a-twinkle" style={{ animationDuration: '1.2s', animationDelay: `${i * 0.3}s` }} />
          ))}
        </g>
      )}
    </svg>
  );
}

/** Per-outfit nudges for the 1.6 proportions: SVG transforms applied to a layer, or back: 'head'. */
const FIT = {
  'cyber.outfit2': { back: 'head' },   // the helmet bubble surrounds the head
};

// x, y, color, sideways drift, delay
const CONFETTI = [
  [20, -6, '#ff8a65', -10, 0], [40, -14, '#ffd34d', 6, 0.3], [62, -10, '#7cc7d8', -4, 0.6], [84, -16, '#b38cf0', 8, 0.15],
  [100, -4, '#8bd17c', 10, 0.45], [10, 10, '#f48fb1', -8, 0.9], [110, 12, '#ffd34d', 6, 1.05], [52, -20, '#ff8a65', 2, 1.2],
];

function OutfitLayer({ outfit, layer }) {
  // Outfits are keyed by shop item id; 1.0 saves used era ids, so fall back to those.
  const art = (OUTFITS[outfit] ?? OUTFITS[outfit?.replace('.outfit', '')])?.[layer];
  return art ? <g>{art}</g> : null;
}

const leaf = (x, y, r, c = '#4f9a3a') => (
  <path key={`${x}-${y}`} d="M0 0 C6 -4 12 -2 14 4 C8 6 2 5 0 0Z" fill={c} transform={`translate(${x} ${y}) rotate(${r})`} />
);

const OUTFITS = {
  stone: {
    body: (
      <g>
        <path d="M36 108 Q60 118 84 108 L82 116 Q60 124 38 116Z" fill="#3e7a2e" />
        {[[36, 110, 80], [44, 113, 95], [52, 115, 100], [60, 116, 90], [68, 115, 80], [76, 113, 70]].map(([x, y, r], i) =>
          leaf(x, y, r, i % 2 ? '#5aa843' : '#3f8a30'))}
        <path d="M58 76 L62 76 L66 96 L54 96Z" fill="#9c7c55" opacity=".9" />
      </g>
    ),
    head: <g>{leaf(56, 25, -70, '#5aa843')}{leaf(60, 26, -110, '#3f8a30')}</g>,
  },
  egypt: {
    back: <path d="M30 50 L22 96 L44 92 L42 60Z M90 50 L98 96 L76 92 L78 60Z" fill="#1e4fa3" />,
    body: (
      <g>
        <path d="M38 82 Q60 96 82 82 L84 90 Q60 106 36 90Z" fill="#d4a017" />
        <path d="M40 86 Q60 99 80 86" stroke="#1e4fa3" strokeWidth="2.5" fill="none" />
        <circle cx="60" cy="97" r="3" fill="#c0392b" stroke="#d4a017" strokeWidth="1.2" />
      </g>
    ),
    head: (
      <g>
        <path d="M32 46 Q34 18 60 18 Q86 18 88 46 L84 46 Q80 32 60 32 Q40 32 36 46Z" fill="#d4a017" />
        <g stroke="#1e4fa3" strokeWidth="2.6">
          <path d="M40 26 L37 44 M48 21 L46 33 M60 19 L60 32 M72 21 L74 33 M80 26 L83 44" />
        </g>
        <path d="M36 46 L30 88 L40 86 L42 58Z M84 46 L90 88 L80 86 L78 58Z" fill="#d4a017" />
        <path d="M33 60 L41 60 M32 70 L41 70 M31 80 L40 79 M79 60 L87 60 M79 70 L88 70 M80 79 L89 80" stroke="#1e4fa3" strokeWidth="3" />
        <path d="M56 22 Q60 14 64 22 L62 28 L58 28Z" fill="#d4a017" stroke="#9a7110" strokeWidth=".8" />
      </g>
    ),
  },
  medieval: {
    back: <path d="M36 84 Q60 78 84 84 L92 124 L28 124Z" fill="#8e1f2c" />,
    body: (
      <g>
        <path d="M44 82 L76 82 L74 118 L46 118Z" fill="#c9ccd2" />
        <path d="M60 86 L60 114 M50 98 L70 98" stroke="#8e1f2c" strokeWidth="4" />
        <circle cx="60" cy="80" r="3" fill="#d4a017" />
      </g>
    ),
    head: (
      <g>
        <path d="M33 46 Q33 20 60 20 Q87 20 87 46 L80 44 Q76 30 60 30 Q44 30 40 44Z" fill="#b8bcc4" />
        <path d="M33 46 Q33 20 60 20 Q87 20 87 46" fill="none" stroke="#8a8f98" strokeWidth="1.5" />
        <path d="M60 20 L60 44" stroke="#8a8f98" strokeWidth="2" />
        <path d="M58 20 C54 6 66 0 74 4 C68 8 66 12 64 20Z" fill="#c0392b" />
        <circle cx="38" cy="44" r="2" fill="#6e737c" /><circle cx="82" cy="44" r="2" fill="#6e737c" />
      </g>
    ),
  },
  pirate: {
    body: (
      <g>
        <path d="M36 92 Q60 82 84 92 L84 120 L36 120Z" fill="#7a1f1f" />
        <path d="M60 84 L50 120 M60 84 L70 120" stroke="#f3e3c0" strokeWidth="3" />
        <path d="M38 106 L82 106" stroke="#2b1d12" strokeWidth="5" />
        <rect x="56" y="103" width="8" height="6" rx="1" fill="#d4a017" />
      </g>
    ),
    head: (
      <g>
        <path d="M22 38 Q40 16 60 22 Q80 16 98 38 Q80 30 60 34 Q40 30 22 38Z" fill="#1b1b1f" />
        <path d="M36 32 Q48 6 60 8 Q72 6 84 32 Q60 26 36 32Z" fill="#1b1b1f" />
        <path d="M22 38 Q40 30 60 34 Q80 30 98 38" fill="none" stroke="#d4a017" strokeWidth="2" />
        <circle cx="60" cy="22" r="4" fill="#f3efe6" />
        <path d="M55 28 L65 32 M65 28 L55 32" stroke="#f3efe6" strokeWidth="1.6" />
        <path d="M78 22 C88 4 104 4 108 10 C98 10 90 16 82 26Z" fill="#e7e2d6" />
      </g>
    ),
  },
  steampunk: {
    body: (
      <g>
        <path d="M42 84 L78 84 L76 118 L44 118Z" fill="#5c3b22" />
        <path d="M60 84 L60 118" stroke="#3a2414" strokeWidth="1.5" />
        {[92, 100, 108].map((y) => <circle key={y} cx="64" cy={y} r="1.8" fill="#d6a74a" />)}
        <path d="M66 96 Q74 100 70 106" stroke="#d6a74a" strokeWidth="1.2" fill="none" />
        <circle cx="70" cy="107" r="2.4" fill="#d6a74a" />
      </g>
    ),
    head: (
      <g>
        <rect x="40" y="2" width="40" height="22" rx="2" fill="#3b2a1f" />
        <rect x="30" y="22" width="60" height="6" rx="3" fill="#3b2a1f" />
        <rect x="40" y="16" width="40" height="5" fill="#8c5a2b" />
        <circle cx="50" cy="38" r="8" fill="#d6a74a" /><circle cx="70" cy="38" r="8" fill="#d6a74a" />
        <circle cx="50" cy="38" r="5.5" fill="#7fc4c9" opacity=".85" /><circle cx="70" cy="38" r="5.5" fill="#7fc4c9" opacity=".85" />
        <circle cx="48" cy="36" r="1.6" fill="#fff" opacity=".8" /><circle cx="68" cy="36" r="1.6" fill="#fff" opacity=".8" />
        <path d="M33 38 L42 38 M58 38 L62 38 M78 38 L87 38" stroke="#5c3b22" strokeWidth="3" />
        <g className="a-spin"><circle cx="74" cy="12" r="4" fill="none" stroke="#d6a74a" strokeWidth="2" strokeDasharray="2 1.5" /></g>
      </g>
    ),
  },
  modern: {
    body: (
      <g>
        <path d="M34 92 Q60 78 86 92 L86 122 L34 122Z" fill="#5b6b7d" />
        <path d="M44 84 Q60 96 76 84" fill="none" stroke="#47566a" strokeWidth="5" strokeLinecap="round" />
        <path d="M54 92 L54 104 M66 92 L66 104" stroke="#e6e9ee" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M48 112 L72 112" stroke="#47566a" strokeWidth="1.5" />
      </g>
    ),
    head: (
      <g>
        <path d="M30 50 Q30 18 60 18 Q90 18 90 50" fill="none" stroke="#1f2328" strokeWidth="5" strokeLinecap="round" />
        <rect x="22" y="42" width="14" height="20" rx="6" fill="#1f2328" />
        <rect x="84" y="42" width="14" height="20" rx="6" fill="#1f2328" />
        <rect x="25" y="46" width="8" height="12" rx="4" fill="#ff9f0a" />
        <rect x="87" y="46" width="8" height="12" rx="4" fill="#ff9f0a" />
      </g>
    ),
  },
  cyber: {
    body: (
      <g>
        <path d="M38 86 Q60 80 82 86 L82 120 L38 120Z" fill="#1d1b38" />
        <path d="M42 90 L78 90" stroke="#22e1ff" strokeWidth="2" className="a-glow" />
        <path d="M60 92 L60 118" stroke="#ff3df2" strokeWidth="1.5" className="a-glow" />
      </g>
    ),
    head: (
      <g>
        <rect x="34" y="50" width="52" height="15" rx="7.5" fill="#0b0a1f" opacity=".9" />
        <rect x="36" y="52" width="48" height="11" rx="5.5" fill="#22e1ff" opacity=".85" className="a-glow" />
        <path d="M41 57 L52 57 M58 57 L60 57" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity=".8" />
        <path d="M86 57 L92 46 L96 46" stroke="#ff3df2" strokeWidth="1.6" fill="none" />
        <circle cx="97" cy="46" r="2" fill="#ff3df2" className="a-glow" />
      </g>
    ),
  },
  apoc: {
    body: (
      <g>
        <path d="M36 80 Q60 94 84 80 L86 90 Q60 104 34 90Z" fill="#7a3b2e" />
        <path d="M70 90 L78 112 L70 110 L66 96Z" fill="#7a3b2e" />
        <path d="M40 84 L44 88 M50 88 L52 92 M62 90 L62 94 M74 87 L72 91" stroke="#5a2a20" strokeWidth="1.5" />
        <rect x="44" y="104" width="9" height="7" rx="1.5" fill="#6b6b4e" stroke="#4a4a35" strokeWidth="1" />
      </g>
    ),
    head: (
      <g>
        <path d="M34 34 Q60 24 86 34" stroke="#3a3a2c" strokeWidth="5" fill="none" />
        <circle cx="48" cy="30" r="7" fill="#6b6b4e" stroke="#3a3a2c" strokeWidth="2" />
        <circle cx="72" cy="30" r="7" fill="#6b6b4e" stroke="#3a3a2c" strokeWidth="2" />
        <circle cx="48" cy="30" r="4.5" fill="#d18b3c" opacity=".7" />
        <circle cx="72" cy="30" r="4.5" fill="#d18b3c" opacity=".7" />
        <path d="M78 46 C84 40 90 42 92 48" stroke="#7aa846" strokeWidth="2" fill="none" />
        {leaf(88, 44, -40, '#7aa846')}
      </g>
    ),
  },
};

Object.assign(OUTFITS, {
  'stone.outfit2': {
    body: (
      <g>
        <path d="M40 82 Q60 96 80 82" stroke="#6b4a2a" strokeWidth="1.6" fill="none" />
        {[[44, 86, -30], [52, 90, -12], [60, 91, 0], [68, 90, 12], [76, 86, 30]].map(([x, y, r]) => (
          <path key={x} d="M-2 0 L2 0 L0 8Z" fill="#f3ead6" stroke="#cbbfa5" strokeWidth=".6" transform={`translate(${x} ${y}) rotate(${r})`} />
        ))}
      </g>
    ),
    head: (
      <g>
        <path d="M33 40 Q34 16 60 16 Q86 16 87 40 Q76 34 60 34 Q44 34 33 40Z" fill="#9c6b3c" />
        <path d="M33 40 Q44 34 60 34 Q76 34 87 40 L86 44 Q74 38 60 38 Q46 38 34 44Z" fill="#c99a63" />
        {[[46, 24], [62, 21], [74, 28], [52, 30]].map(([x, y]) => <ellipse key={x} cx={x} cy={y} rx="3" ry="2" fill="#6b4524" />)}
      </g>
    ),
  },
  'egypt.outfit2': {
    body: (
      <g>
        <path d="M60 84 L60 96" stroke="#d4a017" strokeWidth="1.5" />
        <circle cx="60" cy="98" r="3" fill="none" stroke="#d4a017" strokeWidth="2" />
        <path d="M60 101 L60 110 M55 104 L65 104" stroke="#d4a017" strokeWidth="2.4" strokeLinecap="round" />
      </g>
    ),
    head: (
      <g>
        <path d="M34 38 Q60 26 86 38 L86 43 Q60 31 34 43Z" fill="#d4a017" />
        <circle cx="60" cy="34" r="3.5" fill="#1e7a6a" stroke="#d4a017" strokeWidth="1.2" />
        <path d="M60 30 C54 26 54 16 60 12 C66 16 66 22 62 24 C64 20 62 16 60 16 C58 18 60 24 64 28Z" fill="#d4a017" />
        <circle cx="59" cy="14" r=".9" fill="#1b1512" />
      </g>
    ),
  },
  'medieval.outfit2': {
    back: <path d="M34 84 Q60 76 86 84 L94 124 L26 124Z" fill="#2b3a8a" />,
    body: <path d="M46 82 L60 118 L74 82" stroke="#c9ccd2" strokeWidth="2" fill="none" />,
    head: (
      <g>
        <ellipse cx="60" cy="34" rx="34" ry="7" fill="#22307a" />
        <path d="M38 34 L82 34 L70 0 Q68 -8 80 -12 Q62 -10 60 2Z" fill="#2b3a8a" />
        <path d="M40 32 Q60 38 80 32" stroke="#c9ccd2" strokeWidth="2" fill="none" />
        {[[56, 18, 3], [68, 12, 2.2], [64, 26, 1.8]].map(([x, y, r]) => (
          <path key={x} d={`M${x} ${y - r} L${x + r * 0.3} ${y - r * 0.3} L${x + r} ${y} L${x + r * 0.3} ${y + r * 0.3} L${x} ${y + r} L${x - r * 0.3} ${y + r * 0.3} L${x - r} ${y} L${x - r * 0.3} ${y - r * 0.3}Z`} fill="#f0e6a8" className="a-twinkle" />
        ))}
      </g>
    ),
  },
  'pirate.outfit2': {
    body: (
      <g>
        <path d="M38 86 Q60 80 82 86 L82 120 L38 120Z" fill="#f3efe6" />
        {[92, 101, 110].map((y) => <path key={y} d={`M38 ${y} L82 ${y}`} stroke="#1e3a6a" strokeWidth="4" />)}
      </g>
    ),
    head: (
      <g>
        <path d="M32 42 Q32 20 60 20 Q88 20 88 42 Q74 36 60 36 Q46 36 32 42Z" fill="#c0392b" />
        {[[44, 28], [58, 25], [72, 29], [50, 34], [66, 33]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="1.5" fill="#f3efe6" />)}
        <path d="M86 38 Q96 40 98 48 Q92 46 88 44 M86 40 Q94 46 92 56 Q88 50 86 46" fill="#c0392b" />
        <path d="M37 46 L85 63" stroke="#1b1b1f" strokeWidth="1.6" />
        <ellipse cx="70" cy="57.5" rx="9.2" ry="8.4" fill="#1b1b1f" />
      </g>
    ),
  },
  'steampunk.outfit2': {
    body: (
      <g>
        <path d="M60 84 L50 79 L50 89Z M60 84 L70 79 L70 89Z" fill="#6b1f2a" />
        <circle cx="60" cy="84" r="2.4" fill="#4a1520" />
      </g>
    ),
    head: (
      <g>
        <ellipse cx="60" cy="32" rx="30" ry="5" fill="#2a1d15" />
        <path d="M40 32 Q40 8 60 8 Q80 8 80 32Z" fill="#3b2a1f" />
        <path d="M40 28 Q60 32 80 28" stroke="#8c5a2b" strokeWidth="3" fill="none" />
        <circle cx="50" cy="57.5" r="10.2" fill="#bfe3e6" opacity=".35" stroke="#d6a74a" strokeWidth="2.2" />
        <path d="M41 62 Q34 76 40 90" stroke="#d6a74a" strokeWidth="1" fill="none" strokeDasharray="2 1.5" />
      </g>
    ),
  },
  'modern.outfit2': {
    body: (
      <g>
        <path d="M36 92 Q60 80 84 92 L84 122 L36 122Z" fill="#e8e3da" />
        <path d="M48 86 Q60 92 72 86" stroke="#d4cec3" strokeWidth="3" fill="none" />
        <circle cx="70" cy="102" r="4" fill="#ff9f0a" />
      </g>
    ),
    head: (
      <g>
        <path d="M32 40 Q30 12 60 12 Q90 12 88 40Z" fill="#e0a526" />
        <rect x="31" y="34" width="58" height="9" rx="4.5" fill="#c98f1a" />
        {[40, 48, 56, 64, 72, 80].map((x) => <path key={x} d={`M${x} 16 L${x} 34`} stroke="#c98f1a" strokeWidth="1.5" opacity=".7" />)}
        <circle cx="60" cy="10" r="6" fill="#f3efe6" />
        <circle cx="50" cy="57.5" r="9.8" fill="none" stroke="#1f2328" strokeWidth="2.2" />
        <circle cx="70" cy="57.5" r="9.8" fill="none" stroke="#1f2328" strokeWidth="2.2" />
      </g>
    ),
  },
  'cyber.outfit2': {
    back: <circle cx="60" cy="52" r="42" fill="#bfe8ff" opacity=".12" />,
    body: (
      <g>
        <path d="M36 88 Q60 80 84 88 L84 122 L36 122Z" fill="#eef0f7" />
        <rect x="42" y="84" width="36" height="6" rx="3" fill="#9aa3b8" />
        <rect x="64" y="98" width="10" height="7" rx="1.5" fill="#22e1ff" className="a-glow" />
        <rect x="46" y="98" width="10" height="7" rx="1.5" fill="#ff3df2" />
      </g>
    ),
    head: (
      <g>
        <circle cx="60" cy="52" r="42" fill="none" stroke="#dff4ff" strokeWidth="2.5" opacity=".9" />
        <path d="M32 30 Q40 18 54 14" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" opacity=".7" />
        <circle cx="86" cy="40" r="3" fill="#fff" opacity=".6" />
      </g>
    ),
  },
  'apoc.outfit2': {
    body: (
      <g>
        {[[30, 84, 30, '#5a8a36'], [44, 80, 60, '#7aa846'], [60, 78, 90, '#4f7a2e'], [76, 80, 120, '#7aa846'], [90, 84, 150, '#5a8a36'], [38, 96, 70, '#4f7a2e'], [82, 96, 110, '#4f7a2e']].map(([x, y, r, c]) => (
          <path key={x + y} d="M0 0 C10 -7 22 -3 26 8 C14 11 4 9 0 0Z" fill={c} transform={`translate(${x} ${y}) rotate(${r})`} />
        ))}
      </g>
    ),
    head: <path d="M0 0 C10 -7 22 -3 26 8 C14 11 4 9 0 0Z" fill="#7aa846" transform="translate(48 30) rotate(-30)" />,
  },
});
