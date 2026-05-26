export interface Team {
  id: string;
  name: string;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeGoals: number;
  awayGoals: number;
  matchDateTime: string;
}

export interface LeagueTableRow {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  position: number;
}

export interface StandingSnapshot {
  teamId: string;
  teamName: string;
  position: number;
  points: number;
  playedMatches: number;
}

export interface WeekSnapshot {
  week: string;
  weekEnd: string;
  standings: StandingSnapshot[];
}

export interface Fixture {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  matchDateTime: string;
  homeGoals?: number;
  awayGoals?: number;
  round?: number;
}

export type ForcedResult = "home_win" | "away_win" | "draw";

export interface EloModifier {
  teamId: string;
  delta: number;
}

export interface MatchProbabilities {
  homeWin: number;
  draw: number;
  awayWin: number;
}

export interface SimulationConfig {
  asOf: Date;
  fixtures: Fixture[];
  teams: Team[];
  eloModifiers: Record<string, number>;
  forcedResults: Record<string, ForcedResult>;
  trials?: number;
}

export interface PositionPercentiles {
  p10: number;
  p50: number;
  p90: number;
}

export interface TeamSimulationResult {
  teamId: string;
  teamName: string;
  finalPositionProbabilities: Record<number, number>;
  percentiles: PositionPercentiles;
}

export interface TrajectoryPoint {
  round: number;
  label: string;
  percentiles: Record<string, PositionPercentiles>;
}

export interface SimulationResult {
  trials: number;
  teams: TeamSimulationResult[];
  trajectory: TrajectoryPoint[];
  matchOdds: Record<string, MatchProbabilities>;
}

export interface FixtureWithOdds extends Fixture {
  odds: MatchProbabilities;
  isFuture: boolean;
}
