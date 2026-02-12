# sessions

Training session and match management.

- router file: src/routes/sessions.ts
- url prefix: /sessions

## POST /sessions/review-selection-screen/get-actions

Gets all actions for a session with video synchronization data for review.

**Request Body:**

```json
{
  "sessionId": "number (required)",
  "videoId": "number (required)"
}
```

**Response:**

```json
{
  "result": true,
  "sessionId": "number",
  "videoId": "number",
  "actionsArray": [
    {
      "id": "number",
      "type": "number",
      "quality": "string",
      "timestamp": "string (date)",
      "area": "string",
      "setNumber": "number",
      "scoreTeamAnalyzed": "number",
      "scoreTeamOther": "number",
      "timestampFromStartOfVideo": "number",
      "reviewVideoActionsArrayIndex": "number",
      "favorite": "boolean"
    }
  ],
  "playerDbObjectsArray": []
}
```

**Functionality:**

- Combines actions from all scripts in session
- Calculates video timestamps using sync data
- Sorts actions by video timeline position
- Includes user favorite status
- Provides unique player list

## GET /sessions/:teamId

Gets all sessions for a specific team.

**Parameters:**

- `teamId`: ID of the team

**Response:**

```json
{
  "result": true,
  "sessionsArray": [
    {
      "id": "number",
      "teamId": "number",
      "sessionDate": "string (date)",
      "city": "string",
      "sessionName": "string",
      "sessionDateString": "string (formatted)"
    }
  ]
}
```

**Functionality:**

- Formats session dates for display
- Returns sessions in chronological order

## POST /sessions/create

Creates a new training session or match.

**Request Body:**

```json
{
  "teamId": "number (required)",
  "sessionDate": "string (date, required)",
  "contractLeagueTeamId": "number",
  "sessionName": "string",
  "sessionCity": "string"
}
```

**Response:**

```json
{
  "result": true,
  "sessionNew": {
    "id": "number",
    "teamId": "number",
    "sessionDate": "string",
    "city": "string",
    "sessionName": "string",
    "sessionDateString": "string (formatted)"
  }
}
```

## GET /sessions/scripting-sync-video/:sessionId/actions

Gets basic action data for video synchronization.

**Parameters:**

- `sessionId`: ID of the session

**Response:**

```json
{
  "result": true,
  "actionsArray": []
}
```

## GET /sessions/scripting-sync-video-screen/get-actions-for-syncing/:sessionId

Gets detailed action data with synchronization information for script-based video sync.

**Parameters:**

- `sessionId`: ID of the session

**Response:**

```json
{
  "result": true,
  "sessionId": "number",
  "actionsArrayByScript": [
    {
      "scriptId": "number",
      "actionsArray": [],
      "deltaTimeInSecondsIsSameForAllActions": "boolean",
      "deltaTimeInSeconds": "number"
    }
  ]
}
```
