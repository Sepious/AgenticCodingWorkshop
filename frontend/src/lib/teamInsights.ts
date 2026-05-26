import type { LeagueTableRow, Match, Team } from "../types";
import type { FormResult } from "./teamForm";

export interface TeamMatchSummary {
  matchId: string;
  matchDateTime: string;
  opponentName: string;
  isHome: boolean;
  goalsFor: number;
  goalsAgainst: number;
  result: FormResult;
}

export interface TeamPerformanceInsights {
  teamId: string;
  teamName: string;
  form: FormResult[];
  lastFiveMatches: TeamMatchSummary[];
  avgGoalsScored: number;
  avgGoalsConceded: number;
  cleanSheets: number;
}

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

function getTeamMatches(teamId: string, matches: Match[]): Match[] {
  return matches.filter(
    (match) => match.homeTeamId === teamId || match.awayTeamId === teamId,
  );
}

function matchResult(
  goalsFor: number,
  goalsAgainst: number,
): FormResult {
  if (goalsFor > goalsAgainst) {
    return "W";
  }
  if (goalsFor < goalsAgainst) {
    return "L";
  }
  return "D";
}

export function getLastFiveTeamMatches(
  teamId: string,
  matches: Match[],
  teams: Team[],
): TeamMatchSummary[] {
  const teamNameById = new Map(teams.map((team) => [team.id, team.name]));

  return getTeamMatches(teamId, matches)
    .sort((left, right) =>
      right.matchDateTime.localeCompare(left.matchDateTime),
    )
    .slice(0, 5)
    .map((match) => {
      const isHome = match.homeTeamId === teamId;
      const opponentId = isHome ? match.awayTeamId : match.homeTeamId;
      const goalsFor = isHome ? match.homeGoals : match.awayGoals;
      const goalsAgainst = isHome ? match.awayGoals : match.homeGoals;

      return {
        matchId: match.id,
        matchDateTime: match.matchDateTime,
        opponentName: teamNameById.get(opponentId) ?? opponentId,
        isHome,
        goalsFor,
        goalsAgainst,
        result: matchResult(goalsFor, goalsAgainst),
      };
    });
}

export function computeCleanSheets(teamId: string, matches: Match[]): number {
  return getTeamMatches(teamId, matches).filter((match) => {
    const isHome = match.homeTeamId === teamId;
    const goalsAgainst = isHome ? match.awayGoals : match.homeGoals;
    return goalsAgainst === 0;
  }).length;
}

export function computeTeamPerformanceInsights(
  row: LeagueTableRow,
  matches: Match[],
  teams: Team[],
): TeamPerformanceInsights {
  const played = row.played;
  const lastFiveMatches = getLastFiveTeamMatches(row.teamId, matches, teams);

  return {
    teamId: row.teamId,
    teamName: row.teamName,
    form: lastFiveMatches.map((match) => match.result),
    lastFiveMatches,
    avgGoalsScored:
      played > 0 ? roundToTwoDecimals(row.goalsFor / played) : 0,
    avgGoalsConceded:
      played > 0 ? roundToTwoDecimals(row.goalsAgainst / played) : 0,
    cleanSheets: computeCleanSheets(row.teamId, matches),
  };
}

export function formatFormString(form: FormResult[]): string {
  return form.length > 0 ? form.join(" ") : "—";
}
