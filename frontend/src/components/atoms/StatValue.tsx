interface StatValueProps {
  value: number;
  emphasize?: boolean;
}

export function StatValue({ value, emphasize = false }: StatValueProps) {
  const formatted =
    value > 0 && emphasize ? `+${value}` : value.toString();

  return (
    <span
      className={`stat-value${emphasize ? " stat-value--emphasized" : ""}`}
    >
      {formatted}
    </span>
  );
}
