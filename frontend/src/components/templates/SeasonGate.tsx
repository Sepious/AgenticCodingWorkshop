import type { ReactNode } from "react";
import { useSeasonData } from "../../context/SeasonDataContext";

interface SeasonGateProps {
  children: ReactNode;
}

export function SeasonGate({ children }: SeasonGateProps) {
  const { loading, error } = useSeasonData();

  if (loading) {
    return (
      <div className="season-gate">
        <p className="season-gate__title">Loading Premier League 25/26…</p>
        <p className="season-gate__subtitle">Fetching teams and results from the backend</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="season-gate season-gate--error">
        <p className="season-gate__title">Could not load season data</p>
        <p className="season-gate__subtitle">{error}</p>
        <p className="season-gate__hint">
          Start the backend with <code>python main.py</code> on port 8000, then refresh.
        </p>
      </div>
    );
  }

  return children;
}
