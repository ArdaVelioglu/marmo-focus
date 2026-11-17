// Feature switches for release builds.
//
// FRIENDS: the Friends tab (friend codes, leaderboard, invites) runs on generated sample profiles
// (lib/social.js) because there is no server yet. It stays out of release builds so the App Store
// version never shows people or rewards that are not real. `npm run dev` keeps it for development;
// set VITE_FRIENDS=true to build it in once a real backend replaces lib/social.js.
import { DEV_TOOLS } from './devtools';

export const FRIENDS = DEV_TOOLS || import.meta.env.VITE_FRIENDS === 'true';
