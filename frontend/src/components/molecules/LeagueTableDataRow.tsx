import type { FormResult } from "../../lib/teamForm";
import type { LeagueTableRow } from "../../types";
import { PositionBadge } from "../atoms/PositionBadge";
import { StatValue } from "../atoms/StatValue";
import { TableCell } from "../atoms/TableCell";
import { FormStrip } from "./FormStrip";
import { TeamIdentity } from "./TeamIdentity";

interface LeagueTableDataRowProps {
  row: LeagueTableRow;
  form: FormResult[];
}

export function LeagueTableDataRow({ row, form }: LeagueTableDataRowProps) {
  const rowClassName = [
    "league-table__data-row",
    row.position === 1 ? "league-table__data-row--leader" : "",
    row.position <= 3 ? "league-table__data-row--podium" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <tr className={rowClassName}>
      <TableCell align="center" className="table-cell--position">
        <PositionBadge position={row.position} />
      </TableCell>
      <TableCell align="left" className="table-cell--team">
        <TeamIdentity teamId={row.teamId} teamName={row.teamName} size="sm" />
      </TableCell>
      <TableCell className="table-cell--form">
        <FormStrip form={form} />
      </TableCell>
      <TableCell>{row.played}</TableCell>
      <TableCell>{row.won}</TableCell>
      <TableCell>{row.drawn}</TableCell>
      <TableCell>{row.lost}</TableCell>
      <TableCell>{row.goalsFor}</TableCell>
      <TableCell>{row.goalsAgainst}</TableCell>
      <TableCell>
        <StatValue value={row.goalDifference} emphasize />
      </TableCell>
      <TableCell className="table-cell--points">
        <StatValue value={row.points} />
      </TableCell>
    </tr>
  );
}
