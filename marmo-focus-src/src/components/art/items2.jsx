// Second-wave decor art. Same local coordinates as items.jsx:
// wall 100×90 · left/right 100×110 standing on y=110 · rug centered on (0,0) · small 50×50 standing on y=50.
import { Gear } from './scenes';

const shadow = (cx = 50, rx = 40, y = 110) => <ellipse cx={cx} cy={y} rx={rx} ry="5" fill="#000" opacity=".22" />;
const leaf = (x, y, r, c, s = 1) => <path key={`${x}${y}${r}`} d="M0 0 C6 -4 12 -2 14 4 C8 6 2 5 0 0Z" fill={c} transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} />;

export const ITEM_ART_2 = {
  // ───── Stone Age ─────
  'stone.wall2': (
    <g opacity=".85">
      {[[22, 30, -12, '#c8662e'], [52, 20, 6, '#e2b06a'], [78, 40, 18, '#a8402a'], [38, 60, -4, '#e2b06a']].map(([x, y, r, c]) => (
        <g key={x} transform={`translate(${x} ${y}) rotate(${r})`} fill={c}>
          <ellipse cx="0" cy="6" rx="8" ry="9" />
          {[-7, -3.5, 0, 3.5].map((dx, i) => <rect key={i} x={dx - 1.6} y={-14 + Math.abs(i - 1.5) * 2} width="3.2" height="12" rx="1.6" />)}
          <rect x="7" y="-2" width="3.2" height="9" rx="1.6" transform="rotate(35 8 2)" />
        </g>
      ))}
    </g>
  ),
  'stone.left2': (
    <g>
      {shadow(50, 46)}
      <ellipse cx="50" cy="96" rx="46" ry="16" fill="#b08a3e" />
      <ellipse cx="50" cy="90" rx="38" ry="12" fill="#d4ad5a" />
      <ellipse cx="50" cy="90" rx="26" ry="7" fill="#8a6a2e" />
      <g stroke="#e8c97a" strokeWidth="1.5" strokeLinecap="round">
        {[[10, 92, 24, 84], [80, 84, 92, 94], [20, 102, 36, 96], [66, 100, 84, 104], [40, 80, 46, 76], [56, 78, 62, 82]].map(([a, b, c, d]) => <path key={a + b} d={`M${a} ${b} L${c} ${d}`} />)}
      </g>
      <ellipse cx="60" cy="88" rx="10" ry="4" fill="#9c8a74" />
    </g>
  ),
  'stone.right2': (
    <g>
      {shadow(50, 44)}
      <ellipse cx="20" cy="104" rx="12" ry="6" fill="#6d6259" />
      <ellipse cx="80" cy="104" rx="12" ry="6" fill="#6d6259" />
      <path d="M18 104 C10 60 30 18 56 14 C46 30 34 60 28 104Z" fill="#efe6d2" />
      <path d="M82 104 C90 60 70 18 44 14 C54 30 66 60 72 104Z" fill="#e2d6bd" />
      <path d="M22 86 L30 84 M22 66 L32 66 M76 86 L68 84 M78 66 L68 66" stroke="#b8a888" strokeWidth="1.5" />
    </g>
  ),
  'stone.rug2': (
    <g>
      <ellipse rx="80" ry="15" fill="#5a4232" opacity=".5" />
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return <ellipse key={i} cx={(Math.cos(a) * 72).toFixed(1)} cy={(Math.sin(a) * 13).toFixed(1)} rx="9" ry="4.5" fill={i % 2 ? '#9a8f84' : '#b5aa9c'} />;
      })}
    </g>
  ),
  'stone.small': (
    <g>
      {shadow(25, 22, 50)}
      <path d="M8 48 L14 38 L24 40 L22 48Z" fill="#4a4a52" />
      <path d="M30 48 L34 36 L44 42 L42 48Z" fill="#5c5c66" />
      <rect x="20" y="10" width="4" height="34" rx="2" fill="#7a5a3a" transform="rotate(-20 22 27)" />
      <path d="M12 8 L26 4 L28 16 L16 18Z" fill="#6a6a74" transform="rotate(-20 20 11)" />
      <path d="M17 13 L24 11" stroke="#c9a46a" strokeWidth="2" transform="rotate(-20 20 11)" />
    </g>
  ),

  // ───── Egypt ─────
  'egypt.wall2': (
    <g>
      <rect x="16" y="6" width="68" height="78" fill="#f1dfae" />
      <rect x="10" y="2" width="80" height="8" rx="4" fill="#c9a46a" />
      <rect x="10" y="80" width="80" height="8" rx="4" fill="#c9a46a" />
      <g fill="#6b4a2a" opacity=".8">
        {[18, 34, 50, 66].map((y, r) => [24, 38, 52, 66].map((x, c) => {
          const k = (r + c) % 3;
          return k === 0 ? <circle key={`${x}${y}`} cx={x + 4} cy={y + 4} r="3.5" />
            : k === 1 ? <path key={`${x}${y}`} d={`M${x} ${y + 8} L${x + 4} ${y} L${x + 8} ${y + 8}Z`} />
            : <rect key={`${x}${y}`} x={x + 2} y={y} width="3" height="9" rx="1.5" />;
        }))}
      </g>
    </g>
  ),
  'egypt.left2': (
    <g>
      {shadow(50, 46)}
      <ellipse cx="50" cy="94" rx="46" ry="15" fill="#c9a66b" />
      <ellipse cx="50" cy="92" rx="38" ry="10" fill="#3f8fc2" />
      <path d="M22 92 Q36 88 50 92 T78 92" stroke="#a7d7f0" strokeWidth="1.5" fill="none" className="a-sway" />
      {[[34, 90], [60, 93]].map(([x, y]) => (
        <g key={x} transform={`translate(${x} ${y})`}>
          <ellipse rx="9" ry="3" fill="#2e7d4f" />
          <path d="M0 0 L-5 -10 L0 -6 L5 -10Z M0 -6 L-2 -14 L0 -10 L2 -14Z" fill="#e88bb0" />
        </g>
      ))}
      <path d="M78 88 Q84 60 80 40" stroke="#4f9a3a" strokeWidth="2" fill="none" />
      <path d="M80 40 C70 36 72 26 80 28 C88 26 90 36 80 40Z" fill="#4f9a3a" />
    </g>
  ),
  'egypt.right2': (
    <g>
      {shadow(50, 28)}
      <rect x="28" y="96" width="44" height="14" rx="2" fill="#a9895b" />
      <path d="M38 96 Q32 70 40 52 Q44 42 42 30 L46 34 L50 24 L54 34 L58 30 Q56 42 60 52 Q68 70 62 96Z" fill="#1d1a17" />
      <path d="M44 34 L48 28 M56 34 L52 28" stroke="#d4a017" strokeWidth="1.5" />
      <circle cx="46" cy="40" r="1.6" fill="#d4a017" /><circle cx="54" cy="40" r="1.6" fill="#d4a017" />
      <path d="M42 52 Q50 56 58 52" stroke="#d4a017" strokeWidth="2.5" fill="none" />
      <path d="M62 94 Q76 92 72 76" stroke="#1d1a17" strokeWidth="4" fill="none" strokeLinecap="round" />
    </g>
  ),
  'egypt.rug2': (
    <g>
      <ellipse rx="84" ry="17" fill="#e2b13c" />
      <ellipse rx="66" ry="12" fill="#c0392b" />
      <ellipse rx="40" ry="7" fill="#f4d35e" />
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return <path key={i} d={`M${(Math.cos(a) * 44).toFixed(1)} ${(Math.sin(a) * 8).toFixed(1)} L${(Math.cos(a) * 62).toFixed(1)} ${(Math.sin(a) * 11).toFixed(1)}`} stroke="#f4d35e" strokeWidth="2" />;
      })}
    </g>
  ),
  'egypt.small': (
    <g>
      {shadow(25, 20, 50)}
      <rect x="8" y="30" width="34" height="20" rx="2" fill="#d4a017" />
      <path d="M6 30 L44 30 L40 24 L10 24Z" fill="#b8860b" />
      <ellipse cx="25" cy="38" rx="7" ry="6" fill="#1e7a6a" />
      <path d="M25 32 L25 44 M18 36 L32 36" stroke="#d4a017" strokeWidth="1.2" />
      <circle cx="25" cy="30" r="3" fill="#1e7a6a" />
    </g>
  ),

  // ───── Medieval ─────
  'medieval.wall2': (
    <g>
      <path d="M14 10 L86 80 M86 10 L14 80" stroke="#c9ccd2" strokeWidth="4" strokeLinecap="round" />
      <path d="M22 20 L30 12 M78 20 L70 12" stroke="#7a5a2a" strokeWidth="6" strokeLinecap="round" />
      <path d="M50 18 L72 26 L72 50 Q72 70 50 82 Q28 70 28 50 L28 26Z" fill="#2b4a8a" stroke="#d4a017" strokeWidth="2.5" />
      <path d="M50 30 L56 44 L50 62 L44 44Z" fill="#d4a017" />
    </g>
  ),
  'medieval.left2': (
    <g>
      {shadow(50, 44)}
      <rect x="10" y="14" width="80" height="96" rx="2" fill="#5c3b22" />
      <rect x="14" y="18" width="72" height="88" fill="#3a2414" />
      {[18, 48, 78].map((y, r) => (
        <g key={y}>
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={16 + i * 8.6} y={y + (i % 3) * 2 + 4} width="7" height={22 - (i % 3) * 2} rx="1" fill={['#8e1f2c', '#2b4a8a', '#3f7a3a', '#b8860b'][(i + r) % 4]} />
          ))}
          <rect x="14" y={y + 26} width="72" height="4" fill="#5c3b22" />
        </g>
      ))}
    </g>
  ),
  'medieval.right2': (
    <g>
      {shadow(50, 22)}
      <path d="M40 110 L50 98 L60 110Z" fill="#5c3b22" />
      <path d="M50 98 L50 80" stroke="#5c3b22" strokeWidth="3" />
      <g transform="rotate(-18 50 60)">
        <ellipse cx="50" cy="78" rx="20" ry="22" fill="#b8763a" />
        <circle cx="50" cy="74" r="6" fill="#3a2414" />
        <rect x="47" y="14" width="6" height="52" rx="2" fill="#7a4a24" />
        <rect x="44" y="8" width="12" height="10" rx="2" fill="#5c3b22" />
        <path d="M48 20 L48 96 M50 20 L50 96 M52 20 L52 96" stroke="#f3e3c0" strokeWidth=".6" />
      </g>
    </g>
  ),
  'medieval.rug2': (
    <g>
      <clipPath id="chess"><ellipse rx="80" ry="16" /></clipPath>
      <ellipse rx="84" ry="18" fill="#3a2414" />
      <g clipPath="url(#chess)">
        {Array.from({ length: 16 }, (_, c) => Array.from({ length: 4 }, (_, r) => (
          <rect key={`${c}${r}`} x={-80 + c * 10} y={-16 + r * 8} width="10" height="8" fill={(c + r) % 2 ? '#e8dcc0' : '#8e1f2c'} />
        )))}
      </g>
    </g>
  ),
  'medieval.small': (
    <g>
      {shadow(25, 22, 50)}
      <path d="M8 48 Q4 36 12 30 L12 24 L18 24 L18 30 Q26 36 22 48Z" fill="#7fd1c9" opacity=".9" />
      <path d="M28 48 L28 30 L32 26 L38 26 L42 30 L42 48Z" fill="#c25ad6" opacity=".85" />
      <rect x="12" y="20" width="6" height="5" fill="#8a6a25" />
      <rect x="31" y="22" width="8" height="5" fill="#8a6a25" />
      <circle cx="14" cy="40" r="2" fill="#fff" opacity=".6" className="a-twinkle" />
      <circle cx="35" cy="36" r="1.6" fill="#fff" opacity=".6" className="a-twinkle" style={{ animationDelay: '.8s' }} />
    </g>
  ),

  // ───── Pirate ─────
  'pirate.wall2': (
    <g transform="translate(50 45)">
      <g className="a-sway" style={{ animationDuration: '6s' }}>
        {Array.from({ length: 8 }, (_, i) => (
          <g key={i} transform={`rotate(${i * 45})`}>
            <rect x="-2.5" y="-44" width="5" height="16" rx="2.5" fill="#7a4a24" />
            <rect x="-1.5" y="-28" width="3" height="20" fill="#9a6a3c" />
          </g>
        ))}
        <circle r="28" fill="none" stroke="#7a4a24" strokeWidth="6" />
        <circle r="9" fill="#c8a24a" />
        <circle r="4" fill="#5e3b22" />
      </g>
    </g>
  ),
  'pirate.left2': (
    <g>
      {shadow(50, 46)}
      {[[28, 76], [72, 76], [50, 36]].map(([x, y]) => (
        <g key={x + y}>
          <path d={`M${x - 20} ${y} Q${x - 24} ${y + 17} ${x - 20} ${y + 34} L${x + 20} ${y + 34} Q${x + 24} ${y + 17} ${x + 20} ${y}Z`} fill="#8f5a2d" />
          <path d={`M${x - 22} ${y + 8} L${x + 22} ${y + 8} M${x - 22} ${y + 26} L${x + 22} ${y + 26}`} stroke="#3a2a1c" strokeWidth="3" />
          <path d={`M${x - 8} ${y + 2} L${x - 9} ${y + 32} M${x + 8} ${y + 2} L${x + 9} ${y + 32}`} stroke="#6b4426" strokeWidth="1" />
        </g>
      ))}
    </g>
  ),
  'pirate.right2': (
    <g>
      {shadow(50, 24)}
      <path d="M36 110 L50 96 L64 110Z" fill="#5e3b22" />
      <rect x="48" y="40" width="4" height="58" fill="#7a4a24" />
      <rect x="30" y="40" width="40" height="4" rx="2" fill="#7a4a24" />
      <g className="a-sway" style={{ animationDuration: '3s' }}>
        <path d="M44 40 C40 30 42 18 52 14 C62 12 66 22 62 32 C60 38 56 40 52 40Z" fill="#e03a2e" />
        <path d="M58 38 L66 60 L58 54 L56 62 L52 40Z" fill="#2a6fd6" />
        <circle cx="56" cy="20" r="5" fill="#fff" />
        <circle cx="57" cy="20" r="2.2" fill="#111" />
        <path d="M60 22 Q70 24 64 30 Q62 26 58 26Z" fill="#f2c230" />
        <path d="M44 30 Q40 34 46 38" fill="#f2c230" />
      </g>
    </g>
  ),
  'pirate.rug2': (
    <g fill="none" stroke="#c9a46a" strokeWidth="5">
      {[78, 62, 46, 30, 14].map((r, i) => <ellipse key={r} rx={r} ry={r * 0.21} stroke={i % 2 ? '#b08a50' : '#c9a46a'} />)}
    </g>
  ),
  'pirate.small': (
    <g>
      {shadow(25, 22, 50)}
      <rect x="6" y="34" width="38" height="16" rx="1" fill="#8f5a2d" />
      <path d="M6 42 L44 42" stroke="#5e3b22" strokeWidth="1.5" />
      <g transform="rotate(-14 25 26)">
        <rect x="4" y="22" width="18" height="8" rx="2" fill="#c8a24a" />
        <rect x="22" y="23" width="12" height="6" rx="1.5" fill="#7a4a24" />
        <rect x="34" y="24" width="10" height="4" rx="1" fill="#c8a24a" />
        <circle cx="5" cy="26" r="3.5" fill="#7cc4e0" stroke="#c8a24a" strokeWidth="1.5" />
      </g>
    </g>
  ),

  // ───── Steampunk ─────
  'steampunk.wall2': (
    <g>
      <path d="M8 46 L92 46" stroke="#9a6a2c" strokeWidth="6" strokeLinecap="round" />
      {[[26, 26, 18], [70, 30, 14], [48, 66, 16]].map(([x, y, r], i) => (
        <g key={x} transform={`translate(${x} ${y})`}>
          <circle r={r + 3} fill="#c9943f" />
          <circle r={r} fill="#f0e2c2" />
          {[-60, -30, 0, 30, 60].map((a) => <rect key={a} x="-.8" y={-r + 2} width="1.6" height="4" fill="#3a2414" transform={`rotate(${a})`} />)}
          <g className="a-sway" style={{ animationDuration: `${2 + i}s` }}>
            <path d={`M0 0 L0 ${-r + 5}`} stroke="#a8323e" strokeWidth="2" strokeLinecap="round" />
          </g>
          <circle r="2.5" fill="#3a2414" />
        </g>
      ))}
    </g>
  ),
  'steampunk.left2': (
    <g>
      {shadow(50, 34)}
      <rect x="22" y="76" width="56" height="34" rx="3" fill="#5c3b22" />
      <rect x="26" y="80" width="48" height="26" rx="2" fill="#7a4a24" />
      <ellipse cx="50" cy="76" rx="26" ry="5" fill="#1a1412" />
      <ellipse cx="50" cy="75" rx="4" ry="1.4" fill="#c9943f" />
      <path d="M66 74 L64 52" stroke="#c9943f" strokeWidth="3" />
      <path d="M64 54 C60 30 70 14 92 6 C96 22 90 40 66 56Z" fill="#d6a74a" />
      <path d="M64 54 C64 36 74 22 92 6" stroke="#9a6a2c" strokeWidth="1.5" fill="none" />
      <g fill="#f0e2c2" fontSize="9"><text x="72" y="70" className="a-z">♪</text><text x="82" y="60" className="a-z" style={{ animationDelay: '1.2s' }}>♫</text></g>
    </g>
  ),
  'steampunk.right2': (
    <g>
      {shadow(50, 26)}
      <path d="M38 110 L50 100 L62 110Z" fill="#5c3b22" />
      <rect x="48" y="86" width="4" height="16" fill="#9a6a2c" />
      <path d="M26 86 L26 40 Q26 14 50 12 Q74 14 74 40 L74 86Z" fill="none" stroke="#c9943f" strokeWidth="2" />
      {[34, 42, 50, 58, 66].map((x) => <path key={x} d={`M${x} 86 L${x} ${x === 50 ? 12 : 20}`} stroke="#c9943f" strokeWidth="1.2" />)}
      <rect x="24" y="84" width="52" height="5" rx="2" fill="#9a6a2c" />
      <circle cx="50" cy="10" r="4" fill="#c9943f" />
      <path d="M34 60 L66 60" stroke="#7d5523" strokeWidth="2" />
      <g className="a-bob" style={{ animationDuration: '1.6s' }}>
        <ellipse cx="50" cy="52" rx="10" ry="7" fill="#7fc4c9" />
        <circle cx="57" cy="47" r="5" fill="#7fc4c9" />
        <circle cx="58" cy="46" r="1.4" fill="#1a1412" />
        <path d="M62 47 L67 48 L62 49Z" fill="#d6a74a" />
        <path d="M42 52 L34 48 L40 56Z" fill="#5fa3a8" />
        <g transform="translate(48 52)"><g className="a-spin"><Gear r={3} teeth={6} fill="#d6a74a" /></g></g>
      </g>
    </g>
  ),
  'steampunk.rug2': (
    <g>
      <ellipse rx="82" ry="16" fill="#3a2c22" />
      {[-54, -18, 18, 54].map((x, i) => (
        <g key={x} transform={`translate(${x} 0) scale(1 .22)`}>
          <g className={i % 2 ? 'a-spinr' : 'a-spin'} style={{ animationDuration: '12s' }}><Gear r={20} teeth={10} fill={i % 2 ? '#b07f39' : '#8c6430'} /></g>
        </g>
      ))}
    </g>
  ),
  'steampunk.small': (
    <g>
      {shadow(25, 18, 50)}
      <path d="M12 50 L12 32 Q12 24 22 24 Q32 24 32 32 L32 50Z" fill="#9a6a2c" />
      <path d="M30 30 L46 16" stroke="#9a6a2c" strokeWidth="3" strokeLinecap="round" />
      <path d="M12 34 Q4 34 6 44 Q8 48 12 46" stroke="#7d5523" strokeWidth="2.5" fill="none" />
      <circle cx="47" cy="15" r="1.6" fill="#2a1a0f" className="a-twinkle" />
      <rect x="18" y="20" width="8" height="5" rx="1" fill="#c9943f" />
      <path d="M14 38 L30 38" stroke="#d6a74a" strokeWidth="1.5" />
    </g>
  ),

  // ───── Modern ─────
  'modern.wall2': (
    <g>
      <rect x="4" y="62" width="92" height="5" rx="1" fill="#c7a782" />
      {[['#2f6fde', 8, 32], ['#ff9f0a', 15, 26], ['#5b6b7d', 22, 34], ['#e6e9ee', 29, 30]].map(([c, x, h]) => <rect key={x} x={x} y={62 - h} width="6" height={h} rx="1" fill={c} />)}
      <rect x="36" y="40" width="6" height="22" rx="1" fill="#34c759" transform="rotate(14 39 62)" />
      <rect x="56" y="50" width="12" height="12" rx="2" fill="#f2efe9" />
      <rect x="61" y="44" width="2" height="6" fill="#2f3a45" />
      <path d="M62 42 C59 38 61 34 62 32 C64 35 65 38 62 42Z" fill="#ff9f0a" className="a-flicker" />
      <path d="M78 62 L76 52 L90 52 L88 62Z" fill="#e3ddd3" />
      {leaf(80, 52, -100, '#2e7d4f', 0.9)}{leaf(84, 52, -70, '#3a9a62', 0.9)}
    </g>
  ),
  'modern.left2': (
    <g>
      {shadow(50, 44)}
      <path d="M22 110 L28 86 M78 110 L72 86 M30 110 L36 88 M70 110 L64 88" stroke="#7a5a3a" strokeWidth="3" strokeLinecap="round" />
      <path d="M14 86 Q14 76 24 76 L76 76 Q86 76 86 86 L84 92 L16 92Z" fill="#c76a3a" />
      <path d="M20 78 Q12 40 30 28 Q50 20 66 30 Q78 40 76 76Z" fill="#d8804c" />
      <path d="M28 70 Q24 46 34 38" stroke="#b25a2e" strokeWidth="2" fill="none" />
      <rect x="34" y="62" width="30" height="14" rx="7" fill="#e6e9ee" />
    </g>
  ),
  'modern.right2': (
    <g>
      {shadow(50, 40)}
      {[[24, 78, 30, '#2e7d4f'], [52, 66, 42, '#3a9a62'], [78, 84, 22, '#257045']].map(([x, base, h, c]) => (
        <g key={x}>
          <path d={`M${x - 12} ${base + 6} L${x + 12} ${base + 6} L${x + 9} 110 L${x - 9} 110Z`} fill="#f2efe9" />
          <rect x={x - 7} y={base + 6 - h} width="14" height={h} rx="7" fill={c} />
          {h > 25 && <rect x={x + 6} y={base - h / 2} width="10" height="6" rx="3" fill={c} />}
          {h > 25 && <rect x={x + 12} y={base - h / 2 - 10} width="6" height="14" rx="3" fill={c} />}
          <circle cx={x} cy={base + 6 - h} r="2.5" fill="#ff6b8a" />
        </g>
      ))}
    </g>
  ),
  'modern.rug2': (
    <g fill="none">
      <ellipse rx="80" ry="16" fill="#c9b38c" />
      {[66, 52, 38, 24].map((r) => <ellipse key={r} rx={r} ry={r * 0.2} stroke="#a8916a" strokeWidth="2" />)}
    </g>
  ),
  'modern.small': (
    <g>
      {shadow(25, 16, 50)}
      <rect x="12" y="26" width="22" height="24" rx="4" fill="#f2efe9" />
      <path d="M34 32 Q44 32 42 40 Q40 46 34 44" stroke="#f2efe9" strokeWidth="3.5" fill="none" />
      <rect x="12" y="34" width="22" height="5" fill="#2f6fde" />
      <g fill="#cfcfcf" opacity=".7">
        <path d="M18 20 C14 14 22 12 18 4" stroke="#cfcfcf" strokeWidth="2" fill="none" className="a-steam" />
        <path d="M27 20 C23 14 31 12 27 4" stroke="#cfcfcf" strokeWidth="2" fill="none" className="a-steam" style={{ animationDelay: '1s' }} />
      </g>
    </g>
  ),

  // ───── Cyber ─────
  'cyber.wall2': (
    <g className="a-glow">
      <rect x="2" y="22" width="96" height="44" rx="10" fill="#ff3df2" opacity=".12" />
      <rect x="2" y="22" width="96" height="44" rx="10" fill="none" stroke="#ff3df2" strokeWidth="2" />
      <text x="50" y="53" textAnchor="middle" fontSize="22" fontWeight="800" fontFamily="ui-rounded, system-ui" fill="none" stroke="#ffd1fb" strokeWidth="1.6" letterSpacing="2">FOCUS</text>
      <path d="M30 22 L26 8 M70 22 L74 8" stroke="#3b3680" strokeWidth="1.5" />
    </g>
  ),
  'cyber.left2': (
    <g>
      {shadow(50, 30)}
      <rect x="24" y="8" width="52" height="102" rx="26" fill="#2d2866" />
      <rect x="30" y="16" width="40" height="80" rx="20" fill="#22e1ff" opacity=".25" className="a-glow" />
      <rect x="30" y="16" width="40" height="80" rx="20" fill="none" stroke="#22e1ff" strokeWidth="1.5" />
      <path d="M38 30 Q44 26 48 32" stroke="#fff" strokeWidth="2" opacity=".6" fill="none" />
      <g fill="#a7f3ff">{[[40, 70], [56, 50], [48, 84], [60, 76]].map(([x, y], i) => <circle key={x + y} cx={x} cy={y} r="1.6" className="a-steam" style={{ animationDelay: `${i * 0.5}s` }} />)}</g>
      <rect x="36" y="100" width="28" height="5" rx="2" fill="#ff3df2" className="a-glow" />
    </g>
  ),
  'cyber.right2': (
    <g>
      <ellipse cx="50" cy="110" rx="20" ry="4" fill="#22e1ff" opacity=".3" className="a-glow" />
      <g className="a-bob" style={{ animationDuration: '2.2s' }}>
        <path d="M42 66 L34 100 L66 100 L58 66Z" fill="#22e1ff" opacity=".1" />
        <rect x="16" y="44" width="68" height="5" rx="2.5" fill="#3b3680" />
        <ellipse cx="18" cy="44" rx="12" ry="2.5" fill="#22e1ff" opacity=".6" className="a-glow" />
        <ellipse cx="82" cy="44" rx="12" ry="2.5" fill="#22e1ff" opacity=".6" className="a-glow" />
        <rect x="34" y="40" width="32" height="26" rx="10" fill="#e6e6f5" />
        <rect x="38" y="46" width="24" height="12" rx="6" fill="#0b0a1f" />
        <circle cx="45" cy="52" r="2.5" fill="#22e1ff" className="a-blink" />
        <circle cx="55" cy="52" r="2.5" fill="#22e1ff" className="a-blink" />
        <circle cx="50" cy="36" r="2" fill="#ff3df2" className="a-twinkle" />
        <path d="M50 38 L50 40" stroke="#e6e6f5" strokeWidth="1.5" />
      </g>
    </g>
  ),
  'cyber.rug2': (
    <g className="a-glow">
      <ellipse rx="84" ry="17" fill="#7f5bff" opacity=".14" />
      {Array.from({ length: 9 }, (_, i) => {
        const x = -64 + i * 16;
        return <path key={i} d={`M${x - 6} 0 L${x - 3} -5 L${x + 3} -5 L${x + 6} 0 L${x + 3} 5 L${x - 3} 5Z`} fill="none" stroke={i % 2 ? '#ff3df2' : '#22e1ff'} strokeWidth="1.3" />;
      })}
    </g>
  ),
  'cyber.small': (
    <g>
      <ellipse cx="25" cy="50" rx="14" ry="3" fill="#22e1ff" opacity=".35" />
      <g className="a-bob" style={{ animationDuration: '2.6s' }}>
        <path d="M25 14 L38 22 L38 38 L25 46 L12 38 L12 22Z" fill="#22e1ff" opacity=".35" className="a-glow" />
        <path d="M25 14 L38 22 L25 30 L12 22Z" fill="#a7f3ff" opacity=".7" />
        <path d="M25 30 L25 46" stroke="#fff" strokeWidth="1" opacity=".7" />
        <path d="M25 14 L38 22 L38 38 L25 46 L12 38 L12 22Z" fill="none" stroke="#22e1ff" strokeWidth="1.4" />
      </g>
    </g>
  ),

  // ───── Post-apocalyptic ─────
  'apoc.wall2': (
    <g transform="rotate(-8 50 45)">
      <rect x="47" y="40" width="6" height="50" fill="#5a5a48" />
      <path d="M10 12 L82 12 L94 30 L82 48 L10 48Z" fill="#3f7a3a" />
      <path d="M10 12 L82 12 L94 30 L82 48 L10 48Z" fill="none" stroke="#e8e6d8" strokeWidth="2" />
      <text x="48" y="35" textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="system-ui" fill="#e8e6d8">FOCUS 0 km</text>
      <circle cx="22" cy="20" r="5" fill="#a0522d" opacity=".7" /><circle cx="76" cy="42" r="4" fill="#a0522d" opacity=".6" />
      {leaf(12, 46, 160, '#7aa846')}{leaf(18, 48, 120, '#5a8a36')}
    </g>
  ),
  'apoc.left2': (
    <g>
      {shadow(50, 40)}
      <ellipse cx="50" cy="96" rx="38" ry="14" fill="#2a2a28" />
      <ellipse cx="50" cy="96" rx="22" ry="7" fill="#5a4f3c" />
      <path d="M12 96 Q50 104 88 96" stroke="#444440" strokeWidth="3" fill="none" />
      <ellipse cx="50" cy="80" rx="34" ry="12" fill="#2a2a28" />
      <ellipse cx="50" cy="80" rx="20" ry="6" fill="#4a3f2c" />
      {[[38, 74], [56, 72], [48, 66]].map(([x, y], i) => (
        <g key={x}>
          <path d={`M${x} ${y + 6} Q${x - 2} ${y - 14} ${x + 2} ${y - 24}`} stroke="#4f7a2e" strokeWidth="2" fill="none" />
          {leaf(x, y - 8, 200, '#7aa846')}{leaf(x + 1, y - 16, -20, '#5a8a36')}
          <circle cx={x + 2} cy={y - 24} r="4.5" fill={i === 1 ? '#f0c64a' : '#e0533e'} />
        </g>
      ))}
    </g>
  ),
  'apoc.right2': (
    <g>
      {shadow(50, 38)}
      <rect x="16" y="46" width="68" height="60" rx="8" fill="#6b6050" />
      <rect x="24" y="54" width="44" height="40" rx="10" fill="#2f3a36" />
      <rect x="72" y="60" width="6" height="6" rx="3" fill="#3a3326" /><rect x="72" y="74" width="6" height="6" rx="3" fill="#3a3326" />
      <path d="M38 46 L30 30 M62 46 L70 30" stroke="#3a3326" strokeWidth="2" />
      <path d="M30 92 Q34 70 46 66 Q58 70 62 92" fill="#5a8a36" />
      {leaf(36, 74, -60, '#7aa846')}{leaf(54, 70, -120, '#7aa846')}{leaf(44, 60, -90, '#5a8a36')}
      <path d="M16 60 Q8 80 18 104" stroke="#4f7a2e" strokeWidth="2.5" fill="none" />
      {leaf(12, 78, 160, '#7aa846')}{leaf(84, 50, 20, '#7aa846')}
    </g>
  ),
  'apoc.rug2': (
    <g>
      <ellipse rx="84" ry="17" fill="#4f7a2e" />
      {Array.from({ length: 18 }, (_, i) => {
        const a = (i * 2.4);
        const r = 20 + ((i * 37) % 56);
        return <circle key={i} cx={(Math.cos(a) * r).toFixed(1)} cy={(Math.sin(a) * r * 0.18).toFixed(1)} r={3 + (i % 3) * 2} fill={i % 2 ? '#7aa846' : '#5a8a36'} />;
      })}
      <circle cx="-30" cy="-4" r="2" fill="#f0c64a" /><circle cx="40" cy="5" r="2" fill="#e86f8a" />
    </g>
  ),
  'apoc.small': (
    <g>
      {shadow(25, 22, 50)}
      {[[6, 26], [26, 26], [16, 8]].map(([x, y]) => (
        <g key={x + y}>
          <rect x={x} y={y} width="18" height="20" rx="2" fill="#a8aaa0" />
          <rect x={x} y={y + 5} width="18" height="10" fill="#f0c64a" />
          <path d={`M${x + 5} ${y + 10} Q${x + 9} ${y + 6} ${x + 13} ${y + 10}`} stroke="#7a5200" strokeWidth="1.5" fill="none" />
        </g>
      ))}
    </g>
  ),
};
