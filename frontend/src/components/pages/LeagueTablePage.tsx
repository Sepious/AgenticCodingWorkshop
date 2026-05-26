import { useMemo, useState } from "react";
import { useSeasonData } from "../../context/SeasonDataContext";
import { computeHistory } from "../../lib/leagueHistory";
import { computeLeagueTable } from "../../lib/leagueTable";
import { computeTeamForm } from "../../lib/teamForm";
import { computeTeamPerformanceInsights } from "../../lib/teamInsights";
import { HistoryChart } from "../organisms/HistoryChart";
import { LeaderKpiBanner } from "../organisms/LeaderKpiBanner";
import { LeagueTable } from "../organisms/LeagueTable";
import { TeamPerformanceInsights } from "../organisms/TeamPerformanceInsights";
import { MainLayout } from "../templates/MainLayout";

export function LeagueTablePage() {
  const { teams, matches, dataSource } = useSeasonData();
  const rows = computeLeagueTable(teams, matches);
  const history = computeHistory(teams, matches);
  const leader = rows[0];
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(
    () => leader?.teamId ?? null,
  );
  const formByTeamId = Object.fromEntries(
    teams.map((team) => [team.id, computeTeamForm(team.id, matches)]),
  );
  const selectedInsights = useMemo(() => {
    const selectedRow = rows.find((row) => row.teamId === selectedTeamId);
    return selectedRow
      ? computeTeamPerformanceInsights(selectedRow, matches, teams)
      : null;
  }, [rows, selectedTeamId, matches, teams]);

  return (
    <MainLayout
      matchCount={matches.length}
      teamCount={teams.length}
      title="Premier League 25/26"
      subtitle={`${teams.length} teams · ${matches.length} results · source: ${dataSource}`}
    >
      {leader ? (
        <LeaderKpiBanner
          leader={leader}
          form={formByTeamId[leader.teamId] ?? []}
        />
      ) : null}
      <LeagueTable
        rows={rows}
        formByTeamId={formByTeamId}
        selectedTeamId={selectedTeamId}
        onSelectTeam={setSelectedTeamId}
      />
      <TeamPerformanceInsights insights={selectedInsights} />
      <HistoryChart history={history} teams={teams} />
    </MainLayout>
  );
}
