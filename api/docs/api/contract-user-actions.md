# contract-user-actions

User action favorites and analysis tracking.

- router file: src/routes/contract-user-actions.ts
- url prefix: /contract-user-actions

## POST /contract-user-actions/update-user-favorites

Updates user's favorite actions for a session.

**Request Body:**

```json
{
  "sessionId": "number (required)",
  "actionsArray": [
    {
      "actionsDbTableId": "number",
      "isFavorite": "boolean"
    }
  ]
}
```

**Functionality:**

- Creates contracts for newly favorited actions
- Removes contracts for unfavorited actions
- Maintains consistency between user preferences and database
