import type { Fixture, Match, Team, WeekSnapshot } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

interface ApiFixture {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  matchDateTime: string;
  homeGoals?: number;
  awayGoals?: number;
  round?: number;
}

interface ApiMatch {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeGoals: number;
  awayGoals: number;
  matchDateTime?: string;
}

export interface SeasonData {
  teams: Team[];
  fixtures: Fixture[];
  matches: Match[];
  history: WeekSnapshot[];
  dataSource: string;
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

function toFixture(raw: ApiFixture): Fixture {
  return {
    id: raw.id,
    homeTeamId: raw.homeTeamId,
    awayTeamId: raw.awayTeamId,
    matchDateTime: raw.matchDateTime,
    homeGoals: raw.homeGoals,
    awayGoals: raw.awayGoals,
    round: raw.round,
  };
}

function toMatch(raw: ApiMatch): Match {
  if (!raw.matchDateTime) {
    throw new Error(`Match ${raw.id} is missing matchDateTime`);
  }
  return {
    id: raw.id,
    homeTeamId: raw.homeTeamId,
    awayTeamId: raw.awayTeamId,
    homeGoals: raw.homeGoals,
    awayGoals: raw.awayGoals,
    matchDateTime: raw.matchDateTime,
  };
}

export async function fetchSeasonData(): Promise<SeasonData> {
  const [health, teams, fixtures, matches, history] = await Promise.all([
    fetchJson<{ status: string; dataSource: string }>("/health"),
    fetchJson<Team[]>("/teams"),
    fetchJson<ApiFixture[]>("/fixtures"),
    fetchJson<ApiMatch[]>("/matches"),
    fetchJson<WeekSnapshot[]>("/history"),
  ]);

  return {
    teams,
    fixtures: fixtures.map(toFixture),
    matches: matches.map(toMatch),
    history,
    dataSource: health.dataSource,
  };
}
