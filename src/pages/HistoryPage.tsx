import { TeamBadge } from '../components/TeamBadge';
import { useEffect, useState } from 'react';
import { getMatches } from '../api/client';
import type { MatchRecord } from '../api/client';
import { getTeamById } from '../data/teams';

export default function HistoryPage() {
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMatches().then(m => setMatches([...m].reverse())).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4 text-gray-400 animate-pulse">Carregando histórico...</div>;

  if (matches.length === 0) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-6xl mb-4">🦘</div>
        <p className="text-gray-400">Nenhuma partida jogada ainda</p>
      </div>
    );
  }

  const resultConfig = {
    W: { label: 'V', color: 'bg-green-600 text-white' },
    D: { label: 'E', color: 'bg-yellow-600 text-black' },
    L: { label: 'D', color: 'bg-red-600 text-white' },
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-white mb-4">Histórico</h1>
      <div className="flex flex-col gap-3">
        {matches.map(m => {
          const opp = getTeamById(m.opponent_id);
          const cfg = resultConfig[m.result as 'W' | 'D' | 'L'];
          return (
            <div key={m.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex items-center gap-3">
              <div className="text-xs text-gray-500 w-16 shrink-0">
                <div>Rd {m.match_day}</div>
                <div>{m.date.slice(5)}</div>
              </div>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <TeamBadge teamId="atletico-mg" size="xs" />
                <span className="text-white font-bold text-sm">{m.cam_goals}</span>
                <span className="text-gray-500">-</span>
                <span className="text-white font-bold text-sm">{m.opp_goals}</span>
                <TeamBadge teamId={m.opponent_id} size="xs" />
                <span className="text-gray-400 text-xs truncate">{opp?.shortName}</span>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded shrink-0 ${cfg.color}`}>{cfg.label}</span>
              <span className="text-gray-400 text-xs shrink-0">+{m.points}pts</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
