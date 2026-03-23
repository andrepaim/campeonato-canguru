import { useChampionshipStore } from '../store/championshipStore';
import { getTeamById } from '../data/teams';

export default function MiniStandings() {
  const { standings } = useChampionshipStore();

  // Get top 5
  const top5 = standings.slice(0, 5);

  // Check if CAM is in top 5
  const camInTop5 = top5.some(s => s.teamId === 'atletico-mg');

  // Get CAM standing if not in top 5
  const camStanding = !camInTop5 ? standings.find(s => s.teamId === 'atletico-mg') : null;

  const displayStandings = camStanding ? [...top5, camStanding] : top5;

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="grid grid-cols-[2rem_auto_3rem] gap-2 text-xs text-gray-500 px-1">
        <div className="text-center">#</div>
        <div>Time</div>
        <div className="text-center">Pts</div>
      </div>

      {/* Rows */}
      {displayStandings.map((standing, index) => {
        const team = getTeamById(standing.teamId);
        const isCAM = standing.teamId === 'atletico-mg';

        // Add separator before CAM if not in top 5
        const showSeparator = !camInTop5 && index === 5;

        return (
          <div key={standing.teamId}>
            {showSeparator && (
              <div className="text-center text-gray-600 text-xs py-1">···</div>
            )}
            <div
              className={`grid grid-cols-[2rem_auto_3rem] gap-2 px-1 py-1.5 rounded text-sm ${
                isCAM ? 'bg-yellow-900/30' : ''
              }`}
            >
              <div className={`text-center font-bold ${standing.position <= 4 ? 'text-blue-400' : standing.position >= 17 ? 'text-red-400' : 'text-gray-400'}`}>
                {standing.position}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">{team?.emoji}</span>
                <span className={isCAM ? 'text-galo-gold font-semibold' : 'text-white'}>
                  {team?.shortName}
                </span>
              </div>
              <div className={`text-center font-bold ${isCAM ? 'text-galo-gold' : 'text-white'}`}>
                {standing.points}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
