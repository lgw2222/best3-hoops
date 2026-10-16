# Best of 3 Hoops — PROJECT.md

Fantasy basketball site where **each starter's best 3 games per week count** (the cap follows the player, not the position). Single-file HTML app (`index.html`) for GitHub Pages, with Firebase for shared league data and live ESPN data.

- **Live URL (after upload):** https://lgw2222.github.io/best3-hoops/
- **Sandbox (private test league, this device only):** https://lgw2222.github.io/best3-hoops/?demo=1
- **Version:** v1.3 (2026-10-15) — team start limit per week (settings.teamStarts, 0 = off; a game uses a start only if it adds to the total, maxed players swap better games in free), waivers default 2 days. v1.2: My Team Schedule / Stats / Both toggle (Mon–Sun opponent grid, last 7/15/30 stat windows), no-game-day banner. v1.1: real NBA schedule preloaded

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
