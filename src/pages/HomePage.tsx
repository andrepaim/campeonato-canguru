import { TeamBadge } from '../components/TeamBadge';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChampionshipStore } from '../store/championshipStore';
import { getTeamById, CAM } from '../data/teams';
import { getOpponentForMatchDay } from '../data/schedule';
import { selectMatchQuestions } from '../utils/questions';
import { getState, getMatches } from '../api/client';
import type { Question } from '../types';
import MiniStandings from '../components/MiniStandings';

export default function HomePage() {
  const navigate = useNavigate();
  const { startMatch } = useChampionshipStore();

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [matchDay, setMatchDay] = useState(1);
  const [usedIds, setUsedIds] = useState<string[]>([]);
  const [wins, setWins] = useState(0);
  const [draws, setDraws] = useState(0);
  const [losses, setLosses] = useState(0);

  

  const opponentId = getOpponentForMatchDay(matchDay);
  const opponent = getTeamById(opponentId);

  useEffect(() => {
    Promise.all([getState(), getMatches()])
      .then(([state, matches]) => {
        setMatchDay(state.match_day);
        setUsedIds(state.used_question_ids);
        setWins(matches.filter(m => m.result === 'W').length);
        setDraws(matches.filter(m => m.result === 'D').length);
        setLosses(matches.filter(m => m.result === 'L').length);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handlePlay = async () => {
    if (starting) return;
    setStarting(true);
    try {
      const response = await fetch('/api/questions');
      const raw = await response.json();
      const allQuestions: Question[] = raw.map((q: Record<string, unknown>) => ({
        id: q.id,
        year: q.year,
        level: q.level,
        number: q.number,
        difficulty: q.difficulty,
        questionText: q.text,
        options: [
          (q.options as Record<string, string>).A,
          (q.options as Record<string, string>).B,
          (q.options as Record<string, string>).C,
          (q.options as Record<string, string>).D,
          (q.options as Record<string, string>).E,
        ] as [string, string, string, string, string],
        correctAnswer: q.correct as 'A' | 'B' | 'C' | 'D' | 'E',
        hasImage: q.hasImage as boolean,
        pageFile: q.pageFile as string | undefined,
      }));

      const opponentTeam = getTeamById(opponentId);
      const strength = (opponentTeam?.strength ?? 3) as 1 | 2 | 3 | 4 | 5;
      const selected = selectMatchQuestions(allQuestions, matchDay, usedIds, strength);
      sessionStorage.setItem("matchDay", String(matchDay));
      startMatch(opponentId, selected, matchDay);
      navigate('/match');
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar questões. Tente novamente.');
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400 animate-pulse">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">⚽</div>
        <h1 className="text-2xl font-bold text-white">Campeonato Canguru</h1>
        <p className="text-galo-gold font-semibold">Rodada {matchDay}</p>
      </div>

      <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
        <h2 className="text-gray-400 text-sm uppercase tracking-wide mb-4">Jogo de Hoje</h2>

        <div className="flex items-end justify-between mb-6">
          <div className="flex flex-col items-center flex-1 gap-2">
            <div className="h-14 flex items-center justify-center">
              <TeamBadge teamId="atletico-mg" size="lg" />
            </div>
            <div className="text-white font-semibold text-sm">{CAM.shortName}</div>
          </div>
          <div className="text-2xl text-gray-500 font-bold px-4 pb-4">VS</div>
          <div className="flex flex-col items-center flex-1 gap-2">
            <div className="h-14 flex items-center justify-center">
              <TeamBadge teamId={opponent?.id ?? ''} size="lg" />
            </div>
            <div className="text-white font-semibold text-sm">{opponent?.shortName}</div>
          </div>
        </div>

        <button
          onClick={handlePlay}
          disabled={starting}
          className={`w-full py-3 rounded-lg font-bold text-lg transition-all ${
'bg-galo-gold text-black hover:bg-yellow-400 active:scale-95'
          }`}
        >
          {starting ? 'Carregando...' : 'JOGAR AGORA'}
        </button>
      </div>

      <div className="bg-gray-900 rounded-xl p-4 mb-6 border border-gray-800">
        <h2 className="text-gray-400 text-sm uppercase tracking-wide mb-3">Classificação</h2>
        <MiniStandings />
      </div>

      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <h2 className="text-gray-400 text-sm uppercase tracking-wide mb-3">Retrospecto</h2>
        <div className="flex justify-around">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{wins}</div>
            <div className="text-xs text-gray-400">Vitórias</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{draws}</div>
            <div className="text-xs text-gray-400">Empates</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{losses}</div>
            <div className="text-xs text-gray-400">Derrotas</div>
          </div>
        </div>
      </div>
    </div>
  );
}
