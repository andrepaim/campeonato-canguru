# CLAUDE.md — Campeonato Canguru

## Architecture

Full-stack app: React SPA + FastAPI + SQLite. Same-origin: frontend served by FastAPI at port 3202.

**Live:** https://campeonatocanguru.duckdns.org  
**Service:** `campeonato-canguru.service`  
**Backend root:** `/root/campeonato-canguru/`  
**Frontend dist:** `/root/campeonato-canguru/dist/`  
**DB:** `/root/campeonato-canguru/data/campeonato.db`  
**Apache vhost:** `/etc/apache2/conf.d/includes/pre_virtualhost_campeonato.conf`  
**Team badges:** `/var/www/rotinadoatleticano/campeonato/teams/` (symlinked via static mount)

## Deploy

```bash
bash /home/andrepaim/campeonato-canguru/deploy.sh
```

Builds frontend, rsyncs to `/root/campeonato-canguru/dist/`, restarts service. Preserves icons + manifest.

After deploy, always copy icons manually:
```bash
cp /var/www/rotinadoatleticano/campeonato/icon-*.png /root/campeonato-canguru/dist/
cp /var/www/rotinadoatleticano/campeonato/apple-touch-icon.png /root/campeonato-canguru/dist/
cp /var/www/rotinadoatleticano/campeonato/favicon.png /root/campeonato-canguru/dist/
```

Or better: update deploy.sh to copy them automatically.

## Key Patterns

### Frontend → API flow
- `HomePage`: calls `GET /api/state` on mount to get `match_day`, `last_played_date`, `used_question_ids`
- `HomePage`: stores `matchDay` in `sessionStorage` before navigating to `/match`
- `MatchPage`: reads `sessionStorage` for `matchDay`, calls `POST /api/matches` after Q6
- `MatchPage`: uses `buildMatchPayload()` from the store to construct the API payload
- `ResultPage`: calls `GET /api/matches` to display the last saved match
- `StandingsPage`, `HistoryPage`, `MiniStandings`: all fetch from API

### Zustand store (ephemeral only)
- `useChampionshipStore` holds in-progress match state only — no persistence
- `startMatch(opponentId, questions, matchDay)` — initializes current match
- `submitAnswer(qId, answer, timeMs)` — updates score, returns goals scored
- `skipQuestion(qId)` — advances without scoring
- `clearMatch()` — called after `POST /api/matches` succeeds
- `buildMatchPayload(state, matchDay)` — utility to construct API payload

### Question selection
`selectMatchQuestions(allQuestions, matchDay, usedIds, opponentStrength)`
- Strength 1: [6, 0, 0] (all easy)
- Strength 2: [4, 2, 0]
- Strength 3: [2, 3, 1]
- Strength 4: [1, 2, 3]
- Strength 5: [0, 2, 4] (mostly hard — Palmeiras, Flamengo)
- Seeded shuffle ensures same questions if page reloaded same day

### Standings computation (server-side)
`backend/utils/standings.py`:
- CAM = real results from DB
- Other 19 teams = `_simulate_result(team_a, team_b, match_day)` — deterministic, seeded on team names + day
- Each match_day: CAM plays its real opponent, remaining 18 teams pair up and play simulated fixtures
- Sorting: points DESC, goal_difference DESC, goals_for DESC, team_id ASC

### Opponent scheduling
`OPPONENT_ORDER` in `src/data/schedule.ts` and `backend/utils/standings.py` — **must be identical**.
19 teams ordered weakest→strongest. `getOpponentForMatchDay(day)` = `OPPONENT_ORDER[(day-1) % 19]`.
38 total rounds (2 passes through the list).

## API Endpoints

All under `/api/`:

| Endpoint | Notes |
|---|---|
| `GET /api/state` | Derived from DB: next match_day = MAX(match_day)+1, used_ids from answers JSON |
| `GET /api/matches` | Ordered by match_day ASC |
| `POST /api/matches` | 400 if match_day already exists (prevents double-play) |
| `GET /api/standings` | Computed on every request (fast — pure Python, no SQL joins) |

## Known Gotchas

- **Team badges:** served from `/var/www/rotinadoatleticano/campeonato/teams/` via FastAPI `StaticFiles` mount at `/teams`. If rotinadoatleticano deploy wipes that dir, badges break. Consider moving badges to `/root/campeonato-canguru/`.
- **sessionStorage for matchDay:** MatchPage reads `sessionStorage.getItem("matchDay")`. If user navigates to `/match` directly (e.g. bookmarked), it defaults to `1`. Guard: redirect to `/` if store has no `currentMatch`.
- **One match per day:** enforced in `POST /api/matches` (duplicate match_day → 400) AND in frontend (`lastPlayedDate === today` check). Both needed.
- **Questions source:** `https://rotinadoatleticano.duckdns.org/canguru/questions.json` — cross-origin fetch from frontend. If that server is down, match won't start.

## Tests

```bash
cd /root/campeonato-canguru/backend
python3 -m pytest tests/ -v
# 38 tests, ~0.8s
```

- `tests/test_api.py` — full API flow with isolated temp DB
- `tests/test_standings.py` — standings logic, scheduling, simulation unit tests

## Adding New Features

**New API endpoint:** add to `backend/routers/matches.py`, include router already in `main.py`.

**New frontend page:** add to `src/pages/`, add route in `src/App.tsx`, add nav link in `src/App.tsx` bottom nav.

**Change question distribution:** edit `DIFFICULTY_MIX` in `src/utils/questions.ts`.

**Change opponent order:** edit `OPPONENT_ORDER` in BOTH `src/data/schedule.ts` AND `backend/utils/standings.py` — they must match.
