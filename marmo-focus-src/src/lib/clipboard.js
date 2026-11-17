/** Copy text; falls back to a hidden textarea when the Clipboard API is refused. Resolves true on success. */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0;left:-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

/** Native share sheet when available; returns false if it isn't (caller then copies). */
export async function shareText(text) {
  if (!navigator.share) return false;
  try {
    await navigator.share({ text });
    return true;
  } catch (e) {
    return e?.name === 'AbortError';   // the person closed the sheet: treat as handled
  }
}
