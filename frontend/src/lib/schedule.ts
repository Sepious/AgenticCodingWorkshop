import type { Fixture, Team } from "../types";

function pairingKey(homeTeamId: string, awayTeamId: string): string {
  return `${homeTeamId}|${awayTeamId}`;
}

/** Berger (circle) method — one round of single round-robin for even team count. */
function singleRoundRobinRounds(teamIds: string[]): Array<Array<[string, string]>> {
  const ids = [...teamIds];
  if (ids.length % 2 !== 0) {
    ids.push("__bye__");
  }

  const n = ids.length;
  const rounds: Array<Array<[string, string]>> = [];
  const fixed = ids[0];
  const rotating = ids.slice(1);

  for (let round = 0; round < n - 1; round += 1) {
    const pairings: Array<[string, string]> = [];
    const left = [fixed, ...rotating.slice(0, (n - 2) / 2)];
    const right = rotating.slice((n - 2) / 2).reverse();

    for (let i = 0; i < left.length; i += 1) {
      const home = left[i];
      const away = right[i];
      if (home === "__bye__" || away === "__bye__") {
        continue;
      }
      pairings.push([home, away]);
    }

    rounds.push(pairings);
    rotating.unshift(rotating.pop()!);
  }

  return rounds;
}

function addDays(isoDate: string, days: number): string {
  const date = new Date(isoDate.endsWith("Z") ? isoDate : `${isoDate}Z`);
  date.setUTCDate(date.getUTCDate() + days);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const h = String(date.getUTCHours()).padStart(2, "0");
  const min = String(date.getUTCMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${min}:00`;
}

/**
 * Full double round-robin schedule: every team plays every other twice (home and away).
 */
export function buildDoubleRoundRobinSchedule(
  teams: Team[],
  seasonStart: string,
  daysBetweenRounds = 7,
): Fixture[] {
  const teamIds = [...teams]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((team) => team.id);

  const firstLegRounds = singleRoundRobinRounds(teamIds);
  const secondLegRounds = firstLegRounds.map((round) =>
    round.map(([home, away]) => [away, home] as [string, string]),
  );
  const allRounds = [...firstLegRounds, ...secondLegRounds];

  const fixtures: Fixture[] = [];
  let matchIndex = 0;

  for (let roundIndex = 0; roundIndex < allRounds.length; roundIndex += 1) {
    const kickoff = addDays(seasonStart, roundIndex * daysBetweenRounds);
    for (const [homeTeamId, awayTeamId] of allRounds[roundIndex]) {
      matchIndex += 1;
      fixtures.push({
        id: `sr:schedule:${matchIndex}`,
        homeTeamId,
        awayTeamId,
        matchDateTime: kickoff,
        round: roundIndex + 1,
      });
    }
  }

  return fixtures.sort((a, b) => {
    const timeDiff =
      new Date(a.matchDateTime).getTime() - new Date(b.matchDateTime).getTime();
    if (timeDiff !== 0) {
      return timeDiff;
    }
    return a.id.localeCompare(b.id);
  });
}

/** Merge played matches into the generated schedule by home/away pairing. */
export function mergePlayedIntoSchedule(
  schedule: Fixture[],
  played: Array<{
    id: string;
    homeTeamId: string;
    awayTeamId: string;
    homeGoals: number;
    awayGoals: number;
    matchDateTime: string;
  }>,
): Fixture[] {
  const playedByPair = new Map<string, (typeof played)[number]>();
  for (const match of played) {
    playedByPair.set(pairingKey(match.homeTeamId, match.awayTeamId), match);
  }

  const consumed = new Set<string>();

  const merged = schedule.map((fixture) => {
    const key = pairingKey(fixture.homeTeamId, fixture.awayTeamId);
    const result = playedByPair.get(key);
    if (result) {
      consumed.add(key);
      return {
        ...fixture,
        id: result.id,
        matchDateTime: result.matchDateTime,
        homeGoals: result.homeGoals,
        awayGoals: result.awayGoals,
      };
    }
    return fixture;
  });

  for (const match of played) {
    const key = pairingKey(match.homeTeamId, match.awayTeamId);
    if (!consumed.has(key)) {
      merged.push({
        id: match.id,
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        matchDateTime: match.matchDateTime,
        homeGoals: match.homeGoals,
        awayGoals: match.awayGoals,
        round: 0,
      });
    }
  }

  return merged.sort((a, b) => {
    const timeDiff =
      new Date(a.matchDateTime).getTime() - new Date(b.matchDateTime).getTime();
    if (timeDiff !== 0) {
      return timeDiff;
    }
    return a.id.localeCompare(b.id);
  });
}

export function isFixturePlayed(fixture: Fixture): boolean {
  return fixture.homeGoals !== undefined && fixture.awayGoals !== undefined;
}

export function fixtureToMatch(fixture: Fixture) {
  return {
    id: fixture.id,
    homeTeamId: fixture.homeTeamId,
    awayTeamId: fixture.awayTeamId,
    homeGoals: fixture.homeGoals!,
    awayGoals: fixture.awayGoals!,
    matchDateTime: fixture.matchDateTime,
  };
}
