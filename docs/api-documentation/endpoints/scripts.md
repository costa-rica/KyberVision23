# Scripts Router

This router handles receiving scripted actions from live scripting sessions.

## POST /scripts/scripting-live-screen/receive-actions-array

Receives an array of actions from a live scripting session, creates a new Script record, and saves all actions to the database. Actions marked as favorites create corresponding ContractUserAction records.

- Authentication: Required
- A new Script is created for each submission
- Actions are sorted by timestamp and saved in order within individual transactions
- Optionally records a device ping for latency tracking

### Parameters

Request body:

- `actionsArray` (array, required): array of action objects
  - `timestamp` (string, required): ISO timestamp of the action
  - `type` (string, required): action type (e.g. "Attack", "Serve")
  - `subtype` (string | null): action subtype
  - `quality` (string): quality rating
  - `playerId` (string): ID of the player performing the action
  - `pointId` (string): identifier for the point/rally
  - `area` (number): court area number
  - `favorite` (boolean, optional): whether to mark as a user favorite
  - `scoreTeamAnalyzed` (number): current score of the analyzed team
  - `scoreTeamOther` (number): current score of the opposing team
  - `setNumber` (number): current set number
  - `newAction` (boolean): whether this is a new action
- `sessionId` (number, required): ID of the session
- `userDeviceTimestamp` (string, optional): device timestamp for ping tracking

### Sample Request

```bash
curl --location 'http://localhost:3000/scripts/scripting-live-screen/receive-actions-array' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...' \
--header 'Content-Type: application/json' \
--data-raw '{
  "sessionId": 1,
  "actionsArray": [
    {
      "timestamp": "2026-02-17T20:15:00.000Z",
      "type": "Serve",
      "subtype": null,
      "quality": "+",
      "playerId": "3",
      "pointId": "p1",
      "area": 1,
      "favorite": false,
      "scoreTeamAnalyzed": 0,
      "scoreTeamOther": 0,
      "setNumber": 1,
      "newAction": true
    }
  ]
}'
```

### Sample Response

```json
{
  "result": true,
  "message": "Actions for scriptId: 5",
  "scriptId": 5,
  "actionsCount": 1
}
```

### Error Responses

#### Invalid actions array (400)

```json
{
  "result": false,
  "error": "Invalid or empty actionsArray"
}
```

#### Missing session ID (400)

```json
{
  "result": false,
  "error": "sessionId is required"
}
```
