import type { LeagueTableRow, Match, Team } from "../types";

interface TeamStats {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

function emptyStats(): TeamStats {
  return {
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
  };
}

function applyMatch(stats: Record<string, TeamStats>, match: Match): void {
  const { homeTeamId, awayTeamId, homeGoals, awayGoals } = match;

  if (!stats[homeTeamId]) {
    stats[homeTeamId] = emptyStats();
  }
  if (!stats[awayTeamId]) {
    stats[awayTeamId] = emptyStats();
  }

  stats[homeTeamId].played += 1;
  stats[awayTeamId].played += 1;
  stats[homeTeamId].goalsFor += homeGoals;
  stats[homeTeamId].goalsAgainst += awayGoals;
  stats[awayTeamId].goalsFor += awayGoals;
  stats[awayTeamId].goalsAgainst += homeGoals;

  if (homeGoals > awayGoals) {
    stats[homeTeamId].won += 1;
    stats[homeTeamId].points += 3;
    stats[awayTeamId].lost += 1;
  } else if (homeGoals < awayGoals) {
    stats[awayTeamId].won += 1;
    stats[awayTeamId].points += 3;
    stats[homeTeamId].lost += 1;
  } else {
    stats[homeTeamId].drawn += 1;
    stats[homeTeamId].points += 1;
    stats[awayTeamId].drawn += 1;
    stats[awayTeamId].points += 1;
  }
}

export function computeLeagueTable(
  teams: Team[],
  matches: Match[],
): LeagueTableRow[] {
  const teamById = new Map(teams.map((team) => [team.id, team]));
  const stats: Record<string, TeamStats> = {};

  for (const team of teams) {
    stats[team.id] = emptyStats();
  }

  for (const match of matches) {
    applyMatch(stats, match);
  }

  const rows: LeagueTableRow[] = Object.entries(stats).map(
    ([teamId, teamStats]) => {
      const team = teamById.get(teamId);
      const goalsFor = teamStats.goalsFor;
      const goalsAgainst = teamStats.goalsAgainst;

      return {
        teamId,
        teamName: team?.name ?? teamId,
        played: teamStats.played,
        won: teamStats.won,
        drawn: teamStats.drawn,
        lost: teamStats.lost,
        goalsFor,
        goalsAgainst,
        goalDifference: goalsFor - goalsAgainst,
        points: teamStats.points,
        position: 0,
      };
    },
  );

  rows.sort((left, right) => {
    if (right.points !== left.points) {
      return right.points - left.points;
    }
    if (right.goalDifference !== left.goalDifference) {
      return right.goalDifference - left.goalDifference;
    }
    if (right.goalsFor !== left.goalsFor) {
      return right.goalsFor - left.goalsFor;
    }
    return left.teamName.localeCompare(right.teamName, undefined, {
      sensitivity: "base",
    });
  });

  return rows.map((row, index) => ({
    ...row,
    position: index + 1,
  }));
}
