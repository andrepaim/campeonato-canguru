import type { Team } from '../types';

export const teams: Team[] = [
  { id: 'atletico-mg', name: 'Atlético Mineiro', shortName: 'CAM', emoji: '⚫🟡' },
  { id: 'flamengo', name: 'Flamengo', shortName: 'FLA', emoji: '🔴⚫' },
  { id: 'palmeiras', name: 'Palmeiras', shortName: 'PAL', emoji: '🟢' },
  { id: 'sao-paulo', name: 'São Paulo', shortName: 'SAO', emoji: '🔴⚪⚫' },
  { id: 'internacional', name: 'Internacional', shortName: 'INT', emoji: '🔴' },
  { id: 'gremio', name: 'Grêmio', shortName: 'GRE', emoji: '🔵⚫' },
  { id: 'fluminense', name: 'Fluminense', shortName: 'FLU', emoji: '🟢🔴' },
  { id: 'corinthians', name: 'Corinthians', shortName: 'COR', emoji: '⚫⚪' },
  { id: 'athletico-pr', name: 'Athletico Paranaense', shortName: 'CAP', emoji: '🔴⚫' },
  { id: 'bahia', name: 'Bahia', shortName: 'BAH', emoji: '🔵🔴' },
  { id: 'bragantino', name: 'Red Bull Bragantino', shortName: 'RBB', emoji: '⚫🔴' },
  { id: 'vasco', name: 'Vasco da Gama', shortName: 'VAS', emoji: '⚫⚪' },
  { id: 'botafogo', name: 'Botafogo', shortName: 'BOT', emoji: '⚫⚪' },
  { id: 'cruzeiro', name: 'Cruzeiro', shortName: 'CRU', emoji: '🔵' },
  { id: 'fortaleza', name: 'Fortaleza', shortName: 'FOR', emoji: '🔴🔵' },
  { id: 'cuiaba', name: 'Cuiabá', shortName: 'CUI', emoji: '🟡🟢' },
  { id: 'juventude', name: 'Juventude', shortName: 'JUV', emoji: '🟢' },
  { id: 'criciuma', name: 'Criciúma', shortName: 'CRI', emoji: '🟡⚫' },
  { id: 'vitoria', name: 'Vitória', shortName: 'VIT', emoji: '🔴⚫' },
  { id: 'atletico-go', name: 'Atlético Goianiense', shortName: 'ACG', emoji: '🔴⚫' },
];

export const getTeamById = (id: string): Team | undefined => {
  return teams.find(team => team.id === id);
};

export const CAM = teams[0];
