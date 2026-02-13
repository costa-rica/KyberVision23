# contract-player-users

Player-to-user account linking management.

- router file: src/routes/contract-player-users.ts
- url prefix: /contract-player-users

## POST /contract-player-users/link-user-to-player

Links a user account to a player profile.

**Request Body:**

```json
{
  "playerId": "number (required)",
  "userId": "number (required)"
}
```

**Functionality:**

- Creates one-to-one mapping between player and user
- Updates existing links if they exist
- Handles cases where user is already linked to another player

## DELETE /contract-player-users/:playerId

Removes the link between a player and user account.

**Parameters:**

- `playerId`: ID of the player to unlink

---
