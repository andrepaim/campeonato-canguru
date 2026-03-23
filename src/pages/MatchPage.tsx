import { TeamBadge } from '../components/TeamBadge';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChampionshipStore } from '../store/championshipStore';
import { getTeamById, CAM } from '../data/teams';
import QuestionCard from '../components/QuestionCard';
import GoalCelebration from '../components/GoalCelebration';

type CelebrationState = {
  type: 'goal' | 'skip' | 'timeout' | 'wrong';
  goals: number;
} | null;

export default function MatchPage() {
  const navigate = useNavigate();
  const { currentMatch, currentQuestions, submitAnswer, skipQuestion, finalizeMatch } = useChampionshipStore();
  const [celebrationState, setCelebrationState] = useState<CelebrationState>(null);
  const [questionStartTime] = useState(Date.now());
  const [isAnswering, setIsAnswering] = useState(false);
  const hasFinalized = useRef(false);

  const opponent = currentMatch ? getTeamById(currentMatch.opponentId) : null;
  const currentQuestion = currentMatch && currentQuestions[currentMatch.questionIndex];
  const questionNumber = currentMatch ? currentMatch.questionIndex + 1 : 0;
  const totalQuestions = 6;

  // Reset answering state when question changes
  useEffect(() => {
    setIsAnswering(false);
  }, [currentMatch?.questionIndex]);

  // Navigate to home if somehow on match page with no match and not finalizing
  useEffect(() => {
    if (!currentMatch && !hasFinalized.current) {
      const timer = setTimeout(() => {
        if (!hasFinalized.current) navigate('/');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentMatch, navigate]);

  const handleAnswer = useCallback((answer: 'A' | 'B' | 'C' | 'D' | 'E') => {
    if (!currentQuestion || isAnswering) return;

    setIsAnswering(true);
    const timeMs = Date.now() - questionStartTime;
    const goalsScored = submitAnswer(currentQuestion.id, answer, timeMs);

    // Check if this was the last question
    const freshMatch = useChampionshipStore.getState().currentMatch;
    if (freshMatch && freshMatch.questionIndex >= totalQuestions) {
      // Last question answered — finalize immediately after brief delay
      hasFinalized.current = true;
      const isCorrect = currentQuestion.correctAnswer === answer;
      setCelebrationState(isCorrect ? { type: 'goal', goals: goalsScored } : { type: 'wrong', goals: 0 });
      setTimeout(() => {
        finalizeMatch();
        navigate('/result', { replace: true });
      }, 1500);
    } else {
      const isCorrect = currentQuestion.correctAnswer === answer;
      setCelebrationState(isCorrect ? { type: 'goal', goals: goalsScored } : { type: 'wrong', goals: 0 });
    }
  }, [currentQuestion, isAnswering, questionStartTime, submitAnswer, finalizeMatch, navigate]);

  const handleSkip = useCallback(() => {
    if (!currentQuestion || isAnswering) return;

    setIsAnswering(true);
    skipQuestion(currentQuestion.id);
    const freshMatch = useChampionshipStore.getState().currentMatch;
    if (freshMatch && freshMatch.questionIndex >= totalQuestions) {
      hasFinalized.current = true;
      setCelebrationState({ type: 'skip', goals: 0 });
      setTimeout(() => { finalizeMatch(); navigate('/result', { replace: true }); }, 1500);
    } else {
      setCelebrationState({ type: 'skip', goals: 0 });
    }
  }, [currentQuestion, isAnswering, skipQuestion, finalizeMatch, navigate]);

  const handleCelebrationEnd = useCallback(() => {
    setCelebrationState(null);

    // Read fresh state directly from store to avoid stale closure
    const freshMatch = useChampionshipStore.getState().currentMatch;
    console.log('[MatchPage] celebrationEnd: freshMatch questionIndex=', freshMatch?.questionIndex, 'totalQuestions=', totalQuestions);
    if (freshMatch && freshMatch.questionIndex >= totalQuestions) {
      console.log('[MatchPage] finalizing match, navigating to /result');
      hasFinalized.current = true;
      finalizeMatch();
      navigate('/result', { replace: true });
    }
  }, [finalizeMatch, navigate]);

  if (!currentMatch || !currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      {/* Scoreboard */}
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
            <div className="text-xs text-gray-400 mt-1">
              Questão {questionNumber}/{totalQuestions}
            </div>
          </div>

          <div className="text-center flex-1">
            <TeamBadge teamId={opponent?.id ?? ""} size="sm" />
            <div className="text-xs text-gray-400">{opponent?.shortName}</div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <QuestionCard
        question={currentQuestion}
        onAnswer={handleAnswer}
        onSkip={handleSkip}
        disabled={isAnswering}
      />

      {/* Goal Celebration */}
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
