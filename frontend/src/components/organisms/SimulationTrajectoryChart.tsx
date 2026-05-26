import { useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getTeamBrand } from "../../lib/teamBranding";
import type { SimulationResult, Team } from "../../types";

interface SimulationTrajectoryChartProps {
  result: SimulationResult;
  teams: Team[];
  focusTeamId: string | null;
}

interface ChartRow {
  label: string;
  p10: number;
  p50: number;
  p90: number;
  bandBase: number;
  bandHeight: number;
}

export function SimulationTrajectoryChart({
  result,
  teams,
  focusTeamId,
}: SimulationTrajectoryChartProps) {
  const team = teams.find((entry) => entry.id === focusTeamId) ?? teams[0];
  const brand = team ? getTeamBrand(team.id) : null;

  const chartData = useMemo((): ChartRow[] => {
    if (!team || result.trajectory.length === 0) {
      return [];
    }

    return result.trajectory.map((point) => {
      const bands = point.percentiles[team.id];
      const p10 = bands?.p10 ?? team.id.length;
      const p50 = bands?.p50 ?? team.id.length;
      const p90 = bands?.p90 ?? team.id.length;
      return {
        label: point.label,
        p10,
        p50,
        p90,
        bandBase: p10,
        bandHeight: Math.max(p90 - p10, 0.01),
      };
    });
  }, [result.trajectory, team]);

  if (!team || chartData.length === 0) {
    return (
      <section className="sim-chart" aria-label="Percentile trajectory">
        <h2 className="sim-chart__title">Percentile trajectory</h2>
        <p className="sim-chart__empty">
          No intermediate rounds remain from this simulation point, or select a team to
          view projected rank bands.
        </p>
      </section>
    );
  }

  return (
    <section className="sim-chart" aria-label="Percentile trajectory">
      <div className="sim-chart__header">
        <h2 className="sim-chart__title">Percentile trajectory</h2>
        <p className="sim-chart__subtitle">
          {brand?.emoji} {team.name} — projected league position (P10 / P50 / P90) after
          each remaining round · {result.trials.toLocaleString()} simulations
        </p>
      </div>
      <div className="sim-chart__canvas">
        <ResponsiveContainer width="100%" height={360}>
          <ComposedChart
            data={chartData}
            margin={{ top: 12, right: 24, left: 8, bottom: 8 }}
          >
            <CartesianGrid
              stroke="rgba(255, 255, 255, 0.08)"
              strokeDasharray="4 8"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "#e0aaff", fontSize: 11 }}
              axisLine={{ stroke: "rgba(255, 255, 255, 0.18)" }}
            />
            <YAxis
              reversed
              domain={[1, teams.length]}
              allowDecimals={false}
              tick={{ fill: "#e0aaff", fontSize: 12 }}
              label={{
                value: "Position",
                angle: -90,
                position: "insideLeft",
                fill: "#f0abfc",
              }}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(15, 5, 35, 0.95)",
                border: "1px solid rgba(255, 190, 11, 0.35)",
                borderRadius: "8px",
              }}
              formatter={(value, name) => [
                `#${Number(value).toFixed(1)}`,
                String(name).toUpperCase(),
              ]}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="bandBase"
              stackId="band"
              stroke="none"
              fill="transparent"
              legendType="none"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="bandHeight"
              stackId="band"
              stroke="none"
              fill={brand?.primary ?? "#8338ec"}
              fillOpacity={0.22}
              name="P10–P90 band"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="p10"
              stroke="#00f5d4"
              strokeDasharray="6 4"
              dot={false}
              name="P10"
            />
            <Line
              type="monotone"
              dataKey="p50"
              stroke="#fee440"
              strokeWidth={3}
              dot={{ r: 4 }}
              name="P50"
            />
            <Line
              type="monotone"
              dataKey="p90"
              stroke="#ff006e"
              strokeDasharray="6 4"
              dot={false}
              name="P90"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
