interface KpiCardProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

export function KpiCard({ label, value, highlight = false }: KpiCardProps) {
  return (
    <div className={`kpi-card${highlight ? " kpi-card--highlight" : ""}`}>
      <span className="kpi-card__label">{label}</span>
      <strong className="kpi-card__value">{value}</strong>
    </div>
  );
}
