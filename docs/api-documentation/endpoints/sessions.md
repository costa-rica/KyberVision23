# Sessions Router

This router handles session (match/practice) management and action retrieval for review and video syncing screens.

## POST /sessions/review-selection-screen/get-actions

Returns all actions for a session with computed video timestamps, including favorite status for the authenticated user. Actions are merged across all scripts, sorted by video timestamp, and indexed.

- Authentication: Required

### Parameters

Request body:

- `sessionId` (number, required): ID of the session
- `videoId` (number, required): ID of the video to compute timestamps against

### Sample Request

```bash
curl --location 'http://localhost:3000/sessions/review-selection-screen/get-actions' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...' \
--header 'Content-Type: application/json' \
--data-raw '{
  "sessionId": 1,
  "videoId": 2
}'
```

### Sample Response

```json
{
  "result": true,
  "sessionId": 1,
  "videoId": 2,
  "actionsArray": [
    {
      "id": 10,
      "type": "Serve",
      "subtype": null,
      "quality": "+",
      "playerId": 3,
      "timestamp": "2026-02-17T20:15:00.000Z",
      "timestampReferenceFirstAction": "2026-02-17T20:14:50.000Z",
      "timeDeltaInSeconds": -2.5,
      "timestampFromStartOfVideo": 7.5,
      "favorite": true,
      "reviewVideoActionsArrayIndex": 1
    }
  ],
  "playerDbObjectsArray": [
    {
      "id": 3,
      "firstName": "John",
      "lastName": "Doe"
    }
  ]
}
```

## GET /sessions/:teamId

Returns all sessions for a specific team, with formatted date strings.

- Authentication: Required

### Parameters

URL parameters:

- `teamId` (number, required): ID of the team

### Sample Request

```bash
curl --location 'http://localhost:3000/sessions/1' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...'
```

### Sample Response

```json
{
  "result": true,
  "sessionsArray": [
    {
      "id": 1,
      "teamId": 1,
      "sessionDate": "2026-02-17T20:00:00.000Z",
      "sessionDateString": "17 fev 20h00",
      "city": "Paris",
      "sessionName": "Match vs Tigers",
      "contractLeagueTeamId": 1
    }
  ]
}
```

## POST /sessions/create

Creates a new session for a team.

- Authentication: Required
- Uses the default ContractLeagueTeam (id: 1) for league association

### Parameters

Request body:

- `teamId` (number, required): ID of the team
- `sessionDate` (string, required): ISO date string for the session
- `sessionName` (string, optional): name of the session
- `sessionCity` (string, optional): city where the session takes place
- `contractLeagueTeamId` (number, optional): currently unused, defaults to 1

### Sample Request

```bash
curl --location 'http://localhost:3000/sessions/create' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...' \
--header 'Content-Type: application/json' \
--data-raw '{
  "teamId": 1,
  "sessionDate": "2026-02-20T19:00:00.000Z",
  "sessionName": "Practice",
  "sessionCity": "Paris"
}'
```

### Sample Response

```json
{
  "result": true,
  "sessionNew": {
    "id": 5,
    "teamId": 1,
    "sessionDate": "2026-02-20T19:00:00.000Z",
    "sessionDateString": "20 fev 19h00",
    "city": "Paris",
    "sessionName": "Practice",
    "contractLeagueTeamId": 1
  }
}
```

### Error Responses

#### Default league contract not found (404)

```json
{
  "result": false,
  "message": "Default league contract not found"
}
```

## GET /sessions/scripting-sync-video/:sessionId/actions

Returns all actions for a session across all scripts. Used by the mobile ScriptingSyncVideo screen after a video is selected.

- Authentication: Required

### Parameters

URL parameters:

- `sessionId` (number, required): ID of the session

### Sample Request

```bash
curl --location 'http://localhost:3000/sessions/scripting-sync-video/1/actions' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...'
```

### Sample Response

```json
{
  "result": true,
  "actionsArray": [
    {
      "id": 10,
      "type": "Serve",
      "subtype": null,
      "quality": "+",
      "playerId": 3,
      "scriptId": 1,
      "timestamp": "2026-02-17T20:15:00.000Z"
    }
  ]
}
```

### Error Responses

#### No actions found (404)

```json
{
  "result": false,
  "message": "No actions found for this session."
}
```

## GET /sessions/scripting-sync-video-screen/get-actions-for-syncing/:sessionId

Returns all actions grouped by script with computed video timestamps and delta time information. Used for the ScriptingSyncVideo screen to display and adjust time synchronization.

- Authentication: Required

### Parameters

URL parameters:

- `sessionId` (number, required): ID of the session

### Sample Request

```bash
curl --location 'http://localhost:3000/sessions/scripting-sync-video-screen/get-actions-for-syncing/1' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...'
```

### Sample Response

```json
{
  "result": true,
  "sessionId": "1",
  "actionsArrayByScript": [
    {
      "scriptId": 1,
      "actionsArray": [
        {
          "id": 10,
          "type": "Serve",
          "quality": "+",
          "playerId": 3,
          "timestamp": "2026-02-17T20:15:00.000Z",
          "scriptFirstActionTimestamp": "2026-02-17T20:14:50.000Z",
          "deltaTimeInSeconds": -2.5,
          "videoTimestampCalculation": 7.5
        }
      ],
      "deltaTimeInSecondsIsSameForAllActions": true,
      "deltaTimeInSeconds": -2.5
    }
  ]
}
```
