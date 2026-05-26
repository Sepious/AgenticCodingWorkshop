import type { FormResult } from "../../lib/teamForm";
import { FormBadge } from "../atoms/FormBadge";

interface FormStripProps {
  form: FormResult[];
  ariaLabel?: string;
}

export function FormStrip({ form, ariaLabel = "Recent form" }: FormStripProps) {
  if (form.length === 0) {
    return <span className="form-strip form-strip--empty">—</span>;
  }

  return (
    <div className="form-strip" aria-label={ariaLabel}>
      {form.map((result, index) => (
        <FormBadge key={`${result}-${index}`} result={result} />
      ))}
    </div>
  );
}
