import type { Question } from '../types';

// Question mix by opponent strength (6 questions total)
// Strength 1 = weakest (all easy), 5 = toughest (mostly hard)
const DIFFICULTY_MIX: Record<number, [number, number, number]> = {
  1: [6, 0, 0], // 6 easy, 0 medium, 0 hard
  2: [4, 2, 0],
  3: [2, 3, 1],
  4: [1, 2, 3],
  5: [0, 2, 4],
};

function seededRandom(seed: number): () => number {
  return function () {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

function seededShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array];
  const rng = seededRandom(seed);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function pick<T>(arr: T[], n: number): T[] {
  return arr.slice(0, Math.min(n, arr.length));
}

export function selectMatchQuestions(
  allQuestions: Question[],
  matchDay: number,
  usedIds: string[],
  opponentStrength: 1 | 2 | 3 | 4 | 5 = 3
): Question[] {
  const available = allQuestions.filter(q => !usedIds.includes(q.id));

  const easy   = seededShuffle(available.filter(q => q.difficulty === 'easy'),   matchDay * 1000 + 1);
  const medium = seededShuffle(available.filter(q => q.difficulty === 'medium'), matchDay * 1000 + 2);
  const hard   = seededShuffle(available.filter(q => q.difficulty === 'hard'),   matchDay * 1000 + 3);

  const [nEasy, nMedium, nHard] = DIFFICULTY_MIX[opponentStrength];

  // Pad with easier questions if we run short on a category
  const selectedEasy   = pick(easy,   nEasy);
  const selectedMedium = pick(medium, nMedium);
  const selectedHard   = pick(hard,   nHard);

  const total = selectedEasy.length + selectedMedium.length + selectedHard.length;
  const shortfall = 6 - total;

  // Fill shortfall from whatever category has leftovers (easy first)
  let extra: Question[] = [];
  if (shortfall > 0) {
    const unused = [...easy, ...medium, ...hard]
      .filter(q => ![...selectedEasy, ...selectedMedium, ...selectedHard].includes(q));
    extra = unused.slice(0, shortfall);
  }

  return [...selectedEasy, ...selectedMedium, ...selectedHard, ...extra];
}
