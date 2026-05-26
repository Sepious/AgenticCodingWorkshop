interface PageTitleProps {
  title: string;
  subtitle?: string;
}

export function PageTitle({ title, subtitle }: PageTitleProps) {
  return (
    <header className="page-title">
      <p className="page-title__eyebrow">✦ cosmic standings ✦</p>
      <h1 className="page-title__rainbow">{title}</h1>
      {subtitle ? <p className="page-title__subtitle">{subtitle}</p> : null}
    </header>
  );
}
