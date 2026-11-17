// Ambient soundscapes synthesized live with the Web Audio API — no audio files.
//   rain   · filtered pink noise + random droplets
//   forest · soft wind + occasional bird calls
//   fire   · low roar + random crackles
//   lofi   · 76 BPM loop: jazzy chords, kick, hat, vinyl crackle
// Each channel has its own gain; all feed a master gain and a gentle compressor.

export const SOUNDS = [
  { id: 'rain', name: 'Rain', hint: 'Steady rain on the window' },
  { id: 'forest', name: 'Forest', hint: 'Breeze and birdsong' },
  { id: 'fire', name: 'Fireplace', hint: 'A slow, crackling hearth' },
  { id: 'lofi', name: 'Lo-Fi Beats', hint: 'Mellow chords and soft drums' },
];

let ctx = null;
let master = null;
const channels = {};      // id → { gain, stop() }
const listeners = new Set();

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.ratio.value = 3;
  master = ctx.createGain();
  master.gain.value = 0.8;
  master.connect(comp).connect(ctx.destination);
  return ctx;
}

const emit = () => listeners.forEach((fn) => fn(playing()));
export const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
export const playing = () => Object.keys(channels);
export const isPlaying = (id) => id in channels;

export function setMaster(v) {
  if (master) master.gain.setTargetAtTime(v, ctx.currentTime, 0.05);
}

export function setVolume(id, v) {
  const ch = channels[id];
  if (ch) ch.gain.gain.setTargetAtTime(v, ctx.currentTime, 0.08);
}

/** Start a channel. Must be called from a user gesture the first time (browser autoplay rules). */
export function play(id, volume = 0.6, masterVolume = 0.8) {
  if (!ensure() || channels[id]) return;
  ctx.resume?.();
  setMaster(masterVolume);
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.connect(master);
  gain.gain.setTargetAtTime(volume, ctx.currentTime, 0.6);   // fade in
  const stop = BUILDERS[id](gain);
  channels[id] = { gain, stop };
  emit();
}

export function stop(id) {
  const ch = channels[id];
  if (!ch) return;
  delete channels[id];
  ch.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.25);      // fade out
  setTimeout(() => { ch.stop(); ch.gain.disconnect(); }, 1200);
  emit();
}

export const stopAll = () => Object.keys(channels).forEach(stop);
export const toggle = (id, volume, masterVolume) => (isPlaying(id) ? stop(id) : play(id, volume, masterVolume));

// ───────────── helpers ─────────────

const bufferCache = {};
function noiseBuffer(kind) {
  if (bufferCache[kind]) return bufferCache[kind];
  const len = ctx.sampleRate * 4;
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    let b0 = 0, b1 = 0, b2 = 0, last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === 'white') d[i] = w * 0.5;
      else if (kind === 'pink') {
        b0 = 0.99765 * b0 + w * 0.099; b1 = 0.963 * b1 + w * 0.2965; b2 = 0.57 * b2 + w * 1.0526;
        d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.11;
      } else {                                // brown
        last = (last + 0.02 * w) / 1.02;
        d[i] = last * 3.2;
      }
    }
  }
  return (bufferCache[kind] = buf);
}

function loopNoise(kind) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(kind);
  src.loop = true;
  src.loopStart = Math.random();            // decorrelate layers
  src.start(0, Math.random() * 3);
  return src;
}

const filter = (type, freq, q = 0.7) => { const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; return f; };
const gainNode = (v) => { const g = ctx.createGain(); g.gain.value = v; return g; };

function lfo(target, rate, depth) {
  const o = ctx.createOscillator();
  const g = gainNode(depth);
  o.frequency.value = rate;
  o.connect(g).connect(target);
  o.start();
  return o;
}

/** Short filtered noise burst — droplets, crackles, hats. */
function burst(out, { at, dur, freq, type = 'bandpass', q = 1, level = 0.3 }) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer('white');
  const f = filter(type, freq, q);
  const g = gainNode(0);
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(level, at + 0.003);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  src.connect(f).connect(g).connect(out);
  src.start(at, Math.random() * 3, dur + 0.05);
}

/** Calls `tick` repeatedly with a random delay; returns a cancel function. */
function every(minMs, maxMs, tick) {
  let id;
  const loop = () => { tick(); id = setTimeout(loop, minMs + Math.random() * (maxMs - minMs)); };
  id = setTimeout(loop, minMs);
  return () => clearTimeout(id);
}

// ───────────── soundscapes ─────────────

const BUILDERS = {
  rain(out) {
    const bed = loopNoise('pink');
    const hp = filter('highpass', 500);
    const lp = filter('lowpass', 7000);
    const g = gainNode(0.9);
    bed.connect(hp).connect(lp).connect(g).connect(out);
    const swell = lfo(g.gain, 0.08, 0.15);

    const roof = loopNoise('brown');
    const roofLp = filter('lowpass', 380);
    roof.connect(roofLp).connect(gainNode(0.5)).connect(out);

    const cancel = every(25, 90, () => {
      burst(out, { at: ctx.currentTime + 0.01, dur: 0.02 + Math.random() * 0.04, freq: 2500 + Math.random() * 4000, q: 4, level: 0.08 + Math.random() * 0.12 });
    });
    return () => { cancel(); [bed, roof, swell].forEach((n) => n.stop()); };
  },

  forest(out) {
    const wind = loopNoise('pink');
    const bp = filter('bandpass', 600, 0.4);
    const g = gainNode(0.55);
    wind.connect(bp).connect(g).connect(out);
    const gust = lfo(g.gain, 0.05, 0.3);
    const sweep = lfo(bp.frequency, 0.03, 250);

    const birds = every(1800, 5200, () => {
      const base = 2200 + Math.random() * 1800;
      const notes = 2 + Math.floor(Math.random() * 4);
      let t = ctx.currentTime + 0.05;
      for (let i = 0; i < notes; i++) {
        const o = ctx.createOscillator();
        const e = gainNode(0);
        const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        o.type = 'sine';
        o.frequency.setValueAtTime(base * (0.9 + Math.random() * 0.2), t);
        o.frequency.exponentialRampToValueAtTime(base * (1.2 + Math.random() * 0.5), t + 0.07);
        o.frequency.exponentialRampToValueAtTime(base * 0.85, t + 0.12);
        e.gain.setValueAtTime(0, t);
        e.gain.linearRampToValueAtTime(0.07, t + 0.015);
        e.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
        if (pan) { pan.pan.value = Math.random() * 1.4 - 0.7; o.connect(e).connect(pan).connect(out); } else o.connect(e).connect(out);
        o.start(t); o.stop(t + 0.15);
        t += 0.14 + Math.random() * 0.1;
      }
    });
    return () => { birds(); [wind, gust, sweep].forEach((n) => n.stop()); };
  },

  fire(out) {
    const roar = loopNoise('brown');
    const lp = filter('lowpass', 420);
    const g = gainNode(0.9);
    roar.connect(lp).connect(g).connect(out);
    const breathe = lfo(g.gain, 0.15, 0.25);

    const hiss = loopNoise('white');
    hiss.connect(filter('highpass', 5000)).connect(gainNode(0.02)).connect(out);

    const crackle = every(40, 420, () => {
      const at = ctx.currentTime + 0.01;
      const n = Math.random() < 0.25 ? 3 : 1;
      for (let i = 0; i < n; i++) {
        burst(out, { at: at + i * 0.018, dur: 0.008 + Math.random() * 0.02, freq: 1800 + Math.random() * 3500, type: 'highpass', level: 0.2 + Math.random() * 0.35 });
      }
    });
    return () => { crackle(); [roar, hiss, breathe].forEach((n) => n.stop()); };
  },

  lofi(out) {
    const bpm = 76;
    const beat = 60 / bpm;
    // Fmaj7 · Em7 · Dm7 · Cmaj7 (two bars each), voiced low and warm
    const CHORDS = [
      [174.61, 220.0, 261.63, 329.63],
      [164.81, 196.0, 246.94, 293.66],
      [146.83, 174.61, 220.0, 261.63],
      [130.81, 164.81, 196.0, 246.94],
    ];
    const tone = filter('lowpass', 1400, 0.5);
    const wow = lfo(tone.frequency, 0.2, 180);       // tape wobble on the tone
    tone.connect(gainNode(0.8)).connect(out);

    const vinyl = loopNoise('pink');
    vinyl.connect(filter('bandpass', 1500, 0.6)).connect(gainNode(0.025)).connect(out);
    const pops = every(300, 1400, () => burst(out, { at: ctx.currentTime + 0.01, dur: 0.006, freq: 3000, type: 'highpass', level: 0.12 }));

    let step = 0;                                     // 16th-note steps
    let next = ctx.currentTime + 0.1;
    const schedule = () => {
      while (next < ctx.currentTime + 0.25) {
        const bar = Math.floor(step / 16);
        const s16 = step % 16;
        if (s16 === 0 && bar % 2 === 0) {
          const chord = CHORDS[(bar / 2) % CHORDS.length];
          chord.forEach((f, i) => {
            const o = ctx.createOscillator();
            const e = gainNode(0);
            o.type = i === 0 ? 'triangle' : 'sine';
            o.frequency.value = f;
            o.detune.value = (Math.random() - 0.5) * 8;
            const len = beat * 8;
            e.gain.setValueAtTime(0, next);
            e.gain.linearRampToValueAtTime(0.07, next + 0.35);
            e.gain.setTargetAtTime(0.045, next + 0.4, 1.2);
            e.gain.linearRampToValueAtTime(0, next + len);
            o.connect(e).connect(tone);
            o.start(next + i * 0.03); o.stop(next + len + 0.05);
          });
        }
        if (s16 === 0 || s16 === 10) {               // kick
          const o = ctx.createOscillator();
          const e = gainNode(0);
          o.frequency.setValueAtTime(110, next);
          o.frequency.exponentialRampToValueAtTime(42, next + 0.12);
          e.gain.setValueAtTime(0.35, next);
          e.gain.exponentialRampToValueAtTime(0.0001, next + 0.28);
          o.connect(e).connect(out);
          o.start(next); o.stop(next + 0.3);
        }
        if (s16 === 4 || s16 === 12) burst(out, { at: next, dur: 0.12, freq: 1800, q: 0.8, level: 0.09 });   // soft snare
        if (s16 % 2 === 0) burst(out, { at: next + (s16 % 4 === 2 ? 0.02 : 0), dur: 0.03, freq: 8000, type: 'highpass', level: s16 % 4 === 2 ? 0.045 : 0.025 }); // swung hats
        next += beat / 4;
        step++;
      }
    };
    const timer = setInterval(schedule, 60);
    schedule();
    return () => { clearInterval(timer); pops(); [vinyl, wow].forEach((n) => n.stop()); };
  },
};
