import type { Fixture, ForcedResult, Team } from "../../types";

interface SimulationControlsProps {
  teams: Team[];
  fixtures: Fixture[];
  selectedTeamId: string | null;
  onSelectTeam: (teamId: string | null) => void;
  cutoffIndex: number;
  onCutoffChange: (index: number) => void;
  cutoffOptions: Array<{ label: string; matchIndex: number }>;
  eloModifiers: Record<string, number>;
  onEloChange: (teamId: string, delta: number) => void;
  forcedResults: Record<string, ForcedResult>;
  onForcedResultChange: (matchId: string, result: ForcedResult | "") => void;
  selectedMatchId: string | null;
  onSelectMatch: (matchId: string | null) => void;
}

export function SimulationControls({
  teams,
  fixtures,
  selectedTeamId,
  onSelectTeam,
  cutoffIndex,
  onCutoffChange,
  cutoffOptions,
  eloModifiers,
  onEloChange,
  forcedResults,
  onForcedResultChange,
  selectedMatchId,
  onSelectMatch,
}: SimulationControlsProps) {
  const selectedFixture =
    fixtures.find((fixture) => fixture.id === selectedMatchId) ?? null;

  return (
    <section className="sim-controls" aria-label="Simulation controls">
      <div className="sim-controls__panel">
        <h2 className="sim-controls__title">Simulation point in time</h2>
        <p className="sim-controls__hint">
          Standings and Elo ratings are computed from all matches played up to this
          point. Past result overrides apply retroactively before simulating the rest
          of the season.
        </p>
        <label className="sim-controls__field">
          <span>Simulate from</span>
          <select
            value={cutoffIndex}
            onChange={(event) => onCutoffChange(Number(event.target.value))}
          >
            {cutoffOptions.map((option, index) => (
              <option key={option.label} value={index}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="sim-controls__panel">
        <h2 className="sim-controls__title">Elo modifiers</h2>
        <p className="sim-controls__hint">
          Positive boost or negative decrease adjusts win/draw/loss probabilities for
          that team in every remaining simulated match.
        </p>
        <ul className="sim-controls__elo-list">
          {teams.map((team) => (
            <li key={team.id} className="sim-controls__elo-row">
              <span className="sim-controls__elo-name">{team.name}</span>
              <input
                type="range"
                min={-200}
                max={200}
                step={10}
                value={eloModifiers[team.id] ?? 0}
                onChange={(event) =>
                  onEloChange(team.id, Number(event.target.value))
                }
                aria-label={`Elo modifier for ${team.name}`}
              />
              <span className="sim-controls__elo-value">
                {(eloModifiers[team.id] ?? 0) >= 0 ? "+" : ""}
                {eloModifiers[team.id] ?? 0}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="sim-controls__panel">
        <h2 className="sim-controls__title">Forced match results</h2>
        <p className="sim-controls__hint">
          Override any fixture on the schedule. Past overrides change standings before
          simulation; future overrides replace probabilistic outcomes for that match.
        </p>
        <label className="sim-controls__field">
          <span>Match</span>
          <select
            value={selectedMatchId ?? ""}
            onChange={(event) =>
              onSelectMatch(event.target.value ? event.target.value : null)
            }
          >
            <option value="">Select a match…</option>
            {fixtures.map((fixture) => {
              const home = teams.find((team) => team.id === fixture.homeTeamId);
              const away = teams.find((team) => team.id === fixture.awayTeamId);
              const played =
                fixture.homeGoals !== undefined && fixture.awayGoals !== undefined;
              return (
                <option key={fixture.id} value={fixture.id}>
                  {played ? "[Played] " : "[Future] "}
                  {home?.name ?? fixture.homeTeamId} vs {away?.name ?? fixture.awayTeamId}
                </option>
              );
            })}
          </select>
        </label>
        {selectedFixture ? (
          <label className="sim-controls__field">
            <span>Result override</span>
            <select
              value={forcedResults[selectedFixture.id] ?? ""}
              onChange={(event) =>
                onForcedResultChange(
                  selectedFixture.id,
                  event.target.value as ForcedResult | "",
                )
              }
            >
              <option value="">Use actual / simulated result</option>
              <option value="home_win">Home win</option>
              <option value="away_win">Away win</option>
              <option value="draw">Draw</option>
            </select>
          </label>
        ) : null}
      </div>

      <div className="sim-controls__panel">
        <h2 className="sim-controls__title">Chart focus team</h2>
        <label className="sim-controls__field">
          <span>Highlight team</span>
          <select
            value={selectedTeamId ?? ""}
            onChange={(event) =>
              onSelectTeam(event.target.value ? event.target.value : null)
            }
          >
            <option value="">All teams (distribution)</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
