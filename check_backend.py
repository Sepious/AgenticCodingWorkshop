# Smoke test script to verify all league table API endpoints
from main import app, _data_source

client = app.test_client()

print("=== LEAGUE TABLE BACKEND CHECK ===\n")
print(f"Data source: {_data_source}\n")

# Health check
r = client.get("/health")
print("[1] GET /health")
print(f"    Status: {r.status_code}")
print(f"    Body:   {r.get_json()}\n")

# List teams loaded on startup
r = client.get("/teams")
teams = r.get_json()
print("[2] GET /teams")
print(f"    Status: {r.status_code}")
print(f"    Count:  {len(teams)} teams")
for team in teams[:5]:
    print(f"      - {team['name']} ({team['id']})")
if len(teams) > 5:
    print(f"      ... and {len(teams) - 5} more")
print()

# List matches loaded on startup
r = client.get("/matches")
matches = r.get_json()
print("[3] GET /matches")
print(f"    Status: {r.status_code}")
print(f"    Count:  {len(matches)} matches\n")

# List fixtures loaded on startup
r = client.get("/fixtures")
fixtures = r.get_json()
print("[4] GET /fixtures")
print(f"    Status: {r.status_code}")
print(f"    Count:  {len(fixtures)} fixtures\n")

# League table
r = client.get("/league-table")
table = r.get_json()
print("[5] GET /league-table")
print(f"    Status: {r.status_code}\n")
print("    Pos  Team               P  W  D  L  GF  GA  GD  Pts")
print("    ---  -----------------  -  -  -  -  --  --  --  ---")
for row in table[:10]:
    print(
        f"    {row['position']:>3}  {row['teamName']:<17}  "
        f"{row['played']}  {row['won']}  {row['drawn']}  {row['lost']}  "
        f"{row['goalsFor']:>2}  {row['goalsAgainst']:>2}  "
        f"{row['goalDifference']:>+2}  {row['points']:>3}"
    )
if len(table) > 10:
    print(f"    ... and {len(table) - 10} more teams")
print()

# Validation check
r = client.post(
    "/matches",
    json={
        "matches": [
            {
                "id": "bad",
                "homeTeamId": "sr:competitor:999999",
                "awayTeamId": teams[0]["id"],
                "homeGoals": 1,
                "awayGoals": 0,
            }
        ]
    },
)
print("[6] Validation (unknown team)")
print(f"    Status: {r.status_code} (expected 400)")
print(f"    Error:  {r.get_json()['detail']}\n")

# Assertions
assert client.get("/health").status_code == 200
assert len(client.get("/teams").get_json()) == 20
assert len(client.get("/matches").get_json()) == 380
assert len(client.get("/fixtures").get_json()) == 395
assert client.get("/league-table").status_code == 200
assert len(table) == 20
assert r.status_code == 400

print("=== RESULT ===")
print("All checks passed.")
print("Backend is working correctly.")
