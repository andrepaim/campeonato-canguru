// Brasileirão 2026 — 19 opponents for CAM, ordered weakest → strongest
export const OPPONENT_ORDER = [
  'chapecoense', 'remo',          // str 1
  'coritiba', 'mirassol', 'vitoria', // str 2
  'athletico-pr', 'bahia', 'santos', 'bragantino', 'vasco', // str 3
  'cruzeiro', 'internacional', 'gremio', 'sao-paulo', 'corinthians', // str 4
  'fluminense',                    // str 4 big
  'botafogo', 'palmeiras', 'flamengo', // str 5
];

export function getOpponentForMatchDay(matchDay: number): string {
  const idx = (matchDay - 1) % OPPONENT_ORDER.length;
  return OPPONENT_ORDER[idx];
}
