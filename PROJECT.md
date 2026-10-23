# Best of 3 Hoops — PROJECT.md

Fantasy basketball site where **each starter's best 3 games per week count** (the cap follows the player, not the position). Single-file HTML app (`index.html`) for GitHub Pages, with Firebase for shared league data and live ESPN data.

- **Live URL (after upload):** https://lgw2222.github.io/best3-hoops/
- **Sandbox (private test league, this device only):** https://lgw2222.github.io/best3-hoops/?demo=1
- **Version:** v1.10 (2026-10-22) — Start planner on My Team (planWeek/planDay/plannerCard): tag players Core (always use max starts) / Spot (fill leftover team starts, best FP/G first) / none, for every week (teams/tX/roles) or this week only (teams/tX/wroles/wN); calculator tiles (team starts, used, core need, spot starts, left over) + bar + per-day planned starters vs lineup spots + warnings (core over limit, starts that won't fit); Suggest roles; "Apply plan" and new auto mode "Follow my start plan" (also works with Autopilot). v1.9.5 (2026-10-22) — My Team on phones: stats for the chosen window shown under each name (FP/G, pts, reb, ast, stl, blk, to, min, gp) instead of cut-off columns, player column full width in Stats view; "Sort: …" picker (and tap a stat header on desktop) sorts the bench by that stat, sorted stat highlighted; side-by-side matchup + FantasyCast show short names on phones (D. Lillard); empty-slot rows no longer add blank columns. v1.9.4 (2026-10-22) — basketball logo from v1.9.3 reverted at Garrott's request (original "3" logo + original icons kept). FantasyCast is side by side too (castSBS(): one row per lineup spot, both teams' players with live game status, stat line, today's FP chips and week pts; team totals + today/playing/left in the header row; bench below). v1.9.3 (2026-10-21) — new basketball logo (inline SVG ball with seams and a hand-drawn 3, same on every device) in the sidebar + phone header; new app icons (icon-192/512, maskable, apple-touch) rendered from it. v1.9.2 (2026-10-21) — score strip (ticker) moved to its own full-width row under the header on every screen size: this week's matchup scores (yours highlighted), then today's top 5 scorers, then the week's top 5 (best-3 points); ESPN add-trend items removed; hidden on Home. v1.9.1 (2026-10-20) — full audit (13 tabs + player card at 1440, 820, 390, 360 wide: no sideways scroll anywhere). Fixes: Tri-Cup stuck loading in sandbox (render inside render); phone/tablet bottom bar = Scores, Live, My Team, Players + More sheet; ticker on its own row on phones; matchup header stacks names over score on phones; player-card close button pinned; bigger tap targets; side-by-side matchup capped at 980px on desktop; Tri-Cup empty state. v1.9 (2026-10-20) — Scoreboard matchups open ESPN-app style side by side (sideBySide(): one row per lineup spot, team A player | week pts | slot | week pts | team B player, today's game or FP under each name, best-3 chips, day pills, bench + total). Built on the live v1.8.1. v1.8.1 (2026-10-20) — phone layout for My Team: slot + player columns pinned while the day grid scrolls, today's game and week pts under each name, Today/Started games/Week pts/Pos/Team columns hidden on phones (≤700px), "How lineups work" collapsible, day pills scroll in one row, auto-set buttons in a 2-up grid, phones default to the Schedule view. sw cache b3h-v4. v1.8 (2026-10-20) — Home screen (no ?league= in the address): swipeable league cards like the ESPN app (your team + record per league, sync status) plus a Tri-Cup card; "🏠 Home" in the league switcher. Main league is now ?league=main. v1.7.3 (2026-10-20) — app manifest renamed to b3h-app.webmanifest (new id) so Android treats it as a new app; old manifest.webmanifest removed. v1.7.2 (2026-10-20) — manifest gets an explicit app id so Android installs it fresh (old stuck "already installed" record ignored). v1.7.1 (2026-10-20) — Settings: "Unlock — enter commissioner PIN" button right on the view-only banner; disabled controls look disabled. v1.7 (2026-10-20) — ESPN-style MOVE/HERE lineup buttons; installable app (manifest.webmanifest, sw.js, icons) + Alerts tab with push notifications (lineup reminders, trades, waivers, injuries, weekly results, all moves; quiet hours). Subscriptions at best3hoops/push/{id}, sender state at best3hoops/pushstate; sender = notify/send.mjs run by .github/workflows/notify.yml every 10 min (secrets VAPID_PUBLIC/VAPID_PRIVATE). Finished weeks' scores saved to leagues/{id}/results/w{n} (standings use them). See SETUP-NOTIFICATIONS.md. v1.6.1 (2026-10-20) — settings rows wrap long notes so every dropdown stays on screen; mobile header wraps (league switcher no longer pushes the page wider). v1.6 (2026-10-20) — Tri-Cup tab: one combined W-L per manager across the 3 real leagues (m-dyn, m-other, m-espn), toggle Real records (Sleeper roster settings / ESPN record.overall) vs Best-3 records (each mirror writes `cup` = its best-3 standings on sync). Same Sleeper account auto-joins; ESPN teams linked by the commissioner (saved at best3hoops/tricup/{link,names}). v1.5 (2026-10-20) — multiple leagues on one site (switcher in the header, `?league=<id>`): main; `dyn` = copy of Sleeper "The New Dynasty League" rosters, run here with our rules; read-only mirrors `m-dyn`, `m-other` (Sleeper 1402115472383549440), `m-espn` (ESPN 199278, must stay "viewable to public"). Mirrors sync rosters/adds/drops/IR, lineups (ESPN daily via mRoster&scoringPeriodId, Sleeper weekly starters recorded per day), matchups, every 5 min while open. Sleeper players matched to ESPN ids by name (fallback: ESPN players_wl list). Team start limit default = auto (starters × games per player). v1.4 (2026-10-16) — team login with per-team PIN (teams/tX/pin hash; only on the online league, sandbox keeps the team switcher), read-only view of other teams, commish can reset PINs; My Team: clicking a name opens the player card, separate Swap menu. v1.3: team start limit per week (settings.teamStarts, 0 = off; a game uses a start only if it adds to the total, maxed players swap better games in free), waivers default 2 days. v1.2: My Team Schedule / Stats / Both toggle (Mon–Sun opponent grid, last 7/15/30 stat windows), no-game-day banner. v1.1: real NBA schedule preloaded

## Files
| File | What it is |
|---|---|
| `index.html` | The whole site (HTML + CSS + JS in one file) |
| `.nojekyll` | Tells GitHub Pages to serve files as-is |
| `PROJECT.md` | This handoff doc |

## Data
- **League data:** Firebase Realtime Database, project `dynasty-draft-4934f`, everything under `best3hoops/` only (`best3hoops/leagues/main`, `best3hoops/backups/main`). Doesn't touch the dynasty draft data.
- **Backups:** checkpoint every 12 h and before big changes (auto-draft, undo, trades, restore, delete, new season), each device keeps its own copy, download/restore backup file in League tab.
- **ESPN (works from GitHub Pages, verified 2026-10-14):**
  - Player list: `lm-api-reads.fantasy.espn.com/apis/v3/games/fba/seasons/{2027}/players?view=kona_player_info` + `X-Fantasy-Filter` (ranks, ADP, % rostered + weekly change, positions, injuries, projections, last season, last 7/15/30, outlooks)
  - Rosters: `site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/{1-30}/roster`
  - Scores / box scores: `.../nba/scoreboard?dates=YYYYMMDD`, `.../nba/summary?event=ID`
  - Full season schedule: `site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/{1-30}/schedule?season=2027&seasontype=2` (used for test weeks, games-this-week, opponents, tip times; cached 24 h)
  - Game logs: `site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes/{id}/gamelog?season=YYYY`
  - Headshots: `a.espncdn.com/i/headshots/nba/players/full/{id}.png`
  - Blocked from GitHub Pages: `.../nba/teams` (team list) — don't use it.
  - ESPN team abbreviations: NO, NY, UTAH, WSH.
- The Claude file preview can't reach ESPN/Firebase — always test on GitHub Pages.

## Default league settings (from ESPN league 199278 "Bronny James") — all editable in Settings tab
8 teams · H2H points (PTS 1, FGM 1, REB 1, AST 1, STL 1, BLK 1, TO -1, DD 5, TD 10) · best 3 games per player per week · roster 15 (PG SG SF PF C G F UTIL×3 + 5 bench) + 4 IR · daily lineups, lock at each player's tip-off · waivers 1 day, move-to-last order, 7 adds/matchup · trades: 2-day review, 4 veto votes, no deadline · snake draft, 30 s/pick · 19 weeks + 4-team playoffs (2-week rounds, 2-week final), consolation · league type Redraft (Keeper/Dynasty available).

## Features
Draft room (clock, auto-pick, manual order), Mock Draft vs CPU, daily lineups + schedule-aware auto-set/autopilot, Scoreboard with best-3 chips, FantasyCast (live), player cards (ESPN photo, stats, last 7/15/30, last season, projection, outlook, game logs), Players tab with ESPN add/drop trends, waivers/claims, IR, trades with review + veto votes, standings + playoff bracket, Sim Lab (sim clock, best-3 calculator), keeper/dynasty season rollover, commissioner PIN, install-as-app.

## First-time setup
1. Upload this folder's contents to a new GitHub repo `best3-hoops` (Pages Launcher) and turn on Pages.
2. Open the live URL → Create league → League tab → Commissioner mode → create your PIN.
3. If saves fail with "permission denied", Firebase rules for `dynasty-draft-4934f` need `best3hoops` read/write.

## Next steps / ideas
- Team logins (each manager claims a team) instead of "Acting as".
- Push notifications (lineup reminders, waiver results).
- Verify ESPN last-7/15/30 splits and +/- once the season starts (Oct 20).


## Leagues (v1.5)
| id | what | source |
|---|---|---|
| main | Best of 3 Hoops (our league) | — |
| dyn | Dynasty, our rules — rosters copied once, then managed here (login, own matchups) | Sleeper 1416329086271320064 |
| m-dyn | Mirror (read-only) | Sleeper 1416329086271320064 |
| m-other | Mirror (read-only) | Sleeper 1402115472383549440 |
| m-espn | Mirror (read-only) | ESPN fba 199278 |

APIs (all readable from lgw2222.github.io): api.sleeper.app/v1/league/{id}[/rosters|/users|/matchups/{w}], /v1/state/nba, /v1/players/nba (~2.5MB, memory only); ESPN lm-api-reads .../segments/0/leagues/199278?view=mTeam&view=mRoster&view=mSettings&view=mMatchup, daily lineups with &scoringPeriodId=N (day 1 = 2026-10-20). ESPN lineupSlotId: 0 PG 1 SG 2 SF 3 PF 4 C 5 G 6 F 11 UTIL 12 BE 13 IR.
Known limits: Sleeper only exposes the current week's starters, so a day's lineup is recorded when someone has the site open; mirrors cap playoffs at 4 teams (Sleeper leagues use 6).
