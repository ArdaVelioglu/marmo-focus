import { Gear } from './scenes';
import { ITEM_ART_2 } from './items2';

// Where each slot sits in the 360×300 room. Item art is drawn in local coordinates:
// wall: 100×90 box · left/right: 100×110 box, standing on y=110 · rug: centered on (0,0) · small: 50×50 on y=50.
export const SLOT_POS = {
  wall: 'translate(34 46)',
  left: 'translate(12 128)',
  right: 'translate(248 128)',
  rug: 'translate(180 252)',
  small: 'translate(58 232)',
};

const shadow = (cx = 50, rx = 40) => <ellipse cx={cx} cy="110" rx={rx} ry="5" fill="#000" opacity=".22" />;
const rug = (outer, inner, trim) => (
  <g>
    <ellipse rx="84" ry="17" fill={outer} />
    <ellipse rx="70" ry="12" fill={inner} />
    <ellipse rx="54" ry="8" fill="none" stroke={trim} strokeWidth="2" strokeDasharray="5 4" />
  </g>
);
const flame = (x, y, s = 1, c1 = '#ff8a1f', c2 = '#ffd45c') => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g className="a-flicker">
      <path d="M0 0 C-10 -8 -8 -22 0 -34 C8 -22 10 -8 0 0Z" fill={c1} />
      <path d="M0 0 C-5 -5 -4 -14 0 -22 C4 -14 5 -5 0 0Z" fill={c2} />
    </g>
  </g>
);
const candle = (x, y, h = 22) => (
  <g key={x}>
    <rect x={x - 3} y={y - h} width="6" height={h} rx="1.5" fill="#f3e9d2" />
    {flame(x, y - h - 1, 0.32)}
  </g>
);

const ITEM_ART_1 = {
  // ───── Stone Age ─────
  'stone.rug': rug('#b58a5e', '#cfa77a', '#8a6440'),
  'stone.wall': (
    <g>
      <rect x="0" y="6" width="100" height="74" rx="18" fill="#000" opacity=".12" />
      <g fill="#a8402a" opacity=".85">
        <path d="M16 56 Q18 30 40 28 Q62 26 66 46 L66 60 L60 60 L60 50 L48 50 L46 60 L40 60 L38 50 L26 52 L24 62 L18 62Z" />
        <path d="M66 40 Q76 40 78 54 Q74 50 70 52" fill="none" stroke="#a8402a" strokeWidth="2.5" />
        <circle cx="30" cy="36" r="2" fill="#2d1a12" />
      </g>
      <g stroke="#a8402a" strokeWidth="2" strokeLinecap="round" opacity=".85">
        <path d="M80 24 L80 40 M80 28 L74 34 M80 28 L86 34 M80 40 L76 48 M80 40 L84 48" />
        <path d="M86 60 L96 56" />
      </g>
      <g fill="#e2b06a" opacity=".7"><circle cx="86" cy="16" r="4" /></g>
    </g>
  ),
  'stone.left': (
    <g>
      {shadow(52, 44)}
      {[[18, 104], [32, 108], [50, 110], [68, 108], [84, 104]].map(([x, y]) => <ellipse key={x} cx={x} cy={y} rx="11" ry="7" fill="#6d6259" />)}
      <path d="M28 102 L76 88 M30 90 L74 102" stroke="#5a3a22" strokeWidth="6" strokeLinecap="round" />
      {flame(52, 100, 1.4)}
      <g fill="#ffd45c" opacity=".8">
        <circle cx="44" cy="44" r="1.5" className="a-steam" /><circle cx="58" cy="40" r="1.2" className="a-steam" style={{ animationDelay: '.8s' }} />
      </g>
    </g>
  ),
  'stone.right': (
    <g>
      {shadow(50, 30)}
      <ellipse cx="50" cy="100" rx="28" ry="12" fill="#6a5f55" />
      <ellipse cx="50" cy="80" rx="21" ry="11" fill="#7d7267" />
      <ellipse cx="50" cy="62" rx="15" ry="9" fill="#8f8478" />
      <ellipse cx="50" cy="47" rx="10" ry="7" fill="#a3988b" />
      <path d="M36 98 Q50 92 64 98" stroke="#4e453d" strokeWidth="1.5" fill="none" />
      <path d="M50 40 C44 30 46 22 54 20" stroke="#4f9a3a" strokeWidth="2" fill="none" />
    </g>
  ),

  // ───── Egypt ─────
  'egypt.rug': rug('#2a5ab8', '#e8c77e', '#d4a017'),
  'egypt.wall': (
    <g>
      <rect x="12" y="4" width="76" height="82" rx="4" fill="#1e4fa3" />
      <rect x="16" y="8" width="68" height="74" rx="2" fill="none" stroke="#d4a017" strokeWidth="2" />
      <path d="M24 42 Q50 20 76 42 Q50 60 24 42Z" fill="#f6e7c3" />
      <circle cx="50" cy="42" r="9" fill="#14110d" />
      <circle cx="52" cy="40" r="2.5" fill="#fff" />
      <path d="M24 42 Q50 20 76 42" fill="none" stroke="#14110d" strokeWidth="3" />
      <path d="M44 52 L40 70 Q36 76 30 72 M54 52 L60 64 L66 60" stroke="#14110d" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M22 30 Q50 14 78 28" stroke="#14110d" strokeWidth="3" fill="none" />
    </g>
  ),
  'egypt.left': (
    <g>
      {shadow(50, 26)}
      <path d="M36 50 Q24 70 32 96 Q36 108 50 108 Q64 108 68 96 Q76 70 64 50Z" fill="#d4a017" />
      <rect x="38" y="38" width="24" height="14" rx="3" fill="#b8860b" />
      <path d="M34 40 Q20 46 28 60 M66 40 Q80 46 72 60" stroke="#b8860b" strokeWidth="4" fill="none" />
      <path d="M32 72 Q50 78 68 72" stroke="#1e4fa3" strokeWidth="4" fill="none" />
      <path d="M34 84 Q50 90 66 84" stroke="#c0392b" strokeWidth="2" fill="none" />
      <path d="M40 58 Q44 92 46 100" stroke="#fff" strokeWidth="2.5" opacity=".35" fill="none" />
    </g>
  ),
  'egypt.right': (
    <g>
      {shadow(50, 28)}
      <rect x="30" y="96" width="40" height="14" fill="#a9895b" />
      <path d="M38 96 L42 20 L50 8 L58 20 L62 96Z" fill="#c9a66b" />
      <path d="M50 8 L58 20 L62 96 L50 96Z" fill="#a9895b" />
      <path d="M50 8 L42 20 L58 20Z" fill="#d4a017" />
      <g fill="#7a5a2a" opacity=".8">
        <circle cx="48" cy="34" r="2.5" /><rect x="45" y="44" width="6" height="2" /><path d="M45 56 L48 50 L51 56Z" /><rect x="47" y="64" width="2" height="10" /><circle cx="48" cy="82" r="2" />
      </g>
    </g>
  ),

  // ───── Medieval ─────
  'medieval.rug': rug('#7a1d28', '#a8323e', '#e3b553'),
  'medieval.wall': (
    <g>
      <rect x="20" y="0" width="60" height="4" rx="2" fill="#5c3b22" />
      <circle cx="18" cy="2" r="4" fill="#d4a017" /><circle cx="82" cy="2" r="4" fill="#d4a017" />
      <g className="a-sway">
        <path d="M26 4 L74 4 L74 76 L50 90 L26 76Z" fill="#8e1f2c" />
        <path d="M26 4 L74 4 L74 76 L50 90 L26 76Z" fill="none" stroke="#e3b553" strokeWidth="2" />
        <path d="M50 24 L62 32 L62 48 Q62 60 50 66 Q38 60 38 48 L38 32Z" fill="#e3b553" />
        <path d="M50 32 L50 58 M42 42 L58 42" stroke="#8e1f2c" strokeWidth="3" />
      </g>
    </g>
  ),
  'medieval.left': (
    <g>
      {shadow(50, 46)}
      <rect x="6" y="20" width="88" height="90" rx="3" fill="#6e737c" />
      <g stroke="#4c5058" strokeWidth="1.2" fill="none">
        {[38, 56, 74, 92].map((y) => <path key={y} d={`M6 ${y} L94 ${y}`} />)}
      </g>
      <rect x="0" y="14" width="100" height="10" rx="2" fill="#5c6068" />
      <path d="M22 110 L22 60 Q50 38 78 60 L78 110Z" fill="#1a1412" />
      <path d="M30 104 L70 98 M30 98 L70 104" stroke="#5a3a22" strokeWidth="6" strokeLinecap="round" />
      {flame(42, 100, 1)}{flame(58, 101, 1.25)}
      <path d="M22 110 L22 60 Q50 38 78 60 L78 110" fill="#ff8a1f" opacity=".12" className="a-glow" />
      {candle(14, 14, 14)}{candle(86, 14, 14)}
    </g>
  ),
  'medieval.right': (
    <g>
      {shadow(50, 22)}
      <path d="M40 110 L50 92 L60 110Z" fill="#8a6a25" />
      <rect x="48" y="42" width="4" height="52" fill="#b8860b" />
      <path d="M24 50 Q24 62 50 62 Q76 62 76 50" stroke="#b8860b" strokeWidth="4" fill="none" />
      {[24, 50, 76].map((x) => <rect key={x} x={x - 6} y="44" width="12" height="5" rx="1" fill="#d4a017" />)}
      {candle(24, 44, 18)}{candle(50, 44, 26)}{candle(76, 44, 18)}
    </g>
  ),

  // ───── Pirate ─────
  'pirate.rug': rug('#d8ccb0', '#ebe2cc', '#8b5a2b'),
  'pirate.wall': (
    <g transform="rotate(-4 50 45)">
      <path d="M6 8 L94 4 L92 82 L8 86Z" fill="#e6d3a3" />
      <path d="M6 8 L94 4 L92 82 L8 86Z" fill="none" stroke="#9a7444" strokeWidth="1.5" />
      <path d="M20 30 Q30 20 42 28 Q50 36 44 46 Q34 52 26 46 Q16 40 20 30Z M58 50 Q70 44 80 52 Q84 64 72 68 Q60 66 58 50Z" fill="#c4ac76" />
      <path d="M30 40 Q46 60 60 52 Q68 46 72 58" stroke="#9a3b2b" strokeWidth="2" strokeDasharray="3 3" fill="none" />
      <path d="M66 54 L78 66 M78 54 L66 66" stroke="#c0392b" strokeWidth="3.5" strokeLinecap="round" />
      <g transform="translate(82 20)"><circle r="8" fill="none" stroke="#6b4a2a" strokeWidth="1" /><path d="M0 -10 L2 0 L0 10 L-2 0Z" fill="#6b4a2a" /></g>
    </g>
  ),
  'pirate.left': (
    <g>
      {shadow(50, 44)}
      <rect x="10" y="62" width="80" height="48" rx="3" fill="#7a4a24" />
      <path d="M10 62 Q10 34 50 34 Q90 34 90 62Z" fill="#8f5a2d" />
      <g fill="#ffd34d">
        <ellipse cx="50" cy="58" rx="34" ry="8" />
        {[[30, 52], [42, 49], [56, 48], [68, 52], [48, 44]].map(([x, y]) => <circle key={x + y} cx={x} cy={y} r="6" stroke="#c99a12" strokeWidth="1" />)}
      </g>
      <path d="M10 62 Q10 34 50 34 Q90 34 90 62" fill="none" stroke="#c8a24a" strokeWidth="4" />
      {[22, 78].map((x) => <rect key={x} x={x - 3} y="62" width="6" height="48" fill="#c8a24a" />)}
      <rect x="42" y="66" width="16" height="14" rx="2" fill="#c8a24a" />
      <circle cx="50" cy="73" r="2.5" fill="#3a2414" />
      <circle cx="66" cy="46" r="2" fill="#fff" className="a-twinkle" />
    </g>
  ),
  'pirate.right': (
    <g>
      {shadow(50, 26)}
      <path d="M36 110 L50 86 L64 110Z" fill="#5e3b22" />
      <rect x="47" y="72" width="6" height="16" fill="#c8a24a" />
      <circle cx="50" cy="46" r="28" fill="#2e6f8f" />
      <path d="M30 34 Q40 28 46 36 Q42 48 32 46Z M54 50 Q66 44 72 54 Q66 66 56 62Z M48 24 Q56 20 62 26 Q56 30 50 30Z" fill="#c9b27a" />
      <path d="M22 46 Q50 60 78 46" stroke="#fff" strokeWidth="1" fill="none" opacity=".5" />
      <path d="M20 40 A30 30 0 0 1 64 18" stroke="#c8a24a" strokeWidth="3.5" fill="none" />
      <path d="M50 16 L50 76" stroke="#c8a24a" strokeWidth="2.5" transform="rotate(20 50 46)" />
    </g>
  ),

  // ───── Steampunk ─────
  'steampunk.rug': (
    <g>
      <ellipse rx="82" ry="16" fill="#9a5f2c" />
      <ellipse rx="70" ry="12" fill="#b8763a" />
      {[-60, -30, 0, 30, 60].map((x) => <circle key={x} cx={x} cy={x % 60 ? 6 : -4} r="2" fill="#e6c17a" />)}
    </g>
  ),
  'steampunk.wall': (
    <g>
      <g transform="translate(50 44)">
        <g className="a-spin" style={{ animationDuration: '14s' }}><Gear r={42} teeth={18} fill="#8c6430" /></g>
        <circle r="32" fill="#f0e2c2" stroke="#c9943f" strokeWidth="3" />
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x="-1" y="-29" width="2" height="5" fill="#3a2414" transform={`rotate(${i * 30})`} />)}
        <g className="a-spin" style={{ animationDuration: '60s' }}><rect x="-1.5" y="-24" width="3" height="24" rx="1.5" fill="#3a2414" /></g>
        <g className="a-spin" style={{ animationDuration: '6s' }}><rect x="-.75" y="-28" width="1.5" height="28" fill="#a8323e" /></g>
        <circle r="3" fill="#c9943f" />
      </g>
    </g>
  ),
  'steampunk.left': (
    <g>
      {shadow(50, 40)}
      <rect x="18" y="34" width="64" height="76" rx="30" fill="#9a6a2c" />
      <rect x="18" y="34" width="64" height="76" rx="30" fill="none" stroke="#d6a74a" strokeWidth="2" />
      {[48, 66, 84, 100].map((y) => <path key={y} d={`M20 ${y} L80 ${y}`} stroke="#6b4a1f" strokeWidth="2" />)}
      <circle cx="50" cy="72" r="13" fill="#f0e2c2" stroke="#d6a74a" strokeWidth="3" />
      <path d="M50 72 L58 66" stroke="#a8323e" strokeWidth="2" strokeLinecap="round" />
      <rect x="44" y="18" width="12" height="18" fill="#7d5523" />
      <g fill="#fff">
        <circle cx="50" cy="12" r="7" className="a-steam" opacity=".7" />
        <circle cx="54" cy="10" r="6" className="a-steam" style={{ animationDelay: '.7s' }} />
        <circle cx="47" cy="8" r="5" className="a-steam" style={{ animationDelay: '1.4s' }} />
      </g>
    </g>
  ),
  'steampunk.right': (
    <g>
      {shadow(50, 24)}
      <path d="M34 110 L40 92 L60 92 L66 110Z" fill="#5c3b22" />
      <rect x="44" y="40" width="12" height="54" fill="#b07f39" />
      {[48, 58, 68, 78, 88].map((y) => <ellipse key={y} cx="50" cy={y} rx="11" ry="3" fill="#d6a74a" />)}
      <circle cx="50" cy="30" r="12" fill="#c9943f" />
      <circle cx="46" cy="26" r="3" fill="#fff" opacity=".6" />
      <g stroke="#a7e8ff" strokeWidth="1.8" fill="none" strokeLinecap="round" className="a-glow">
        <path d="M38 24 L28 18 L32 12 L22 6" /><path d="M62 24 L72 16 L68 10 L78 4" /><path d="M50 18 L52 8 L48 2" />
      </g>
    </g>
  ),

  // ───── Modern ─────
  'modern.rug': rug('#cfc8bd', '#e3ddd3', '#a89f92'),
  'modern.wall': (
    <g>
      <rect x="14" y="4" width="72" height="84" fill="#fafafa" stroke="#2f3a45" strokeWidth="3" />
      <circle cx="40" cy="36" r="16" fill="#ff9f0a" opacity=".9" />
      <rect x="44" y="44" width="30" height="34" fill="#2f6fde" opacity=".85" />
      <path d="M22 76 Q40 58 58 70" stroke="#2f3a45" strokeWidth="3" fill="none" />
    </g>
  ),
  'modern.left': (
    <g>
      {shadow(50, 30)}
      <path d="M32 82 L68 82 L64 110 L36 110Z" fill="#f2efe9" />
      <path d="M32 82 L68 82" stroke="#cfc8bd" strokeWidth="2" />
      <g fill="#2e7d4f">
        <path d="M50 82 C20 70 14 40 30 24 C40 40 50 56 50 82Z" />
        <path d="M50 82 C80 72 90 44 74 26 C62 42 52 58 50 82Z" fill="#3a9a62" />
        <path d="M50 82 C44 50 52 20 60 6 C70 30 62 60 50 82Z" fill="#257045" />
      </g>
      <g stroke="#f2efe9" strokeWidth="2" opacity=".55" fill="none">
        <path d="M30 34 L40 40 M26 46 L38 50 M74 36 L64 42 M78 48 L66 52 M58 24 L54 32" />
      </g>
    </g>
  ),
  'modern.right': (
    <g>
      {shadow(30, 22)}
      <ellipse cx="30" cy="108" rx="18" ry="4" fill="#2f3a45" />
      <path d="M30 108 L30 60 Q34 6 82 14" stroke="#2f3a45" strokeWidth="3.5" fill="none" />
      <path d="M68 14 Q82 4 96 14 L90 22 L74 22Z" fill="#2f3a45" />
      <path d="M74 22 L90 22 L120 110 L44 110Z" fill="#fff1d0" opacity=".16" className="a-glow" />
      <ellipse cx="82" cy="22" rx="8" ry="2.5" fill="#fff6dc" className="a-glow" />
    </g>
  ),

  // ───── Cyber ─────
  'cyber.rug': (
    <g className="a-glow">
      <ellipse rx="84" ry="17" fill="#22e1ff" opacity=".18" />
      <ellipse rx="70" ry="12" fill="none" stroke="#22e1ff" strokeWidth="2" />
      <ellipse rx="50" ry="7" fill="none" stroke="#ff3df2" strokeWidth="1.5" />
    </g>
  ),
  'cyber.wall': (
    <g>
      <path d="M8 84 L92 84" stroke="#22e1ff" strokeWidth="2" opacity=".6" />
      <path d="M30 84 L18 96 M70 84 L82 96" stroke="#22e1ff" strokeWidth="1" opacity=".4" />
      <g className="a-glow">
        <rect x="4" y="4" width="92" height="66" rx="6" fill="#22e1ff" opacity=".14" />
        <rect x="4" y="4" width="92" height="66" rx="6" fill="none" stroke="#22e1ff" strokeWidth="1.5" />
        {[18, 30, 22, 40, 34, 50].map((h, i) => <rect key={i} x={14 + i * 12} y={60 - h} width="7" height={h} rx="1.5" fill={i === 5 ? '#ff3df2' : '#22e1ff'} opacity=".8" />)}
        <path d="M12 20 L36 20 M12 26 L28 26" stroke="#fff" strokeWidth="1.5" opacity=".7" />
      </g>
    </g>
  ),
  'cyber.left': (
    <g>
      {shadow(50, 30)}
      <rect x="22" y="16" width="56" height="94" rx="4" fill="#15132e" stroke="#3b3680" strokeWidth="1.5" />
      {[24, 42, 60, 78].map((y, r) => (
        <g key={y}>
          <rect x="28" y={y} width="44" height="12" rx="2" fill="#1f1c44" />
          {[0, 1, 2, 3].map((c) => (
            <circle key={c} cx={34 + c * 6} cy={y + 6} r="1.6" fill={(r + c) % 3 ? '#22e1ff' : '#ff3df2'} className="a-twinkle" style={{ animationDelay: `${(r * 4 + c) * 0.23}s`, animationDuration: '1.2s' }} />
          ))}
          <rect x="58" y={y + 4} width="10" height="4" rx="1" fill="#3b3680" />
        </g>
      ))}
    </g>
  ),
  'cyber.right': (
    <g>
      <ellipse cx="50" cy="110" rx="22" ry="4" fill="#ff3df2" opacity=".4" className="a-glow" />
      <g className="a-bob" style={{ animationDuration: '3s' }}>
        <path d="M36 74 L64 74 L60 92 L40 92Z" fill="#15132e" stroke="#ff3df2" strokeWidth="1.5" />
        <path d="M50 74 Q46 56 54 44" stroke="#9a7bff" strokeWidth="3" fill="none" />
        <g className="a-glow">
          <circle cx="40" cy="46" r="13" fill="#22e1ff" opacity=".7" />
          <circle cx="60" cy="38" r="15" fill="#ff3df2" opacity=".6" />
          <circle cx="52" cy="54" r="10" fill="#7f5bff" opacity=".7" />
        </g>
      </g>
    </g>
  ),

  // ───── Post-apocalyptic ─────
  'apoc.rug': (
    <g>
      <ellipse rx="84" ry="17" fill="#8a5a3c" />
      <path d="M-70 -6 L-20 -12 L-20 10 L-66 6Z" fill="#6a7a4a" />
      <path d="M-20 -12 L30 -12 L30 12 L-20 10Z" fill="#a34a32" />
      <path d="M30 -12 L72 -6 L68 8 L30 12Z" fill="#c9a24a" />
      <path d="M-70 -6 L-20 -12 L30 -12 L72 -6 M-66 6 L-20 10 L30 12 L68 8 M-20 -12 L-20 10 M30 -12 L30 12" stroke="#3a2a1c" strokeWidth="1.2" strokeDasharray="3 2" fill="none" />
    </g>
  ),
  'apoc.wall': (
    <g className="a-sway">
      {[[16, 80], [38, 96], [60, 70], [82, 90]].map(([x, len], i) => (
        <g key={x}>
          <path d={`M${x} -40 Q${x + (i % 2 ? 8 : -8)} ${len / 2} ${x} ${len}`} stroke="#4f7a2e" strokeWidth="2.5" fill="none" />
          {Array.from({ length: 5 }, (_, j) => (
            <path key={j} d="M0 0 C6 -4 12 -2 14 4 C8 6 2 5 0 0Z" fill={j % 2 ? '#7aa846' : '#5a8a36'} transform={`translate(${x} ${(len / 5) * j + 6}) rotate(${j % 2 ? 30 : 150})`} />
          ))}
          <circle cx={x} cy={len} r="3" fill={i % 2 ? '#f0c64a' : '#e86f8a'} />
        </g>
      ))}
    </g>
  ),
  'apoc.left': (
    <g>
      {shadow(50, 34)}
      <rect x="22" y="46" width="56" height="64" rx="6" fill="#6b4d33" />
      {[58, 78, 98].map((y) => <path key={y} d={`M22 ${y} L78 ${y}`} stroke="#4d3624" strokeWidth="3" />)}
      <rect x="34" y="70" width="32" height="20" rx="3" fill="#1a1412" />
      {flame(44, 90, 0.7)}{flame(56, 90, 0.85)}
      <rect x="44" y="10" width="10" height="38" fill="#5a5a48" />
      <path d="M44 10 L60 10" stroke="#5a5a48" strokeWidth="6" />
      <g fill="#cfcfc0"><circle cx="52" cy="4" r="5" className="a-steam" /><circle cx="56" cy="2" r="4" className="a-steam" style={{ animationDelay: '1s' }} /></g>
      <path d="M22 50 Q14 70 20 96" stroke="#5a8a36" strokeWidth="2" fill="none" />
    </g>
  ),
  'apoc.right': (
    <g>
      {shadow(50, 44)}
      <rect x="8" y="36" width="84" height="5" fill="#7a6a52" />
      <rect x="8" y="72" width="84" height="5" fill="#7a6a52" />
      <rect x="10" y="36" width="4" height="74" fill="#5a4c3a" /><rect x="86" y="36" width="4" height="74" fill="#5a4c3a" />
      <rect x="22" y="16" width="38" height="20" rx="3" fill="#8a5a3c" />
      <circle cx="32" cy="26" r="6" fill="#3a2a1c" /><circle cx="32" cy="26" r="3" fill="#5a4c3a" />
      <rect x="42" y="20" width="14" height="4" rx="1" fill="#f0c64a" className="a-glow" />
      <path d="M54 16 L64 2" stroke="#3a2a1c" strokeWidth="1.5" />
      <g fill="#f0c64a" fontSize="8" fontFamily="system-ui"><text x="66" y="12" className="a-z">♪</text></g>
      <rect x="66" y="22" width="16" height="14" rx="2" fill="#5a8a36" />
      <path d="M74 22 C70 14 78 10 80 6" stroke="#7aa846" strokeWidth="2" fill="none" />
      <rect x="18" y="56" width="10" height="16" rx="2" fill="#a34a32" />
      <rect x="30" y="60" width="10" height="12" rx="2" fill="#c9a24a" />
      <rect x="52" y="52" width="28" height="20" rx="2" fill="#4a5a6a" />
      <rect x="55" y="55" width="22" height="14" rx="1" fill="#7ab0a0" opacity=".6" />
      <rect x="20" y="92" width="22" height="18" rx="2" fill="#6b6b4e" />
      <rect x="60" y="96" width="20" height="14" rx="7" fill="#7a6a52" />
    </g>
  ),
};

export const ITEM_ART = { ...ITEM_ART_1, ...ITEM_ART_2 };
