import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Copy, Gift, Medal, Send, UserPlus, UserRound } from 'lucide-react';
import { useStore, useDerived, placedIn, normalizeCode, INVITE_REWARD, WELCOME_REWARD } from '../../state/store';
import { ERAS, eraById, eraForMinutes } from '../../data/eras';
import { getProfiles, lookupFriend, isValidCode, inviteMessage } from '../../lib/social';
import { copyText, shareText } from '../../lib/clipboard';
import { fmtHours } from '../../lib/feedback';
import { resolveAtmosphere } from '../../lib/atmosphere';
import Room from '../Room';
import { BananaCoin, Button, ConfirmSheet, LargeTitle, Segmented, Sheet } from '../ui';
import { num, t, tp } from '../../i18n';

/** Loads friend profiles through the social service (async, so a real API can slot in). */
function useProfiles(codes) {
  const [profiles, setProfiles] = useState([]);
  const key = codes.join(',');
  useEffect(() => {
    let live = true;
    getProfiles(codes).then((p) => live && setProfiles(p));
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return profiles;
}

const RANGES = [
  { value: 'today', label: 'Today', key: 'todayMinutes' },
  { value: 'week', label: 'This Week', key: 'weekMinutes' },
  { value: 'all', label: 'All Time', key: 'totalMinutes' },
];

export default function FriendsView({ notify }) {
  const { state } = useStore();
  const { todayMinutes, weekMinutes } = useDerived();
  const [range, setRange] = useState('week');
  const [visit, setVisit] = useState(null);
  const [inviting, setInviting] = useState(false);
  const profiles = useProfiles(state.friends.map((f) => f.code));
  const hasSamples = state.friends.some((f) => f.sample);

  const me = {
    code: state.myCode, me: true,
    name: state.profile?.mode === 'local' && state.profile.name ? state.profile.name : t('You'),
    petName: state.petName, eraId: eraForMinutes(state.focusMinutes).id,
    todayMinutes, weekMinutes, totalMinutes: state.focusMinutes, sessions: state.sessions,
  };
  const key = RANGES.find((r) => r.value === range).key;
  const board = useMemo(() => [me, ...profiles].sort((a, b) => b[key] - a[key]), [profiles, key, me.todayMinutes, me.weekMinutes, me.totalMinutes]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="pb-6">
      <LargeTitle title={t('Friends')} subtitle={t('Focus is better together')} />

      <div className="px-4 mt-2"><CodeCard onInvite={() => setInviting(true)} notify={notify} /></div>
      <div className="px-4 mt-4"><AddFriendCard notify={notify} /></div>

      {/* Leaderboard */}
      <section className="px-4 mt-7" aria-label={t('Leaderboard')}>
        <div className="flex items-end justify-between px-1">
          <h2 className="t-title2">{t('Leaderboard')}</h2>
          <span className="t-footnote text-label2">{t('by focus time')}</span>
        </div>
        <Segmented className="mt-3" value={range} onChange={setRange} options={RANGES.map((r) => ({ ...r, label: t(r.label) }))} />
        <ol className="card mt-3 overflow-hidden">
          {board.map((p, i) => (
            <li key={p.code}>
              <button onClick={() => !p.me && setVisit(p)} disabled={p.me}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left ${i < board.length - 1 ? 'hairline-b' : ''} ${p.me ? 'bg-[color-mix(in_srgb,var(--tint)_9%,transparent)]' : 'active:bg-fill2'}`}>
                <Rank n={i + 1} />
                <Avatar name={p.name} eraId={p.eraId} me={p.me} />
                <span className="flex-1 min-w-0">
                  <span className="block t-subhead font-semibold truncate">{p.name}{p.me && <span className="text-label2 font-normal"> {t('(you)')}</span>}</span>
                  <span className="block t-caption text-label2 truncate">{p.petName} · {t(eraById(p.eraId).name)}</span>
                </span>
                <span className="t-subhead font-semibold tabular shrink-0">{fmtHours(p[key])}</span>
              </button>
            </li>
          ))}
        </ol>
      </section>

      {/* Friends' rooms */}
      <section className="px-4 mt-7" aria-label={t('Your friends')}>
        <div className="flex items-end justify-between px-1">
          <h2 className="t-title2">{t('Visit a Room')}</h2>
          <span className="t-footnote text-label2 tabular">{tp(profiles.length, '{n} friend', '{n} friends')}</span>
        </div>
        {profiles.length === 0 ? (
          <div className="card p-5 mt-3 text-center">
            <p className="t-subhead font-semibold">{t('No friends yet')}</p>
            <p className="t-footnote text-label2 mt-1">{t('Add a friend code above, or invite someone with yours.')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5 mt-3">
            {profiles.map((p) => (
              <button key={p.code} onClick={() => setVisit(p)} className="pressable card !rounded-[24px] overflow-hidden text-left">
                <div className="aspect-[6/5]"><Room era={eraById(p.eraId)} placed={p.placed} outfit={p.outfit} /></div>
                <div className="p-3 pt-2.5 flex items-center gap-2">
                  <span className="flex-1 min-w-0">
                    <span className="block t-subhead font-semibold truncate">{p.petName}</span>
                    <span className="block t-caption text-label2 truncate">{t('{name}’s marmoset', { name: p.name })}{p.sample ? ` · ${t('Sample')}` : ''}</span>
                  </span>
                  <ChevronRight size={16} className="text-label3 shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}
        {hasSamples && <p className="t-footnote text-label2 px-1 mt-3">{t('Sample friends show how the leaderboard and rooms look. Remove them from their room page anytime.')}</p>}
      </section>

      <FriendRoomSheet profile={visit} onClose={() => setVisit(null)} notify={notify} />
      <InviteSheet open={inviting} onClose={() => setInviting(false)} notify={notify} />
    </div>
  );
}

function Rank({ n }) {
  const medal = { 1: '#e3b341', 2: '#b8bcc6', 3: '#c98a5a' }[n];
  return medal
    ? <span className="grid place-items-center w-7 h-7 rounded-full shrink-0" style={{ background: `color-mix(in srgb, ${medal} 22%, transparent)`, color: medal }}><Medal size={16} strokeWidth={2.4} /></span>
    : <span className="w-7 text-center t-subhead font-semibold text-label2 tabular shrink-0">{n}</span>;
}

function Avatar({ name, eraId, me }) {
  const era = eraById(eraId);
  return (
    <span className="grid place-items-center w-10 h-10 rounded-full text-white font-rounded font-bold shrink-0"
      style={{ background: `linear-gradient(160deg, color-mix(in srgb, ${era.tint.light} 60%, #fff), ${era.tint.light})` }}>
      {me && name === t('You') ? <UserRound size={18} /> : name[0]?.toUpperCase()}
    </span>
  );
}

function CodeCard({ onInvite, notify }) {
  const { state } = useStore();
  const code = state.myCode ?? '';
  return (
    <section className="card-tinted p-5" aria-label={t('Your friend code')}>
      <p className="t-footnote font-semibold text-label2 uppercase tracking-[.4px]">{t('Your friend code')}</p>
      <div className="flex items-center justify-between gap-3 mt-1.5">
        <span className="font-rounded text-[30px] font-bold tracking-[.12em] tabular select-all">{code}</span>
        <button onClick={async () => notify({ text: (await copyText(code)) ? t('Code copied') : t('Your code: {code}', { code }), icon: <Copy size={15} className="text-tint" /> })}
          className="pressable grid place-items-center w-11 h-11 rounded-full bg-bg2 text-tint shadow-sm" aria-label={t('Copy friend code')}>
          <Copy size={18} />
        </button>
      </div>
      <div className="flex items-center gap-2.5 mt-4 p-3 rounded-[16px] bg-bg2/70">
        <Gift size={20} className="text-tint shrink-0" />
        <p className="t-footnote flex-1">{t('Get {a} Banana Coins for every friend who joins with your code. They get {b}.', { a: INVITE_REWARD, b: WELCOME_REWARD })}</p>
      </div>
      <Button className="w-full mt-4" onClick={onInvite}><Send size={18} />{t('Invite Friends')}</Button>
      {state.referrals.length > 0 && <p className="t-footnote text-label2 text-center mt-2">{t('{n} joined with your code · +{coins} coins earned', { n: state.referrals.length, coins: num(state.referrals.length * INVITE_REWARD) })}</p>}
    </section>
  );
}

function AddFriendCard({ notify }) {
  const { state, dispatch } = useStore();
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState(null);
  const [redeem, setRedeem] = useState(false);
  const clean = normalizeCode(code);

  const submit = async (e) => {
    e.preventDefault();
    if (!isValidCode(clean)) return setMsg({ bad: true, text: t('Friend codes are 5–8 letters and numbers, like LUNA42.') });
    if (clean === state.myCode) return setMsg({ bad: true, text: t('That’s your own code. Share it with a friend instead.') });
    if (state.friends.some((f) => f.code === clean)) return setMsg({ bad: true, text: t('You’re already friends.') });
    const p = await lookupFriend(clean);
    if (!p) return setMsg({ bad: true, text: t('No player found with that code.') });
    if (redeem) {
      dispatch({ type: 'invite/redeem', code: clean });
      notify({ text: t('+{n} welcome coins', { n: WELCOME_REWARD }), icon: <BananaCoin size={18} /> });
      setRedeem(false);
    } else {
      dispatch({ type: 'friend/add', code: clean });
      notify({ text: t('{name} added', { name: p.name }), icon: <UserPlus size={16} className="text-tint" /> });
    }
    setMsg({ bad: false, text: t('{name} and {pet} are now your friends.', { name: p.name, pet: p.petName }) });
    setCode('');
  };

  return (
    <section className="card p-5" aria-label={t('Add a friend')}>
      <h2 className="t-headline">{redeem ? t('Redeem an invite code') : t('Add a friend')}</h2>
      <form onSubmit={submit} className="mt-3 flex items-center gap-2">
        <label htmlFor="friend-code" className="sr-only">{t('Friend code')}</label>
        <input id="friend-code" value={code} onChange={(e) => { setCode(e.target.value); setMsg(null); }} placeholder={t('Friend code')} autoCapitalize="characters" autoComplete="off"
          className="flex-1 min-w-0 h-11 rounded-[14px] bg-bg3 px-3.5 t-body font-semibold tracking-[.08em] uppercase outline-none focus:ring-2 focus:ring-tint placeholder:normal-case placeholder:tracking-normal placeholder:font-normal" />
        <Button type="submit" className="!h-11 !rounded-[14px] !px-4" disabled={!clean}>{redeem ? t('Redeem') : t('Add')}</Button>
      </form>
      {msg && <p className={`t-footnote mt-2 ${msg.bad ? 'text-danger' : 'text-success'}`} role="status">{msg.text}</p>}
      {!state.redeemedInvite && (
        <button onClick={() => { setRedeem(!redeem); setMsg(null); }} className="pressable t-footnote font-semibold text-tint mt-3">
          {redeem ? t('Just add a friend instead') : t('Were you invited? Redeem a code for {n} coins', { n: WELCOME_REWARD })}
        </button>
      )}
    </section>
  );
}

function FriendRoomSheet({ profile: p, onClose, notify }) {
  const { state, dispatch } = useStore();
  const [ask, setAsk] = useState(null);
  if (!p) return null;
  const era = eraById(p.eraId);
  const stats = [
    { label: t('Today'), value: fmtHours(p.todayMinutes) },
    { label: t('This week'), value: fmtHours(p.weekMinutes) },
    { label: t('Total'), value: fmtHours(p.totalMinutes) },
  ];
  return (
    <Sheet open onClose={onClose} title={t('{name}’s Room', { name: p.name })}>
      <div className="px-4">
        <div className="relative rounded-[28px] overflow-hidden aspect-[6/5] shadow-[var(--float-shadow)]">
          <Room era={era} placed={p.placed} outfit={p.outfit} atmosphere={resolveAtmosphere(state.atmosphere)} />
          <span className="absolute left-3 top-3 h-8 px-3 rounded-full bg-black/35 text-white backdrop-blur-md t-subhead font-semibold flex items-center">{p.petName}</span>
          <span className="absolute right-3 top-3 h-8 px-3 rounded-full bg-black/35 text-white backdrop-blur-md t-footnote font-semibold flex items-center">{t('Era {n}', { n: ERAS.indexOf(era) + 1 })} · {t(era.name)}</span>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {stats.map((s) => (
            <div key={s.label} className="card !rounded-[20px] px-3 py-3">
              <p className="t-caption text-label2">{s.label}</p>
              <p className="t-headline tabular mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>
        <p className="t-footnote text-label2 mt-4 px-1">
          {t('{name} has finished {sessions} sessions over {days} days.', { name: p.name, sessions: p.sessions, days: p.joinedDays })} {t('Friend code')} <span className="font-semibold tabular tracking-[.06em]">{p.code}</span>{p.sample ? ` · ${t('sample friend')}` : ''}.
        </p>
        <Button variant="gray" className="w-full mt-5 !text-danger" onClick={() => setAsk({
          title: t('Remove {name}?', { name: p.name }), message: t('You can add them again with their code.'), action: t('Remove Friend'),
          onConfirm: () => { dispatch({ type: 'friend/remove', code: p.code }); notify({ text: t('{name} removed', { name: p.name }) }); onClose(); },
        })}>{t('Remove Friend')}</Button>
      </div>
      <ConfirmSheet request={ask} onClose={() => setAsk(null)} />
    </Sheet>
  );
}

function InviteSheet({ open, onClose, notify }) {
  const { state } = useStore();
  const text = inviteMessage(state.myCode ?? '', state.petName);
  const share = async () => {
    if (await shareText(text)) return;
    notify({ text: (await copyText(text)) ? t('Invite copied — paste it anywhere') : t('Select the message to copy it'), icon: <Copy size={15} className="text-tint" /> });
  };
  return (
    <Sheet open={open} onClose={onClose} title={t('Invite Friends')} detent="medium">
      <div className="px-4">
        <div className="card p-4">
          <p className="t-subhead select-all">{text}</p>
        </div>
        <p className="t-footnote text-label2 mt-3 px-1">{t('When a friend joins and enters {code}, you get {a} Banana Coins and they get {b}.', { code: state.myCode, a: INVITE_REWARD, b: WELCOME_REWARD })}</p>
        <Button className="w-full mt-5" onClick={share}><Send size={18} />{t('Share Invite')}</Button>
        <Button variant="gray" className="w-full mt-2" onClick={async () => notify({ text: (await copyText(text)) ? t('Invite copied') : t('Select the message to copy it'), icon: <Copy size={15} className="text-tint" /> })}>
          <Copy size={18} />{t('Copy Message')}
        </Button>
      </div>
    </Sheet>
  );
}
