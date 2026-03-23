import type { Question } from '../types';

/**
 * Question mix by opponent strength (6 questions total).
 * Format: [P-easy, E-easy, E-medium, E-hard]
 *
 * Strength 1 (Chapecoense, Remo):        P-level warm-up — all easy
 * Strength 2 (Coritiba, Mirassol, Vitória): mostly P + some E-easy
 * Strength 3 (Vasco, Santos, Bahia...):   balanced E-level
 * Strength 4 (Grêmio, Inter, Cruzeiro...): harder E-level
 * Strength 5 (Palmeiras, Flamengo, Botafogo, CAM): mostly hard
 */
const DIFFICULTY_MIX: Record<number, [number, number, number, number]> = {
  // [P-easy, E-easy, E-medium, E-hard]
  1: [6, 0, 0, 0],  // all P-easy
  2: [3, 3, 0, 0],  // half P-easy, half E-easy
  3: [0, 2, 3, 1],  // pure E, balanced
  4: [0, 1, 2, 3],  // E, hard-leaning
  5: [0, 0, 2, 4],  // E, mostly hard
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

  const pEasy   = seededShuffle(available.filter(q => q.level === 'P' && q.difficulty === 'easy'),   matchDay * 1000 + 0);
  const eEasy   = seededShuffle(available.filter(q => q.level === 'E' && q.difficulty === 'easy'),   matchDay * 1000 + 1);
  const eMedium = seededShuffle(available.filter(q => q.level === 'E' && q.difficulty === 'medium'), matchDay * 1000 + 2);
  const eHard   = seededShuffle(available.filter(q => q.level === 'E' && q.difficulty === 'hard'),   matchDay * 1000 + 3);

  const [nPEasy, nEEasy, nEMedium, nEHard] = DIFFICULTY_MIX[opponentStrength];

  const selected = [
    ...pick(pEasy,   nPEasy),
    ...pick(eEasy,   nEEasy),
    ...pick(eMedium, nEMedium),
    ...pick(eHard,   nEHard),
  ];

  // Pad if a bucket ran short
  if (selected.length < 6) {
    const usedInMatch = new Set(selected.map(q => q.id));
    const fallback = [...pEasy, ...eEasy, ...eMedium, ...eHard]
      .filter(q => !usedInMatch.has(q.id));
    selected.push(...fallback.slice(0, 6 - selected.length));
  }

  return selected;
}
