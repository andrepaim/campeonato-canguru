import { TeamBadge } from './TeamBadge';
import { useEffect, useState } from 'react';
import { getStandings } from '../api/client';
import type { TeamStanding } from '../api/client';
import { getTeamById } from '../data/teams';

export default function MiniStandings() {
  const [standings, setStandings] = useState<TeamStanding[]>([]);

  useEffect(() => {
    getStandings().then(setStandings).catch(console.error);
  }, []);

  if (standings.length === 0) {
    return <div className="text-xs text-gray-500 text-center py-2">Nenhuma partida ainda</div>;
  }

  const camPos = standings.findIndex(s => s.team_id === 'atletico-mg') + 1;
  const showSeparator = camPos > 5;
  const display = showSeparator
    ? [...standings.slice(0, 5), standings[camPos - 1]]
    : standings.slice(0, 6);

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-[2rem_auto_3rem] gap-2 px-1 py-1 text-xs text-gray-500 font-semibold">
        <span>#</span><span>Time</span><span className="text-center">Pts</span>
      </div>
      {display.map((s, i) => {
        const team = getTeamById(s.team_id);
        const isCAM = s.team_id === 'atletico-mg';
        const showSep = showSeparator && i === 5;
        return (
          <div key={s.team_id}>
            {showSep && <div className="text-center text-gray-600 text-xs py-1">···</div>}
            <div className={`grid grid-cols-[2rem_auto_3rem] gap-2 px-1 py-1.5 rounded text-sm items-center ${isCAM ? 'bg-yellow-900/30' : ''}`}>
              <span className={`text-center font-bold text-xs ${s.position <= 4 ? 'text-blue-400' : s.position >= 17 ? 'text-red-400' : 'text-gray-400'}`}>{s.position}</span>
              <div className="flex items-center gap-2">
                <TeamBadge teamId={s.team_id} size="xs" />
                <span className={`text-xs ${isCAM ? 'text-galo-gold font-semibold' : 'text-white'}`}>{team?.shortName}</span>
              </div>
              <span className={`text-center font-bold text-xs ${isCAM ? 'text-galo-gold' : 'text-white'}`}>{s.points}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
