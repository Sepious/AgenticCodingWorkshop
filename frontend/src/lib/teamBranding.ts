export interface TeamBrand {
  emoji: string;
  primary: string;
  secondary: string;
  initials: string;
}

const brands: Record<string, TeamBrand> = {
  "sr:team:1": {
    emoji: "🦁",
    primary: "#ff006e",
    secondary: "#fb5607",
    initials: "LIO",
  },
  "sr:team:2": {
    emoji: "🐯",
    primary: "#ffbe0b",
    secondary: "#ff006e",
    initials: "TIG",
  },
  "sr:team:3": {
    emoji: "🐻",
    primary: "#8338ec",
    secondary: "#3a86ff",
    initials: "BER",
  },
  "sr:team:4": {
    emoji: "🐺",
    primary: "#06ffa5",
    secondary: "#00bbf9",
    initials: "WOL",
  },
  "sr:team:5": {
    emoji: "🦅",
    primary: "#00f5d4",
    secondary: "#9b5de5",
    initials: "EAG",
  },
  "sr:team:6": {
    emoji: "🦈",
    primary: "#00bbf9",
    secondary: "#fee440",
    initials: "SHA",
  },
  "sr:team:7": {
    emoji: "🐆",
    primary: "#f15bb5",
    secondary: "#7209b7",
    initials: "PAN",
  },
  "sr:team:8": {
    emoji: "🐉",
    primary: "#70e000",
    secondary: "#ff006e",
    initials: "DRG",
  },
  "sr:team:9": {
    emoji: "🦅",
    primary: "#ff5400",
    secondary: "#ff006e",
    initials: "FAL",
  },
  "sr:team:10": {
    emoji: "🦏",
    primary: "#bdb2ff",
    secondary: "#ffc6ff",
    initials: "RHI",
  },
};

const fallbackBrand: TeamBrand = {
  emoji: "⚽",
  primary: "#ff006e",
  secondary: "#8338ec",
  initials: "TM",
};

export function getTeamBrand(teamId: string): TeamBrand {
  return brands[teamId] ?? fallbackBrand;
}
