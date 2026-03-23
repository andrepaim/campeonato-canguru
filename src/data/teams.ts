import type { Team } from '../types';

export const teams: Team[] = [
  { id: 'atletico-mg',  name: 'Atlético Mineiro',      shortName: 'CAM', emoji: '⚫🟡', strength: 5 },
  { id: 'flamengo',     name: 'Flamengo',               shortName: 'FLA', emoji: '🔴⚫', strength: 5 },
  { id: 'palmeiras',    name: 'Palmeiras',               shortName: 'PAL', emoji: '🟢',  strength: 5 },
  { id: 'corinthians',  name: 'Corinthians',             shortName: 'COR', emoji: '⚫⚪', strength: 4 },
  { id: 'fluminense',   name: 'Fluminense',              shortName: 'FLU', emoji: '🟢🔴', strength: 4 },
  { id: 'botafogo',     name: 'Botafogo',                shortName: 'BOT', emoji: '⚫⚪', strength: 4 },
  { id: 'sao-paulo',    name: 'São Paulo',               shortName: 'SAO', emoji: '🔴⚪⚫', strength: 3 },
  { id: 'internacional',name: 'Internacional',           shortName: 'INT', emoji: '🔴',  strength: 3 },
  { id: 'gremio',       name: 'Grêmio',                  shortName: 'GRE', emoji: '🔵⚫', strength: 3 },
  { id: 'athletico-pr', name: 'Athletico Paranaense',    shortName: 'CAP', emoji: '🔴⚫', strength: 3 },
  { id: 'cruzeiro',     name: 'Cruzeiro',                shortName: 'CRU', emoji: '🔵',  strength: 2 },
  { id: 'vasco',        name: 'Vasco da Gama',           shortName: 'VAS', emoji: '⚫⚪', strength: 2 },
  { id: 'bahia',        name: 'Bahia',                   shortName: 'BAH', emoji: '🔵🔴', strength: 2 },
  { id: 'fortaleza',    name: 'Fortaleza',               shortName: 'FOR', emoji: '🔴🔵', strength: 2 },
  { id: 'bragantino',   name: 'Red Bull Bragantino',     shortName: 'RBB', emoji: '⚫🔴', strength: 2 },
  { id: 'cuiaba',       name: 'Cuiabá',                  shortName: 'CUI', emoji: '🟡🟢', strength: 1 },
  { id: 'juventude',    name: 'Juventude',               shortName: 'JUV', emoji: '🟢',  strength: 1 },
  { id: 'criciuma',     name: 'Criciúma',                shortName: 'CRI', emoji: '🟡⚫', strength: 1 },
  { id: 'vitoria',      name: 'Vitória',                 shortName: 'VIT', emoji: '🔴⚫', strength: 1 },
  { id: 'atletico-go',  name: 'Atlético Goianiense',     shortName: 'ACG', emoji: '🔴⚫', strength: 1 },
];

export const getTeamById = (id: string): Team | undefined =>
  teams.find(t => t.id === id);

export const CAM = teams[0];
