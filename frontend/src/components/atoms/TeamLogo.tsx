import type { CSSProperties } from "react";
import { getTeamBrand } from "../../lib/teamBranding";

interface TeamLogoProps {
  teamId: string;
  size?: "sm" | "md" | "lg";
}

export function TeamLogo({ teamId, size = "md" }: TeamLogoProps) {
  const brand = getTeamBrand(teamId);

  return (
    <span
      className={`team-logo team-logo--${size} team-logo--trip`}
      style={
        {
          "--team-primary": brand.primary,
          "--team-secondary": brand.secondary,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <span className="team-logo__emoji">{brand.emoji}</span>
    </span>
  );
}
