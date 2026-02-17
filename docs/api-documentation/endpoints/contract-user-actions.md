# Contract User Actions Router

This router handles user favorite actions for a session.

## POST /contract-user-actions/update-user-favorites

Updates the authenticated user's favorite actions for a specific session. Creates new ContractUserAction records for newly favorited actions and removes records for unfavorited actions.

- Authentication: Required

### Parameters

Request body:

- `sessionId` (number, required): ID of the session
- `actionsArray` (array, required): array of action favorite data
  - `actionsDbTableId` (number): ID of the action in the Actions table
  - `isFavorite` (boolean): whether the action should be marked as a favorite

### Sample Request

```bash
curl --location 'http://localhost:3000/contract-user-actions/update-user-favorites' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...' \
--header 'Content-Type: application/json' \
--data-raw '{
  "sessionId": 1,
  "actionsArray": [
    { "actionsDbTableId": 10, "isFavorite": true },
    { "actionsDbTableId": 11, "isFavorite": false },
    { "actionsDbTableId": 12, "isFavorite": true }
  ]
}'
```

### Sample Response

```json
{
  "result": true,
  "message": "User favorites updated successfully"
}
```
