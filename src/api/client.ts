const BASE = "";  // same-origin

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const r = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(`${method} ${path} → ${r.status}`);
  return r.json();
}

export interface MatchPayload {
  match_day: number;
  date: string;
  opponent_id: string;
  cam_goals: number;
  opp_goals: number;
  result: "W" | "D" | "L";
  points: number;
  answers: unknown[];
}

export interface MatchRecord extends MatchPayload {
  id: number;
  created_at: string;
}

export interface TeamStanding {
  team_id: string;
  position: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

export interface AppState {
  match_day: number;
  last_played_date: string | null;
  used_question_ids: string[];
}

export const getState = () => req<AppState>("GET", "/api/state");
export const getMatches = () => req<MatchRecord[]>("GET", "/api/matches");
export const getStandings = () => req<TeamStanding[]>("GET", "/api/standings");
export const saveMatch = (payload: MatchPayload) =>
  req<MatchRecord>("POST", "/api/matches", payload);
