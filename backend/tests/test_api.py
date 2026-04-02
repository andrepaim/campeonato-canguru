"""
API tests for Campeonato Canguru backend.
Uses a temp SQLite DB so tests are fully isolated.
"""
import json
import os
import tempfile
import pytest
from fastapi.testclient import TestClient


# ── Patch DB path BEFORE importing app ─────────────────────────────────────────
@pytest.fixture(autouse=True, scope="session")
def temp_db():
    tmp = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
    tmp.close()
    os.environ["CAMPEONATO_TEST_DB"] = tmp.name
    yield tmp.name
    os.unlink(tmp.name)


# Patch database.py to use test DB
import database
from pathlib import Path

@pytest.fixture(autouse=True, scope="session")
def patch_db(temp_db):
    database.DB_PATH = Path(temp_db)


from main import app

@pytest.fixture(scope="session")
def client(temp_db, patch_db):
    database.init_db()
    with TestClient(app) as c:
        yield c


# ── Health ─────────────────────────────────────────────────────────────────────

def test_status(client):
    r = client.get("/status")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


# ── Initial state (empty DB) ───────────────────────────────────────────────────

def test_initial_state(client):
    r = client.get("/api/state")
    assert r.status_code == 200
    body = r.json()
    assert body["match_day"] == 1
    assert body["last_played_date"] is None
    assert body["used_question_ids"] == []


def test_initial_matches_empty(client):
    r = client.get("/api/matches")
    assert r.status_code == 200
    assert r.json() == []


def test_initial_standings_all_zeros(client):
    r = client.get("/api/standings")
    assert r.status_code == 200
    standings = r.json()
    assert len(standings) == 20
    for s in standings:
        assert s["played"] == 0
        assert s["points"] == 0


# ── POST /api/matches ─────────────────────────────────────────────────────────

MATCH_1 = {
    "match_day": 1,
    "date": "2026-03-23",
    "opponent_id": "chapecoense",
    "cam_goals": 4,
    "opp_goals": 1,
    "result": "W",
    "points": 3,
    "answers": [{"questionId": "2025-E-01", "answer": "A", "isCorrect": True}],
}


def test_create_match(client):
    r = client.post("/api/matches", json=MATCH_1)
    assert r.status_code == 201
    body = r.json()
    assert body["match_day"] == 1
    assert body["cam_goals"] == 4
    assert body["opp_goals"] == 1
    assert body["result"] == "W"
    assert body["points"] == 3
    assert body["id"] >= 1
    assert isinstance(body["answers"], list)


def test_duplicate_match_day_rejected(client):
    r = client.post("/api/matches", json=MATCH_1)
    assert r.status_code == 400
    assert "already played" in r.json()["detail"]


def test_list_matches_after_create(client):
    r = client.get("/api/matches")
    assert r.status_code == 200
    matches = r.json()
    assert len(matches) == 1
    assert matches[0]["match_day"] == 1
    assert matches[0]["result"] == "W"


# ── State after first match ───────────────────────────────────────────────────

def test_state_after_match(client):
    r = client.get("/api/state")
    body = r.json()
    assert body["match_day"] == 2       # incremented
    assert body["last_played_date"] == "2026-03-23"
    assert "2025-E-01" in body["used_question_ids"]


# ── Standings after CAM win ───────────────────────────────────────────────────

def test_standings_cam_has_points(client):
    r = client.get("/api/standings")
    standings = r.json()
    cam = next(s for s in standings if s["team_id"] == "atletico-mg")
    assert cam["played"] == 1
    assert cam["wins"] == 1
    assert cam["draws"] == 0
    assert cam["losses"] == 0
    assert cam["goals_for"] == 4
    assert cam["goals_against"] == 1
    assert cam["goal_difference"] == 3
    assert cam["points"] == 3


def test_standings_opponent_has_loss(client):
    r = client.get("/api/standings")
    standings = r.json()
    cuiaba = next(s for s in standings if s["team_id"] == "chapecoense")
    assert cuiaba["played"] == 1
    assert cuiaba["losses"] == 1
    assert cuiaba["goals_for"] == 1
    assert cuiaba["goals_against"] == 4


def test_standings_sorted_by_points(client):
    r = client.get("/api/standings")
    standings = r.json()
    points = [s["points"] for s in standings]
    assert points == sorted(points, reverse=True)


def test_standings_positions_sequential(client):
    r = client.get("/api/standings")
    standings = r.json()
    positions = [s["position"] for s in standings]
    assert positions == list(range(1, 21))


def test_cam_is_first_after_win(client):
    r = client.get("/api/standings")
    standings = r.json()
    # CAM won, should be at or near the top
    cam = next(s for s in standings if s["team_id"] == "atletico-mg")
    assert cam["position"] <= 5   # with only 1 match, many teams simulated


# ── Second match — draw ───────────────────────────────────────────────────────

MATCH_2 = {
    "match_day": 2,
    "date": "2026-03-24",
    "opponent_id": "criciuma",
    "cam_goals": 2,
    "opp_goals": 2,
    "result": "D",
    "points": 1,
    "answers": [],
}


def test_create_second_match(client):
    r = client.post("/api/matches", json=MATCH_2)
    assert r.status_code == 201
    body = r.json()
    assert body["result"] == "D"
    assert body["points"] == 1


def test_cam_standings_after_two_matches(client):
    r = client.get("/api/standings")
    standings = r.json()
    cam = next(s for s in standings if s["team_id"] == "atletico-mg")
    assert cam["played"] == 2
    assert cam["wins"] == 1
    assert cam["draws"] == 1
    assert cam["losses"] == 0
    assert cam["points"] == 4   # 3 + 1


def test_state_after_two_matches(client):
    r = client.get("/api/state")
    body = r.json()
    assert body["match_day"] == 3
    assert body["last_played_date"] == "2026-03-24"


# ── Third match — loss ────────────────────────────────────────────────────────

MATCH_3 = {
    "match_day": 3,
    "date": "2026-03-25",
    "opponent_id": "flamengo",
    "cam_goals": 0,
    "opp_goals": 3,
    "result": "L",
    "points": 0,
    "answers": [],
}


def test_create_loss(client):
    r = client.post("/api/matches", json=MATCH_3)
    assert r.status_code == 201
    assert r.json()["result"] == "L"
    assert r.json()["points"] == 0


def test_cam_has_loss(client):
    r = client.get("/api/standings")
    standings = r.json()
    cam = next(s for s in standings if s["team_id"] == "atletico-mg")
    assert cam["losses"] == 1
    assert cam["points"] == 4   # unchanged from before


# ── Validation ────────────────────────────────────────────────────────────────

def test_invalid_result_rejected(client):
    r = client.post("/api/matches", json={**MATCH_1, "match_day": 99, "result": "X"})
    assert r.status_code == 422


def test_missing_required_fields(client):
    r = client.post("/api/matches", json={"match_day": 50})
    assert r.status_code == 422


def test_all_20_teams_in_standings(client):
    r = client.get("/api/standings")
    standings = r.json()
    assert len(standings) == 20
    team_ids = {s["team_id"] for s in standings}
    expected = {
        "atletico-mg", "flamengo", "palmeiras", "corinthians", "fluminense",
        "botafogo", "sao-paulo", "internacional", "gremio", "athletico-pr",
        "cruzeiro", "vasco", "bahia", "santos", "bragantino",
        "chapecoense", "mirassol", "coritiba", "vitoria", "remo",
    }
    assert team_ids == expected
