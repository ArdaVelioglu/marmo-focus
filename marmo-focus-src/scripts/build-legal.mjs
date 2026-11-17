// Generates the public legal pages from src/legal/content.js:
//   public/legal/privacy.html, terms.html   → served by the web build; host them for the App Store URL
//   legal/PRIVACY.md, legal/TERMS.md        → readable on GitHub as-is
//   public/legal/licenses.txt               → full open-source licence texts shipped with the app
// Run with `npm run legal` after editing src/legal/content.js.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { PRIVACY, TERMS, APP_NAME, DEVELOPER, CONTACT_EMAIL, EFFECTIVE_DATE, ACKNOWLEDGEMENTS } from '../src/legal/content.js';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const page = (doc) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(doc.title)} · ${APP_NAME}</title>
<style>
  :root{color-scheme:light dark;--bg:#fbf6ec;--fg:#2b2118;--muted:#7a6555;--card:#fffdf8}
  @media (prefers-color-scheme:dark){:root{--bg:#1b1f2e;--fg:#eef1fb;--muted:#aab3cc;--card:#252a3c}}
  body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif}
  main{max-width:720px;margin:0 auto;padding:40px 20px 64px}
  h1{font-size:30px;margin:0 0 4px} h2{font-size:19px;margin:28px 0 6px}
  .meta{color:var(--muted);font-size:14px;margin-bottom:24px}
  .intro{background:var(--card);border-radius:16px;padding:16px 18px}
  a{color:inherit}
</style></head><body><main>
<h1>${esc(doc.title)}</h1>
<div class="meta">${APP_NAME} · ${esc(DEVELOPER)} · Effective ${EFFECTIVE_DATE}</div>
<p class="intro">${esc(doc.intro)}</p>
${doc.sections.map((s) => `<h2>${esc(s.h)}</h2>\n${s.p.map((p) => `<p>${esc(p).replace(esc(CONTACT_EMAIL), `<a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>`)}</p>`).join('\n')}`).join('\n')}
</main></body></html>
`;
const md = (doc) => `# ${doc.title}

*${APP_NAME} · ${DEVELOPER} · Effective ${EFFECTIVE_DATE}*

${doc.intro}

${doc.sections.map((s) => `## ${s.h}\n\n${s.p.join('\n\n')}`).join('\n\n')}
`;

writeFileSync('public/legal/privacy.html', page(PRIVACY));
writeFileSync('public/legal/terms.html', page(TERMS));
writeFileSync('legal/PRIVACY.md', md(PRIVACY));
writeFileSync('legal/TERMS.md', md(TERMS));

// Licence texts of everything that ships inside the app (not build-only tools).
const SHIPPED = ['react', 'react-dom', 'scheduler', 'lucide-react', '@fontsource/nunito', '@capacitor/core', '@capacitor/haptics', '@capacitor/local-notifications', '@capacitor/preferences'];
const parts = [`${APP_NAME} — open-source acknowledgements\n\n${ACKNOWLEDGEMENTS.map((a) => `• ${a.name} — ${a.license} — ${a.by}`).join('\n')}\n`];
for (const p of SHIPPED) {
  const dir = `node_modules/${p}`;
  const pkg = JSON.parse(readFileSync(`${dir}/package.json`, 'utf8'));
  const file = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'license', 'LICENCE'].map((f) => `${dir}/${f}`).find(existsSync);
  parts.push(`\n${'='.repeat(72)}\n${p} ${pkg.version} — ${pkg.license}\n${'='.repeat(72)}\n\n${file ? readFileSync(file, 'utf8').trim() : `Licensed under ${pkg.license}.`}\n`);
}
writeFileSync('public/legal/licenses.txt', parts.join(''));
console.log('legal pages and licences written');
