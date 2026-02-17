# Contract Team Users Router

This router manages the relationship between users and teams, including squad membership, roles, and join tokens.

## GET /contract-team-users

Returns all teams the authenticated user belongs to, along with a generated join token for each team.

- Authentication: Required

### Sample Request

```bash
curl --location 'http://localhost:3000/contract-team-users' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...'
```

### Sample Response

```json
{
  "teamsArray": [
    {
      "id": 1,
      "teamName": "Eagles",
      "description": "Volleyball team",
      "genericJoinToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  ],
  "contractTeamUserArray": [
    {
      "id": 1,
      "userId": 1,
      "teamId": 1,
      "isSuperUser": true,
      "isAdmin": true,
      "isCoach": false
    }
  ]
}
```

## POST /contract-team-users/create/:teamId

Creates or updates a contract linking the authenticated user to a team.

- Authentication: Required

### Parameters

URL parameters:

- `teamId` (number, required): ID of the team

Request body:

- `isSuperUser` (boolean, optional): whether the user is a super user
- `isAdmin` (boolean, optional): whether the user is an admin
- `isCoach` (boolean, optional): whether the user is a coach

### Sample Request

```bash
curl --location 'http://localhost:3000/contract-team-users/create/1' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...' \
--header 'Content-Type: application/json' \
--data-raw '{
  "isSuperUser": false,
  "isAdmin": false,
  "isCoach": true
}'
```

### Sample Response (created)

```json
{
  "message": "ContractTeamUser created with success",
  "contractTeamUser": {
    "id": 2,
    "userId": 1,
    "teamId": 1,
    "isSuperUser": false,
    "isAdmin": false,
    "isCoach": true
  }
}
```

## GET /contract-team-users/:teamId

Returns all squad members for a team, including user details and player linkage status.

- Authentication: Required

### Parameters

URL parameters:

- `teamId` (number, required): ID of the team

### Sample Request

```bash
curl --location 'http://localhost:3000/contract-team-users/1' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...'
```

### Sample Response

```json
{
  "squadArray": [
    {
      "id": 1,
      "userId": 1,
      "teamId": 1,
      "isSuperUser": true,
      "isAdmin": true,
      "isCoach": false,
      "username": "nick",
      "email": "nick@example.com",
      "isPlayer": true,
      "playerId": 3
    }
  ]
}
```

## POST /contract-team-users/add-squad-member

Adds a user to a team by email. If the user does not exist, creates a pending invitation and sends a notification email.

- Authentication: Required

### Parameters

Request body:

- `teamId` (number, required): ID of the team
- `email` (string, required): email address of the user to add

### Sample Request

```bash
curl --location 'http://localhost:3000/contract-team-users/add-squad-member' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...' \
--header 'Content-Type: application/json' \
--data-raw '{
  "teamId": 1,
  "email": "newmember@example.com"
}'
```

### Sample Response (user exists)

```json
{
  "id": 3,
  "teamId": 1,
  "userId": 5,
  "isSuperUser": false,
  "isAdmin": false,
  "isCoach": false
}
```

### Sample Response (user not found, invitation sent)

```json
{
  "message": "User invited successfully."
}
```

### Error Responses

#### User already invited (400)

```json
{
  "message": "User already invited."
}
```

## GET /contract-team-users/create-join-token/:teamId

Generates a short-lived join token URL for a team. The token expires in 2 minutes.

- Authentication: Required
- Not currently used in the application

### Parameters

URL parameters:

- `teamId` (number, required): ID of the team

### Sample Request

```bash
curl --location 'http://localhost:3000/contract-team-users/create-join-token/1' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...'
```

### Sample Response

```json
{
  "shareUrl": "http://localhost:3000/contract-team-users/join/eyJhbGciOiJIUzI1NiIs..."
}
```

## GET /contract-team-users/join/:joinToken

Joins the authenticated user to a team using a join token.

- Authentication: Required

### Parameters

URL parameters:

- `joinToken` (string, required): JWT join token containing the teamId

### Sample Request

```bash
curl --location 'http://localhost:3000/contract-team-users/join/eyJhbGciOiJIUzI1NiIs...' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...'
```

### Sample Response

```json
{
  "result": true,
  "contractTeamUser": {
    "id": 4,
    "teamId": 1,
    "userId": 3
  }
}
```

### Error Responses

#### Invalid token (403)

```json
{
  "message": "Invalid token"
}
```

#### User already in team (400)

```json
{
  "message": "User already in team"
}
```

## POST /contract-team-users/toggle-role

Toggles a role for a specific user on a team. Supports "Coach", "Admin", and "Member" roles.

- Authentication: Required
- Setting role to "Member" clears all elevated roles (isSuperUser, isAdmin, isCoach)

### Parameters

Request body:

- `teamId` (number, required): ID of the team
- `userId` (number, required): ID of the user whose role to toggle
- `role` (string, required): role to toggle — "Coach", "Admin", or "Member"

### Sample Request

```bash
curl --location 'http://localhost:3000/contract-team-users/toggle-role' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...' \
--header 'Content-Type: application/json' \
--data-raw '{
  "teamId": 1,
  "userId": 2,
  "role": "Coach"
}'
```

### Sample Response

```json
{
  "result": true,
  "contractTeamUser": {
    "id": 2,
    "userId": 2,
    "teamId": 1,
    "isSuperUser": false,
    "isAdmin": false,
    "isCoach": true
  }
}
```

### Error Responses

#### Contract not found (404)

```json
{
  "message": "ContractTeamUser not found"
}
```

## DELETE /contract-team-users

Removes a user from a team by deleting their contract.

- Authentication: Required

### Parameters

Request body:

- `contractTeamUserId` (number, required): ID of the ContractTeamUser record to delete

### Sample Request

```bash
curl --location --request DELETE 'http://localhost:3000/contract-team-users' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...' \
--header 'Content-Type: application/json' \
--data-raw '{
  "contractTeamUserId": 3
}'
```

### Sample Response

```json
{
  "result": true,
  "contractTeamUser": {
    "id": 3,
    "teamId": 1,
    "userId": 5
  }
}
```

### Error Responses

#### Contract not found (404)

```json
{
  "message": "ContractTeamUser not found"
}
```
