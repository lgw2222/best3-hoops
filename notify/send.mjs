// Best of 3 Hoops — notification sender. Run by GitHub Actions every ~10 minutes.
// Reads the league database, works out what's new for each device that turned on alerts, and sends a push.
// Needs two repository secrets: VAPID_PUBLIC and VAPID_PRIVATE (from the setup notes).
import webpush from 'web-push';

const DB = process.env.DB_URL || 'https://dynasty-draft-4934f-default-rtdb.firebaseio.com/best3hoops';
const SITE = 'https://lgw2222.github.io/best3-hoops/';
const LEAGUE_NAMES = { main: 'Best of 3 Hoops', dyn: 'Dynasty (our rules)', 'm-dyn': 'New Dynasty League', 'm-other': 'The Other League', 'm-espn': 'Bronny James (ESPN)' };
const ELIG = { PG:['PG'], SG:['SG'], SF:['SF'], PF:['PF'], C:['C'], G:['PG','SG'], F:['SF','PF'], 'SG/SF':['SG','SF'], 'G/F':['PG','SG','SF','PF'], 'PF/C':['PF','C'], 'F/C':['SF','PF','C'], UTIL:null };

if (!process.env.VAPID_PUBLIC || !process.env.VAPID_PRIVATE) { console.log('VAPID secrets missing — add them in GitHub → Settings → Secrets → Actions'); process.exit(0); }
webpush.setVapidDetails(SITE, process.env.VAPID_PUBLIC, process.env.VAPID_PRIVATE);

const get = async (path) => { const r = await fetch(`${DB}/${path}.json`); if (!r.ok) throw new Error(path + ' ' + r.status); return r.json(); };
const patch = (path, body) => fetch(`${DB}/${path}.json`, { method: 'PATCH', body: JSON.stringify(body) });
const del = (path) => fetch(`${DB}/${path}.json`, { method: 'DELETE' });
const etDate = (d = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d).replace(/-/g, '');
const hourIn = (tz) => { try { return +new Intl.DateTimeFormat('en-US', { timeZone: tz || 'America/Chicago', hour: 'numeric', hourCycle: 'h23' }).format(new Date()); } catch { return new Date().getHours(); } };
const quietNow = (q, tz) => { if (!q || !q.on) return false; const h = hourIn(tz), f = q.from ?? 23, t = q.to ?? 8; return f === t ? false : f < t ? (h >= f && h < t) : (h >= f || h < t); };
const eligible = (slot, pos) => { const e = ELIG[slot]; if (!e) return true; return String(pos || '').split(/[\/,-]/).some(p => e.includes(p.trim())); };
const tn = (L, t) => (L.teams && L.teams[t] && L.teams[t].name) || t;
const pname = (L, t, pid) => (L.rosters && L.rosters[t] && L.rosters[t][pid] && L.rosters[t][pid].name) || 'A player';

const subs = (await get('push')) || {};
const state = (await get('pushstate')) || {};
const ids = Object.keys(subs);
if (!ids.length) { console.log('no devices signed up'); process.exit(0); }

// load every league someone follows
const leagues = {};
for (const id of ids) for (const lg of Object.keys(subs[id].leagues || {})) leagues[lg] = null;
for (const lg of Object.keys(leagues)) { try { leagues[lg] = await get('leagues/' + lg); } catch (e) { console.log('league', lg, e.message); } }

// today's NBA games (for lineup reminders)
const today = etDate();
let teamsToday = new Set(), firstTip = null;
try {
  const sb = await (await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=' + today)).json();
  for (const ev of sb.events || []) {
    const tip = Date.parse(ev.date); if (!firstTip || tip < firstTip) firstTip = tip;
    for (const c of (ev.competitions?.[0]?.competitors) || []) teamsToday.add(c.team.abbreviation);
  }
} catch (e) { console.log('scoreboard', e.message); }
const minsToTip = firstTip ? (firstTip - Date.now()) / 60000 : null;

// injury statuses for every rostered player we follow (ESPN ids are numeric)
const followed = new Set();
for (const id of ids) for (const [lg, t] of Object.entries(subs[id].leagues || {})) { const L = leagues[lg]; if (L && L.rosters && L.rosters[t]) Object.keys(L.rosters[t]).forEach(p => /^\d+$/.test(p) && followed.add(+p)); }
const inj = {};
if (followed.size) {
  try {
    const Y = new Date().getMonth() >= 6 ? new Date().getFullYear() + 1 : new Date().getFullYear();
    const all = [...followed];
    for (let i = 0; i < all.length; i += 50) {   // ESPN answers in pages; ask 50 players at a time
      const r = await fetch(`https://lm-api-reads.fantasy.espn.com/apis/v3/games/fba/seasons/${Y}/players?scoringPeriodId=0&view=kona_player_info`, { headers: { 'X-Fantasy-Filter': JSON.stringify({ filterIds: { value: all.slice(i, i + 50) } }) } });
      const list = await r.json(); if (!Array.isArray(list)) continue;
      for (const p of list) inj[String(p.id)] = p.injuryStatus && p.injuryStatus !== 'ACTIVE' ? p.injuryStatus.replace(/_/g, ' ').toLowerCase() : 'healthy';
    }
  } catch (e) { console.log('injuries', e.message); }
}

const newState = {};
let sent = 0;
for (const id of ids) {
  const sub = subs[id], prefs = sub.prefs || {}, quiet = quietNow(sub.quiet, sub.tz);
  const msgs = [];          // {title, body, lg, tag}
  const st = JSON.parse(JSON.stringify(state[id] || {}));
  for (const [lg, t] of Object.entries(sub.leagues || {})) {
    const L = leagues[lg]; if (!L || !L.teams || !L.teams[t]) continue;
    const s = st[lg] || null, n = { log: 0, trades: {}, claims: {}, inj: {}, week: 0, lineupDay: s ? s.lineupDay || '' : '' };
    const lname = LEAGUE_NAMES[lg] || (L.settings && L.settings.name) || lg;
    // league log (all moves)
    const logs = Object.values(L.log || {}).filter(x => x && x.ts).sort((a, b) => a.ts - b.ts);
    n.log = logs.length ? logs[logs.length - 1].ts : 0;
    // trades
    for (const [tid, tr] of Object.entries(L.trades || {})) {
      if (tr.from !== t && tr.to !== t) continue;
      n.trades[tid] = tr.status;
      const was = s && s.trades ? s.trades[tid] : undefined;
      if (!s || was === tr.status) continue;
      const other = tn(L, tr.from === t ? tr.to : tr.from);
      if (tr.status === 'pending' && tr.to === t && !was) msgs.push({ k: 'trades', lg, title: `Trade offer from ${other}`, body: `${lname}: review it in Trades.`, tag: 'trade-' + tid });
      else if (tr.status === 'accepted') msgs.push({ k: 'trades', lg, title: 'Trade accepted ✅', body: `${lname}: your trade with ${other} went through.`, tag: 'trade-' + tid });
      else if (tr.status === 'review') msgs.push({ k: 'trades', lg, title: 'Trade accepted — under review', body: `${lname}: your trade with ${other} is in league review.`, tag: 'trade-' + tid });
      else if (tr.status === 'rejected' && tr.from === t) msgs.push({ k: 'trades', lg, title: 'Trade declined', body: `${lname}: ${other} turned down your offer.`, tag: 'trade-' + tid });
      else if (tr.status === 'vetoed') msgs.push({ k: 'trades', lg, title: 'Trade vetoed', body: `${lname}: the league vetoed your trade with ${other}.`, tag: 'trade-' + tid });
    }
    // waiver claims
    for (const [cid, c] of Object.entries(L.claims || {})) {
      if (c.team !== t) continue;
      n.claims[cid] = c.status;
      const was = s && s.claims ? s.claims[cid] : undefined;
      if (!s || was === c.status || !['won', 'lost'].includes(c.status)) continue;
      const who = (c.status === 'won' ? pname(L, t, c.pid) : null) || 'your player';
      msgs.push({ k: 'waivers', lg, title: c.status === 'won' ? 'Waiver claim won 🎉' : 'Waiver claim lost', body: `${lname}: ${c.status === 'won' ? who + ' is on your team.' : 'another team had priority.'}`, tag: 'claim-' + cid });
    }
    // all league moves
    if (s && prefs.moves) { const fresh = logs.filter(x => x.ts > (s.log || 0)); if (fresh.length) msgs.push({ k: 'moves', lg, title: `${lname}: ${fresh.length} new move${fresh.length > 1 ? 's' : ''}`, body: fresh.slice(-3).map(x => x.text).join(' · ').slice(0, 220), tag: 'moves-' + lg }); }
    // injuries on your roster
    for (const pid of Object.keys(L.rosters?.[t] || {})) {
      if (!(pid in inj)) continue; n.inj[pid] = inj[pid];
      const was = s && s.inj ? s.inj[pid] : undefined;
      if (s && was && was !== inj[pid]) msgs.push({ k: 'injury', lg, title: `${pname(L, t, pid)}: ${inj[pid]}`, body: `${lname}: was ${was}.${inj[pid] !== 'healthy' ? ' You may want to adjust your lineup.' : ''}`, tag: 'inj-' + pid });
    }
    // weekly results
    const weeks = Object.keys(L.results || {}).map(k => +k.slice(1)).filter(Boolean);
    n.week = weeks.length ? Math.max(...weeks) : 0;
    if (s) for (const w of weeks.filter(w => w > (s.week || 0)).sort((a, b) => a - b)) {
      const me = L.results['w' + w][t]; if (!me) continue; const op = L.results['w' + w][me.opp] || { pts: 0 };
      const res = me.pts > op.pts ? 'W' : me.pts < op.pts ? 'L' : 'T';
      msgs.push({ k: 'final', lg, title: `Week ${w} final: ${res === 'W' ? 'you won! 🏆' : res === 'L' ? 'tough loss' : 'a tie'}`, body: `${lname}: ${tn(L, t)} ${me.pts} – ${op.pts} ${tn(L, me.opp)}`, tag: `final-${lg}-${w}` });
    }
    // lineup reminder: once a day, in the 2 hours before the first tip (not for mirrors or autopilot)
    if (s && !L.settings?.mirror && !L.teams[t].autopilot && L.draft?.status === 'done' && minsToTip !== null && minsToTip > 0 && minsToTip <= 120 && s.lineupDay !== today) {
      const days = Object.keys(L.lineups?.[t] || {}).filter(k => k[0] === 'd' && k.slice(1) <= today).sort();
      const lu = days.length ? L.lineups[t][days[days.length - 1]] : null;
      const slots = L.settings?.slots || [], ros = L.rosters?.[t] || {};
      if (lu) {
        const starters = new Set(Object.values(lu)), plays = pid => ros[pid] && teamsToday.has(ros[pid].team);
        const idle = [], empty = [];
        slots.forEach((sl, i) => { const pid = lu[i]; if (!pid || !ros[pid]) empty.push(sl); else if (!plays(pid)) idle.push({ sl, pid }); });
        const bench = Object.keys(ros).filter(p => !starters.has(p) && !ros[p].ir && plays(p));
        const fixable = bench.filter(b => [...idle.map(x => x.sl), ...empty].some(sl => eligible(sl, ros[b].pos)));
        if (fixable.length) {
          const a = idle.slice(0, 2).map(x => ros[x.pid].name).join(', ');
          msgs.push({ k: 'lineup', lg, title: 'Set your lineup ⏰', body: `${lname}: ${idle.length ? `${a}${idle.length > 2 ? ' +' + (idle.length - 2) : ''} ${idle.length > 1 ? "don't" : "doesn't"} play today` : empty.length + ' empty spot' + (empty.length > 1 ? 's' : '')} — ${fixable.slice(0, 2).map(p => ros[p].name).join(', ')} on your bench ${fixable.length > 1 ? 'do' : 'does'}. First tip in ${Math.round(minsToTip)} min.`, tag: `lineup-${lg}-${today}` });
        }
        n.lineupDay = today;
      }
    }
    st[lg] = n;
  }
  const out = msgs.filter(m => prefs[m.k]);
  if (quiet && out.length) { newState[id] = state[id] || null; console.log(id, 'quiet hours — holding', out.length); continue; }   // keep the old state so it sends after quiet hours
  const toSend = out.length > 4 ? [{ title: `${out.length} Best of 3 updates`, body: out.slice(0, 4).map(m => m.title).join(' · '), lg: out[0].lg, tag: 'batch' }] : out;
  let gone = false;
  for (const m of toSend) {
    if (process.env.DRY) { console.log('WOULD SEND', m.title, '|', m.body); sent++; continue; }   // test mode
    try {
      await webpush.sendNotification(sub.sub, JSON.stringify({ title: m.title, body: m.body, tag: m.tag, url: SITE + (m.lg === 'main' ? '' : '?league=' + m.lg) }), { TTL: 6 * 3600 });
      sent++;
    } catch (e) { if (e.statusCode === 404 || e.statusCode === 410) { gone = true; break; } console.log(id, 'send failed', e.statusCode || e.message); }
  }
  if (gone) { await del('push/' + id); await del('pushstate/' + id); console.log(id, 'expired — removed'); continue; }
  newState[id] = st;
}
const upd = {}; for (const [id, v] of Object.entries(newState)) if (v) upd[id] = v;
if (Object.keys(upd).length) await patch('pushstate', upd);
console.log(`devices ${ids.length}, sent ${sent}`);
