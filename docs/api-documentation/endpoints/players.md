# Players Router

This router handles player data retrieval and profile pictures for teams.

## GET /players/team/:teamId

Returns all players for a specific team, including their team contract details (shirt number, position, role) and linked user information if applicable.

- Authentication: Required

### Parameters

URL parameters:

- `teamId` (number, required): ID of the team

### Sample Request

```bash
curl --location 'http://localhost:3000/players/team/1' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...'
```

### Sample Response

```json
{
  "result": true,
  "team": {
    "id": 1,
    "teamName": "Eagles",
    "description": "Volleyball team"
  },
  "playersArray": [
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "birthDate": null,
      "shirtNumber": 7,
      "position": "Outside Hitter",
      "positionAbbreviation": "OH",
      "role": null,
      "image": null,
      "isUser": true,
      "userId": 2,
      "username": "johndoe",
      "email": "john@example.com"
    },
    {
      "id": 2,
      "firstName": "Jane",
      "lastName": "Smith",
      "birthDate": null,
      "shirtNumber": 12,
      "position": "Setter",
      "positionAbbreviation": "S",
      "role": null,
      "image": null,
      "isUser": false,
      "userId": null,
      "username": null,
      "email": null
    }
  ]
}
```

## GET /players/profile-picture/:filename

Serves a player's profile picture file.

- Authentication: Required

### Parameters

URL parameters:

- `filename` (string, required): filename of the profile picture

### Sample Request

```bash
curl --location 'http://localhost:3000/players/profile-picture/player_3.jpg' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...' \
--output profile.jpg
```

### Sample Response

Binary image file.

### Error Responses

#### Profile picture not found (404)

```json
{
  "error": "Profile picture not found"
}
```

#### Directory not configured (500)

```json
{
  "error": "Profile pictures directory not configured"
}
```
