import type { FormResult } from "../../lib/teamForm";

interface FormBadgeProps {
  result: FormResult;
}

const labels: Record<FormResult, string> = {
  W: "Win",
  D: "Draw",
  L: "Loss",
};

export function FormBadge({ result }: FormBadgeProps) {
  return (
    <span
      className={`form-badge form-badge--${result.toLowerCase()}`}
      title={labels[result]}
    >
      {result}
    </span>
  );
}
