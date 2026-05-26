import type { ReactNode } from "react";
import { PageTitle } from "../atoms/PageTitle";
import { PsychedelicBackdrop } from "../organisms/PsychedelicBackdrop";

interface MainLayoutProps {
  children: ReactNode;
  teamCount: number;
  matchCount: number;
}

export function MainLayout({
  children,
  teamCount,
  matchCount,
}: MainLayoutProps) {
  return (
    <PsychedelicBackdrop>
      <div className="main-layout">
        <PageTitle
          title="Premier Wildlife League"
          subtitle={`${teamCount} teams · ${matchCount} matches · reality is optional`}
        />
        <main className="main-layout__content">{children}</main>
      </div>
    </PsychedelicBackdrop>
  );
}
