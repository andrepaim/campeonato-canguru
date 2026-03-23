import type { Question } from '../types';

// Seeded random number generator
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

// Seeded shuffle using Fisher-Yates
function seededShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array];
  const random = seededRandom(seed);

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

export function selectMatchQuestions(
  allQuestions: Question[],
  matchDay: number,
  usedIds: string[]
): Question[] {
  // Filter out used questions
  const availableQuestions = allQuestions.filter(q => !usedIds.includes(q.id));

  // Separate by difficulty
  const easy = availableQuestions.filter(q => q.difficulty === 'easy');
  const medium = availableQuestions.filter(q => q.difficulty === 'medium');
  const hard = availableQuestions.filter(q => q.difficulty === 'hard');

  // Seeded shuffle each category
  const shuffledEasy = seededShuffle(easy, matchDay * 1000 + 1);
  const shuffledMedium = seededShuffle(medium, matchDay * 1000 + 2);
  const shuffledHard = seededShuffle(hard, matchDay * 1000 + 3);

  // Select 2 from each
  const selectedEasy = shuffledEasy.slice(0, 2);
  const selectedMedium = shuffledMedium.slice(0, 2);
  const selectedHard = shuffledHard.slice(0, 2);

  // Combine: easy first, then medium, then hard
  return [...selectedEasy, ...selectedMedium, ...selectedHard];
}
