# Flask application entry point for the league table backend
from flask import Flask, jsonify, request

from league_table import compute_league_table
from models import parse_match, parse_team, row_to_dict
from storage import add_matches, add_teams, get_team, list_matches, list_teams

# Create the Flask application instance
app = Flask(__name__)


# Health check endpoint
@app.get("/health")
def health():
    return jsonify({"status": "ok"})


# Add multiple teams in a single request
@app.post("/teams")
def create_teams():
    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        return jsonify({"detail": "Request body must be a JSON object"}), 400

    raw_teams = body.get("teams")
    if not isinstance(raw_teams, list) or not raw_teams:
        return jsonify({"detail": "At least one team is required"}), 400

    teams = []
    for index, raw_team in enumerate(raw_teams):
        team, error = parse_team(raw_team)
        if error:
            return jsonify({"detail": f"teams[{index}]: {error}"}), 400
        teams.append(team)

    added = add_teams(teams)
    return jsonify([{"id": t.id, "name": t.name} for t in added]), 201


# List every team currently in memory
@app.get("/teams")
def get_teams():
    return jsonify([{"id": t.id, "name": t.name} for t in list_teams()])


# Add multiple match results in a single request
@app.post("/matches")
def create_matches():
    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        return jsonify({"detail": "Request body must be a JSON object"}), 400

    raw_matches = body.get("matches")
    if not isinstance(raw_matches, list) or not raw_matches:
        return jsonify({"detail": "At least one match is required"}), 400

    matches = []
    for index, raw_match in enumerate(raw_matches):
        match, error = parse_match(raw_match)
        if error:
            return jsonify({"detail": f"matches[{index}]: {error}"}), 400

        if match.homeTeamId == match.awayTeamId:
            return jsonify(
                {"detail": f"Match {match.id}: home and away team must differ"}
            ), 400
        if get_team(match.homeTeamId) is None:
            return jsonify(
                {"detail": f"Match {match.id}: unknown home team {match.homeTeamId}"}
            ), 400
        if get_team(match.awayTeamId) is None:
            return jsonify(
                {"detail": f"Match {match.id}: unknown away team {match.awayTeamId}"}
            ), 400

        matches.append(match)

    added = add_matches(matches)
    return jsonify(
        [
            {
                "id": m.id,
                "homeTeamId": m.homeTeamId,
                "awayTeamId": m.awayTeamId,
                "homeGoals": m.homeGoals,
                "awayGoals": m.awayGoals,
            }
            for m in added
        ]
    ), 201


# List every match currently in memory
@app.get("/matches")
def get_matches():
    return jsonify(
        [
            {
                "id": m.id,
                "homeTeamId": m.homeTeamId,
                "awayTeamId": m.awayTeamId,
                "homeGoals": m.homeGoals,
                "awayGoals": m.awayGoals,
            }
            for m in list_matches()
        ]
    )


# Compute and return the league table from all stored matches
@app.get("/league-table")
def get_league_table():
    rows = compute_league_table()
    return jsonify([row_to_dict(row) for row in rows])


# Run the development server when executed directly
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
