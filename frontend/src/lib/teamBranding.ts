export interface TeamBrand {
  emoji: string;
  primary: string;
  secondary: string;
  initials: string;
}

const brands: Record<string, TeamBrand> = {
  "sr:competitor:42": { emoji: "🔴", primary: "#ef0107", secondary: "#ffffff", initials: "ARS" },
  "sr:competitor:44": { emoji: "🔴", primary: "#c8102e", secondary: "#00b2a9", initials: "LIV" },
  "sr:competitor:17": { emoji: "🔵", primary: "#6cabdd", secondary: "#1c2c5b", initials: "MCI" },
  "sr:competitor:35": { emoji: "🔴", primary: "#da291c", secondary: "#fbe122", initials: "MUN" },
  "sr:competitor:38": { emoji: "🔵", primary: "#034694", secondary: "#ffffff", initials: "CHE" },
  "sr:competitor:33": { emoji: "⚪", primary: "#132257", secondary: "#ffffff", initials: "TOT" },
  "sr:competitor:40": { emoji: "🟣", primary: "#670e36", secondary: "#95bfe5", initials: "AVL" },
  "sr:competitor:39": { emoji: "⚫", primary: "#241f20", secondary: "#ffffff", initials: "NEW" },
  "sr:competitor:30": { emoji: "🔵", primary: "#0057b8", secondary: "#ffffff", initials: "BHA" },
  "sr:competitor:50": { emoji: "🔴", primary: "#e30613", secondary: "#ffffff", initials: "BRE" },
  "sr:competitor:48": { emoji: "🔵", primary: "#003399", secondary: "#ffffff", initials: "EVE" },
  "sr:competitor:43": { emoji: "⚪", primary: "#000000", secondary: "#cc0000", initials: "FUL" },
  "sr:competitor:7": { emoji: "🔵", primary: "#1b458f", secondary: "#c4122e", initials: "CRY" },
  "sr:competitor:14": { emoji: "🔴", primary: "#dd0000", secondary: "#ffffff", initials: "NFO" },
  "sr:competitor:37": { emoji: "🟣", primary: "#7a263a", secondary: "#1bb1e7", initials: "WHU" },
  "sr:competitor:60": { emoji: "🔴", primary: "#da291c", secondary: "#000000", initials: "BOU" },
  "sr:competitor:3": { emoji: "🟡", primary: "#fdb913", secondary: "#231f20", initials: "WOL" },
  "sr:competitor:6": { emoji: "🟣", primary: "#6c1d45", secondary: "#99d6ea", initials: "BUR" },
  "sr:competitor:34": { emoji: "⚪", primary: "#ffcd00", secondary: "#1d428a", initials: "LEE" },
  "sr:competitor:41": { emoji: "🔴", primary: "#eb172b", secondary: "#ffffff", initials: "SUN" },
};

const fallbackBrand: TeamBrand = {
  emoji: "⚽",
  primary: "#ff006e",
  secondary: "#8338ec",
  initials: "TM",
};

function initialsFromName(name: string): string {
  const words = name.replace(/\bFC\b|\bAFC\b/gi, "").trim().split(/\s+/);
  return words
    .slice(0, 3)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 3);
}

export function getTeamBrand(teamId: string, teamName?: string): TeamBrand {
  const brand = brands[teamId];
  if (brand) {
    return brand;
  }
  if (teamName) {
    return {
      ...fallbackBrand,
      initials: initialsFromName(teamName),
    };
  }
  return fallbackBrand;
}
