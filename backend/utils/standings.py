"""
Compute the full 20-team Brasileirão 2026 standings.
Atlético Mineiro uses real match results.
Other 19 teams get deterministic simulated results per match_day.
"""

TEAMS = [
    "atletico-mg", "flamengo", "palmeiras", "botafogo",
    "fluminense", "corinthians", "sao-paulo", "internacional", "gremio", "cruzeiro",
    "vasco", "bragantino", "santos", "bahia", "athletico-pr",
    "vitoria", "mirassol", "coritiba",
    "chapecoense", "remo",
]

STRENGTH = {
    "atletico-mg": 5, "flamengo": 5, "palmeiras": 5, "botafogo": 5,
    "fluminense": 4, "corinthians": 4, "sao-paulo": 4, "internacional": 4, "gremio": 4, "cruzeiro": 4,
    "vasco": 3, "bragantino": 3, "santos": 3, "bahia": 3, "athletico-pr": 3,
    "vitoria": 2, "mirassol": 2, "coritiba": 2,
    "chapecoense": 1, "remo": 1,
}

OPPONENT_ORDER = [
    "chapecoense", "remo",
    "coritiba", "mirassol", "vitoria",
    "athletico-pr", "bahia", "santos", "bragantino", "vasco",
    "cruzeiro", "internacional", "gremio", "sao-paulo", "corinthians",
    "fluminense",
    "botafogo", "palmeiras", "flamengo",
]


def _seeded_int(seed: int, lo: int, hi: int) -> int:
    v = (seed * 1103515245 + 12345) & 0x7FFFFFFF
    return lo + (v % (hi - lo + 1))


def _simulate_result(team_a: str, team_b: str, match_day: int):
    seed = hash(f"{team_a}{team_b}{match_day}") & 0x7FFFFFFF
    str_a = STRENGTH.get(team_a, 3)
    str_b = STRENGTH.get(team_b, 3)
    g_a = _seeded_int(seed, max(0, str_a - 2), str_a)
    g_b = _seeded_int(seed ^ 0xDEAD, max(0, str_b - 2), str_b)
    return g_a, g_b


def compute_standings(real_matches: list[dict]) -> list[dict]:
    records = {t: {"played": 0, "wins": 0, "draws": 0, "losses": 0,
                   "gf": 0, "ga": 0, "pts": 0} for t in TEAMS}

    played_days = set()
    for m in real_matches:
        day = m["match_day"]
        played_days.add(day)
        opp = m["opponent_id"]
        _apply(records["atletico-mg"], m["cam_goals"], m["opp_goals"])
        if opp in records:
            _apply(records[opp], m["opp_goals"], m["cam_goals"])

    for day in sorted(played_days):
        idx = (day - 1) % len(OPPONENT_ORDER)
        cam_opp = OPPONENT_ORDER[idx]
        others = [t for t in TEAMS if t not in ("atletico-mg", cam_opp)]
        shuffled = _det_shuffle(others, (day * 31337) & 0x7FFFFFFF)
        for i in range(0, len(shuffled) - 1, 2):
            a, b = shuffled[i], shuffled[i + 1]
            ga, gb = _simulate_result(a, b, day)
            _apply(records[a], ga, gb)
            _apply(records[b], gb, ga)

    def sort_key(team_id):
        r = records[team_id]
        return (-r["pts"], -(r["gf"] - r["ga"]), -r["gf"], team_id)

    sorted_teams = sorted(TEAMS, key=sort_key)
    result = []
    for pos, team_id in enumerate(sorted_teams, 1):
        r = records[team_id]
        result.append({
            "team_id": team_id,
            "position": pos,
            "played": r["played"],
            "wins": r["wins"],
            "draws": r["draws"],
            "losses": r["losses"],
            "goals_for": r["gf"],
            "goals_against": r["ga"],
            "goal_difference": r["gf"] - r["ga"],
            "points": r["pts"],
        })
    return result


def _apply(rec: dict, gf: int, ga: int):
    rec["played"] += 1
    rec["gf"] += gf
    rec["ga"] += ga
    if gf > ga:
        rec["wins"] += 1
        rec["pts"] += 3
    elif gf == ga:
        rec["draws"] += 1
        rec["pts"] += 1
    else:
        rec["losses"] += 1


def _det_shuffle(lst: list, seed: int) -> list:
    result = list(lst)
    for i in range(len(result) - 1, 0, -1):
        seed = (seed * 1103515245 + 12345) & 0x7FFFFFFF
        j = seed % (i + 1)
        result[i], result[j] = result[j], result[i]
    return result
