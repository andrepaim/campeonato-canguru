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

  // Columns: # | Team badge+name | V | E | D | SG | Pts
  // grid: pos(2rem) | team(auto) | V(2rem) | E(2rem) | D(2rem) | SG(2.5rem) | Pts(2.5rem)
  const gridCols = 'grid-cols-[1.8rem_auto_2rem_2rem_2rem_2.5rem_2.5rem]';

  return (
    <div className="p-4 pb-24">
      <h1 className="text-xl font-bold text-white mb-4">Classificação</h1>
      <div className="rounded-xl overflow-hidden border border-gray-800">
        {/* Header */}
        <div className={`grid ${gridCols} gap-1 px-2 py-2 bg-gray-800 text-xs text-gray-400 font-semibold`}>
          <span className="text-center">#</span>
          <span className="pl-1">Time</span>
          <span className="text-center text-green-400">V</span>
          <span className="text-center text-yellow-400">E</span>
          <span className="text-center text-red-400">D</span>
          <span className="text-center">SG</span>
          <span className="text-center font-bold text-white">Pts</span>
        </div>

        {standings.map((s) => {
          const team = getTeamById(s.team_id);
          const isCAM = s.team_id === 'atletico-mg';
          const posColor =
            s.position <= 5 ? 'text-blue-400' :
            s.position <= 8 ? 'text-green-400' :
            s.position >= 17 ? 'text-red-400' :
            'text-gray-500';

          return (
            <div
              key={s.team_id}
              className={`grid ${gridCols} gap-1 px-2 py-2 border-t border-gray-800/50 items-center text-xs
                ${isCAM ? 'bg-yellow-900/20 border-l-2 border-l-yellow-400' : 'bg-gray-900'}`}
            >
              <span className={`text-center font-bold text-xs ${posColor}`}>{s.position}</span>

              <div className="flex items-center gap-1.5 min-w-0 pl-0.5">
                <TeamBadge teamId={s.team_id} size="xs" className="shrink-0" />
                <span className={`truncate font-medium ${isCAM ? 'text-yellow-400' : 'text-white'}`}>
                  {team?.shortName}
                </span>
              </div>

              <span className="text-center text-green-400">{s.wins}</span>
              <span className="text-center text-yellow-400">{s.draws}</span>
              <span className="text-center text-red-400">{s.losses}</span>
              <span className={`text-center ${s.goal_difference > 0 ? 'text-green-400' : s.goal_difference < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                {s.goal_difference > 0 ? '+' : ''}{s.goal_difference}
              </span>
              <span className={`text-center font-bold ${isCAM ? 'text-yellow-400' : 'text-white'}`}>
                {s.points}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex gap-4 text-xs text-gray-500 px-1">
        <span><span className="text-blue-400">■</span> Libertadores</span>
        <span><span className="text-green-400">■</span> Sul-Americana</span>
        <span><span className="text-red-400">■</span> Rebaixamento</span>
      </div>
    </div>
  );
}
