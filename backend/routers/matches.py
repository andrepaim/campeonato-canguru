import json
from fastapi import APIRouter, HTTPException
from database import db
from models import MatchCreate, MatchOut, TeamStanding, AppState
from utils.standings import compute_standings, OPPONENT_ORDER

router = APIRouter(prefix="/api", tags=["matches"])


def _row_to_match(row) -> dict:
    d = dict(row)
    d["answers"] = json.loads(d["answers"]) if d["answers"] else []
    return d


@router.get("/matches", response_model=list[MatchOut])
def list_matches():
    with db() as conn:
        rows = conn.execute(
            "SELECT * FROM matches ORDER BY match_day ASC"
        ).fetchall()
    return [_row_to_match(r) for r in rows]


@router.post("/matches", response_model=MatchOut, status_code=201)
def create_match(match: MatchCreate):
    with db() as conn:
        # Prevent duplicate match_day
        existing = conn.execute(
            "SELECT id FROM matches WHERE match_day = ?", (match.match_day,)
        ).fetchone()
        if existing:
            raise HTTPException(400, f"Match day {match.match_day} already played")

        cur = conn.execute(
            """INSERT INTO matches (match_day, date, opponent_id, cam_goals, opp_goals,
               result, points, answers)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                match.match_day, match.date, match.opponent_id,
                match.cam_goals, match.opp_goals, match.result, match.points,
                json.dumps(match.answers),
            ),
        )
        row = conn.execute(
            "SELECT * FROM matches WHERE id = ?", (cur.lastrowid,)
        ).fetchone()
    return _row_to_match(row)


@router.get("/standings", response_model=list[TeamStanding])
def get_standings():
    with db() as conn:
        rows = conn.execute(
            "SELECT match_day, opponent_id, cam_goals, opp_goals, result FROM matches"
        ).fetchall()
    real_matches = [dict(r) for r in rows]
    standings = compute_standings(real_matches)
    return standings


@router.get("/state", response_model=AppState)
def get_state():
    with db() as conn:
        last = conn.execute(
            "SELECT match_day, date, answers FROM matches ORDER BY match_day DESC LIMIT 1"
        ).fetchone()
        all_answers = conn.execute("SELECT answers FROM matches").fetchall()

    if last is None:
        return AppState(match_day=1, last_played_date=None, used_question_ids=[])

    next_day = last["match_day"] + 1
    last_date = last["date"]

    used_ids: list[str] = []
    for row in all_answers:
        try:
            answers = json.loads(row["answers"]) if row["answers"] else []
            for a in answers:
                if isinstance(a, dict) and "questionId" in a:
                    used_ids.append(a["questionId"])
        except Exception:
            pass

    return AppState(
        match_day=next_day,
        last_played_date=last_date,
        used_question_ids=used_ids,
    )


@router.get("/questions")
async def proxy_questions():
    """Proxy Canguru questions from rotinadoatleticano to avoid CORS."""
    import httpx
    async with httpx.AsyncClient() as client:
        r = await client.get(
            "https://rotinadoatleticano.duckdns.org/canguru/questions.json",
            timeout=15
        )
        r.raise_for_status()
        return r.json()
