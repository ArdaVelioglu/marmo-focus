// Base room art for every era. Scene canvas: viewBox 0 0 360 300, floor line at y≈200.
// The right-hand wall (x 220–340, y 30–140) holds each era's signature feature.

export function SceneBase({ era, phase }) {
  const { wall, floor, glow } = era.scene;
  const id = era.id;
  return (
    <g>
      <defs>
        <linearGradient id={`w-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={wall[0]} /><stop offset="1" stopColor={wall[1]} />
        </linearGradient>
        <linearGradient id={`f-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={floor[0]} /><stop offset="1" stopColor={floor[1]} />
        </linearGradient>
        <radialGradient id={`g-${id}`} cx=".5" cy=".55" r=".6">
          <stop offset="0" stopColor={glow} stopOpacity=".28" /><stop offset="1" stopColor={glow} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="vignette" cx=".5" cy=".5" r=".75">
          <stop offset=".6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".35" />
        </radialGradient>
      </defs>
      <rect width="360" height="300" fill={`url(#w-${id})`} />
      <path d="M0 200 L360 200 L360 300 L0 300Z" fill={`url(#f-${id})`} />
      {BASES[id]?.(phase)}
      <rect width="360" height="300" fill={`url(#g-${id})`} />
    </g>
  );
}

export const SceneOverlay = () => <rect width="360" height="300" fill="url(#vignette)" pointerEvents="none" style={{ opacity: 'var(--room-vignette, 1)' }} />;

const BASES = {
  stone: (phase) => DinoValley(phase),
  egypt: () => (
    <g>
      {/* sandstone blocks */}
      <g stroke="#9a7140" strokeWidth="1" opacity=".45">
        {[40, 80, 120, 160].map((y) => <path key={y} d={`M0 ${y} L360 ${y}`} />)}
        {[0, 1, 2, 3].map((r) => [0, 1, 2, 3, 4, 5, 6].map((c) => (
          <path key={`${r}${c}`} d={`M${c * 60 + (r % 2) * 30} ${r * 40 + 40} L${c * 60 + (r % 2) * 30} ${r * 40 + 80}`} />
        )))}
      </g>
      {/* doorway with pyramid view */}
      <path d="M232 200 L232 60 Q280 34 328 60 L328 200Z" fill="#6d4c2a" />
      <path d="M240 200 L240 66 Q280 44 320 66 L320 200Z" fill="#f6c98a" />
      <path d="M244 200 L282 120 L320 200Z" fill="#d9a35c" />
      <path d="M282 120 L320 200 L296 200Z" fill="#b8843f" />
      <circle cx="300" cy="90" r="9" fill="#fff1c2" />
      {/* hieroglyph frieze */}
      <rect x="0" y="10" width="360" height="22" fill="#1e4fa3" opacity=".85" />
      <g fill="#d4a017">
        {Array.from({ length: 12 }, (_, i) => {
          const x = 14 + i * 30;
          const g = i % 4;
          return g === 0 ? <circle key={i} cx={x} cy="21" r="5" />
            : g === 1 ? <path key={i} d={`M${x - 5} 28 L${x} 14 L${x + 5} 28Z`} />
            : g === 2 ? <path key={i} d={`M${x - 6} 21 Q${x} 13 ${x + 6} 21 Q${x} 29 ${x - 6} 21Z`} />
            : <rect key={i} x={x - 2} y="14" width="4" height="14" rx="2" />;
        })}
      </g>
      <path d="M0 200 L360 200" stroke="#d4a017" strokeWidth="3" />
    </g>
  ),
  medieval: () => (
    <g>
      <g stroke="#3f444b" strokeWidth="1.2" opacity=".5" fill="none">
        {Array.from({ length: 6 }, (_, r) => Array.from({ length: 8 }, (_, c) => (
          <rect key={`${r}${c}`} x={c * 50 - (r % 2) * 25} y={r * 34} width="50" height="34" rx="4" />
        )))}
      </g>
      {/* gothic window */}
      <path d="M250 150 L250 80 Q280 40 310 80 L310 150Z" fill="#2c3445" />
      <path d="M256 146 L256 82 Q280 50 304 82 L304 146Z" fill="#40507a" />
      <path d="M280 54 L280 146 M256 104 L304 104" stroke="#2c3445" strokeWidth="3" />
      <circle cx="270" cy="72" r="3" fill="#fff" opacity=".7" className="a-twinkle" />
      <circle cx="292" cy="90" r="2" fill="#fff" opacity=".6" className="a-twinkle" style={{ animationDelay: '1s' }} />
      <path d="M244 150 L316 150 L312 158 L248 158Z" fill="#5c6068" />
      {/* floor planks */}
      <g stroke="#3b2618" strokeWidth="1" opacity=".5">
        {[220, 244, 272].map((y) => <path key={y} d={`M0 ${y} L360 ${y}`} />)}
      </g>
    </g>
  ),
  pirate: () => (
    <g>
      <g stroke="#4a2e1a" strokeWidth="2" opacity=".6">
        {[30, 66, 102, 138, 174].map((y) => <path key={y} d={`M0 ${y} L360 ${y}`} />)}
      </g>
      {/* porthole with sea */}
      <circle cx="282" cy="92" r="40" fill="#c8a24a" />
      <circle cx="282" cy="92" r="32" fill="#7cc4e0" />
      <clipPath id="porthole"><circle cx="282" cy="92" r="32" /></clipPath>
      <g clipPath="url(#porthole)">
        <rect x="240" y="100" width="90" height="40" fill="#1f6f99" />
        <path d="M240 102 Q255 96 270 102 T300 102 T330 102" fill="none" stroke="#e8f6ff" strokeWidth="2" className="a-sway" />
        <path d="M270 100 L276 80 L284 100Z" fill="#fff" opacity=".9" />
        <circle cx="298" cy="74" r="6" fill="#fff6c8" />
      </g>
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <circle key={a} cx={282 + 36 * Math.cos((a * Math.PI) / 180)} cy={92 + 36 * Math.sin((a * Math.PI) / 180)} r="2.4" fill="#8a6a25" />
      ))}
      {/* hanging lantern */}
      <path d="M200 0 L200 34" stroke="#2b1d12" strokeWidth="2" />
      <rect x="190" y="34" width="20" height="26" rx="4" fill="#2b1d12" />
      <rect x="194" y="38" width="12" height="18" rx="3" fill="#ffcf7a" className="a-flicker" />
      <g stroke="#3d2614" strokeWidth="1.2" opacity=".6">
        {[60, 120, 180, 240, 300].map((x) => <path key={x} d={`M${x} 200 L${x * 1.3 - 54} 300`} />)}
      </g>
    </g>
  ),
  steampunk: () => (
    <g>
      {/* pipes */}
      <g fill="none" strokeLinecap="round">
        <path d="M0 40 L170 40 Q190 40 190 60 L190 200" stroke="#9a6a2c" strokeWidth="10" />
        <path d="M360 160 L340 160 Q326 160 326 146 L326 20" stroke="#7d5523" strokeWidth="8" />
        <path d="M0 40 L170 40 Q190 40 190 60 L190 200" stroke="#d6a74a" strokeWidth="3" opacity=".5" />
      </g>
      {[[60, 40], [130, 40], [190, 120]].map(([x, y]) => <rect key={x + y} x={x - 7} y={y - 7} width="14" height="14" rx="2" fill="#5c3b22" />)}
      <circle cx="190" cy="160" r="9" fill="#d6a74a" /><circle cx="190" cy="160" r="5" fill="#3a2414" />
      {/* clockwork wall */}
      <g transform="translate(270 84)">
        <g className="a-spin"><Gear r={34} teeth={14} fill="#8c6430" /></g>
      </g>
      <g transform="translate(236 128)">
        <g className="a-spinr"><Gear r={20} teeth={10} fill="#b07f39" /></g>
      </g>
      <g transform="translate(310 136)">
        <g className="a-spinr" style={{ animationDuration: '4s' }}><Gear r={14} teeth={8} fill="#c9943f" /></g>
      </g>
      <circle cx="230" cy="40" r="3" fill="#fff" opacity=".6" />
      <g fill="#fff" opacity=".6">
        <circle cx="190" cy="16" r="6" className="a-steam" />
        <circle cx="196" cy="14" r="5" className="a-steam" style={{ animationDelay: '1.1s' }} />
      </g>
      <g stroke="#1f1812" strokeWidth="1" opacity=".5">
        {[230, 262].map((y) => <path key={y} d={`M0 ${y} L360 ${y}`} />)}
        {[40, 120, 200, 280].map((x) => <circle key={x} cx={x} cy="215" r="1.5" fill="#d6a74a" />)}
      </g>
    </g>
  ),
  modern: () => (
    <g>
      {/* floor-to-ceiling window with skyline */}
      <rect x="222" y="22" width="118" height="178" fill="#2f3a45" />
      <rect x="226" y="26" width="110" height="170" fill="#9fc3df" />
      <rect x="226" y="120" width="110" height="76" fill="#f6c690" opacity=".5" />
      <g fill="#5c6f84">
        <rect x="230" y="110" width="16" height="86" /><rect x="248" y="90" width="20" height="106" />
        <rect x="270" y="124" width="14" height="72" /><rect x="286" y="76" width="18" height="120" />
        <rect x="306" y="104" width="26" height="92" />
      </g>
      <g fill="#fff3c4" opacity=".85">
        {[[252, 100], [260, 116], [290, 90], [296, 110], [312, 118], [322, 132], [236, 128]].map(([x, y]) => <rect key={x + y} x={x} y={y} width="3" height="3" />)}
      </g>
      <g fill="#fff" opacity=".9" className="a-drift"><ellipse cx="0" cy="50" rx="16" ry="5" /></g>
      <path d="M281 26 L281 196" stroke="#2f3a45" strokeWidth="3" />
      {/* track lights */}
      <rect x="40" y="8" width="160" height="4" rx="2" fill="#2f3a45" />
      {[70, 120, 170].map((x) => <g key={x}><rect x={x - 4} y="12" width="8" height="10" rx="2" fill="#2f3a45" /><path d={`M${x - 4} 22 L${x - 26} 120 L${x + 26} 120 L${x + 4} 22Z`} fill="#fff1d0" opacity=".12" className="a-glow" /></g>)}
      <path d="M0 200 L360 200" stroke="#9c7d58" strokeWidth="2" />
      <g stroke="#a88762" strokeWidth="1" opacity=".7">
        {[50, 110, 170, 230, 290].map((x) => <path key={x} d={`M${x} 200 L${(x - 180) * 1.5 + 180} 300`} />)}
      </g>
    </g>
  ),
  cyber: () => (
    <g>
      {/* panelled hull */}
      <g stroke="#2d2866" strokeWidth="1">
        {[0, 72, 144, 216, 288].map((x) => <rect key={x} x={x + 4} y="6" width="64" height="186" rx="6" fill="none" />)}
      </g>
      {/* starfield window */}
      <rect x="222" y="34" width="116" height="104" rx="18" fill="#22e1ff" opacity=".3" />
      <rect x="226" y="38" width="108" height="96" rx="15" fill="#05040f" />
      {Array.from({ length: 18 }, (_, i) => (
        <circle key={i} cx={(232 + ((i * 61.8) % 100)).toFixed(1)} cy={44 + ((i * i * 17 + i * 29) % 84)} r={i % 4 ? 0.9 : 1.6} fill="#fff" className="a-twinkle" style={{ animationDelay: `${(i % 6) * 0.4}s` }} />
      ))}
      <circle cx="304" cy="106" r="18" fill="#6b4bff" />
      <path d="M282 104 Q304 96 326 110" stroke="#d3c8ff" strokeWidth="2" fill="none" opacity=".8" />
      <ellipse cx="304" cy="106" rx="28" ry="6" fill="none" stroke="#ff3df2" strokeWidth="1.4" opacity=".7" />
      {/* neon strip */}
      <rect x="0" y="194" width="360" height="4" fill="#ff3df2" className="a-glow" />
      <rect x="0" y="194" width="360" height="10" fill="#ff3df2" opacity=".18" className="a-glow" />
      <g stroke="#22e1ff" strokeWidth="1" opacity=".35">
        {[220, 248, 284].map((y) => <path key={y} d={`M0 ${y} L360 ${y}`} />)}
        {[60, 120, 180, 240, 300].map((x) => <path key={x} d={`M${x} 200 L${(x - 180) * 1.6 + 180} 300`} />)}
      </g>
    </g>
  ),
  apoc: () => (
    <g>
      {/* corrugated bunker wall */}
      <g stroke="#3a3c32" strokeWidth="2" opacity=".35">
        {Array.from({ length: 24 }, (_, i) => <path key={i} d={`M${i * 16} 0 L${i * 16} 200`} />)}
      </g>
      {/* cracked opening with daylight & greenery */}
      <path d="M232 150 L240 70 L262 52 L300 48 L330 66 L336 150Z" fill="#b8d9a0" />
      <path d="M240 150 L246 118 Q290 92 332 120 L334 150Z" fill="#6a9a4a" />
      <circle cx="300" cy="74" r="8" fill="#fff6d0" />
      <path d="M232 150 L240 70 L262 52 L300 48 L330 66 L336 150" fill="none" stroke="#2f3128" strokeWidth="4" strokeLinejoin="round" />
      {/* vines along the top */}
      <g className="a-sway">
        <path d="M0 4 Q60 22 120 6 T240 10 T360 6" stroke="#4f7a2e" strokeWidth="4" fill="none" />
        {[[24, 14], [70, 18], [110, 8], [160, 16], [210, 10], [262, 14], [310, 8]].map(([x, y], i) => (
          <path key={x} d="M0 0 C6 -4 12 -2 14 4 C8 6 2 5 0 0Z" fill={i % 2 ? '#7aa846' : '#5a8a36'} transform={`translate(${x} ${y}) rotate(${60 + i * 25})`} />
        ))}
        <path d="M150 12 Q146 50 152 90" stroke="#4f7a2e" strokeWidth="2.5" fill="none" />
        <path d="M0 0 C6 -4 12 -2 14 4 C8 6 2 5 0 0Z" fill="#7aa846" transform="translate(150 60) rotate(80)" />
      </g>
      {/* moss on floor */}
      {[[30, 214, 40], [330, 220, 30], [200, 288, 50]].map(([x, y, r]) => <ellipse key={x} cx={x} cy={y} rx={r} ry="6" fill="#5a8a36" opacity=".55" />)}
      <path d="M0 200 L360 200" stroke="#2f3128" strokeWidth="2" />
    </g>
  ),
};

export function Gear({ r, teeth, fill }) {
  const pts = [];
  for (let i = 0; i < teeth * 2; i++) {
    const a = (i * Math.PI) / teeth;
    const rr = i % 2 ? r * 0.82 : r;
    pts.push(`${(rr * Math.cos(a)).toFixed(1)},${(rr * Math.sin(a)).toFixed(1)}`);
  }
  return (
    <g>
      <polygon points={pts.join(' ')} fill={fill} />
      <circle r={r * 0.5} fill="#000" opacity=".25" />
      <circle r={r * 0.18} fill="#e6c17a" />
    </g>
  );
}

/* ───────── Stone Age: Dino Valley (1.7) ─────────
   Open-air valley: warm boulder upper-left for wall items, friendly long-neck dinosaur on the right. */
const fern = (x, y, s = 1, flip = 1, c = '#4f9a4a') => (
  <g transform={`translate(${x} ${y}) scale(${s * flip} ${s})`} fill={c}>
    {[-60, -35, -12, 12, 35].map((r, i) => (
      <path key={i} d="M0 0 C6 -14 8 -30 2 -44 C-2 -30 -4 -14 0 0Z" transform={`rotate(${r})`} opacity={0.9 - i * 0.05} />
    ))}
  </g>
);
const cloud = (x, y, s = 1) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="#fff" opacity=".85">
    <ellipse cx="0" cy="0" rx="22" ry="9" /><ellipse cx="-12" cy="-5" rx="11" ry="8" /><ellipse cx="8" cy="-8" rx="13" ry="10" />
  </g>
);
const grass = (x, y, c = '#6fae5c') => <path d={`M${x} ${y} l-3 -9 M${x + 3} ${y} l0 -11 M${x + 6} ${y} l3 -8`} stroke={c} strokeWidth="2" strokeLinecap="round" />;

function DinoValley(phase) {
  const dark = phase === 'night';
  return (
    <g>
      <defs>
        <linearGradient id="dv-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd6b8" /><stop offset=".55" stopColor="#ffe9c6" /><stop offset="1" stopColor="#f6f0d2" /></linearGradient>
        <linearGradient id="dv-grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a9d58f" /><stop offset="1" stopColor="#86bd70" /></linearGradient>
        <linearGradient id="dv-rock" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e7c39b" /><stop offset="1" stopColor="#c79a72" /></linearGradient>
        <radialGradient id="dv-sun"><stop offset="0" stopColor="#fff6cf" /><stop offset=".6" stopColor="#ffe9a8" stopOpacity=".8" /><stop offset="1" stopColor="#ffe9a8" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="360" height="300" fill="url(#dv-sky)" />
      {dark ? (
        <g>
          <circle cx="296" cy="46" r="13" fill="#fff6dc" /><circle cx="301" cy="42" r="11" fill="url(#dv-sky)" />
          {[[40, 20], [150, 14], [210, 40], [330, 90], [110, 64], [250, 18]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.3" fill="#fff" className="a-twinkle" style={{ animationDelay: `${i * 0.4}s` }} />)}
        </g>
      ) : (
        <g><circle cx="296" cy="46" r="40" fill="url(#dv-sun)" /><circle cx="296" cy="46" r="15" fill="#fff4c7" /></g>
      )}
      {!dark && <>{cloud(90, 30, 1)}{cloud(220, 22, 0.8)}</>}
      {/* pterodactyls */}
      {!dark && <g stroke="#b88a78" strokeWidth="2" fill="none" strokeLinecap="round"><path d="M186 46 q5 -5 10 0 q5 -5 10 0" /><path d="M214 60 q4 -4 8 0 q4 -4 8 0" /></g>}
      {/* volcano + far hills */}
      <path d="M150 200 L215 110 Q222 102 230 110 L300 200Z" fill="#d6b3d6" />
      <path d="M210 117 Q222 108 236 117 L232 124 Q222 118 213 124Z" fill="#e8a37c" />
      <g fill="#fff" opacity=".75" className="a-steam"><circle cx="222" cy="96" r="7" /><circle cx="230" cy="84" r="9" /><circle cx="222" cy="70" r="11" /></g>
      <path d="M0 176 Q70 150 150 172 T300 166 T360 172 L360 200 L0 200Z" fill="#bfe0a6" />
      {/* friendly long-neck dinosaur */}
      <g transform="translate(262 112)">
        <path d="M-6 74 C-4 30 8 2 30 -26 C34 -32 44 -30 44 -22 C44 -16 38 -16 36 -12 C24 8 22 40 26 74Z" fill="#8cc28a" />
        <ellipse cx="18" cy="76" rx="44" ry="22" fill="#8cc28a" />
        <path d="M58 70 C78 70 88 58 96 52" stroke="#8cc28a" strokeWidth="10" fill="none" strokeLinecap="round" />
        {[-14, 2, 30, 46].map((x) => <rect key={x} x={x} y="84" width="11" height="20" rx="5" fill="#7bb27a" />)}
        <circle cx="38" cy="-24" r="2.2" fill="#2b2a28" /><circle cx="38.6" cy="-24.8" r=".8" fill="#fff" />
        <path d="M40 -17 q3 2 5 0" stroke="#2b2a28" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <ellipse cx="34" cy="-18" rx="2.4" ry="1.4" fill="#f2a0a0" opacity=".8" />
        {[[4, 66], [24, 62], [40, 70]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="3.5" fill="#a7d4a0" />)}
      </g>
      {/* big warm boulder for wall items */}
      <path d="M8 200 C2 140 10 70 40 42 C70 18 130 22 156 50 C176 74 176 150 170 200Z" fill="url(#dv-rock)" />
      <path d="M40 42 C70 18 130 22 156 50" stroke="#f3d7b4" strokeWidth="4" fill="none" opacity=".7" strokeLinecap="round" />
      <path d="M150 90 C160 120 160 160 156 196" stroke="#b58660" strokeWidth="3" fill="none" opacity=".5" />
      {/* ground */}
      <path d="M0 196 Q180 186 360 196 L360 300 L0 300Z" fill="url(#dv-grass)" />
      <ellipse cx="182" cy="256" rx="110" ry="30" fill="#e8d3a3" opacity=".55" />
      {fern(18, 214, 1.1, 1)}{fern(344, 216, 1.2, -1, '#5aa653')}{fern(320, 296, 0.9, 1, '#4f9a4a')}
      {[[110, 228], [250, 214], [40, 270], [300, 262], [150, 290]].map(([x, y]) => <g key={x}>{grass(x, y)}</g>)}
      {[[86, 214, '#ff9fb2'], [272, 236, '#ffd36a'], [26, 252, '#ffffff'], [338, 248, '#ff9fb2']].map(([x, y, c]) => (
        <g key={x} fill={c}><circle cx={x} cy={y} r="3" /><circle cx={x + 5} cy={y + 1} r="3" /><circle cx={x + 2} cy={y + 4} r="3" /><circle cx={x + 2.5} cy={y + 1.5} r="1.6" fill="#f3b23c" /></g>
      ))}
    </g>
  );
}

