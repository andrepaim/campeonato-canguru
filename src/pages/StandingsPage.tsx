import { useChampionshipStore } from '../store/championshipStore';
import { getTeamById } from '../data/teams';

export default function StandingsPage() {
  const { standings } = useChampionshipStore();

  const getPositionColor = (position: number) => {
    if (position <= 4) return 'text-blue-400';
    if (position <= 6) return 'text-green-400';
    if (position >= 17) return 'text-red-400';
    return 'text-white';
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-white text-center mb-4">Classificação</h1>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        {/* Header Row */}
        <div className="grid grid-cols-[2rem_auto_2rem_2rem_2rem_2rem_2rem_2rem_2rem_3rem] gap-1 px-2 py-2 bg-gray-800 text-xs text-gray-400 font-semibold">
          <div className="text-center">#</div>
          <div>Time</div>
          <div className="text-center">P</div>
          <div className="text-center">V</div>
          <div className="text-center">E</div>
          <div className="text-center">D</div>
          <div className="text-center">GP</div>
          <div className="text-center">GC</div>
          <div className="text-center">SG</div>
          <div className="text-center">Pts</div>
        </div>

        {/* Team Rows */}
        {standings.map((standing) => {
          const team = getTeamById(standing.teamId);
          const isCAM = standing.teamId === 'atletico-mg';

          return (
            <div
              key={standing.teamId}
              className={`grid grid-cols-[2rem_auto_2rem_2rem_2rem_2rem_2rem_2rem_2rem_3rem] gap-1 px-2 py-2 text-sm border-t border-gray-800 ${
                isCAM ? 'bg-yellow-900/30 border-l-2 border-l-yellow-400' : ''
              }`}
            >
              <div className={`text-center font-bold ${getPositionColor(standing.position)}`}>
                {standing.position}
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm">{team?.emoji}</span>
                <span className={`truncate ${isCAM ? 'text-galo-gold font-bold' : 'text-white'}`}>
                  {team?.shortName}
                </span>
              </div>
              <div className="text-center text-gray-400">{standing.played}</div>
              <div className="text-center text-green-400">{standing.wins}</div>
              <div className="text-center text-yellow-400">{standing.draws}</div>
              <div className="text-center text-red-400">{standing.losses}</div>
              <div className="text-center text-gray-400">{standing.goalsFor}</div>
              <div className="text-center text-gray-400">{standing.goalsAgainst}</div>
              <div className={`text-center ${standing.goalDifference > 0 ? 'text-green-400' : standing.goalDifference < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                {standing.goalDifference > 0 ? '+' : ''}{standing.goalDifference}
              </div>
              <div className={`text-center font-bold ${isCAM ? 'text-galo-gold' : 'text-white'}`}>
                {standing.points}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-400 rounded"></div>
          <span>Libertadores</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded"></div>
          <span>Pré-Libertadores</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-400 rounded"></div>
          <span>Rebaixamento</span>
        </div>
      </div>
    </div>
  );
}
