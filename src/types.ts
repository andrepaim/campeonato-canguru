export interface Team {
  id: string;
  name: string;
  shortName: string;
  emoji: string;
}

export interface Question {
  id: string;
  year: number;
  level: string;
  number: number;
  difficulty: 'easy' | 'medium' | 'hard';
  questionText: string;
  options: [string, string, string, string, string];
  correctAnswer: 'A' | 'B' | 'C' | 'D' | 'E';
  hasImage: boolean;
  pageFile?: string;
}

export interface QuestionAnswer {
  questionId: string;
  answer: 'A' | 'B' | 'C' | 'D' | 'E' | 'skip';
  timeMs: number;
  isCorrect: boolean;
  goalsScored: number;
}

export interface Match {
  matchDay: number;
  date: string;
  opponentId: string;
  camGoals: number;
  opponentGoals: number;
  result: 'W' | 'D' | 'L';
  points: number;
  answers: QuestionAnswer[];
}

export interface TeamStanding {
  teamId: string;
  position: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface ChampionshipState {
  matchDay: number;
  lastPlayedDate: string | null;
  matches: Match[];
  standings: TeamStanding[];
  usedQuestionIds: string[];
  currentMatch: {
    opponentId: string;
    camGoals: number;
    opponentGoals: number;
    questionIndex: number;
  } | null;
  currentQuestions: Question[];
  currentAnswers: QuestionAnswer[];
}

export interface ChampionshipActions {
  canPlayToday: () => boolean;
  startMatch: (opponentId: string, questions: Question[]) => void;
  submitAnswer: (questionId: string, answer: 'A' | 'B' | 'C' | 'D' | 'E', timeMs: number) => number;
  skipQuestion: (questionId: string) => void;
  finalizeMatch: () => Match;
  resetAll: () => void;
}
