// "Export My Data": a JSON copy of everything the app stores on this device, offered through the
// share sheet (iOS / Android) or as a download (desktop browsers).
export async function exportData(state) {
  const day = new Date().toISOString().slice(0, 10);
  const name = `marmo-focus-data-${day}.json`;
  const json = JSON.stringify({ app: 'Marmo Focus', exportedAt: new Date().toISOString(), data: state }, null, 2);
  const file = new File([json], name, { type: 'application/json' });
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: name });
      return 'shared';
    }
  } catch (e) {
    if (e?.name === 'AbortError') return 'cancelled';
  }
  const url = URL.createObjectURL(file);
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return 'downloaded';
}
