import type { TeamStanding, Match } from '../types';
import { teams } from '../data/teams';

export function calculateGoals(_timeMs: number, isCorrect: boolean): number {
  return isCorrect ? 1 : 0;
}

export function simulateOpponentGoals(seed: number): number {
  // Weighted distribution: 0,1,1,1,2,2,2,3
  const outcomes = [0, 1, 1, 1, 2, 2, 2, 3];
  const index = Math.abs(seed) % outcomes.length;
  return outcomes[index];
}

export function calculateResult(home: number, away: number): { result: 'W' | 'D' | 'L'; points: number } {
  if (home > away) return { result: 'W', points: 3 };
  if (home === away) return { result: 'D', points: 1 };
  return { result: 'L', points: 0 };
}

export function initStandings(teamsList: typeof teams): TeamStanding[] {
  return teamsList.map((team, index) => ({
    teamId: team.id,
    position: index + 1,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
  }));
}

export function updateStandings(standings: TeamStanding[], match: Match): TeamStanding[] {
  return standings.map(standing => {
    if (standing.teamId !== 'atletico-mg') return standing;

    return {
      ...standing,
      played: standing.played + 1,
      wins: standing.wins + (match.result === 'W' ? 1 : 0),
      draws: standing.draws + (match.result === 'D' ? 1 : 0),
      losses: standing.losses + (match.result === 'L' ? 1 : 0),
      goalsFor: standing.goalsFor + match.camGoals,
      goalsAgainst: standing.goalsAgainst + match.opponentGoals,
      goalDifference: standing.goalsFor + match.camGoals - (standing.goalsAgainst + match.opponentGoals),
      points: standing.points + match.points,
    };
  });
}

// Seeded random for simulation
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

export function simulateRound(standings: TeamStanding[], matchDay: number): TeamStanding[] {
  // Get all teams except CAM
  const otherTeams = standings.filter(s => s.teamId !== 'atletico-mg');

  // Simulate matches between pairs of other teams
  const updatedStandings = [...standings];

  for (let i = 0; i < otherTeams.length; i += 2) {
    if (i + 1 >= otherTeams.length) break;

    const team1Id = otherTeams[i].teamId;
    const team2Id = otherTeams[i + 1].teamId;

    // Generate pseudo-random goals based on seed
    const seed1 = matchDay * 1000 + i * 100 + 1;
    const seed2 = matchDay * 1000 + i * 100 + 2;

    const goals1 = Math.floor(seededRandom(seed1) * 4); // 0-3 goals
    const goals2 = Math.floor(seededRandom(seed2) * 4); // 0-3 goals

    // Update team 1
    const idx1 = updatedStandings.findIndex(s => s.teamId === team1Id);
    if (idx1 !== -1) {
      const result1 = calculateResult(goals1, goals2);
      updatedStandings[idx1] = {
        ...updatedStandings[idx1],
        played: updatedStandings[idx1].played + 1,
        wins: updatedStandings[idx1].wins + (result1.result === 'W' ? 1 : 0),
        draws: updatedStandings[idx1].draws + (result1.result === 'D' ? 1 : 0),
        losses: updatedStandings[idx1].losses + (result1.result === 'L' ? 1 : 0),
        goalsFor: updatedStandings[idx1].goalsFor + goals1,
        goalsAgainst: updatedStandings[idx1].goalsAgainst + goals2,
        goalDifference: updatedStandings[idx1].goalsFor + goals1 - (updatedStandings[idx1].goalsAgainst + goals2),
        points: updatedStandings[idx1].points + result1.points,
      };
    }

    // Update team 2
    const idx2 = updatedStandings.findIndex(s => s.teamId === team2Id);
    if (idx2 !== -1) {
      const result2 = calculateResult(goals2, goals1);
      updatedStandings[idx2] = {
        ...updatedStandings[idx2],
        played: updatedStandings[idx2].played + 1,
        wins: updatedStandings[idx2].wins + (result2.result === 'W' ? 1 : 0),
        draws: updatedStandings[idx2].draws + (result2.result === 'D' ? 1 : 0),
        losses: updatedStandings[idx2].losses + (result2.result === 'L' ? 1 : 0),
        goalsFor: updatedStandings[idx2].goalsFor + goals2,
        goalsAgainst: updatedStandings[idx2].goalsAgainst + goals1,
        goalDifference: updatedStandings[idx2].goalsFor + goals2 - (updatedStandings[idx2].goalsAgainst + goals1),
        points: updatedStandings[idx2].points + result2.points,
      };
    }
  }

  // Sort standings by points, then goal difference, then goals for
  return updatedStandings
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    })
    .map((standing, index) => ({
      ...standing,
      position: index + 1,
    }));
}
