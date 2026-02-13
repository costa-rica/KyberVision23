# teams

Team management and player association endpoints.

- router file: src/routes/teams.ts
- url prefix: /teams

## GET /teams

Retrieves all teams in the system.

**Response:**

```json
{
  "result": true,
  "teams": [
    {
      "id": "number",
      "teamName": "string",
      "city": "string",
      "coachName": "string",
      "description": "string",
      "image": "string",
      "visibility": "string"
    }
  ]
}
```

## POST /teams/create

Creates a new team with optional players.

**Request Body:**

```json
{
  "teamName": "string (required)",
  "description": "string",
  "playersArray": [
    {
      "firstName": "string",
      "lastName": "string",
      "shirtNumber": "number",
      "position": "string",
      "positionAbbreviation": "string"
    }
  ],
  "leagueName": "string"
}
```

**Response:**

```json
{
  "result": true,
  "teamNew": {
    "id": "number",
    "teamName": "string",
    "description": "string",
    "playersArray": []
  }
}
```

**Functionality:**

- Creates team record
- Associates team with league (defaults to league ID 1)
- Creates team-user contract with admin privileges for creator
- Adds players if provided in playersArray

## POST /teams/update-visibility

Updates a team's visibility setting.

**Request Body:**

```json
{
  "teamId": "number (required)",
  "visibility": "string (required)"
}
```

## POST /teams/add-player

Adds a new player to an existing team.

**Request Body:**

```json
{
  "teamId": "number (required)",
  "firstName": "string (required)",
  "lastName": "string",
  "shirtNumber": "number",
  "position": "string",
  "positionAbbreviation": "string"
}
```

## DELETE /teams/player

Removes a player from a team.

**Request Body:**

```json
{
  "teamId": "number (required)",
  "playerId": "number (required)"
}
```

---
