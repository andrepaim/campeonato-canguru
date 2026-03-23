import { TeamBadge } from '../components/TeamBadge';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChampionshipStore } from '../store/championshipStore';
import { getTeamById, CAM } from '../data/teams';
import { getOpponentForMatchDay } from '../data/schedule';
import { selectMatchQuestions } from '../utils/questions';
import type { Question } from '../types';
import MiniStandings from '../components/MiniStandings';

export default function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { matchDay, matches, canPlayToday, startMatch, usedQuestionIds } = useChampionshipStore();

  const opponentId = getOpponentForMatchDay(matchDay);
  const opponent = getTeamById(opponentId);
  const playedToday = !canPlayToday();

  // Calculate W/D/L summary
  const wins = matches.filter(m => m.result === 'W').length;
  const draws = matches.filter(m => m.result === 'D').length;
  const losses = matches.filter(m => m.result === 'L').length;

  const handlePlay = async () => {
    if (playedToday) return;

    setLoading(true);
    try {
      const response = await fetch('https://rotinadoatleticano.duckdns.org/canguru/questions.json');
      const raw = await response.json();
      // Map API fields to our Question type
      const allQuestions: Question[] = raw.map((q: any) => ({
        id: q.id,
        year: q.year,
        level: q.level,
        number: q.number,
        difficulty: q.difficulty,
        questionText: q.text,
        options: [q.options.A, q.options.B, q.options.C, q.options.D, q.options.E] as [string,string,string,string,string],
        correctAnswer: q.correct as 'A'|'B'|'C'|'D'|'E',
        hasImage: q.hasImage,
        pageFile: q.pageFile,
      }));

      const opponentTeam = getTeamById(opponentId);
      const strength = (opponentTeam?.strength ?? 3) as 1 | 2 | 3 | 4 | 5;
      const selectedQuestions = selectMatchQuestions(allQuestions, matchDay, usedQuestionIds, strength);
      startMatch(opponentId, selectedQuestions);
      navigate('/match');
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      alert('Erro ao carregar questões. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">⚽</div>
        <h1 className="text-2xl font-bold text-white">Campeonato Canguru</h1>
        <p className="text-galo-gold font-semibold">Rodada {matchDay}</p>
      </div>

      {/* Today's Match Card */}
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
              <TeamBadge teamId={opponent?.id ?? ""} size="lg" />
            </div>
            <div className="text-white font-semibold text-sm">{opponent?.shortName}</div>
          </div>
        </div>

        <button
          onClick={handlePlay}
          disabled={playedToday || loading}
          className={`w-full py-3 rounded-lg font-bold text-lg transition-all ${
            playedToday
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-galo-gold text-black hover:bg-yellow-400 active:scale-95'
          }`}
        >
          {loading ? (
            'Carregando...'
          ) : playedToday ? (
            'Já jogou hoje ✓'
          ) : (
            'JOGAR AGORA'
          )}
        </button>
      </div>

      {/* Mini Standings */}
      <div className="bg-gray-900 rounded-xl p-4 mb-6 border border-gray-800">
        <h2 className="text-gray-400 text-sm uppercase tracking-wide mb-3">Classificação</h2>
        <MiniStandings />
      </div>

      {/* W/D/L Summary */}
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
