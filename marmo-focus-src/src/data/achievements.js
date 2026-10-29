// Achievements: each badge measures one number from the store against a target.
// `measure(state)` returns the current value; a badge unlocks when value ≥ target.
import { Award, Coffee, Coins, Compass, Crown, Flame, Gem, Hourglass, ListChecks, Moon, Mountain, NotebookPen, Shirt, Sparkles, Sunrise, Timer, Trophy, Users, Zap } from 'lucide-react';
import { ERAS, eraForMinutes } from './eras';
import { SHOP } from './shop';
import { num, t } from '../i18n';

const owns = (state, era) => SHOP.filter((i) => i.era === era).filter((i) => state.owned.includes(i.id)).length;
const eraTotal = (era) => SHOP.filter((i) => i.era === era).length;

/** Longest run of consecutive calendar days with at least one finished session. */
export function longestStreak(history) {
  const days = [...new Set(history.map((h) => { const d = new Date(h.t); return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5; }))].sort((a, b) => a - b);
  let best = 0, run = 0, prev = null;
  for (const d of days) { run = prev !== null && d === prev + 1 ? run + 1 : 1; best = Math.max(best, run); prev = d; }
  return best;
}

const bestStreak = (s) => Math.max(longestStreak(s.history), s.streak?.count ?? 0);
const hourCount = (state, test) => state.history.filter((h) => test(new Date(h.t).getHours())).length;
const doneTasks = (state) => state.doneTaskCount + state.tasks.filter((t) => t.done).length;
const realFriends = (state) => state.friends.filter((f) => !f.sample).length;

export const ACHIEVEMENTS = [
  { id: 'first-focus', title: 'First Focus', desc: 'Finish your first focus session.', icon: Sparkles, color: '#e8915f', target: 1, measure: (s) => s.sessions },
  { id: 'sessions-10', title: 'Getting Into It', desc: 'Finish 10 sessions.', icon: Timer, color: '#d9a441', target: 10, measure: (s) => s.sessions },
  { id: 'sessions-50', title: 'Creature of Habit', desc: 'Finish 50 sessions.', icon: Award, color: '#c27a3e', target: 50, measure: (s) => s.sessions },
  { id: 'hours-5', title: '5 Hours Logged', desc: 'Focus for 5 hours in total.', icon: Hourglass, color: '#7fa86a', target: 300, unit: 'min', measure: (s) => s.focusMinutes },
  { id: 'hours-25', title: '25 Hours Logged', desc: 'Focus for 25 hours in total.', icon: Mountain, color: '#5f9a8c', target: 1500, unit: 'min', measure: (s) => s.focusMinutes },
  { id: 'hours-100', title: 'Centurion', desc: 'Focus for 100 hours in total.', icon: Crown, color: '#b5893a', target: 6000, unit: 'min', measure: (s) => s.focusMinutes },
  { id: 'deep-dive', title: 'Deep Dive', desc: 'Finish a session of 1 hour or longer.', icon: Zap, color: '#6f8fd0', target: 1, measure: (s) => s.history.filter((h) => h.m >= 60).length },
  { id: 'marathon', title: 'Marathon Mind', desc: 'Finish a 2-hour session.', icon: Trophy, color: '#a46ac4', target: 1, measure: (s) => s.history.filter((h) => h.m >= 120).length },
  { id: 'streak-3', title: 'On a Roll', desc: 'Focus on 3 days in a row.', icon: Flame, color: '#e0714f', target: 3, unit: 'days', measure: bestStreak },
  { id: 'streak-7', title: 'Week Warrior', desc: 'Focus on 7 days in a row.', icon: Flame, color: '#d0503f', target: 7, unit: 'days', measure: bestStreak },
  { id: 'streak-14', title: 'Unstoppable', desc: 'Focus on 14 days in a row.', icon: Flame, color: '#c43d5a', target: 14, unit: 'days', measure: bestStreak },
  { id: 'streak-30', title: 'Eternal Flame', desc: 'Focus on 30 days in a row.', icon: Flame, color: '#a33bb0', target: 30, unit: 'days', measure: bestStreak },
  { id: 'early-bird', title: 'Early Bird', desc: 'Finish a session before 9 am.', icon: Sunrise, color: '#f0a35e', target: 1, measure: (s) => hourCount(s, (h) => h >= 4 && h < 9) },
  { id: 'night-owl', title: 'Night Owl', desc: 'Finish a session after 10 pm.', icon: Moon, color: '#6a6fb8', target: 1, measure: (s) => hourCount(s, (h) => h >= 22 || h < 4) },
  { id: 'collector-stone', title: 'Stone Age Collector', desc: 'Own every Stone Age item.', icon: Gem, color: '#a27552', target: eraTotal('stone'), measure: (s) => owns(s, 'stone') },
  { id: 'collector-egypt', title: 'Pharaoh’s Treasury', desc: 'Own every Ancient Egypt item.', icon: Gem, color: '#c79a35', target: eraTotal('egypt'), measure: (s) => owns(s, 'egypt') },
  { id: 'wardrobe', title: 'Time-Traveling Wardrobe', desc: 'Own 5 outfits.', icon: Shirt, color: '#c96f8a', target: 5, measure: (s) => SHOP.filter((i) => i.type === 'outfit' && s.owned.includes(i.id)).length },
  { id: 'traveler', title: 'Time Traveler', desc: 'Reach the Pirate Age.', icon: Compass, color: '#3f8ea3', target: 4, unit: 'era', measure: (s) => eraForMinutes(s.focusMinutes).index + 1 },
  { id: 'end-of-time', title: 'End of Time', desc: 'Reach the Post-Apocalyptic era.', icon: Compass, color: '#66913c', target: ERAS.length, unit: 'era', measure: (s) => eraForMinutes(s.focusMinutes).index + 1 },
  { id: 'planner', title: 'Clear Planner', desc: 'Complete 10 tasks from your list.', icon: ListChecks, color: '#5a9b7b', target: 10, measure: doneTasks },
  { id: 'social', title: 'Focus Buddies', desc: 'Add 3 friends.', icon: Users, color: '#4f86cf', target: 3, measure: realFriends },
  { id: 'big-spender', title: 'Big Spender', desc: 'Spend 2,000 Banana Coins.', icon: Coins, color: '#b9852c', target: 2000, unit: 'coins', measure: (s) => s.coinsSpent },
  { id: 'reflective', title: 'Reflective Mind', desc: 'Write 10 session notes.', icon: NotebookPen, color: '#8a7bc4', target: 10, measure: (s) => s.history.filter((h) => h.note).length },
  { id: 'well-rested', title: 'Well Rested', desc: 'Finish 10 breaks.', icon: Coffee, color: '#8a9a5b', target: 10, measure: (s) => s.breaksTaken ?? 0 },
];

export const evaluate = (state) =>
  ACHIEVEMENTS.map((a) => {
    const value = Math.min(a.target, a.measure(state));
    return { ...a, value, done: Boolean(state.achievements[a.id]) || value >= a.target, unlockedAt: state.achievements[a.id] ?? null };
  });

export const formatProgress = (a) => {
  if (a.unit === 'min') return t('{a} / {b} h', { a: Math.floor(a.value / 60), b: a.target / 60 });
  if (a.unit === 'coins') return `${num(a.value)} / ${num(a.target)}`;
  if (a.unit === 'days') return t('{a} / {b} days', { a: a.value, b: a.target });
  if (a.unit === 'era') return t('Era {a} / {b}', { a: a.value, b: a.target });
  return `${a.value} / ${a.target}`;
};
