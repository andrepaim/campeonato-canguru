import { TeamBadge } from '../components/TeamBadge';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getMatches } from '../api/client';
import type { MatchRecord } from '../api/client';
import { getTeamById, CAM } from '../data/teams';

export default function ResultPage() {
  const navigate = useNavigate();
  const [match, setMatch] = useState<MatchRecord | null>(null);

  useEffect(() => {
    getMatches().then(matches => {
      if (matches.length > 0) setMatch(matches[matches.length - 1]);
    }).catch(console.error);
  }, []);

  if (!match) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400 animate-pulse text-4xl">⚽</div>
      </div>
    );
  }

  const opponent = getTeamById(match.opponent_id);
  const cfg = {
    W: { icon: '🏆', title: 'VITÓRIA!',  bg: 'from-green-900 to-gray-950', color: 'text-green-400' },
    D: { icon: '🤝', title: 'EMPATE',    bg: 'from-yellow-900 to-gray-950', color: 'text-yellow-400' },
    L: { icon: '😤', title: 'DERROTA',   bg: 'from-red-900 to-gray-950',   color: 'text-red-400' },
  }[match.result as 'W' | 'D' | 'L'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b ${cfg.bg}`}
    >
      <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-6xl mb-4">
        {cfg.icon}
      </motion.div>

      <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
        className={`text-3xl font-black mb-8 ${cfg.color}`}>
        {cfg.title}
      </motion.h1>

      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
        className="bg-black/50 rounded-2xl p-6 w-full max-w-xs mb-6">
        <div className="text-center text-xs text-gray-400 mb-4">PLACAR FINAL · Rodada {match.match_day}</div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center gap-2">
            <div className="h-14 flex items-center justify-center">
              <TeamBadge teamId="atletico-mg" size="lg" />
            </div>
            <span className="text-xs text-galo-gold">{CAM.shortName}</span>
          </div>
          <div className="text-center">
            <div className="text-5xl font-black">
              <span className="text-galo-gold">{match.cam_goals}</span>
              <span className="text-gray-500 mx-2">-</span>
              <span className="text-white">{match.opp_goals}</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-14 flex items-center justify-center">
              <TeamBadge teamId={match.opponent_id} size="lg" />
            </div>
            <span className="text-xs text-gray-400">{opponent?.shortName}</span>
          </div>
        </div>
        <div className="text-center mt-4 pt-4 border-t border-gray-700">
          <span className="text-sm text-gray-400">Pontos: </span>
          <span className="text-xl font-bold text-galo-gold">+{match.points}</span>
        </div>
      </motion.div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}
        className="flex flex-col gap-3 w-full max-w-xs">
        <button onClick={() => navigate('/standings')} className="w-full py-3 bg-galo-gold text-black font-bold rounded-xl active:scale-95">
          Ver Tabela
        </button>
        <button onClick={() => navigate('/')} className="w-full py-3 bg-gray-800 text-white font-medium rounded-xl active:scale-95">
          Início
        </button>
      </motion.div>
    </motion.div>
  );
}
