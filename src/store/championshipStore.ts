import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChampionshipState, ChampionshipActions, Question, Match, QuestionAnswer } from '../types';
import { teams } from '../data/teams';
import { initStandings, calculateGoals, simulateOpponentGoals, calculateResult, updateStandings, simulateRound } from '../utils/scoring';

const initialState: ChampionshipState = {
  matchDay: 1,
  lastPlayedDate: null,
  matches: [],
  standings: initStandings(teams),
  usedQuestionIds: [],
  currentMatch: null,
  currentQuestions: [],
  currentAnswers: [],
};

export const useChampionshipStore = create<ChampionshipState & ChampionshipActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      canPlayToday: () => {
        const { lastPlayedDate } = get();
        const today = new Date().toISOString().split('T')[0];
        return lastPlayedDate !== today;
      },

      startMatch: (opponentId: string, questions: Question[]) => {
        const { matchDay } = get();
        const opponentGoals = simulateOpponentGoals(matchDay * 7919 + 1337);

        set({
          currentMatch: {
            opponentId,
            camGoals: 0,
            opponentGoals,
            questionIndex: 0,
          },
          currentQuestions: questions,
          currentAnswers: [],
        });
      },

      submitAnswer: (questionId: string, answer: 'A' | 'B' | 'C' | 'D' | 'E', timeMs: number): number => {
        const { currentMatch, currentQuestions, currentAnswers } = get();
        if (!currentMatch) return 0;

        const question = currentQuestions.find(q => q.id === questionId);
        if (!question) return 0;

        const isCorrect = question.correctAnswer === answer;
        const goalsScored = calculateGoals(timeMs, isCorrect);

        const newAnswer: QuestionAnswer = {
          questionId,
          answer,
          timeMs,
          isCorrect,
          goalsScored,
        };

        set({
          currentMatch: {
            ...currentMatch,
            camGoals: currentMatch.camGoals + goalsScored,
            questionIndex: currentMatch.questionIndex + 1,
          },
          currentAnswers: [...currentAnswers, newAnswer],
        });

        return goalsScored;
      },

      skipQuestion: (questionId: string) => {
        const { currentMatch, currentAnswers } = get();
        if (!currentMatch) return;

        const newAnswer: QuestionAnswer = {
          questionId,
          answer: 'skip',
          timeMs: 10000,
          isCorrect: false,
          goalsScored: 0,
        };

        set({
          currentMatch: {
            ...currentMatch,
            questionIndex: currentMatch.questionIndex + 1,
          },
          currentAnswers: [...currentAnswers, newAnswer],
        });
      },

      finalizeMatch: (): Match => {
        const { currentMatch, currentQuestions, currentAnswers, matchDay, matches, standings, usedQuestionIds } = get();

        if (!currentMatch) {
          throw new Error('No current match to finalize');
        }

        const { result, points } = calculateResult(currentMatch.camGoals, currentMatch.opponentGoals);
        const today = new Date().toISOString().split('T')[0];

        const match: Match = {
          matchDay,
          date: today,
          opponentId: currentMatch.opponentId,
          camGoals: currentMatch.camGoals,
          opponentGoals: currentMatch.opponentGoals,
          result,
          points,
          answers: currentAnswers,
        };

        // Update standings with CAM result
        let newStandings = updateStandings(standings, match);

        // Simulate other team matches
        newStandings = simulateRound(newStandings, matchDay);

        // Update used question IDs
        const newUsedIds = [...usedQuestionIds, ...currentQuestions.map(q => q.id)];

        set({
          matchDay: matchDay + 1,
          lastPlayedDate: today,
          matches: [...matches, match],
          standings: newStandings,
          usedQuestionIds: newUsedIds,
          currentMatch: null,
          currentQuestions: [],
          currentAnswers: [],
        });

        return match;
      },

      resetAll: () => {
        set(initialState);
      },
    }),
    {
      name: 'campeonato-canguru-v1',
    }
  )
);
