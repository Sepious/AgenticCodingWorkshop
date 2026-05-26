# Per-week snapshots of the league table bucketed by ISO calendar weeks
from datetime import date, datetime, time, timedelta, timezone

from league_table import compute_league_table
from storage import list_matches


# Inclusive end of an ISO calendar week: Sunday 23:59:59 UTC
def iso_week_end(year: int, week: int) -> datetime:
    monday = date.fromisocalendar(year, week, 1)
    sunday = monday + timedelta(days=6)
    return datetime.combine(sunday, time(23, 59, 59), tzinfo=timezone.utc)


# Every ISO week between the earliest and latest played match, inclusive
def season_iso_weeks() -> list[tuple[int, int, datetime]]:
    matches = list_matches()
    if not matches:
        return []

    played_dates = [m.playedAt for m in matches]
    earliest = min(played_dates)
    latest = max(played_dates)

    earliest_cal = earliest.isocalendar()
    latest_cal = latest.isocalendar()

    weeks: list[tuple[int, int, datetime]] = []
    # Walk one ISO week at a time using Mondays so year boundaries are handled correctly
    cursor = date.fromisocalendar(earliest_cal.year, earliest_cal.week, 1)
    end_monday = date.fromisocalendar(latest_cal.year, latest_cal.week, 1)
    while cursor <= end_monday:
        cal = cursor.isocalendar()
        weeks.append((cal.year, cal.week, iso_week_end(cal.year, cal.week)))
        cursor += timedelta(days=7)

    return weeks


# League table snapshot at the end of every ISO week of the season
def compute_history() -> list[dict]:
    history: list[dict] = []
    for year, week, week_end in season_iso_weeks():
        rows = compute_league_table(week_end)
        standings = [
            {
                "teamId": row.teamId,
                "teamName": row.teamName,
                "position": row.position,
                "points": row.points,
                "playedMatches": row.played,
            }
            for row in rows
        ]
        history.append(
            {
                "week": f"{year:04d}-W{week:02d}",
                "weekEnd": week_end.isoformat(),
                "standings": standings,
            }
        )
    return history
