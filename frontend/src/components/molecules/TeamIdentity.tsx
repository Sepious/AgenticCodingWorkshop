import { TeamLogo } from "../atoms/TeamLogo";

interface TeamIdentityProps {
  teamId: string;
  teamName: string;
  size?: "sm" | "md" | "lg";
}

export function TeamIdentity({
  teamId,
  teamName,
  size = "md",
}: TeamIdentityProps) {
  return (
    <div className="team-identity">
      <TeamLogo teamId={teamId} size={size} />
      <span className="team-identity__name">{teamName}</span>
    </div>
  );
}
