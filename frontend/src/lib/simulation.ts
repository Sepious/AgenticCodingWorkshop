import type {
  Fixture,
  ForcedResult,
  SimulationConfig,
  SimulationResult,
  Team,
  TeamSimulationResult,
  TrajectoryPoint,
} from "../types";
import { computeLeagueTable } from "./leagueTable";
import {
  buildRatingsFromFixtures,
  oddsForFixture,
  sampleOutcome,
  updateRatings,
} from "./elo";
import { fixtureToMatch, isFixturePlayed } from "./schedule";
import { parseMatchDateTime } from "./matchDateTime";

const DEFAULT_TRIALS = 2500;

function parseKickoff(value: string): Date {
  return parseMatchDateTime(value);
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) {
    return 1;
  }
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) {
    return sorted[lower];
  }
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

function resolveFixtureGoals(
  fixture: Fixture,
  forced: ForcedResult | undefined,
  ratings: Record<string, number>,
  random: () => number,
): { homeGoals: number; awayGoals: number } | null {
  if (forced === "home_win") {
    return { homeGoals: 2, awayGoals: 1 };
  }
  if (forced === "away_win") {
    return { homeGoals: 1, awayGoals: 2 };
  }
  if (forced === "draw") {
    return { homeGoals: 1, awayGoals: 1 };
  }
  if (isFixturePlayed(fixture)) {
    return { homeGoals: fixture.homeGoals!, awayGoals: fixture.awayGoals! };
  }
  const odds = oddsForFixture(fixture, ratings, {});
  return sampleOutcome(odds, random);
}

function aggregateTeamResults(
  teams: Team[],
  finalPositions: Record<string, number[]>,
  trials: number,
): TeamSimulationResult[] {
  return teams.map((team) => {
    const positions = finalPositions[team.id] ?? [];
    const sorted = [...positions].sort((a, b) => a - b);
    const distribution: Record<number, number> = {};
    for (const position of positions) {
      distribution[position] = (distribution[position] ?? 0) + 1 / trials;
    }

    return {
      teamId: team.id,
      teamName: team.name,
      finalPositionProbabilities: distribution,
      percentiles: {
        p10: percentile(sorted, 0.1),
        p50: percentile(sorted, 0.5),
        p90: percentile(sorted, 0.9),
      },
    };
  });
}

export function runMonteCarloSimulation(
  config: SimulationConfig,
): SimulationResult {
  const {
    asOf,
    fixtures,
    teams,
    eloModifiers,
    forcedResults,
    trials = DEFAULT_TRIALS,
  } = config;

  const baseRatings = buildRatingsFromFixtures(
    teams,
    fixtures,
    forcedResults,
    asOf,
    eloModifiers,
  );

  const matchOdds: SimulationResult["matchOdds"] = {};
  for (const fixture of fixtures) {
    matchOdds[fixture.id] = oddsForFixture(fixture, baseRatings, forcedResults);
  }

  const futureFixtures = fixtures
    .filter((fixture) => parseKickoff(fixture.matchDateTime) > asOf)
    .sort(
      (a, b) =>
        parseKickoff(a.matchDateTime).getTime() -
        parseKickoff(b.matchDateTime).getTime(),
    );

  const roundLabels = new Map<number, string>();
  for (const fixture of fixtures) {
    if (fixture.round && !roundLabels.has(fixture.round)) {
      roundLabels.set(fixture.round, `Round ${fixture.round}`);
    }
  }

  const roundsInFuture = [
    ...new Set(
      futureFixtures.map((fixture) => fixture.round ?? 0).filter((r) => r > 0),
    ),
  ].sort((a, b) => a - b);

  const finalPositions: Record<string, number[]> = Object.fromEntries(
    teams.map((team) => [team.id, []]),
  );
  const trajectoryByRound: Record<
    number,
    Record<string, number[]>
  > = Object.fromEntries(
    roundsInFuture.map((round) => [
      round,
      Object.fromEntries(teams.map((team) => [team.id, []])),
    ]),
  );

  for (let trial = 0; trial < trials; trial += 1) {
    const random = () => Math.random();
    const ratings = { ...baseRatings };
    const playedMatches = fixtures
      .filter((fixture) => parseKickoff(fixture.matchDateTime) <= asOf)
      .map((fixture) => {
        const forced = forcedResults[fixture.id];
        const goals = resolveFixtureGoals(fixture, forced, ratings, random);
        if (!goals) {
          return null;
        }
        return fixtureToMatch({ ...fixture, ...goals });
      })
      .filter((match): match is NonNullable<typeof match> => match !== null);

    let currentMatches = [...playedMatches];
    let lastRound = 0;

    for (const fixture of futureFixtures) {
      const forced = forcedResults[fixture.id];
      const goals = resolveFixtureGoals(fixture, forced, ratings, random);
      if (!goals) {
        continue;
      }

      updateRatings(
        ratings,
        fixture.homeTeamId,
        fixture.awayTeamId,
        goals.homeGoals,
        goals.awayGoals,
      );

      currentMatches = [
        ...currentMatches,
        fixtureToMatch({ ...fixture, ...goals }),
      ];

      const round = fixture.round ?? 0;
      if (round > lastRound) {
        const table = computeLeagueTable(teams, currentMatches);
        for (const row of table) {
          trajectoryByRound[round]?.[row.teamId]?.push(row.position);
        }
        lastRound = round;
      }
    }

    const finalTable = computeLeagueTable(teams, currentMatches);
    for (const row of finalTable) {
      finalPositions[row.teamId].push(row.position);
    }
  }

  const trajectory: TrajectoryPoint[] = roundsInFuture.map((round) => {
    const byTeam = trajectoryByRound[round] ?? {};
    const percentiles: TrajectoryPoint["percentiles"] = {};
    for (const team of teams) {
      const positions = byTeam[team.id] ?? [];
      const sorted = [...positions].sort((a, b) => a - b);
      percentiles[team.id] = {
        p10: percentile(sorted, 0.1),
        p50: percentile(sorted, 0.5),
        p90: percentile(sorted, 0.9),
      };
    }
    return {
      round,
      label: roundLabels.get(round) ?? `Round ${round}`,
      percentiles,
    };
  });

  return {
    trials,
    teams: aggregateTeamResults(teams, finalPositions, trials),
    trajectory,
    matchOdds,
  };
}
