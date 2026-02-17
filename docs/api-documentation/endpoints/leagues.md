# Leagues Router

This router handles league data retrieval for teams.

## GET /leagues/team/:teamId

Returns all leagues associated with a specific team, resolved through the ContractLeagueTeam join table.

- Authentication: Required

### Parameters

URL parameters:

- `teamId` (number, required): ID of the team

### Sample Request

```bash
curl --location 'http://localhost:3000/leagues/team/1' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...'
```

### Sample Response

```json
{
  "leaguesArray": [
    {
      "id": 1,
      "name": "Default League",
      "contractLeagueTeamId": 1
    }
  ]
}
```
