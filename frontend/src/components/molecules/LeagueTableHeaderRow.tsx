import { TableCell } from "../atoms/TableCell";

const columns = [
  { key: "position", label: "#", align: "center" as const },
  { key: "team", label: "Team", align: "left" as const },
  { key: "form", label: "Form", align: "center" as const },
  { key: "played", label: "P", align: "center" as const },
  { key: "won", label: "W", align: "center" as const },
  { key: "drawn", label: "D", align: "center" as const },
  { key: "lost", label: "L", align: "center" as const },
  { key: "goalsFor", label: "GF", align: "center" as const },
  { key: "goalsAgainst", label: "GA", align: "center" as const },
  { key: "goalDifference", label: "GD", align: "center" as const },
  { key: "points", label: "Pts", align: "center" as const },
];

export function LeagueTableHeaderRow() {
  return (
    <tr className="league-table__header-row">
      {columns.map((column) => (
        <TableCell
          key={column.key}
          align={column.align}
          variant="header"
          className={`table-cell--${column.key}`}
        >
          {column.label}
        </TableCell>
      ))}
    </tr>
  );
}
