# scripts

Live scripting and action data management.

- router file: src/routes/scripts.ts
- url prefix: /scripts

## POST /scripts/scripting-live-screen/receive-actions-array

Receives and processes actions from live scripting sessions.

**Request Body:**

```json
{
  "actionsArray": [
    {
      "timestamp": "string (ISO date, required)",
      "type": "number",
      "quality": "string",
      "area": "string",
      "setNumber": "number",
      "scoreTeamAnalyzed": "number",
      "scoreTeamOther": "number",
      "playerId": "number",
      "favorite": "boolean"
    }
  ],
  "sessionId": "number (required)"
}
```

**Response:**

```json
{
  "result": true,
  "message": "Actions for scriptId: {id}",
  "scriptId": "number",
  "actionsCount": "number"
}
```

**Functionality:**

- Creates new script with earliest action timestamp as reference
- Sorts actions by timestamp
- Creates action records with database transactions
- Handles user favorites for actions
- Maintains data consistency with transaction rollback on errors
