import type { Match } from "../types";

export type FormResult = "W" | "D" | "L";

export function computeTeamForm(
  teamId: string,
  matches: Match[],
  limit = 5,
): FormResult[] {
  const teamMatches = matches
    .filter(
      (match) =>
        match.homeTeamId === teamId || match.awayTeamId === teamId,
    )
    .sort((left, right) =>
      right.matchDateTime.localeCompare(left.matchDateTime),
    )
    .slice(0, limit);

  return teamMatches.map((match) => {
    const isHome = match.homeTeamId === teamId;
    const goalsFor = isHome ? match.homeGoals : match.awayGoals;
    const goalsAgainst = isHome ? match.awayGoals : match.homeGoals;

    if (goalsFor > goalsAgainst) {
      return "W";
    }
    if (goalsFor < goalsAgainst) {
      return "L";
    }
    return "D";
  });
}

export function computeWinRate(won: number, played: number): number {
  if (played === 0) {
    return 0;
  }
  return Math.round((won / played) * 100);
}
