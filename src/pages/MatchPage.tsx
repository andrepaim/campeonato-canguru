import { TeamBadge } from '../components/TeamBadge';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChampionshipStore, buildMatchPayload } from '../store/championshipStore';
import { getTeamById, CAM } from '../data/teams';
import { saveMatch } from '../api/client';
import QuestionCard from '../components/QuestionCard';
import GoalCelebration from '../components/GoalCelebration';

type CelebrationState = { type: 'goal' | 'skip' | 'wrong'; goals: number } | null;

// Store matchDay in sessionStorage so MatchPage knows it after navigation
const getSessionMatchDay = () => parseInt(sessionStorage.getItem('matchDay') ?? '1', 10);

export default function MatchPage() {
  const navigate = useNavigate();
  const { currentMatch, currentQuestions, submitAnswer, skipQuestion, clearMatch } = useChampionshipStore();
  const [celebrationState, setCelebrationState] = useState<CelebrationState>(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const hasFinalized = useRef(false);
  const TOTAL = 6;

  const opponent = currentMatch ? getTeamById(currentMatch.opponentId) : null;
  const currentQuestion = currentMatch && currentQuestions[currentMatch.questionIndex];
  const questionNumber = currentMatch ? currentMatch.questionIndex + 1 : 0;

  useEffect(() => {
    setIsAnswering(false);
  }, [currentMatch?.questionIndex]);

  // Block back gesture during match — show confirmation instead
  useEffect(() => {
    if (!currentMatch) return;

    // Push a sentinel entry so back gesture triggers popstate, not navigation
    window.history.pushState({ matchGuard: true }, '');

    const handlePopState = () => {
      // Re-push so the guard stays active if user cancels
      const confirmed = window.confirm('Quer mesmo sair? O progresso da partida será perdido.');
      if (confirmed) {
        clearMatch();
        navigate('/', { replace: true });
      } else {
        window.history.pushState({ matchGuard: true }, '');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentMatch, clearMatch, navigate]);

  useEffect(() => {
    if (!currentMatch && !hasFinalized.current) {
      const t = setTimeout(() => { if (!hasFinalized.current) navigate('/'); }, 500);
      return () => clearTimeout(t);
    }
  }, [currentMatch, navigate]);

  const finalize = useCallback(async () => {
    if (hasFinalized.current) return;
    hasFinalized.current = true;
    setIsSaving(true);

    const state = useChampionshipStore.getState();
    const matchDay = getSessionMatchDay();

    try {
      const payload = buildMatchPayload(state, matchDay);
      await saveMatch(payload);
    } catch (err) {
      console.error('Failed to save match:', err);
    } finally {
      clearMatch();
      setIsSaving(false);
      navigate('/result', { replace: true });
    }
  }, [clearMatch, navigate]);

  const handleAnswer = useCallback((answer: 'A' | 'B' | 'C' | 'D' | 'E') => {
    if (!currentQuestion || isAnswering) return;
    setIsAnswering(true);
    const goalsScored = submitAnswer(currentQuestion.id, answer, 0);
    const isCorrect = currentQuestion.correctAnswer === answer;

    const fresh = useChampionshipStore.getState().currentMatch;
    if (fresh && fresh.questionIndex >= TOTAL) {
      setCelebrationState(isCorrect ? { type: 'goal', goals: goalsScored } : { type: 'wrong', goals: 0 });
      setTimeout(finalize, 1500);
    } else {
      setCelebrationState(isCorrect ? { type: 'goal', goals: goalsScored } : { type: 'wrong', goals: 0 });
    }
  }, [currentQuestion, isAnswering, submitAnswer, finalize]);

  const handleSkip = useCallback(() => {
    if (!currentQuestion || isAnswering) return;
    setIsAnswering(true);
    skipQuestion(currentQuestion.id);
    const fresh = useChampionshipStore.getState().currentMatch;
    if (fresh && fresh.questionIndex >= TOTAL) {
      setCelebrationState({ type: 'skip', goals: 0 });
      setTimeout(finalize, 1500);
    } else {
      setCelebrationState({ type: 'skip', goals: 0 });
    }
  }, [currentQuestion, isAnswering, skipQuestion, finalize]);

  const handleCelebrationEnd = useCallback(() => {
    setCelebrationState(null);
    const fresh = useChampionshipStore.getState().currentMatch;
    if (fresh && fresh.questionIndex >= TOTAL) {
      finalize();
    }
  }, [finalize]);

  if (isSaving) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-4xl animate-pulse">⚽</div>
        <div className="text-gray-400">Salvando resultado...</div>
      </div>
    );
  }

  if (!currentMatch || !currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="bg-gray-900 rounded-xl p-4 mb-4 border border-gray-800">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <TeamBadge teamId="atletico-mg" size="sm" />
            <div className="text-xs text-gray-400">{CAM.shortName}</div>
          </div>
          <div className="text-center px-6">
            <div className="text-3xl font-bold text-white">
              {currentMatch.camGoals} : {currentMatch.opponentGoals}
            </div>
            <div className="text-xs text-gray-400 mt-1">Questão {questionNumber}/{TOTAL}</div>
          </div>
          <div className="text-center flex-1">
            <TeamBadge teamId={opponent?.id ?? ''} size="sm" />
            <div className="text-xs text-gray-400">{opponent?.shortName}</div>
          </div>
        </div>
      </div>

      <QuestionCard
        question={currentQuestion}
        onAnswer={handleAnswer}
        onSkip={handleSkip}
        disabled={isAnswering}
      />

      {celebrationState && (
        <GoalCelebration
          type={celebrationState.type}
          goals={celebrationState.goals}
          onComplete={handleCelebrationEnd}
        />
      )}
    </div>
  );
}
