// Release guard: fails the build if dist/ still contains code or text from features that are
// not part of the shipped app (developer tools, the unfinished Friends / invite system).
//
// App Review reads the JavaScript inside the app. Switched-off features that are still in the
// bundle look like functionality hidden from review (guideline 5.6), so they must not ship at all.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;

const FORBIDDEN = [
  /developer mode/i, /developer panel/i, /dev\/(?:toggle|coins|era|speed|minutes|unlockAll|finish|streak|daily)/,
  /devMode/, /devSpeed/, /devUnlockAll/, /coin injector/i, /era switcher/i,
  /\bfriends?\b/i, /friend ?code/i, /leaderboard/i, /\binvite/i, /referral/i, /redeem/i,
  /\bmyCode\b/, /LUNA42|KAITO7|ELIF88/, /VITE_DEV_TOOLS|VITE_FRIENDS/,
];

const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(js|html|css|json)$/.test(name)) files.push(p);
  }
};
walk(DIST);

const hits = [];
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  for (const re of FORBIDDEN) {
    const m = text.match(re);
    if (m) {
      const at = m.index ?? 0;
      hits.push(`${file.replace(DIST, 'dist/')}: ${re} → …${text.slice(Math.max(0, at - 40), at + 40).replace(/\s+/g, ' ')}…`);
    }
  }
}

if (hits.length) {
  console.error('\n✖ Release check failed — the build contains features that must not ship:\n');
  for (const h of hits) console.error('  ' + h);
  console.error('\nRemove that code from src/ before submitting to the App Store.\n');
  process.exit(1);
}
console.log(`✓ Release check passed (${files.length} files scanned)`);
