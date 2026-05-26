# Data classes and validation helpers for teams, matches, and league rows
import re
from dataclasses import asdict, dataclass
from datetime import datetime


# Regex pattern for Sportradar-style team identifiers
TEAM_ID_PATTERN = re.compile(r"^sr:(?:team|competitor):\d+$")


# Team entity stored in memory
@dataclass
class Team:
    id: str
    name: str


# Season fixture; scores are set once the match is completed
@dataclass
class Fixture:
    id: str
    homeTeamId: str
    awayTeamId: str
    matchDateTime: datetime
    homeGoals: int | None = None
    awayGoals: int | None = None
    round: int | None = None


# Completed match with final score
@dataclass
class Match:
    id: str
    homeTeamId: str
    awayTeamId: str
    homeGoals: int
    awayGoals: int
    playedAt: datetime | None = None


# One row in the computed league standings
@dataclass
class LeagueTableRow:
    teamId: str
    teamName: str
    played: int
    won: int
    drawn: int
    lost: int
    goalsFor: int
    goalsAgainst: int
    goalDifference: int
    points: int
    position: int


# Validate a team payload and return a Team or an error message
def parse_team(data: dict) -> tuple[Team | None, str | None]:
    if not isinstance(data, dict):
        return None, "Team must be an object"

    team_id = data.get("id")
    name = data.get("name")

    if not isinstance(team_id, str) or not TEAM_ID_PATTERN.match(team_id):
        return None, "Team id must match sr:team:<number> or sr:competitor:<number>"
    if not isinstance(name, str) or not name.strip():
        return None, "Team name must be a non-empty string"

    return Team(id=team_id, name=name.strip()), None


# Validate a match payload and return a Match or an error message
def parse_match(data: dict) -> tuple[Match | None, str | None]:
    if not isinstance(data, dict):
        return None, "Match must be an object"

    match_id = data.get("id")
    home_team_id = data.get("homeTeamId")
    away_team_id = data.get("awayTeamId")
    home_goals = data.get("homeGoals")
    away_goals = data.get("awayGoals")

    if not isinstance(match_id, str) or not match_id:
        return None, "Match id must be a non-empty string"
    if not isinstance(home_team_id, str) or not TEAM_ID_PATTERN.match(home_team_id):
        return None, "homeTeamId must match sr:team:<number> or sr:competitor:<number>"
    if not isinstance(away_team_id, str) or not TEAM_ID_PATTERN.match(away_team_id):
        return None, "awayTeamId must match sr:team:<number> or sr:competitor:<number>"
    if not isinstance(home_goals, int) or home_goals < 0:
        return None, "homeGoals must be a non-negative integer"
    if not isinstance(away_goals, int) or away_goals < 0:
        return None, "awayGoals must be a non-negative integer"

    return (
        Match(
            id=match_id,
            homeTeamId=home_team_id,
            awayTeamId=away_team_id,
            homeGoals=home_goals,
            awayGoals=away_goals,
        ),
        None,
    )


# Convert a dataclass row to a JSON-serializable dictionary
def row_to_dict(row: LeagueTableRow) -> dict:
    return asdict(row)
