"""Unit tests for standings computation and scheduling logic."""
import pytest
from utils.standings import compute_standings, TEAMS, OPPONENT_ORDER, _simulate_result


# ── compute_standings ─────────────────────────────────────────────────────────

def test_empty_matches_all_zeros():
    result = compute_standings([])
    assert len(result) == 20
    for s in result:
        assert s["played"] == 0
        assert s["points"] == 0


def test_cam_win_updates_cam_record():
    matches = [{
        "match_day": 1,
        "opponent_id": "cuiaba",
        "cam_goals": 3,
        "opp_goals": 0,
        "result": "W",
    }]
    standings = compute_standings(matches)
    cam = next(s for s in standings if s["team_id"] == "atletico-mg")
    assert cam["wins"] == 1
    assert cam["goals_for"] == 3
    assert cam["goals_against"] == 0
    assert cam["points"] == 3


def test_cam_loss_updates_cam_record():
    matches = [{
        "match_day": 1,
        "opponent_id": "flamengo",
        "cam_goals": 0,
        "opp_goals": 2,
        "result": "L",
    }]
    standings = compute_standings(matches)
    cam = next(s for s in standings if s["team_id"] == "atletico-mg")
    assert cam["losses"] == 1
    assert cam["points"] == 0


def test_cam_draw_updates_record():
    matches = [{
        "match_day": 1,
        "opponent_id": "palmeiras",
        "cam_goals": 1,
        "opp_goals": 1,
        "result": "D",
    }]
    standings = compute_standings(matches)
    cam = next(s for s in standings if s["team_id"] == "atletico-mg")
    assert cam["draws"] == 1
    assert cam["points"] == 1


def test_opponent_record_is_mirror_of_cam():
    matches = [{
        "match_day": 1,
        "opponent_id": "cuiaba",
        "cam_goals": 3,
        "opp_goals": 1,
        "result": "W",
    }]
    standings = compute_standings(matches)
    cuiaba = next(s for s in standings if s["team_id"] == "cuiaba")
    assert cuiaba["losses"] == 1
    assert cuiaba["goals_for"] == 1
    assert cuiaba["goals_against"] == 3
    assert cuiaba["points"] == 0


def test_standings_always_has_20_teams():
    for n in range(5):
        matches = [{"match_day": i + 1, "opponent_id": OPPONENT_ORDER[i],
                    "cam_goals": 2, "opp_goals": 0, "result": "W"}
                   for i in range(n)]
        result = compute_standings(matches)
        assert len(result) == 20


def test_standings_positions_are_1_to_20():
    result = compute_standings([])
    positions = [s["position"] for s in result]
    assert sorted(positions) == list(range(1, 21))


def test_standings_sorted_desc_by_points():
    matches = [
        {"match_day": 1, "opponent_id": "cuiaba",   "cam_goals": 3, "opp_goals": 0, "result": "W"},
        {"match_day": 2, "opponent_id": "criciuma",  "cam_goals": 2, "opp_goals": 2, "result": "D"},
        {"match_day": 3, "opponent_id": "flamengo",  "cam_goals": 0, "opp_goals": 2, "result": "L"},
    ]
    standings = compute_standings(matches)
    pts = [s["points"] for s in standings]
    assert pts == sorted(pts, reverse=True)


def test_goal_difference_computed_correctly():
    matches = [{"match_day": 1, "opponent_id": "cuiaba",
                "cam_goals": 5, "opp_goals": 1, "result": "W"}]
    standings = compute_standings(matches)
    cam = next(s for s in standings if s["team_id"] == "atletico-mg")
    assert cam["goal_difference"] == 4


def test_multiple_matches_accumulate():
    matches = [
        {"match_day": 1, "opponent_id": "cuiaba",   "cam_goals": 2, "opp_goals": 0, "result": "W"},
        {"match_day": 2, "opponent_id": "criciuma",  "cam_goals": 1, "opp_goals": 0, "result": "W"},
        {"match_day": 3, "opponent_id": "juventude", "cam_goals": 0, "opp_goals": 1, "result": "L"},
    ]
    standings = compute_standings(matches)
    cam = next(s for s in standings if s["team_id"] == "atletico-mg")
    assert cam["played"] == 3
    assert cam["wins"] == 2
    assert cam["losses"] == 1
    assert cam["points"] == 6
    assert cam["goals_for"] == 3
    assert cam["goals_against"] == 1


def test_simulation_is_deterministic():
    """Same inputs always produce same standings."""
    matches = [{"match_day": 1, "opponent_id": "cuiaba", "cam_goals": 2, "opp_goals": 0, "result": "W"}]
    s1 = compute_standings(matches)
    s2 = compute_standings(matches)
    assert s1 == s2


# ── Opponent scheduling ───────────────────────────────────────────────────────

def test_opponent_order_has_19_teams():
    assert len(OPPONENT_ORDER) == 19
    assert "atletico-mg" not in OPPONENT_ORDER


def test_opponent_order_all_unique():
    assert len(set(OPPONENT_ORDER)) == len(OPPONENT_ORDER)


def test_all_non_cam_teams_in_rotation():
    non_cam = [t for t in TEAMS if t != "atletico-mg"]
    assert set(OPPONENT_ORDER) == set(non_cam)


# ── Simulation sanity ─────────────────────────────────────────────────────────

def test_simulate_result_returns_non_negative():
    for day in range(1, 20):
        ga, gb = _simulate_result("flamengo", "palmeiras", day)
        assert ga >= 0
        assert gb >= 0


def test_simulate_result_deterministic():
    r1 = _simulate_result("flamengo", "palmeiras", 5)
    r2 = _simulate_result("flamengo", "palmeiras", 5)
    assert r1 == r2


def test_simulate_result_varies_by_day():
    results = {_simulate_result("flamengo", "palmeiras", d) for d in range(1, 20)}
    assert len(results) > 1  # Not all the same
