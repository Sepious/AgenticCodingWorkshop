interface PositionBadgeProps {
  position: number;
}

export function PositionBadge({ position }: PositionBadgeProps) {
  return <span className="position-badge">{position}</span>;
}
