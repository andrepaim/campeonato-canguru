import type { Team } from '../types';

// Brasileirão Série A 2026 — all 20 teams
export const teams: Team[] = [
  // Strength 5 — title contenders
  { id: 'atletico-mg',  name: 'Atlético Mineiro',      shortName: 'CAM', emoji: '⚫🟡', strength: 5 },
  { id: 'flamengo',     name: 'Flamengo',               shortName: 'FLA', emoji: '🔴⚫', strength: 5 },
  { id: 'palmeiras',    name: 'Palmeiras',               shortName: 'PAL', emoji: '🟢',  strength: 5 },
  { id: 'botafogo',     name: 'Botafogo',                shortName: 'BOT', emoji: '⚫⚪', strength: 5 },

  // Strength 4 — strong mid-table
  { id: 'fluminense',   name: 'Fluminense',              shortName: 'FLU', emoji: '🟢🔴', strength: 4 },
  { id: 'corinthians',  name: 'Corinthians',             shortName: 'COR', emoji: '⚫⚪', strength: 4 },
  { id: 'sao-paulo',    name: 'São Paulo',               shortName: 'SAO', emoji: '🔴⚪⚫', strength: 4 },
  { id: 'internacional',name: 'Internacional',           shortName: 'INT', emoji: '🔴',  strength: 4 },
  { id: 'gremio',       name: 'Grêmio',                  shortName: 'GRE', emoji: '🔵⚫', strength: 4 },
  { id: 'cruzeiro',     name: 'Cruzeiro',                shortName: 'CRU', emoji: '🔵',  strength: 4 },

  // Strength 3 — mid-table
  { id: 'vasco',        name: 'Vasco da Gama',           shortName: 'VAS', emoji: '⚫⚪', strength: 3 },
  { id: 'bragantino',   name: 'Red Bull Bragantino',     shortName: 'RBB', emoji: '⚫🔴', strength: 3 },
  { id: 'santos',       name: 'Santos',                  shortName: 'SAN', emoji: '⚫⚪', strength: 3 },
  { id: 'bahia',        name: 'Bahia',                   shortName: 'BAH', emoji: '🔵🔴', strength: 3 },
  { id: 'athletico-pr', name: 'Athletico Paranaense',    shortName: 'CAP', emoji: '🔴⚫', strength: 3 },

  // Strength 2 — lower half
  { id: 'vitoria',      name: 'Vitória',                 shortName: 'VIT', emoji: '🔴⚫', strength: 2 },
  { id: 'mirassol',     name: 'Mirassol',                shortName: 'MIR', emoji: '🟡🔵', strength: 2 },
  { id: 'coritiba',     name: 'Coritiba',                shortName: 'CFC', emoji: '🟢⚪', strength: 2 },

  // Strength 1 — promoted clubs
  { id: 'chapecoense',  name: 'Chapecoense',             shortName: 'CHP', emoji: '🟢',  strength: 1 },
  { id: 'remo',         name: 'Clube do Remo',           shortName: 'REM', emoji: '🔵',  strength: 1 },
];

export const getTeamById = (id: string): Team | undefined =>
  teams.find(t => t.id === id);

export const CAM = teams[0];
