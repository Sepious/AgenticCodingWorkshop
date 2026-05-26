import type { TeamPerformanceInsights as TeamPerformanceInsightsData } from "../../lib/teamInsights";
import { formatFormString } from "../../lib/teamInsights";
import { FormBadge } from "../atoms/FormBadge";
import { TableCell } from "../atoms/TableCell";
import { FormStrip } from "../molecules/FormStrip";

interface TeamPerformanceInsightsProps {
  insights: TeamPerformanceInsightsData | null;
}

function formatMatchDate(matchDateTime: string): string {
  return matchDateTime.slice(0, 10);
}

export function TeamPerformanceInsights({
  insights,
}: TeamPerformanceInsightsProps) {
  return (
    <section
      className="team-insights"
      aria-label="Team performance insights"
    >
      <div className="team-insights__header">
        <h2 className="team-insights__title">Team Performance Insights</h2>
        <p className="team-insights__subtitle">
          Click a team in the standings to view their season stats
        </p>
      </div>
      <div className="team-insights__scroll">
        <table className="team-insights__table">
          <thead>
            <tr className="team-insights__header-row">
              <TableCell align="left" variant="header" className="table-cell--team">
                Team
              </TableCell>
              <TableCell align="center" variant="header" className="table-cell--form">
                Last 5 Form
              </TableCell>
              <TableCell align="center" variant="header">
                Avg Goals Scored
              </TableCell>
              <TableCell align="center" variant="header">
                Avg Goals Conceded
              </TableCell>
              <TableCell align="center" variant="header">
                Clean Sheets
              </TableCell>
            </tr>
          </thead>
          <tbody>
            {insights ? (
              <tr className="team-insights__data-row">
                <TableCell align="left" className="table-cell--team">
                  <span className="team-insights__team-name">
                    {insights.teamName}
                  </span>
                </TableCell>
                <TableCell align="center" className="table-cell--form">
                  <FormStrip
                    form={insights.form}
                    ariaLabel={`Last 5 form: ${formatFormString(insights.form)}`}
                  />
                </TableCell>
                <TableCell align="center">
                  {insights.avgGoalsScored.toFixed(2)}
                </TableCell>
                <TableCell align="center">
                  {insights.avgGoalsConceded.toFixed(2)}
                </TableCell>
                <TableCell align="center">{insights.cleanSheets}</TableCell>
              </tr>
            ) : (
              <tr className="team-insights__empty-row">
                <TableCell colSpan={5} align="center">
                  Select a team from the standings above
                </TableCell>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="team-insights__matches">
        <h3 className="team-insights__matches-title">Last 5 Matches</h3>
        <div className="team-insights__scroll">
          <table className="team-insights__table team-insights__matches-table">
            <thead>
              <tr className="team-insights__header-row">
                <TableCell align="center" variant="header">
                  Date
                </TableCell>
                <TableCell align="left" variant="header">
                  Opponent
                </TableCell>
                <TableCell align="center" variant="header">
                  H/A
                </TableCell>
                <TableCell align="center" variant="header">
                  Score
                </TableCell>
                <TableCell align="center" variant="header">
                  Result
                </TableCell>
              </tr>
            </thead>
            <tbody>
              {insights && insights.lastFiveMatches.length > 0 ? (
                insights.lastFiveMatches.map((match) => (
                  <tr
                    key={match.matchId}
                    className="team-insights__match-row"
                  >
                    <TableCell align="center">
                      {formatMatchDate(match.matchDateTime)}
                    </TableCell>
                    <TableCell align="left">{match.opponentName}</TableCell>
                    <TableCell align="center">
                      {match.isHome ? "H" : "A"}
                    </TableCell>
                    <TableCell align="center">
                      {match.goalsFor}-{match.goalsAgainst}
                    </TableCell>
                    <TableCell align="center">
                      <FormBadge result={match.result} />
                    </TableCell>
                  </tr>
                ))
              ) : (
                <tr className="team-insights__empty-row">
                  <TableCell colSpan={5} align="center">
                    {insights
                      ? "No finished matches yet"
                      : "Select a team to view recent matches"}
                  </TableCell>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
