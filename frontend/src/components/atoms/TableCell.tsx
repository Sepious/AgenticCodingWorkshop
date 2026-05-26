import type { ReactNode } from "react";

interface TableCellProps {
  children: ReactNode;
  align?: "left" | "center" | "right";
  variant?: "body" | "header";
  className?: string;
}

export function TableCell({
  children,
  align = "center",
  variant = "body",
  className = "",
}: TableCellProps) {
  const Tag = variant === "header" ? "th" : "td";

  return (
    <Tag
      className={`table-cell table-cell--${align} table-cell--${variant} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}
