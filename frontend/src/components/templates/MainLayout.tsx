import type { ReactNode } from "react";
import { PageTitle } from "../atoms/PageTitle";
import { PsychedelicBackdrop } from "../organisms/PsychedelicBackdrop";

interface MainLayoutProps {
  children: ReactNode;
  teamCount: number;
  matchCount: number;
  title?: string;
  subtitle?: string;
}

export function MainLayout({
  children,
  teamCount,
  matchCount,
  title = "Premier Wildlife League",
  subtitle,
}: MainLayoutProps) {
  const resolvedSubtitle =
    subtitle ?? `${teamCount} teams · ${matchCount} matches · reality is optional`;

  return (
    <PsychedelicBackdrop>
      <div className="main-layout">
        <PageTitle title={title} subtitle={resolvedSubtitle} />
        <main className="main-layout__content">{children}</main>
      </div>
    </PsychedelicBackdrop>
  );
}
