import type { KeyboardEvent } from "react";
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
  selected?: boolean;
  onSelect?: (teamId: string) => void;
}

export function LeagueTableDataRow({
  row,
  form,
  selected = false,
  onSelect,
}: LeagueTableDataRowProps) {
  const rowClassName = [
    "league-table__data-row",
    row.position === 1 ? "league-table__data-row--leader" : "",
    row.position <= 3 ? "league-table__data-row--podium" : "",
    selected ? "league-table__data-row--selected" : "",
    onSelect ? "league-table__data-row--selectable" : "",
  ]
    .filter(Boolean)
    .join(" ");

  function handleSelect() {
    onSelect?.(row.teamId);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTableRowElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelect();
    }
  }

  return (
    <tr
      className={rowClassName}
      onClick={onSelect ? handleSelect : undefined}
      onKeyDown={onSelect ? handleKeyDown : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-selected={onSelect ? selected : undefined}
      role={onSelect ? "button" : undefined}
    >
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
