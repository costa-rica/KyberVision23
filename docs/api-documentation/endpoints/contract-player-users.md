# Contract Player Users Router

This router handles linking and unlinking players to user accounts.

## POST /contract-player-users/link-user-to-player

Links a user account to a player record. If a contract already exists for the player or user, it updates the existing contract instead of creating a new one.

- Authentication: Required

### Parameters

Request body:

- `playerId` (number, required): ID of the player to link
- `userId` (number, required): ID of the user to link

### Sample Request

```bash
curl --location 'http://localhost:3000/contract-player-users/link-user-to-player' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...' \
--header 'Content-Type: application/json' \
--data-raw '{
  "playerId": 3,
  "userId": 1
}'
```

### Sample Response

```json
{
  "result": true,
  "contractPlayerUserObject": {
    "id": 1,
    "playerId": 3,
    "userId": 1,
    "createdAt": "2026-02-17T10:00:00.000Z",
    "updatedAt": "2026-02-17T10:00:00.000Z"
  }
}
```

## DELETE /contract-player-users/:playerId

Removes the contract linking a player to a user.

- Authentication: Required

### Parameters

URL parameters:

- `playerId` (number, required): ID of the player whose contract to delete

### Sample Request

```bash
curl --location --request DELETE 'http://localhost:3000/contract-player-users/3' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...'
```

### Sample Response

```json
{
  "result": true
}
```
