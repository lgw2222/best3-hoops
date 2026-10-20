# Best of 3 Hoops — PROJECT.md

Fantasy basketball site where **each starter's best 3 games per week count** (the cap follows the player, not the position). Single-file HTML app (`index.html`) for GitHub Pages, with Firebase for shared league data and live ESPN data.

- **Live URL (after upload):** https://lgw2222.github.io/best3-hoops/
- **Sandbox (private test league, this device only):** https://lgw2222.github.io/best3-hoops/?demo=1
- **Version:** v1.5 (2026-10-20) — multiple leagues on one site (switcher in the header, `?league=<id>`): main; `dyn` = copy of Sleeper "The New Dynasty League" rosters, run here with our rules; read-only mirrors `m-dyn`, `m-other` (Sleeper 1402115472383549440), `m-espn` (ESPN 199278, must stay "viewable to public"). Mirrors sync rosters/adds/drops/IR, lineups (ESPN daily via mRoster&scoringPeriodId, Sleeper weekly starters recorded per day), matchups, every 5 min while open. Sleeper players matched to ESPN ids by name (fallback: ESPN players_wl list). Team start limit default = auto (starters × games per player). v1.4 (2026-10-16) — team login with per-team PIN (teams/tX/pin hash; only on the online league, sandbox keeps the team switcher), read-only view of other teams, commish can reset PINs; My Team: clicking a name opens the player card, separate Swap menu. v1.3: team start limit per week (settings.teamStarts, 0 = off; a game uses a start only if it adds to the total, maxed players swap better games in free), waivers default 2 days. v1.2: My Team Schedule / Stats / Both toggle (Mon–Sun opponent grid, last 7/15/30 stat windows), no-game-day banner. v1.1: real NBA schedule preloaded

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
