# Fetch Premier League teams and match results from the Sportradar Soccer API
import json
import logging
import os
import urllib.error
import urllib.request
from datetime import datetime, timezone

from fallback_data import FALLBACK_FIXTURES, FALLBACK_TEAMS
from models import Fixture, Match, Team

logger = logging.getLogger(__name__)

EPL_COMPETITION_ID = "sr:competition:17"
EPL_SEASON_YEAR = "25/26"
EPL_SEASON_ID = "sr:season:130281"
API_BASE_URL = "https://api.sportradar.com/soccer/trial/v4/en"


def _api_key() -> str | None:
    return os.environ.get("SPORTRADAR_API_KEY")


def _get_json(path: str) -> dict:
    api_key = _api_key()
    if not api_key:
        raise RuntimeError("SPORTRADAR_API_KEY environment variable is not set")

    url = f"{API_BASE_URL}{path}"
    request = urllib.request.Request(url, headers={"x-api-key": api_key})
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.loads(response.read())


def resolve_season_id() -> str:
    seasons = _get_json(f"/competitions/{EPL_COMPETITION_ID}/seasons.json").get(
        "seasons", []
    )
    for season in seasons:
        if season.get("year") == EPL_SEASON_YEAR:
            return season["id"]
    raise RuntimeError(f"Premier League season {EPL_SEASON_YEAR} not found")


def fetch_teams(season_id: str) -> list[Team]:
    payload = _get_json(f"/seasons/{season_id}/competitors.json")
    competitors = payload.get("season_competitors", [])
    if not competitors:
        raise RuntimeError("No teams returned for season")

    return [
        Team(id=competitor["id"], name=competitor["name"].strip())
        for competitor in competitors
    ]


def fetch_fixtures(season_id: str) -> list[Fixture]:
    payload = _get_json(f"/seasons/{season_id}/schedules.json?limit=1000")
    schedules = payload.get("schedules", [])
    fixtures: list[Fixture] = []

    for item in schedules:
        event = item["sport_event"]
        status = item.get("sport_event_status", {})
        competitors = {entry["qualifier"]: entry for entry in event["competitors"]}
        home = competitors.get("home")
        away = competitors.get("away")
        if home is None or away is None:
            continue

        home_goals = None
        away_goals = None
        if status.get("status") == "closed":
            home_goals = status["home_score"]
            away_goals = status["away_score"]

        round_number = event.get("sport_event_context", {}).get("round", {}).get(
            "number"
        )

        fixtures.append(
            Fixture(
                id=event["id"],
                homeTeamId=home["id"],
                awayTeamId=away["id"],
                matchDateTime=_parse_start_time(event["start_time"]),
                homeGoals=home_goals,
                awayGoals=away_goals,
                round=round_number,
            )
        )

    if not fixtures:
        raise RuntimeError("No fixtures returned for season")

    fixtures.sort(key=lambda fixture: fixture.matchDateTime)
    return fixtures


def fixtures_to_matches(fixtures: list[Fixture]) -> list[Match]:
    matches: list[Match] = []
    for fixture in fixtures:
        if fixture.homeGoals is None or fixture.awayGoals is None:
            continue
        matches.append(
            Match(
                id=fixture.id,
                homeTeamId=fixture.homeTeamId,
                awayTeamId=fixture.awayTeamId,
                homeGoals=fixture.homeGoals,
                awayGoals=fixture.awayGoals,
                playedAt=fixture.matchDateTime,
            )
        )
    return matches


def _parse_start_time(value: str) -> datetime:
    normalized = value.replace("Z", "+00:00")
    played_at = datetime.fromisoformat(normalized)
    if played_at.tzinfo is None:
        return played_at.replace(tzinfo=timezone.utc)
    return played_at.astimezone(timezone.utc)


def _fallback_teams() -> list[Team]:
    return [Team(id=team["id"], name=team["name"]) for team in FALLBACK_TEAMS]


def _fallback_fixtures() -> list[Fixture]:
    fixtures: list[Fixture] = []
    for item in FALLBACK_FIXTURES:
        fixture = Fixture(
            id=item["id"],
            homeTeamId=item["homeTeamId"],
            awayTeamId=item["awayTeamId"],
            matchDateTime=_parse_start_time(item["matchDateTime"]),
            homeGoals=item.get("homeGoals"),
            awayGoals=item.get("awayGoals"),
            round=item.get("round"),
        )
        fixtures.append(fixture)
    fixtures.sort(key=lambda entry: entry.matchDateTime)
    return fixtures


def load_premier_league_data() -> tuple[list[Team], list[Fixture], list[Match], str]:
    try:
        season_id = resolve_season_id()
        teams = fetch_teams(season_id)
        fixtures = fetch_fixtures(season_id)
        matches = fixtures_to_matches(fixtures)
        logger.info(
            "Loaded Premier League %s from Sportradar (%d teams, %d fixtures, %d results)",
            EPL_SEASON_YEAR,
            len(teams),
            len(fixtures),
            len(matches),
        )
        return teams, fixtures, matches, "sportradar"
    except (RuntimeError, urllib.error.URLError, urllib.error.HTTPError, KeyError, ValueError) as exc:
        logger.warning("Sportradar fetch failed, using fallback data: %s", exc)
        teams = _fallback_teams()
        fixtures = _fallback_fixtures()
        matches = fixtures_to_matches(fixtures)
        return teams, fixtures, matches, "fallback"
