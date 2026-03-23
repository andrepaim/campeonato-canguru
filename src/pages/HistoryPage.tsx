import { TeamBadge } from '../components/TeamBadge';
import { useChampionshipStore } from '../store/championshipStore';
import { getTeamById, CAM } from '../data/teams';

export default function HistoryPage() {
  const { matches } = useChampionshipStore();

  const getResultBadge = (result: 'W' | 'D' | 'L') => {
    switch (result) {
      case 'W':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-900 text-green-400">V</span>;
      case 'D':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-yellow-900 text-yellow-400">E</span>;
      case 'L':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-900 text-red-400">D</span>;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  if (matches.length === 0) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white text-center mb-4">Histórico</h1>
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <div className="text-6xl mb-4">🦘</div>
          <p>Nenhum jogo disputado ainda</p>
          <p className="text-sm mt-2">Jogue sua primeira partida!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-white text-center mb-4">Histórico</h1>

      <div className="space-y-3">
        {[...matches].reverse().map((match) => {
          const opponent = getTeamById(match.opponentId);

          return (
            <div
              key={match.matchDay}
              className="bg-gray-900 rounded-xl p-4 border border-gray-800"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">R{match.matchDay}</span>
                  <span className="text-sm text-gray-400">{formatDate(match.date)}</span>
                </div>
                {getResultBadge(match.result)}
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <TeamBadge teamId="atletico-mg" size="sm" />
                  <span className="text-white font-semibold">{CAM.shortName}</span>
                </div>

                <div className="text-xl font-bold text-white">
                  {match.camGoals} - {match.opponentGoals}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">{opponent?.shortName}</span>
                  <TeamBadge teamId={match.opponentId} size="sm" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
