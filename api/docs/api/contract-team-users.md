# contract-team-users

Team membership and role management endpoints (formerly "Tribe" functionality).

- router file: src/routes/contract-team-users.ts
- url prefix: /contract-team-users

## GET /contract-team-users

Gets all teams associated with the authenticated user.

**Response:**

```json
{
  "teamsArray": [
    {
      "id": "number",
      "teamName": "string",
      "city": "string",
      "coachName": "string",
      "genericJoinToken": "string (JWT)"
    }
  ],
  "contractTeamUserArray": [
    {
      "id": "number",
      "userId": "number",
      "teamId": "number",
      "isSuperUser": "boolean",
      "isAdmin": "boolean",
      "isCoach": "boolean"
    }
  ]
}
```

**Functionality:**

- Returns teams user is associated with
- Generates join tokens for team sharing
- Excludes Team data from contract objects

## POST /contract-team-users/create/:teamId

Creates or updates a team membership contract.

**Parameters:**

- `teamId`: ID of the team

**Request Body:**

```json
{
  "isSuperUser": "boolean",
  "isAdmin": "boolean",
  "isCoach": "boolean"
}
```

## GET /contract-team-users/:teamId

Gets all squad members for a specific team.

**Parameters:**

- `teamId`: ID of the team

**Response:**

```json
{
  "squadArray": [
    {
      "id": "number",
      "userId": "number",
      "username": "string",
      "email": "string",
      "isSuperUser": "boolean",
      "isAdmin": "boolean",
      "isCoach": "boolean",
      "isPlayer": "boolean",
      "playerId": "number"
    }
  ]
}
```

## POST /contract-team-users/add-squad-member

Adds a new member to a team by email.

**Request Body:**

```json
{
  "teamId": "number (required)",
  "email": "string (required)"
}
```

**Functionality:**

- If user exists, creates team contract immediately
- If user doesn't exist, creates pending invitation
- Sends invitation email for non-existing users

## GET /contract-team-users/create-join-token/:teamId

Generates a temporary join token for a team.

**Parameters:**

- `teamId`: ID of the team

**Response:**

```json
{
  "shareUrl": "string (full URL with token)"
}
```

## GET /contract-team-users/join/:joinToken

Joins a team using a join token.

**Parameters:**

- `joinToken`: JWT token containing teamId

**Functionality:**

- Validates token and extracts teamId
- Prevents duplicate team memberships
- Creates new team contract for user

## POST /contract-team-users/toggle-role

Toggles role permissions for a team member.

**Request Body:**

```json
{
  "teamId": "number (required)",
  "userId": "number (required)",
  "role": "string (Coach|Admin|Member)"
}
```

## DELETE /contract-team-users/

Removes a user from a team.

**Request Body:**

```json
{
  "contractTeamUserId": "number (required)"
}
```

---
