import type { CSSProperties } from "react";
import { getTeamBrand } from "../../lib/teamBranding";
import { computeWinRate } from "../../lib/teamForm";
import type { FormResult } from "../../lib/teamForm";
import type { LeagueTableRow } from "../../types";
import { KpiCard } from "../atoms/KpiCard";
import { TeamLogo } from "../atoms/TeamLogo";
import { FormStrip } from "../molecules/FormStrip";

interface LeaderKpiBannerProps {
  leader: LeagueTableRow;
  form: FormResult[];
}

export function LeaderKpiBanner({ leader, form }: LeaderKpiBannerProps) {
  const brand = getTeamBrand(leader.teamId);
  const winRate = computeWinRate(leader.won, leader.played);
  const goalDifference =
    leader.goalDifference > 0
      ? `+${leader.goalDifference}`
      : leader.goalDifference.toString();

  return (
    <section
      className="leader-banner"
      style={
        {
          "--leader-primary": brand.primary,
          "--leader-secondary": brand.secondary,
        } as CSSProperties
      }
      aria-label="League leader"
    >
      <div className="leader-banner__main">
        <div className="leader-banner__identity">
          <TeamLogo teamId={leader.teamId} size="lg" />
          <div>
            <p className="leader-banner__eyebrow">League leaders</p>
            <h2 className="leader-banner__team">{leader.teamName}</h2>
            <p className="leader-banner__tagline">
              Leading after {leader.played} matches
            </p>
          </div>
        </div>

        <div className="leader-banner__kpis">
          <KpiCard label="Points" value={leader.points} highlight />
          <KpiCard label="Wins" value={leader.won} />
          <KpiCard label="Goal Diff" value={goalDifference} />
          <KpiCard label="Win Rate" value={`${winRate}%`} />
        </div>
      </div>

      <div className="leader-banner__form">
        <span className="leader-banner__form-label">Recent form</span>
        <FormStrip form={form} />
      </div>
    </section>
  );
}
