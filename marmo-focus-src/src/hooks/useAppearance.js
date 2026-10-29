import { useEffect, useState } from 'react';

/** Resolves 'system' | 'light' | 'dark' and applies the .dark class + era tint to <html>. */
export function useAppearance(theme, era) {
  const [systemDark, setSystemDark] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const on = (e) => setSystemDark(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  const host = document.documentElement.getAttribute('data-theme'); // set by an embedding host, if any
  const dark = theme === 'dark' || (theme === 'system' && (host ? host === 'dark' : systemDark));

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', dark);
    root.classList.toggle('light', !dark);
    const tint = dark ? era.tint.dark : era.tint.light;
    root.style.setProperty('--tint', tint);
    root.style.setProperty('--on-tint', luminance(tint) > 0.45 ? '#000000' : '#ffffff');
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', dark ? '#1b1f2e' : '#fbf6ec'));
  }, [dark, era]);

  return dark;
}

// Relative luminance (sRGB) — picks black or white text for filled tint controls.
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
