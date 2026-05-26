# In-memory data store for teams, fixtures, and matches
from models import Fixture, Match, Team


# Module-level dictionaries keyed by entity id
_teams: dict[str, Team] = {}
_fixtures: dict[str, Fixture] = {}
_matches: dict[str, Match] = {}


# Persist a batch of teams; skip duplicates by id
def add_teams(teams: list[Team]) -> list[Team]:
    added: list[Team] = []
    for team in teams:
        if team.id not in _teams:
            _teams[team.id] = team
            added.append(team)
    return added


# Return all stored teams as a list
def list_teams() -> list[Team]:
    return list(_teams.values())


# Look up a single team by id
def get_team(team_id: str) -> Team | None:
    return _teams.get(team_id)


# Persist a batch of matches; skip duplicates by id
def add_matches(matches: list[Match]) -> list[Match]:
    added: list[Match] = []
    for match in matches:
        if match.id not in _matches:
            _matches[match.id] = match
            added.append(match)
    return added


# Return all stored matches as a list
def list_matches() -> list[Match]:
    return list(_matches.values())


# Replace all stored teams with a fresh dataset
def replace_teams(teams: list[Team]) -> None:
    _teams.clear()
    for team in teams:
        _teams[team.id] = team


# Replace all stored matches with a fresh dataset
def replace_matches(matches: list[Match]) -> None:
    _matches.clear()
    for match in matches:
        _matches[match.id] = match


# Return all stored fixtures as a list
def list_fixtures() -> list[Fixture]:
    return sorted(_fixtures.values(), key=lambda fixture: fixture.matchDateTime)


# Replace all stored fixtures with a fresh dataset
def replace_fixtures(fixtures: list[Fixture]) -> None:
    _fixtures.clear()
    for fixture in fixtures:
        _fixtures[fixture.id] = fixture
