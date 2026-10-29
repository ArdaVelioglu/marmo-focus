// Gentle chime via Web Audio (no asset files) + haptics where supported.
import { t } from '../i18n';
let ctx;
/** Call from a tap so the browser allows the completion chime later. */
export function unlockAudio() {
  try { ctx ??= new (window.AudioContext || window.webkitAudioContext)(); ctx.resume?.(); } catch { /* unavailable */ }
}
export function chime(kind = 'focus') {
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)();
    const notes = kind === 'focus' ? [659.25, 783.99, 1046.5] : [783.99, 659.25];
    notes.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      const t = ctx.currentTime + i * 0.16;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.18, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 1);
    });
  } catch { /* audio unavailable */ }
}

export function haptic(pattern = 12) {
  try { navigator.vibrate?.(pattern); } catch { /* unsupported */ }
}

export const fmt = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

export const fmtHours = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h ? t('{h}h {m}m', { h, m }) : t('{m}m', { m });
};
