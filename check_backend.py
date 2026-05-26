# Smoke test script to verify all league table API endpoints
from main import app

client = app.test_client()

print("=== LEAGUE TABLE BACKEND CHECK ===\n")

# Health check
r = client.get("/health")
print("[1] GET /health")
print(f"    Status: {r.status_code}")
print(f"    Body:   {r.get_json()}\n")

# Add teams
teams_payload = {
    "teams": [
        {"id": "sr:team:1", "name": "Arsenal"},
        {"id": "sr:team:2", "name": "Chelsea"},
        {"id": "sr:team:3", "name": "Liverpool"},
        {"id": "sr:team:4", "name": "Manchester City"},
    ]
}
r = client.post("/teams", json=teams_payload)
print("[2] POST /teams")
print(f"    Status: {r.status_code}")
print(f"    Added:  {len(r.get_json())} teams\n")

# List teams
r = client.get("/teams")
teams = r.get_json()
print("[3] GET /teams")
print(f"    Status: {r.status_code}")
print(f"    Count:  {len(teams)} teams")
for team in teams:
    print(f"      - {team['name']} ({team['id']})")
print()

# Add matches
matches_payload = {
    "matches": [
        {"id": "m1", "homeTeamId": "sr:team:1", "awayTeamId": "sr:team:2", "homeGoals": 2, "awayGoals": 1},
        {"id": "m2", "homeTeamId": "sr:team:2", "awayTeamId": "sr:team:3", "homeGoals": 1, "awayGoals": 1},
        {"id": "m3", "homeTeamId": "sr:team:3", "awayTeamId": "sr:team:1", "homeGoals": 0, "awayGoals": 3},
        {"id": "m4", "homeTeamId": "sr:team:4", "awayTeamId": "sr:team:2", "homeGoals": 4, "awayGoals": 0},
        {"id": "m5", "homeTeamId": "sr:team:1", "awayTeamId": "sr:team:4", "homeGoals": 1, "awayGoals": 1},
    ]
}
r = client.post("/matches", json=matches_payload)
print("[4] POST /matches")
print(f"    Status: {r.status_code}")
print(f"    Added:  {len(r.get_json())} matches\n")

# List matches
r = client.get("/matches")
matches = r.get_json()
print("[5] GET /matches")
print(f"    Status: {r.status_code}")
print(f"    Count:  {len(matches)} matches\n")

# League table
r = client.get("/league-table")
table = r.get_json()
print("[6] GET /league-table")
print(f"    Status: {r.status_code}\n")
print("    Pos  Team               P  W  D  L  GF  GA  GD  Pts")
print("    ---  -----------------  -  -  -  -  --  --  --  ---")
for row in table:
    print(
        f"    {row['position']:>3}  {row['teamName']:<17}  "
        f"{row['played']}  {row['won']}  {row['drawn']}  {row['lost']}  "
        f"{row['goalsFor']:>2}  {row['goalsAgainst']:>2}  "
        f"{row['goalDifference']:>+2}  {row['points']:>3}"
    )
print()

# Validation check
r = client.post(
    "/matches",
    json={
        "matches": [
            {
                "id": "bad",
                "homeTeamId": "sr:team:99",
                "awayTeamId": "sr:team:1",
                "homeGoals": 1,
                "awayGoals": 0,
            }
        ]
    },
)
print("[7] Validation (unknown team)")
print(f"    Status: {r.status_code} (expected 400)")
print(f"    Error:  {r.get_json()['detail']}\n")

# Assertions
assert client.get("/health").status_code == 200
assert len(client.get("/teams").get_json()) == 4
assert len(client.get("/matches").get_json()) == 5
assert client.get("/league-table").status_code == 200
assert table[0]["teamName"] == "Arsenal"
assert table[0]["points"] == 7
assert r.status_code == 400

print("=== RESULT ===")
print("All 7 checks passed.")
print("Backend is working correctly.")
