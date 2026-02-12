# leagues

League and competition management.

- router file: src/routes/leagues.ts
- url prefix: /leagues

## GET /leagues/team/:teamId

Gets all leagues associated with a specific team.

**Parameters:**

- `teamId`: ID of the team

**Response:**

```json
{
  "leaguesArray": [
    {
      "id": "number",
      "name": "string",
      "contractLeagueTeamId": "number"
    }
  ]
}
```

**Functionality:**

- Returns leagues through team-league contracts
- Sorts leagues by ID
- Includes contract ID for relationship management
