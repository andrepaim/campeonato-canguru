from pydantic import BaseModel
from typing import Literal, Any


class MatchCreate(BaseModel):
    match_day: int
    date: str               # YYYY-MM-DD
    opponent_id: str
    cam_goals: int
    opp_goals: int
    result: Literal["W", "D", "L"]
    points: int
    answers: list[Any] = []  # raw JSON from frontend


class MatchOut(BaseModel):
    id: int
    match_day: int
    date: str
    opponent_id: str
    cam_goals: int
    opp_goals: int
    result: str
    points: int
    answers: list[Any]
    created_at: str


class TeamStanding(BaseModel):
    team_id: str
    position: int
    played: int
    wins: int
    draws: int
    losses: int
    goals_for: int
    goals_against: int
    goal_difference: int
    points: int


class AppState(BaseModel):
    match_day: int
    last_played_date: str | None
    used_question_ids: list[str]
