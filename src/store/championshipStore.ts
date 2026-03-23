/**
 * Championship store — in-progress match state only (ephemeral, no persistence).
 * All durable state (history, standings, match_day) lives in the backend API.
 */
import { create } from 'zustand';
import type { Question, QuestionAnswer } from '../types';
import { calculateGoals, simulateOpponentGoals, calculateResult } from '../utils/scoring';

interface CurrentMatchState {
  opponentId: string;
  camGoals: number;
  opponentGoals: number;
  questionIndex: number;
}

interface StoreState {
  currentMatch: CurrentMatchState | null;
  currentQuestions: Question[];
  currentAnswers: QuestionAnswer[];
}

interface StoreActions {
  startMatch: (opponentId: string, questions: Question[], matchDay: number) => void;
  submitAnswer: (questionId: string, answer: 'A' | 'B' | 'C' | 'D' | 'E', timeMs: number) => number;
  skipQuestion: (questionId: string) => void;
  clearMatch: () => void;
}

export const useChampionshipStore = create<StoreState & StoreActions>((set, get) => ({
  currentMatch: null,
  currentQuestions: [],
  currentAnswers: [],

  startMatch: (opponentId, questions, matchDay) => {
    const opponentGoals = simulateOpponentGoals(matchDay * 7919 + 1337);
    set({
      currentMatch: { opponentId, camGoals: 0, opponentGoals, questionIndex: 0 },
      currentQuestions: questions,
      currentAnswers: [],
    });
  },

  submitAnswer: (questionId, answer, timeMs) => {
    const { currentMatch, currentQuestions, currentAnswers } = get();
    if (!currentMatch) return 0;

    const question = currentQuestions.find(q => q.id === questionId);
    if (!question) return 0;

    const isCorrect = question.correctAnswer === answer;
    const goalsScored = calculateGoals(timeMs, isCorrect);

    set({
      currentMatch: {
        ...currentMatch,
        camGoals: currentMatch.camGoals + goalsScored,
        questionIndex: currentMatch.questionIndex + 1,
      },
      currentAnswers: [...currentAnswers, {
        questionId, answer, timeMs, isCorrect, goalsScored,
      }],
    });

    return goalsScored;
  },

  skipQuestion: (questionId) => {
    const { currentMatch, currentAnswers } = get();
    if (!currentMatch) return;
    set({
      currentMatch: { ...currentMatch, questionIndex: currentMatch.questionIndex + 1 },
      currentAnswers: [...currentAnswers, {
        questionId, answer: 'skip' as const, timeMs: 99999, isCorrect: false, goalsScored: 0,
      }],
    });
  },

  clearMatch: () => set({ currentMatch: null, currentQuestions: [], currentAnswers: [] }),
}));

// Helper: build the match payload for the API from current store state
export function buildMatchPayload(
  store: StoreState,
  matchDay: number,
) {
  const { currentMatch, currentAnswers } = store;
  if (!currentMatch) throw new Error('No current match');

  const { result, points } = calculateResult(currentMatch.camGoals, currentMatch.opponentGoals);
  const today = new Date().toISOString().split('T')[0];

  return {
    match_day: matchDay,
    date: today,
    opponent_id: currentMatch.opponentId,
    cam_goals: currentMatch.camGoals,
    opp_goals: currentMatch.opponentGoals,
    result,
    points,
    answers: currentAnswers,
  };
}
