// Opponent rotation: weaker teams first, stronger teams later
export const OPPONENT_ORDER = [
  'cuiaba',
  'criciuma',
  'vitoria',
  'atletico-go',
  'juventude',
  'bragantino',
  'fortaleza',
  'bahia',
  'vasco',
  'cruzeiro',
  'athletico-pr',
  'botafogo',
  'internacional',
  'gremio',
  'sao-paulo',
  'corinthians',
  'fluminense',
  'palmeiras',
  'flamengo',
];

export const getOpponentForMatchDay = (matchDay: number): string => {
  const index = (matchDay - 1) % 19;
  return OPPONENT_ORDER[index];
};
