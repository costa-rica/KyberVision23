# Teams Router

This router handles team creation, management, player assignment, and visibility settings.

## GET /teams

Returns all teams in the database.

- Authentication: Required

### Sample Request

```bash
curl --location 'http://localhost:3000/teams' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...'
```

### Sample Response

```json
{
  "result": true,
  "teams": [
    {
      "id": 1,
      "teamName": "Eagles",
      "description": "Volleyball team",
      "visibility": "Private"
    }
  ]
}
```

## POST /teams/create

Creates a new team, links it to a league, assigns the authenticated user as super user and admin, and optionally adds players.

- Authentication: Required
- The creating user is automatically assigned as isSuperUser and isAdmin
- If no leagueName is provided, defaults to league ID 1

### Parameters

Request body:

- `teamName` (string, required): name of the team
- `description` (string, optional): team description
- `leagueName` (string, optional): name of the league to associate with
- `playersArray` (array, optional): array of player objects to create
  - `firstName` (string, required): player's first name
  - `lastName` (string, optional): player's last name
  - `shirtNumber` (number, optional): player's shirt number
  - `position` (string, optional): player's position
  - `positionAbbreviation` (string, optional): abbreviated position

### Sample Request

```bash
curl --location 'http://localhost:3000/teams/create' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...' \
--header 'Content-Type: application/json' \
--data-raw '{
  "teamName": "Eagles",
  "description": "Volleyball team",
  "playersArray": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "shirtNumber": 7,
      "position": "Outside Hitter",
      "positionAbbreviation": "OH"
    }
  ]
}'
```

### Sample Response

```json
{
  "result": true,
  "teamNew": {
    "id": 2,
    "teamName": "Eagles",
    "description": "Volleyball team",
    "playersArray": [
      {
        "firstName": "John",
        "lastName": "Doe",
        "shirtNumber": 7,
        "position": "Outside Hitter",
        "positionAbbreviation": "OH"
      }
    ]
  }
}
```

## POST /teams/update-visibility

Updates the visibility setting for a team.

- Authentication: Required

### Parameters

Request body:

- `teamId` (number, required): ID of the team
- `visibility` (string, required): visibility setting (e.g. "Public", "Private")

### Sample Request

```bash
curl --location 'http://localhost:3000/teams/update-visibility' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...' \
--header 'Content-Type: application/json' \
--data-raw '{
  "teamId": 1,
  "visibility": "Public"
}'
```

### Sample Response

```json
{
  "result": true,
  "team": {
    "id": 1,
    "teamName": "Eagles",
    "description": "Volleyball team",
    "visibility": "Public"
  }
}
```

### Error Responses

#### Team not found (404)

```json
{
  "result": false,
  "message": "Team not found"
}
```

## POST /teams/add-player

Adds a new player to an existing team.

- Authentication: Required

### Parameters

Request body:

- `teamId` (number, required): ID of the team
- `firstName` (string, required): player's first name
- `lastName` (string, optional): player's last name
- `shirtNumber` (number, optional): player's shirt number
- `position` (string, optional): player's position
- `positionAbbreviation` (string, optional): abbreviated position

### Sample Request

```bash
curl --location 'http://localhost:3000/teams/add-player' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...' \
--header 'Content-Type: application/json' \
--data-raw '{
  "teamId": 1,
  "firstName": "Jane",
  "lastName": "Smith",
  "shirtNumber": 12,
  "position": "Setter",
  "positionAbbreviation": "S"
}'
```

### Sample Response

```json
{
  "result": true,
  "playerNew": {
    "id": 5,
    "firstName": "Jane",
    "lastName": "Smith"
  }
}
```

## DELETE /teams/player

Removes a player from a team by deleting their ContractTeamPlayer record.

- Authentication: Required

### Parameters

Request body:

- `teamId` (number, required): ID of the team
- `playerId` (number, required): ID of the player to remove

### Sample Request

```bash
curl --location --request DELETE 'http://localhost:3000/teams/player' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...' \
--header 'Content-Type: application/json' \
--data-raw '{
  "teamId": 1,
  "playerId": 5
}'
```

### Sample Response

```json
{
  "result": true
}
```

## GET /teams/public

Returns all teams with visibility set to "Public".

- Authentication: Required

### Sample Request

```bash
curl --location 'http://localhost:3000/teams/public' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...'
```

### Sample Response

```json
{
  "result": true,
  "publicTeamsArray": [
    {
      "id": 1,
      "teamName": "Eagles",
      "description": "Volleyball team",
      "visibility": "Public"
    }
  ]
}
```
