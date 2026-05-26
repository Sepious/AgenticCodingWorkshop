# JSON serialization helpers for API responses
from models import Fixture, Match


def fixture_to_dict(fixture: Fixture) -> dict:
    payload = {
        "id": fixture.id,
        "homeTeamId": fixture.homeTeamId,
        "awayTeamId": fixture.awayTeamId,
        "matchDateTime": fixture.matchDateTime.isoformat(),
    }
    if fixture.round is not None:
        payload["round"] = fixture.round
    if fixture.homeGoals is not None:
        payload["homeGoals"] = fixture.homeGoals
    if fixture.awayGoals is not None:
        payload["awayGoals"] = fixture.awayGoals
    return payload


def match_to_dict(match: Match) -> dict:
    payload = {
        "id": match.id,
        "homeTeamId": match.homeTeamId,
        "awayTeamId": match.awayTeamId,
        "homeGoals": match.homeGoals,
        "awayGoals": match.awayGoals,
    }
    if match.playedAt is not None:
        payload["matchDateTime"] = match.playedAt.isoformat()
    return payload
