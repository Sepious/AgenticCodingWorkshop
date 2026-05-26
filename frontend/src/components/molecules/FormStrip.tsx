import type { FormResult } from "../../lib/teamForm";
import { FormBadge } from "../atoms/FormBadge";

interface FormStripProps {
  form: FormResult[];
}

export function FormStrip({ form }: FormStripProps) {
  if (form.length === 0) {
    return <span className="form-strip form-strip--empty">—</span>;
  }

  return (
    <div className="form-strip" aria-label="Recent form">
      {form.map((result, index) => (
        <FormBadge key={`${result}-${index}`} result={result} />
      ))}
    </div>
  );
}
