import { TeamBadge } from '../components/TeamBadge';
import { useEffect, useState } from 'react';
import { getStandings } from '../api/client';
import type { TeamStanding } from '../api/client';
import { getTeamById } from '../data/teams';

export default function StandingsPage() {
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStandings().then(setStandings).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4 text-gray-400 animate-pulse">Carregando tabela...</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-white mb-4">Classificação</h1>
      <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
        <div className="grid grid-cols-[2rem_auto_2rem_2rem_2rem_2rem_2rem_2rem_2rem_3rem] gap-1 px-2 py-2 bg-gray-800 text-xs text-gray-400 font-semibold">
          <span className="text-center">#</span>
          <span>Time</span>
          <span className="text-center">P</span>
          <span className="text-center">V</span>
          <span className="text-center">E</span>
          <span className="text-center">D</span>
          <span className="text-center">GP</span>
          <span className="text-center">GC</span>
          <span className="text-center">SG</span>
          <span className="text-center font-bold">Pts</span>
        </div>
        {standings.map((s) => {
          const team = getTeamById(s.team_id);
          const isCAM = s.team_id === 'atletico-mg';
          const posColor = s.position <= 4 ? 'text-blue-400' : s.position >= 17 ? 'text-red-400' : 'text-gray-400';
          return (
            <div key={s.team_id}
              className={`grid grid-cols-[2rem_auto_2rem_2rem_2rem_2rem_2rem_2rem_2rem_3rem] gap-1 px-2 py-2 text-sm border-t border-gray-800 items-center ${isCAM ? 'bg-yellow-900/20 border-l-2 border-l-galo-gold' : ''}`}>
              <span className={`text-center font-bold ${posColor}`}>{s.position}</span>
              <div className="flex items-center gap-2 min-w-0">
                <TeamBadge teamId={s.team_id} size="xs" />
                <span className={`truncate text-xs ${isCAM ? 'text-galo-gold font-bold' : 'text-white'}`}>{team?.shortName}</span>
              </div>
              <span className="text-center text-gray-400 text-xs">{s.played}</span>
              <span className="text-center text-green-400 text-xs">{s.wins}</span>
              <span className="text-center text-yellow-400 text-xs">{s.draws}</span>
              <span className="text-center text-red-400 text-xs">{s.losses}</span>
              <span className="text-center text-gray-400 text-xs">{s.goals_for}</span>
              <span className="text-center text-gray-400 text-xs">{s.goals_against}</span>
              <span className="text-center text-gray-400 text-xs">{s.goal_difference >= 0 ? '+' : ''}{s.goal_difference}</span>
              <span className={`text-center font-bold ${isCAM ? 'text-galo-gold' : 'text-white'}`}>{s.points}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
