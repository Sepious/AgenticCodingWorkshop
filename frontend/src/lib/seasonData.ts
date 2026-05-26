import { matches, teams } from "../data/testData";
import type { Fixture, Team } from "../types";
import {
  buildDoubleRoundRobinSchedule,
  mergePlayedIntoSchedule,
} from "./schedule";

const SEASON_START = "2026-01-10T12:00:00";

let cachedFixtures: Fixture[] | null = null;

export function getSeasonTeams(): Team[] {
  return teams;
}

export function getSeasonFixtures(): Fixture[] {
  if (!cachedFixtures) {
    const schedule = buildDoubleRoundRobinSchedule(teams, SEASON_START);
    cachedFixtures = mergePlayedIntoSchedule(schedule, matches);
  }
  return cachedFixtures;
}

export function getSimulationCutoffOptions(
  fixtures: Fixture[],
): Array<{ label: string; asOf: Date; matchIndex: number }> {
  const played = fixtures.filter(
    (fixture) => fixture.homeGoals !== undefined && fixture.awayGoals !== undefined,
  );

  const options: Array<{ label: string; asOf: Date; matchIndex: number }> = [
    {
      label: "Season start (no matches played)",
      asOf: new Date("2026-01-01T00:00:00Z"),
      matchIndex: 0,
    },
  ];

  played.forEach((fixture, index) => {
    const kickoff = new Date(
      fixture.matchDateTime.endsWith("Z")
        ? fixture.matchDateTime
        : `${fixture.matchDateTime}Z`,
    );
    options.push({
      label: `After match ${index + 1}: ${fixture.id}`,
      asOf: kickoff,
      matchIndex: index + 1,
    });
  });

  return options;
}
