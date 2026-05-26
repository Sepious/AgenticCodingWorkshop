import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getTeamBrand } from "../../lib/teamBranding";
import type { Team, WeekSnapshot } from "../../types";

interface HistoryChartProps {
  history: WeekSnapshot[];
  teams: Team[];
}

interface ChartPoint {
  week: string;
  [teamId: string]: string | number;
}

interface TooltipPayloadItem {
  color: string;
  dataKey: string;
  value: number;
}

function buildChartData(
  history: WeekSnapshot[],
  teamIds: string[],
): ChartPoint[] {
  return history.map((snapshot) => {
    const point: ChartPoint = { week: snapshot.week };
    const positionByTeamId = new Map(
      snapshot.standings.map((standing) => [standing.teamId, standing.position]),
    );

    for (const teamId of teamIds) {
      point[teamId] = positionByTeamId.get(teamId) ?? teamIds.length;
    }

    return point;
  });
}

function ChartTooltip({
  active,
  payload,
  label,
  teamNames,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  teamNames: Record<string, string>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const sorted = [...payload].sort(
    (left, right) => Number(left.value) - Number(right.value),
  );

  return (
    <div className="history-chart__tooltip">
      <p className="history-chart__tooltip-title">{label}</p>
      <ul className="history-chart__tooltip-list">
        {sorted.map((entry) => {
          const brand = getTeamBrand(entry.dataKey);
          return (
            <li key={entry.dataKey} className="history-chart__tooltip-row">
              <span
                className="history-chart__tooltip-dot"
                style={{ backgroundColor: entry.color }}
              />
              <span className="history-chart__tooltip-team">
                {brand.emoji} {teamNames[entry.dataKey] ?? entry.dataKey}
              </span>
              <span className="history-chart__tooltip-position">
                #{entry.value}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function HistoryChart({ history, teams }: HistoryChartProps) {
  const sortedTeams = useMemo(
    () => [...teams].sort((left, right) => left.id.localeCompare(right.id)),
    [teams],
  );
  const teamIds = useMemo(
    () => sortedTeams.map((team) => team.id),
    [sortedTeams],
  );
  const teamNames = useMemo(
    () => Object.fromEntries(teams.map((team) => [team.id, team.name])),
    [teams],
  );
  const chartData = useMemo(
    () => buildChartData(history, teamIds),
    [history, teamIds],
  );
  const [hiddenTeams, setHiddenTeams] = useState<Set<string>>(() => new Set());
  const [focusedTeamId, setFocusedTeamId] = useState<string | null>(null);

  const toggleTeam = (teamId: string) => {
    setHiddenTeams((current) => {
      const next = new Set(current);
      if (next.has(teamId)) {
        next.delete(teamId);
      } else {
        next.add(teamId);
      }
      return next;
    });
  };

  if (history.length === 0) {
    return (
      <section className="history-chart" aria-label="Position history chart">
        <div className="history-chart__header">
          <h2 className="history-chart__title history-chart__title--trip">
            Position Timeline
          </h2>
          <p className="history-chart__subtitle">
            No match history yet — the vibes are flat
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="history-chart" aria-label="Position history chart">
      <div className="history-chart__header">
        <h2 className="history-chart__title history-chart__title--trip">
          Position Timeline
        </h2>
        <p className="history-chart__subtitle">
          Hover a line, click legend items to focus teams · lower is better
        </p>
      </div>

      <div className="history-chart__canvas">
        <ResponsiveContainer width="100%" height={420}>
          <LineChart
            data={chartData}
            margin={{ top: 12, right: 24, left: 8, bottom: 8 }}
            onMouseLeave={() => setFocusedTeamId(null)}
          >
            <CartesianGrid
              stroke="rgba(255, 255, 255, 0.08)"
              strokeDasharray="4 8"
              vertical={false}
            />
            <XAxis
              dataKey="week"
              tick={{ fill: "#e0aaff", fontSize: 12 }}
              axisLine={{ stroke: "rgba(255, 255, 255, 0.18)" }}
              tickLine={{ stroke: "rgba(255, 255, 255, 0.18)" }}
            />
            <YAxis
              reversed
              domain={[1, teamIds.length]}
              allowDecimals={false}
              tick={{ fill: "#e0aaff", fontSize: 12 }}
              axisLine={{ stroke: "rgba(255, 255, 255, 0.18)" }}
              tickLine={{ stroke: "rgba(255, 255, 255, 0.18)" }}
              label={{
                value: "Position",
                angle: -90,
                position: "insideLeft",
                fill: "#f0abfc",
                style: { textAnchor: "middle" },
              }}
            />
            <Tooltip
              content={
                <ChartTooltip teamNames={teamNames} />
              }
              cursor={{ stroke: "rgba(255, 190, 11, 0.45)", strokeWidth: 1 }}
            />
            <Legend
              wrapperStyle={{ paddingTop: "1rem" }}
              content={() => (
                <div className="history-chart__legend">
                  {sortedTeams.map((team) => {
                    const brand = getTeamBrand(team.id);
                    const isHidden = hiddenTeams.has(team.id);
                    const isFocused =
                      focusedTeamId === null || focusedTeamId === team.id;

                    return (
                      <button
                        key={team.id}
                        type="button"
                        className={`history-chart__legend-item${
                          isHidden ? " history-chart__legend-item--hidden" : ""
                        }${isFocused ? " history-chart__legend-item--focused" : ""}`}
                        style={
                          {
                            "--team-color": brand.primary,
                          } as React.CSSProperties
                        }
                        onClick={() => toggleTeam(team.id)}
                        onMouseEnter={() => setFocusedTeamId(team.id)}
                        onMouseLeave={() => setFocusedTeamId(null)}
                        aria-pressed={!isHidden}
                      >
                        <span className="history-chart__legend-swatch" />
                        {brand.emoji} {team.name}
                      </button>
                    );
                  })}
                </div>
              )}
            />
            {sortedTeams.map((team) => {
              if (hiddenTeams.has(team.id)) {
                return null;
              }

              const brand = getTeamBrand(team.id);
              const dimmed =
                focusedTeamId !== null && focusedTeamId !== team.id;

              return (
                <Line
                  key={team.id}
                  type="monotone"
                  dataKey={team.id}
                  name={team.name}
                  stroke={brand.primary}
                  strokeWidth={dimmed ? 1.5 : 3}
                  strokeOpacity={dimmed ? 0.18 : 1}
                  dot={{
                    r: dimmed ? 0 : 4,
                    strokeWidth: 2,
                    fill: brand.secondary,
                  }}
                  activeDot={{
                    r: 7,
                    stroke: "#fee440",
                    strokeWidth: 2,
                    fill: brand.primary,
                  }}
                  connectNulls
                  isAnimationActive
                  onMouseEnter={() => setFocusedTeamId(team.id)}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
