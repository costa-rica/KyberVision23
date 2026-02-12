## players

Player profile and team association management.

- router file: src/routes/players.ts
- url prefix: /players

## GET /players/team/:teamId

Gets all players associated with a specific team.

**Parameters:**

- `teamId`: ID of the team

**Response:**

```json
{
  "result": true,
  "team": {
    "id": "number",
    "teamName": "string"
  },
  "playersArray": [
    {
      "id": "number",
      "firstName": "string",
      "lastName": "string",
      "birthDate": "string (date)",
      "shirtNumber": "number",
      "position": "string",
      "positionAbbreviation": "string",
      "role": "string",
      "image": "string",
      "isUser": "boolean",
      "userId": "number",
      "username": "string",
      "email": "string"
    }
  ]
}
```

**Functionality:**

- Includes team-specific player data (position, shirt number)
- Shows if player has associated user account
- Provides user account details if linked

## GET /players/profile-picture/:filename

Serves player profile picture files.

**Parameters:**

- `filename`: Name of the image file

**Response:** Image file or 404 if not found

---
