import type { Fixture, MatchProbabilities, Team } from "../types";
import { parseMatchDateTime } from "./matchDateTime";
import { fixtureToMatch, isFixturePlayed } from "./schedule";

const DEFAULT_ELO = 1500;
const HOME_ADVANTAGE = 100;
const K_FACTOR = 32;
const BASE_DRAW_RATE = 0.27;

export function createInitialRatings(teams: Team[]): Record<string, number> {
  return Object.fromEntries(teams.map((team) => [team.id, DEFAULT_ELO]));
}

export function applyEloModifiers(
  ratings: Record<string, number>,
  modifiers: Record<string, number>,
): Record<string, number> {
  const adjusted = { ...ratings };
  for (const [teamId, delta] of Object.entries(modifiers)) {
    if (adjusted[teamId] !== undefined) {
      adjusted[teamId] += delta;
    }
  }
  return adjusted;
}

function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + 10 ** ((ratingB - ratingA) / 400));
}

export function updateRatings(
  ratings: Record<string, number>,
  homeId: string,
  awayId: string,
  homeGoals: number,
  awayGoals: number,
): void {
  const homeRating = ratings[homeId] ?? DEFAULT_ELO;
  const awayRating = ratings[awayId] ?? DEFAULT_ELO;
  const homeExpected = expectedScore(homeRating + HOME_ADVANTAGE, awayRating);
  const awayExpected = 1 - homeExpected;

  let homeScore: number;
  let awayScore: number;
  if (homeGoals > awayGoals) {
    homeScore = 1;
    awayScore = 0;
  } else if (homeGoals < awayGoals) {
    homeScore = 0;
    awayScore = 1;
  } else {
    homeScore = 0.5;
    awayScore = 0.5;
  }

  ratings[homeId] = homeRating + K_FACTOR * (homeScore - homeExpected);
  ratings[awayId] = awayRating + K_FACTOR * (awayScore - awayExpected);
}

function forcedGoals(result: "home_win" | "away_win" | "draw"): {
  homeGoals: number;
  awayGoals: number;
} {
  if (result === "home_win") {
    return { homeGoals: 2, awayGoals: 1 };
  }
  if (result === "away_win") {
    return { homeGoals: 1, awayGoals: 2 };
  }
  return { homeGoals: 1, awayGoals: 1 };
}

export function buildRatingsFromFixtures(
  teams: Team[],
  fixtures: Fixture[],
  forcedResults: Record<string, "home_win" | "away_win" | "draw">,
  asOf: Date,
  eloModifiers: Record<string, number>,
): Record<string, number> {
  const ratings = createInitialRatings(teams);
  const sorted = [...fixtures].sort(
    (a, b) =>
      new Date(a.matchDateTime).getTime() - new Date(b.matchDateTime).getTime(),
  );

  for (const fixture of sorted) {
    const kickoff = parseMatchDateTime(fixture.matchDateTime);
    if (kickoff > asOf) {
      continue;
    }

    const forced = forcedResults[fixture.id];
    if (forced) {
      const { homeGoals, awayGoals } = forcedGoals(forced);
      updateRatings(ratings, fixture.homeTeamId, fixture.awayTeamId, homeGoals, awayGoals);
      continue;
    }

    if (isFixturePlayed(fixture)) {
      updateRatings(
        ratings,
        fixture.homeTeamId,
        fixture.awayTeamId,
        fixture.homeGoals!,
        fixture.awayGoals!,
      );
    }
  }

  return applyEloModifiers(ratings, eloModifiers);
}

export function matchProbabilities(
  homeRating: number,
  awayRating: number,
): MatchProbabilities {
  const diff = homeRating + HOME_ADVANTAGE - awayRating;
  const homeWinShare = expectedScore(homeRating + HOME_ADVANTAGE, awayRating);
  const draw = BASE_DRAW_RATE * Math.exp(-Math.abs(diff) / 500);
  const remaining = 1 - draw;
  const homeWin = remaining * homeWinShare;
  const awayWin = remaining * (1 - homeWinShare);

  return {
    homeWin: Math.max(0, Math.min(1, homeWin)),
    draw: Math.max(0, Math.min(1, draw)),
    awayWin: Math.max(0, Math.min(1, awayWin)),
  };
}

export function oddsForFixture(
  fixture: Fixture,
  ratings: Record<string, number>,
  forcedResults: Record<string, "home_win" | "away_win" | "draw">,
): MatchProbabilities {
  const forced = forcedResults[fixture.id];
  if (forced === "home_win") {
    return { homeWin: 1, draw: 0, awayWin: 0 };
  }
  if (forced === "away_win") {
    return { homeWin: 0, draw: 0, awayWin: 1 };
  }
  if (forced === "draw") {
    return { homeWin: 0, draw: 1, awayWin: 0 };
  }

  return matchProbabilities(
    ratings[fixture.homeTeamId] ?? DEFAULT_ELO,
    ratings[fixture.awayTeamId] ?? DEFAULT_ELO,
  );
}

export function sampleOutcome(
  odds: MatchProbabilities,
  random: () => number,
): { homeGoals: number; awayGoals: number } {
  const roll = random();
  if (roll < odds.homeWin) {
    return { homeGoals: 2, awayGoals: 1 };
  }
  if (roll < odds.homeWin + odds.draw) {
    return { homeGoals: 1, awayGoals: 1 };
  }
  return { homeGoals: 1, awayGoals: 2 };
}

export function fixturesAsMatches(
  fixtures: Fixture[],
  forcedResults: Record<string, "home_win" | "away_win" | "draw">,
  asOf: Date,
) {
  return fixtures
    .filter((fixture) => parseMatchDateTime(fixture.matchDateTime) <= asOf)
    .map((fixture) => {
      const forced = forcedResults[fixture.id];
      if (forced) {
        const goals = forcedGoals(forced);
        return {
          ...fixtureToMatch({ ...fixture, ...goals }),
        };
      }
      if (isFixturePlayed(fixture)) {
        return fixtureToMatch(fixture);
      }
      return null;
    })
    .filter((match): match is NonNullable<typeof match> => match !== null);
}
