# League table computation from match results
from datetime import datetime

from models import LeagueTableRow
from storage import get_team, list_matches, list_teams


# Internal accumulator for per-team statistics before sorting
def _empty_stats() -> dict[str, int]:
    return {
        "played": 0,
        "won": 0,
        "drawn": 0,
        "lost": 0,
        "goalsFor": 0,
        "goalsAgainst": 0,
        "points": 0,
    }


# Apply one match outcome to both participating teams
def _apply_match(stats: dict[str, dict[str, int]], match) -> None:
    home_id = match.homeTeamId
    away_id = match.awayTeamId
    home_goals = match.homeGoals
    away_goals = match.awayGoals

    for team_id in (home_id, away_id):
        if team_id not in stats:
            stats[team_id] = _empty_stats()

    stats[home_id]["played"] += 1
    stats[away_id]["played"] += 1
    stats[home_id]["goalsFor"] += home_goals
    stats[home_id]["goalsAgainst"] += away_goals
    stats[away_id]["goalsFor"] += away_goals
    stats[away_id]["goalsAgainst"] += home_goals

    if home_goals > away_goals:
        stats[home_id]["won"] += 1
        stats[home_id]["points"] += 3
        stats[away_id]["lost"] += 1
    elif home_goals < away_goals:
        stats[away_id]["won"] += 1
        stats[away_id]["points"] += 3
        stats[home_id]["lost"] += 1
    else:
        stats[home_id]["drawn"] += 1
        stats[home_id]["points"] += 1
        stats[away_id]["drawn"] += 1
        stats[away_id]["points"] += 1


# Build sorted league table rows from all teams and matches
def compute_league_table(as_of: datetime | None = None) -> list[LeagueTableRow]:
    stats: dict[str, dict[str, int]] = {}

    for team in list_teams():
        stats[team.id] = _empty_stats()

    for match in list_matches():
        if as_of is not None:
            if match.playedAt is None or match.playedAt > as_of:
                continue
        _apply_match(stats, match)

    rows: list[LeagueTableRow] = []
    for team_id, team_stats in stats.items():
        team = get_team(team_id)
        team_name = team.name if team else team_id
        goals_for = team_stats["goalsFor"]
        goals_against = team_stats["goalsAgainst"]
        rows.append(
            LeagueTableRow(
                teamId=team_id,
                teamName=team_name,
                played=team_stats["played"],
                won=team_stats["won"],
                drawn=team_stats["drawn"],
                lost=team_stats["lost"],
                goalsFor=goals_for,
                goalsAgainst=goals_against,
                goalDifference=goals_for - goals_against,
                points=team_stats["points"],
                position=0,
            )
        )

    rows.sort(
        key=lambda row: (
            -row.points,
            -row.goalDifference,
            -row.goalsFor,
            row.teamName.lower(),
        )
    )

    for index, row in enumerate(rows, start=1):
        row.position = index

    return rows
