import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useChampionshipStore } from '../store/championshipStore';
import { getTeamById, CAM } from '../data/teams';

export default function ResultPage() {
  const navigate = useNavigate();
  const { matches } = useChampionshipStore();
  const [lastMatch, setLastMatch] = useState(matches[matches.length - 1]);

  useEffect(() => {
    if (matches.length > 0) {
      setLastMatch(matches[matches.length - 1]);
    }
  }, [matches]);

  if (!lastMatch) {
    navigate('/');
    return null;
  }

  const opponent = getTeamById(lastMatch.opponentId);

  const resultConfig = {
    W: { icon: '🏆', title: 'VITÓRIA', color: 'text-green-400', bg: 'from-green-900/50' },
    D: { icon: '🤝', title: 'EMPATE', color: 'text-yellow-400', bg: 'from-yellow-900/50' },
    L: { icon: '😤', title: 'DERROTA', color: 'text-red-400', bg: 'from-red-900/50' },
  };

  const config = resultConfig[lastMatch.result];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b ${config.bg} to-galo-black`}
    >
      {/* Result Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="text-8xl mb-4"
      >
        {config.icon}
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={`text-4xl font-bold ${config.color} mb-6`}
      >
        {config.title}
      </motion.h1>

      {/* Score Display */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800 w-full max-w-sm"
      >
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="text-3xl mb-1">{CAM.emoji}</div>
            <div className="text-white font-semibold">{CAM.shortName}</div>
          </div>

          <div className="text-center px-4">
            <div className="text-4xl font-bold text-white">
              {lastMatch.camGoals} - {lastMatch.opponentGoals}
            </div>
          </div>

          <div className="text-center flex-1">
            <div className="text-3xl mb-1">{opponent?.emoji}</div>
            <div className="text-white font-semibold">{opponent?.shortName}</div>
          </div>
        </div>
      </motion.div>

      {/* Points */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-2xl font-bold text-galo-gold mb-8"
      >
        +{lastMatch.points} {lastMatch.points === 1 ? 'ponto' : 'pontos'}
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col gap-3 w-full max-w-sm"
      >
        <button
          onClick={() => navigate('/standings')}
          className="w-full py-3 rounded-lg font-bold text-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
        >
          Ver Tabela
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full py-3 rounded-lg font-bold text-lg bg-galo-gold text-black hover:bg-yellow-400 transition-colors"
        >
          Início
        </button>
      </motion.div>
    </motion.div>
  );
}
