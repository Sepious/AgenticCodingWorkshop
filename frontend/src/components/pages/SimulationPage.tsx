import { useMemo, useState } from "react";
import { useSeasonData } from "../../context/SeasonDataContext";
import { getSimulationCutoffOptions } from "../../lib/seasonData";
import { runMonteCarloSimulation } from "../../lib/simulation";
import { isFixturePlayed } from "../../lib/schedule";
import type { FixtureWithOdds, ForcedResult } from "../../types";
import { parseMatchDateTime } from "../../lib/matchDateTime";
import { FinalPositionChart } from "../organisms/FinalPositionChart";
import { MatchOddsTable } from "../organisms/MatchOddsTable";
import { SimulationControls } from "../organisms/SimulationControls";
import { SimulationTrajectoryChart } from "../organisms/SimulationTrajectoryChart";
import { MainLayout } from "../templates/MainLayout";

export function SimulationPage() {
  const { teams, fixtures, dataSource } = useSeasonData();
  const cutoffOptions = useMemo(
    () => getSimulationCutoffOptions(fixtures),
    [fixtures],
  );

  const [cutoffIndex, setCutoffIndex] = useState(
    () => Math.max(0, cutoffOptions.length - 1),
  );
  const [eloModifiers, setEloModifiers] = useState<Record<string, number>>({});
  const [forcedResults, setForcedResults] = useState<Record<string, ForcedResult>>(
    {},
  );
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [focusTeamId, setFocusTeamId] = useState<string | null>(teams[0]?.id ?? null);

  const asOf = cutoffOptions[cutoffIndex]?.asOf ?? new Date();

  const simulationResult = useMemo(
    () =>
      runMonteCarloSimulation({
        asOf,
        fixtures,
        teams,
        eloModifiers,
        forcedResults,
      }),
    [asOf, fixtures, teams, eloModifiers, forcedResults],
  );

  const fixturesWithOdds: FixtureWithOdds[] = useMemo(
    () =>
      fixtures.map((fixture) => {
        const kickoff = parseMatchDateTime(fixture.matchDateTime);
        return {
          ...fixture,
          isFuture: kickoff > asOf && !isFixturePlayed(fixture),
          odds: simulationResult.matchOdds[fixture.id] ?? {
            homeWin: 0,
            draw: 0,
            awayWin: 0,
          },
        };
      }),
    [fixtures, asOf, simulationResult.matchOdds],
  );

  const handleEloChange = (teamId: string, delta: number) => {
    setEloModifiers((current) => ({ ...current, [teamId]: delta }));
  };

  const handleForcedResultChange = (matchId: string, result: ForcedResult | "") => {
    setForcedResults((current) => {
      const next = { ...current };
      if (!result) {
        delete next[matchId];
      } else {
        next[matchId] = result;
      }
      return next;
    });
  };

  const playedCount = fixtures.filter((fixture) => {
    const kickoff = parseMatchDateTime(fixture.matchDateTime);
    return kickoff <= asOf && isFixturePlayed(fixture);
  }).length;

  return (
    <MainLayout
      teamCount={teams.length}
      matchCount={fixtures.length}
      title="Premier League 25/26 Simulation"
      subtitle={`Monte Carlo · ${simulationResult.trials.toLocaleString()} trials · ${playedCount} played at cutoff · source: ${dataSource}`}
    >
      <SimulationControls
        teams={teams}
        fixtures={fixtures}
        selectedTeamId={focusTeamId}
        onSelectTeam={setFocusTeamId}
        cutoffIndex={cutoffIndex}
        onCutoffChange={setCutoffIndex}
        cutoffOptions={cutoffOptions}
        eloModifiers={eloModifiers}
        onEloChange={handleEloChange}
        forcedResults={forcedResults}
        onForcedResultChange={handleForcedResultChange}
        selectedMatchId={selectedMatchId}
        onSelectMatch={setSelectedMatchId}
      />

      <div className="sim-page__charts">
        <SimulationTrajectoryChart
          result={simulationResult}
          teams={teams}
          focusTeamId={focusTeamId}
        />
        <FinalPositionChart
          result={simulationResult}
          teams={teams}
          focusTeamId={focusTeamId}
        />
      </div>

      <MatchOddsTable fixtures={fixturesWithOdds} teams={teams} />
    </MainLayout>
  );
}
