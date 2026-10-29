// Light and weather layered over a room (360×300 canvas).
// Light: a tinted wash per time of day (blend modes keep the art readable).
// Weather: falling rain streaks or drifting snow, plus a faint cool cast for rain.

const WASH = {
  morning: [{ fill: 'url(#atm-dawn)', blend: 'soft-light', o: 0.9 }],
  day: [{ fill: '#fff6e0', blend: 'soft-light', o: 0.25 }],
  evening: [{ fill: 'url(#atm-dusk)', blend: 'multiply', o: 0.55 }],
  night: [{ fill: '#1d2550', blend: 'multiply', o: 0.58 }, { fill: 'url(#atm-lamp)', blend: 'soft-light', o: 0.7 }],
};

// fixed pseudo-random layout so nothing reshuffles between renders
const rnd = (i, s) => (((Math.sin(i * 91.7 + s * 13.1) * 43758.5453) % 1) + 1) % 1;
const DROPS = Array.from({ length: 46 }, (_, i) => ({ x: rnd(i, 1) * 380 - 10, d: 0.55 + rnd(i, 2) * 0.5, delay: -rnd(i, 3) * 1.2, len: 10 + rnd(i, 4) * 10, o: 0.25 + rnd(i, 5) * 0.35 }));
const FLAKES = Array.from({ length: 34 }, (_, i) => ({ x: rnd(i, 6) * 360, d: 5 + rnd(i, 7) * 5, delay: -rnd(i, 8) * 10, r: 1.2 + rnd(i, 9) * 1.8, sway: 8 + rnd(i, 10) * 14 }));

export default function Atmosphere({ phase = 'day', weather = 'clear' }) {
  return (
    <g pointerEvents="none" aria-hidden="true">
      <defs>
        <linearGradient id="atm-dawn" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffd2b0" /><stop offset=".6" stopColor="#ffe9c8" /><stop offset="1" stopColor="#c9d8f0" />
        </linearGradient>
        <linearGradient id="atm-dusk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b36ab0" /><stop offset=".55" stopColor="#f09a6a" /><stop offset="1" stopColor="#e8b58a" />
        </linearGradient>
        <radialGradient id="atm-lamp" cx=".5" cy=".82" r=".42">
          <stop offset="0" stopColor="#ffb560" stopOpacity=".85" /><stop offset="1" stopColor="#ffb560" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="atm-ray" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff3d6" stopOpacity=".55" /><stop offset="1" stopColor="#fff3d6" stopOpacity="0" />
        </linearGradient>
      </defs>

      {WASH[phase]?.map((w, i) => (
        <rect key={i} width="360" height="300" fill={w.fill}
          style={{ mixBlendMode: w.blend, transition: 'opacity 1.2s ease', opacity: w.blend === 'multiply' ? `calc(${w.o} * var(--room-dim, 1))` : w.o }} />
      ))}
      {phase === 'morning' && (
        <g className="a-glow" style={{ animationDuration: '7s' }}>
          <path d="M240 0 L300 0 L170 300 L90 300Z" fill="url(#atm-ray)" style={{ mixBlendMode: 'screen' }} />
          <path d="M310 0 L340 0 L250 300 L210 300Z" fill="url(#atm-ray)" opacity=".6" style={{ mixBlendMode: 'screen' }} />
        </g>
      )}
      {phase === 'night' && (
        <g fill="#fff">
          {[[40, 30], [120, 18], [200, 40], [300, 22], [80, 60]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1" className="a-twinkle" style={{ animationDelay: `${i * 0.6}s` }} opacity=".5" />
          ))}
        </g>
      )}

      {weather === 'rain' && (
        <g>
          <rect width="360" height="300" fill="#5a7da6" opacity=".14" style={{ mixBlendMode: 'multiply' }} />
          <g stroke="#dbe9ff" strokeLinecap="round" strokeWidth="1.2">
            {DROPS.map((p, i) => (
              <line key={i} x1={p.x} y1={-20} x2={p.x - 4} y2={-20 + p.len} opacity={p.o}
                className="a-rain" style={{ animationDuration: `${p.d}s`, animationDelay: `${p.delay}s` }} />
            ))}
          </g>
        </g>
      )}
      {weather === 'snow' && (
        <g fill="#fff">
          <rect width="360" height="300" fill="#dfe8f5" opacity=".12" style={{ mixBlendMode: 'screen' }} />
          {FLAKES.map((p, i) => (
            <g key={i} className="a-snow" style={{ animationDuration: `${p.d}s`, animationDelay: `${p.delay}s`, '--sway': `${p.sway}px` }}>
              <circle cx={p.x} cy={-6} r={p.r} opacity=".85" />
            </g>
          ))}
        </g>
      )}
    </g>
  );
}
