import type { FormResult } from "../../lib/teamForm";
import type { LeagueTableRow } from "../../types";
import { LeagueTableDataRow } from "../molecules/LeagueTableDataRow";
import { LeagueTableHeaderRow } from "../molecules/LeagueTableHeaderRow";

interface LeagueTableProps {
  rows: LeagueTableRow[];
  formByTeamId: Record<string, FormResult[]>;
  selectedTeamId?: string | null;
  onSelectTeam?: (teamId: string) => void;
}

export function LeagueTable({
  rows,
  formByTeamId,
  selectedTeamId = null,
  onSelectTeam,
}: LeagueTableProps) {
  return (
    <section className="league-table" aria-label="League standings">
      <div className="league-table__header">
        <h2 className="league-table__title league-table__title--trip">
          Full Standings (probably)
        </h2>
        <p className="league-table__subtitle">
          Sorted by vibes, then points, then cosmic goal difference
        </p>
      </div>
      <div className="league-table__scroll">
        <table className="league-table__table">
          <thead>
            <LeagueTableHeaderRow />
          </thead>
          <tbody>
            {rows.map((row) => (
              <LeagueTableDataRow
                key={row.teamId}
                row={row}
                form={formByTeamId[row.teamId] ?? []}
                selected={row.teamId === selectedTeamId}
                onSelect={onSelectTeam}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
