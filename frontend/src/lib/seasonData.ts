import type { Fixture } from "../types";
import { parseMatchDateTime } from "./matchDateTime";

export function getSimulationCutoffOptions(
  fixtures: Fixture[],
): Array<{ label: string; asOf: Date; matchIndex: number }> {
  const played = fixtures.filter(
    (fixture) => fixture.homeGoals !== undefined && fixture.awayGoals !== undefined,
  );

  const seasonStart = played[0]?.matchDateTime
    ? parseMatchDateTime(played[0].matchDateTime)
    : new Date("2025-08-01T00:00:00Z");

  const options: Array<{ label: string; asOf: Date; matchIndex: number }> = [
    {
      label: "Season start (no matches played)",
      asOf: new Date(seasonStart.getTime() - 86_400_000),
      matchIndex: 0,
    },
  ];

  played.forEach((fixture, index) => {
    const kickoff = parseMatchDateTime(fixture.matchDateTime);
    options.push({
      label: `After match ${index + 1}: ${fixture.id}`,
      asOf: kickoff,
      matchIndex: index + 1,
    });
  });

  return options;
}
