import { matches, teams } from "../../data/testData";
import { computeHistory } from "../../lib/leagueHistory";
import { computeLeagueTable } from "../../lib/leagueTable";
import { computeTeamForm } from "../../lib/teamForm";
import { HistoryChart } from "../organisms/HistoryChart";
import { LeaderKpiBanner } from "../organisms/LeaderKpiBanner";
import { LeagueTable } from "../organisms/LeagueTable";
import { MainLayout } from "../templates/MainLayout";

export function LeagueTablePage() {
  const rows = computeLeagueTable(teams, matches);
  const history = computeHistory(teams, matches);
  const leader = rows[0];
  const formByTeamId = Object.fromEntries(
    teams.map((team) => [team.id, computeTeamForm(team.id, matches)]),
  );

  return (
    <MainLayout matchCount={matches.length} teamCount={teams.length}>
      {leader ? (
        <LeaderKpiBanner
          leader={leader}
          form={formByTeamId[leader.teamId] ?? []}
        />
      ) : null}
      <LeagueTable rows={rows} formByTeamId={formByTeamId} />
      <HistoryChart history={history} teams={teams} />
    </MainLayout>
  );
}
