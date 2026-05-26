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
