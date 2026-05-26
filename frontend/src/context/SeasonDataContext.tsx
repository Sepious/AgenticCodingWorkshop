import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { WeekSnapshot } from "../types";
import { fetchSeasonData, type SeasonData } from "../lib/api";

interface SeasonDataContextValue {
  teams: SeasonData["teams"];
  fixtures: SeasonData["fixtures"];
  matches: SeasonData["matches"];
  history: WeekSnapshot[];
  dataSource: string;
  loading: boolean;
  error: string | null;
}

const SeasonDataContext = createContext<SeasonDataContextValue | null>(null);

export function SeasonDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SeasonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchSeasonData()
      .then((seasonData) => {
        if (!cancelled) {
          setData(seasonData);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load season data");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<SeasonDataContextValue>(
    () => ({
      teams: data?.teams ?? [],
      fixtures: data?.fixtures ?? [],
      matches: data?.matches ?? [],
      history: data?.history ?? [],
      dataSource: data?.dataSource ?? "unknown",
      loading,
      error,
    }),
    [data, loading, error],
  );

  return (
    <SeasonDataContext.Provider value={value}>{children}</SeasonDataContext.Provider>
  );
}

export function useSeasonData(): SeasonDataContextValue {
  const context = useContext(SeasonDataContext);
  if (!context) {
    throw new Error("useSeasonData must be used within SeasonDataProvider");
  }
  return context;
}
