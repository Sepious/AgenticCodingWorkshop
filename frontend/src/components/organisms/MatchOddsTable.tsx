import type { FixtureWithOdds, Team } from "../../types";

interface MatchOddsTableProps {
  fixtures: FixtureWithOdds[];
  teams: Team[];
}

function formatPct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function decimalOdds(probability: number): string {
  if (probability <= 0) {
    return "—";
  }
  return (1 / probability).toFixed(2);
}

export function MatchOddsTable({ fixtures, teams }: MatchOddsTableProps) {
  const teamName = Object.fromEntries(teams.map((team) => [team.id, team.name]));
  const future = fixtures.filter((fixture) => fixture.isFuture);

  if (future.length === 0) {
    return (
      <section className="match-odds" aria-label="Future match odds">
        <h2 className="match-odds__title">Future match odds</h2>
        <p className="match-odds__empty">No remaining fixtures from this simulation point.</p>
      </section>
    );
  }

  return (
    <section className="match-odds" aria-label="Future match odds">
      <div className="match-odds__header">
        <h2 className="match-odds__title">Future match odds</h2>
        <p className="match-odds__subtitle">
          Probabilities include Elo modifiers and forced future results
        </p>
      </div>
      <div className="match-odds__scroll">
        <table className="match-odds__table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Home</th>
              <th>Away</th>
              <th>Home win</th>
              <th>Draw</th>
              <th>Away win</th>
              <th>Home (dec.)</th>
              <th>Draw (dec.)</th>
              <th>Away (dec.)</th>
            </tr>
          </thead>
          <tbody>
            {future.map((fixture) => (
              <tr key={fixture.id}>
                <td>{fixture.matchDateTime.slice(0, 10)}</td>
                <td>{teamName[fixture.homeTeamId] ?? fixture.homeTeamId}</td>
                <td>{teamName[fixture.awayTeamId] ?? fixture.awayTeamId}</td>
                <td>{formatPct(fixture.odds.homeWin)}</td>
                <td>{formatPct(fixture.odds.draw)}</td>
                <td>{formatPct(fixture.odds.awayWin)}</td>
                <td>{decimalOdds(fixture.odds.homeWin)}</td>
                <td>{decimalOdds(fixture.odds.draw)}</td>
                <td>{decimalOdds(fixture.odds.awayWin)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
