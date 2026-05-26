import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getTeamBrand } from "../../lib/teamBranding";
import type { SimulationResult, Team } from "../../types";

interface FinalPositionChartProps {
  result: SimulationResult;
  teams: Team[];
  focusTeamId: string | null;
}

interface BarRow {
  position: number;
  probability: number;
  label: string;
}

export function FinalPositionChart({
  result,
  teams,
  focusTeamId,
}: FinalPositionChartProps) {
  const chartData = useMemo((): BarRow[] => {
    const teamCount = teams.length;
    const positions = Array.from({ length: teamCount }, (_, index) => index + 1);

    if (focusTeamId) {
      const teamResult = result.teams.find((entry) => entry.teamId === focusTeamId);
      if (!teamResult) {
        return [];
      }
      return positions.map((position) => ({
        position,
        probability: teamResult.finalPositionProbabilities[position] ?? 0,
        label: `#${position}`,
      }));
    }

    const aggregated = new Map<number, number>();
    for (const teamResult of result.teams) {
      for (const [positionKey, probability] of Object.entries(
        teamResult.finalPositionProbabilities,
      )) {
        const position = Number(positionKey);
        aggregated.set(position, (aggregated.get(position) ?? 0) + probability);
      }
    }

    const total = [...aggregated.values()].reduce((sum, value) => sum + value, 0);
    return positions.map((position) => ({
      position,
      probability: (aggregated.get(position) ?? 0) / Math.max(total, 1),
      label: `#${position}`,
    }));
  }, [focusTeamId, result.teams, teams.length]);

  const focusTeam = focusTeamId
    ? teams.find((team) => team.id === focusTeamId)
    : null;
  const brand = focusTeam ? getTeamBrand(focusTeam.id) : null;

  return (
    <section className="sim-chart" aria-label="Final position probabilities">
      <div className="sim-chart__header">
        <h2 className="sim-chart__title">Final position probabilities</h2>
        <p className="sim-chart__subtitle">
          {focusTeam
            ? `${brand?.emoji} ${focusTeam.name} — chance of finishing in each position`
            : "League-wide average finish-position distribution across all teams"}
        </p>
      </div>
      <div className="sim-chart__canvas">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
            <CartesianGrid
              stroke="rgba(255, 255, 255, 0.08)"
              strokeDasharray="4 8"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "#e0aaff", fontSize: 12 }}
            />
            <YAxis
              tickFormatter={(value) => `${(Number(value) * 100).toFixed(0)}%`}
              tick={{ fill: "#e0aaff", fontSize: 12 }}
              domain={[0, "auto"]}
            />
            <Tooltip
              formatter={(value) => [
                `${(Number(value) * 100).toFixed(1)}%`,
                "Probability",
              ]}
              contentStyle={{
                background: "rgba(15, 5, 35, 0.95)",
                border: "1px solid rgba(255, 190, 11, 0.35)",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="probability" radius={[6, 6, 0, 0]}>
              {chartData.map((entry) => (
                <Cell
                  key={entry.position}
                  fill={
                    focusTeam
                      ? (brand?.primary ?? "#8338ec")
                      : `hsl(${(entry.position * 36) % 360} 85% 60%)`
                  }
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="sim-chart__percentile-table">
        <h3 className="sim-chart__table-title">Final rank percentiles (P10 / P50 / P90)</h3>
        <table>
          <thead>
            <tr>
              <th>Team</th>
              <th>P10</th>
              <th>P50</th>
              <th>P90</th>
            </tr>
          </thead>
          <tbody>
            {[...result.teams]
              .sort((a, b) => a.percentiles.p50 - b.percentiles.p50)
              .map((row) => {
                const teamBrand = getTeamBrand(row.teamId);
                return (
                  <tr
                    key={row.teamId}
                    className={
                      focusTeamId === row.teamId ? "sim-chart__row--focus" : undefined
                    }
                  >
                    <td>
                      {teamBrand.emoji} {row.teamName}
                    </td>
                    <td>#{row.percentiles.p10.toFixed(1)}</td>
                    <td>#{row.percentiles.p50.toFixed(1)}</td>
                    <td>#{row.percentiles.p90.toFixed(1)}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
