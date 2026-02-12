# KyberVision23 API Reference

This document provides comprehensive documentation for all API endpoints in the KyberVision23 Express.js TypeScript API. The API serves as the central connection point for all KyberVision universe applications to interact with the SQLite database using Sequelize ORM.

## Base URL

All endpoints are relative to the base URL: `http://localhost:PORT` (where PORT is configured in your environment)

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow a consistent format:

```json
{
  "result": true|false,
  "message": "Success message",
  "data": { ... },
  "error": "Error message if applicable"
}
```

---

## users

User authentication and registration endpoints.

### POST /users/register

Creates a new user account and handles invitation processing.

**Request Body:**

```json
{
  "firstName": "string",
  "lastName": "string",
  "password": "string (required)",
  "email": "string (required, unique)"
}
```

**Response:**

```json
{
  "message": "Successfully created user",
  "user": {
    "id": "number",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "username": "string"
  },
  "token": "string (JWT)"
}
```

**Functionality:**

- Generates username from email prefix
- Hashes password with bcrypt
- Sends registration email (environment dependent)
- Processes pending team invitations if they exist
- Auto-creates team user contracts for pending invitations

### POST /users/login

Authenticates a user and returns a JWT token.

**Request Body:**

```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response:**

```json
{
  "message": "Connexion r�ussie.",
  "token": "string (JWT)",
  "user": {
    "id": "number",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "username": "string",
    "ContractTeamUsers": []
  }
}
```

**Functionality:**

- Validates credentials against database
- Updates user's `updatedAt` timestamp
- Returns user data without password
- Includes associated team contracts

---

## adminDb

Database administration endpoints for backup, import, and table management.

### GET /admin-db/table/:tableName

Retrieves all data from a specific database table.

**Parameters:**

- `tableName`: Name of the database table

**Response:**

```json
{
  "result": true,
  "data": []
}
```

**Functionality:**

- Returns all records from specified table
- Creates dummy row with null values if table is empty
- Validates table exists in model definitions

### GET /admin-db/create-database-backup

Creates a backup of the entire database as a ZIP file.

**Response:**

```json
{
  "result": true,
  "message": "Database backup completed",
  "backupFile": "string (file path)"
}
```

### GET /admin-db/backup-database-list

Lists all available database backup files.

**Response:**

```json
{
  "result": true,
  "backups": ["string array of zip filenames"]
}
```

### GET /admin-db/send-db-backup/:filename

Downloads a specific backup file.

**Parameters:**

- `filename`: Name of the backup file to download

### GET /admin-db/db-row-counts-by-table

Returns row counts for all database tables.

**Response:**

```json
{
  "result": true,
  "arrayRowCountsByTable": [
    {
      "tableName": "string",
      "rowCount": "number"
    }
  ]
}
```

### POST /admin-db/import-db-backup

Imports data from a backup ZIP file.

**Request:** Multipart form with `backupFile` field

**Response:**

```json
{
  "result": true,
  "message": "Import completed successfully"
}
```

**Functionality:**

- Extracts ZIP file to temporary directory
- Reads CSV files and imports to database tables
- Cleans up temporary files after processing

### DELETE /admin-db/delete-db-backup/:filename

Deletes a specific backup file.

**Parameters:**

- `filename`: Name of the backup file to delete

### DELETE /admin-db/the-entire-database

Deletes the entire database file after creating a backup.

**Response:**

```json
{
  "result": true,
  "message": "Database successfully deleted.",
  "backupFile": "string (backup file path)"
}
```

### DELETE /admin-db/table/:tableName

Truncates all data from a specific table.

**Parameters:**

- `tableName`: Name of the table to truncate

### GET /admin-db/table-clean/:tableName

Alternative endpoint to retrieve table data (same as GET /admin-db/table/:tableName).

### DELETE /admin-db/table-row/:tableName/:rowId

Deletes a specific row from a table.

**Parameters:**

- `tableName`: Name of the table
- `rowId`: ID of the row to delete

### PUT /admin-db/table-row/:tableName/:rowId

Updates or creates a row in a specific table.

**Parameters:**

- `tableName`: Name of the table
- `rowId`: ID of the row to update (or null/undefined for new row)

**Request Body:** Object with fields to update/create

---

## teams

Team management and player association endpoints.

### GET /teams

Retrieves all teams in the system.

**Response:**

```json
{
  "result": true,
  "teams": [
    {
      "id": "number",
      "teamName": "string",
      "city": "string",
      "coachName": "string",
      "description": "string",
      "image": "string",
      "visibility": "string"
    }
  ]
}
```

### POST /teams/create

Creates a new team with optional players.

**Request Body:**

```json
{
  "teamName": "string (required)",
  "description": "string",
  "playersArray": [
    {
      "firstName": "string",
      "lastName": "string",
      "shirtNumber": "number",
      "position": "string",
      "positionAbbreviation": "string"
    }
  ],
  "leagueName": "string"
}
```

**Response:**

```json
{
  "result": true,
  "teamNew": {
    "id": "number",
    "teamName": "string",
    "description": "string",
    "playersArray": []
  }
}
```

**Functionality:**

- Creates team record
- Associates team with league (defaults to league ID 1)
- Creates team-user contract with admin privileges for creator
- Adds players if provided in playersArray

### POST /teams/update-visibility

Updates a team's visibility setting.

**Request Body:**

```json
{
  "teamId": "number (required)",
  "visibility": "string (required)"
}
```

### POST /teams/add-player

Adds a new player to an existing team.

**Request Body:**

```json
{
  "teamId": "number (required)",
  "firstName": "string (required)",
  "lastName": "string",
  "shirtNumber": "number",
  "position": "string",
  "positionAbbreviation": "string"
}
```

### DELETE /teams/player

Removes a player from a team.

**Request Body:**

```json
{
  "teamId": "number (required)",
  "playerId": "number (required)"
}
```

---

## contract-team-users

Team membership and role management endpoints (formerly "Tribe" functionality).

### GET /contract-team-users

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

### POST /contract-team-users/create/:teamId

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

### GET /contract-team-users/:teamId

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

### POST /contract-team-users/add-squad-member

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

### GET /contract-team-users/create-join-token/:teamId

Generates a temporary join token for a team.

**Parameters:**

- `teamId`: ID of the team

**Response:**

```json
{
  "shareUrl": "string (full URL with token)"
}
```

### GET /contract-team-users/join/:joinToken

Joins a team using a join token.

**Parameters:**

- `joinToken`: JWT token containing teamId

**Functionality:**

- Validates token and extracts teamId
- Prevents duplicate team memberships
- Creates new team contract for user

### POST /contract-team-users/toggle-role

Toggles role permissions for a team member.

**Request Body:**

```json
{
  "teamId": "number (required)",
  "userId": "number (required)",
  "role": "string (Coach|Admin|Member)"
}
```

### DELETE /contract-team-users/

Removes a user from a team.

**Request Body:**

```json
{
  "contractTeamUserId": "number (required)"
}
```

---

## players

Player profile and team association management.

### GET /players/team/:teamId

Gets all players associated with a specific team.

**Parameters:**

- `teamId`: ID of the team

**Response:**

```json
{
  "result": true,
  "team": {
    "id": "number",
    "teamName": "string"
  },
  "playersArray": [
    {
      "id": "number",
      "firstName": "string",
      "lastName": "string",
      "birthDate": "string (date)",
      "shirtNumber": "number",
      "position": "string",
      "positionAbbreviation": "string",
      "role": "string",
      "image": "string",
      "isUser": "boolean",
      "userId": "number",
      "username": "string",
      "email": "string"
    }
  ]
}
```

**Functionality:**

- Includes team-specific player data (position, shirt number)
- Shows if player has associated user account
- Provides user account details if linked

### GET /players/profile-picture/:filename

Serves player profile picture files.

**Parameters:**

- `filename`: Name of the image file

**Response:** Image file or 404 if not found

---

## contract-player-users

Player-to-user account linking management.

### POST /contract-player-users/link-user-to-player

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

### DELETE /contract-player-users/:playerId

Removes the link between a player and user account.

**Parameters:**

- `playerId`: ID of the player to unlink

---

## contract-user-actions

User action favorites and analysis tracking.

### POST /contract-user-actions/update-user-favorites

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

---

## contract-video-actions

Video-to-action synchronization management.

### POST /contract-video-actions/scripting-sync-video-screen/update-delta-time-all-actions-in-script

Updates the time synchronization offset for all actions in a script relative to a video.

**Request Body:**

```json
{
  "newDeltaTimeInSeconds": "number (required)",
  "scriptId": "number (required)",
  "videoId": "number (required)"
}
```

**Response:**

```json
{
  "result": true,
  "message": "ContractVideoAction modified with success",
  "scriptId": "number",
  "updatedCount": "number"
}
```

**Functionality:**

- Updates deltaTimeInSeconds for all actions in specified script
- Synchronizes action timestamps with video timeline
- Used for video analysis and review features

---

## leagues

League and competition management.

### GET /leagues/team/:teamId

Gets all leagues associated with a specific team.

**Parameters:**

- `teamId`: ID of the team

**Response:**

```json
{
  "leaguesArray": [
    {
      "id": "number",
      "name": "string",
      "contractLeagueTeamId": "number"
    }
  ]
}
```

**Functionality:**

- Returns leagues through team-league contracts
- Sorts leagues by ID
- Includes contract ID for relationship management

---

## sessions

Training session and match management.

### POST /sessions/review-selection-screen/get-actions

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

### GET /sessions/:teamId

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

### POST /sessions/create

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

### GET /sessions/scripting-sync-video/:sessionId/actions

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

### GET /sessions/scripting-sync-video-screen/get-actions-for-syncing/:sessionId

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

---

## videos

Video upload, processing, and montage management.

### GET /videos/

Gets all videos in the system with session data.

**Response:**

```json
{
  "result": true,
  "videosArray": [
    {
      "id": "number",
      "sessionId": "number",
      "filename": "string",
      "url": "string",
      "videoFileSizeInMb": "number",
      "processingCompleted": "boolean",
      "processingFailed": "boolean",
      "youTubeVideoId": "string",
      "session": {
        "id": "number",
        "sessionDate": "string",
        "sessionName": "string"
      }
    }
  ]
}
```

### GET /videos/team/:teamId

Gets all videos for a specific team.

**Parameters:**

- `teamId`: ID of the team

**Response:** Same format as GET /videos/ but filtered by team

### POST /videos/upload-youtube

Uploads a video file to the server and initiates asynchronous YouTube upload processing.

**Request:** Multipart form with `video` file and `sessionId` field

**Response:**

```json
{
  "result": true,
  "message": "All good."
}
```

**Processing Workflow:**

This endpoint handles the initial upload and database setup, then delegates YouTube processing to external services:

**Phase 1 - API Responsibilities (Synchronous):**

- Validates user has team membership permissions for the session
- Saves uploaded video file to server storage
- Creates initial Video database record with metadata
- Renames file using standardized naming convention: `{PREFIX}-videoId{XXXX}-sessionId{ID}.mp4`
- Creates ContractVideoAction records to link video with session actions for synchronization
- Sends job request to the Queuer service

**Phase 2 - External Service Processing (Asynchronous):**

- **Queuer**: Receives the job request and manages the processing queue
- **YouTubeUploader**: Child process of the Queuer that performs the actual YouTube upload
  - Uploads video to YouTube platform
  - Updates Video table with final completion status (`processingCompleted`, `youTubeVideoId`)
  - Marks upload as failed if errors occur (`processingFailed`)

**Note:** The API response indicates successful queueing, not completion of YouTube upload. The actual YouTube processing happens asynchronously in the YouTubeUploader service.

### DELETE /videos/:videoId

Deletes a video and removes it from YouTube.

**Parameters:**

- `videoId`: ID of the video to delete

**Response:**

```json
{
  "message": "Video deleted successfully"
}
```

### POST /videos/montage-service/queue-a-job

Queues a video montage creation job.

**Request Body:**

```json
{
  "videoId": "number (required)",
  "actionsArray": [],
  "token": "string"
}
```

**Response:**

```json
{
  "result": true,
  "message": "Job queued successfully",
  "data": {}
}
```

### POST /videos/montage-service/video-completed-notify-user

Notifies user when video montage is complete.

**Request Body:**

```json
{
  "filename": "string (required)"
}
```

**Functionality:**

- Sends email notification to user
- Includes tokenized download link

### GET /videos/montage-service/play-video/:tokenizedMontageFilename

Streams a completed video montage for viewing.

**Parameters:**

- `tokenizedMontageFilename`: JWT token containing filename

**Response:** Video file stream

### GET /videos/montage-service/download-video/:tokenizedMontageFilename

Downloads a completed video montage.

**Parameters:**

- `tokenizedMontageFilename`: JWT token containing filename

**Response:** Video file as attachment

### GET /videos/user

Gets all videos for the authenticated user.

**Response:** Same format as GET /videos/ but filtered by user's teams

---

## scripts

Live scripting and action data management.

### POST /scripts/scripting-live-screen/receive-actions-array

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

---

## Error Responses

All endpoints may return these common error responses:

### 400 Bad Request

```json
{
  "result": false,
  "error": "Invalid request parameters"
}
```

### 401 Unauthorized

```json
{
  "result": false,
  "message": "Invalid token"
}
```

### 403 Forbidden

```json
{
  "result": false,
  "message": "Insufficient privileges"
}
```

### 404 Not Found

```json
{
  "result": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "result": false,
  "message": "Internal server error",
  "error": "Detailed error message"
}
```

---

## Database Schema Reference

This API interacts with the KyberVision23Db SQLite database. For detailed information about table structures, relationships, and data types, refer to `docs/DATABASE_SCHEMA_OVERVIEW.md`.

### Key Entity Relationships:

- **Users � Teams**: Many-to-many through `contractTeamUser`
- **Players � Teams**: Many-to-many through `contractTeamPlayer`
- **Players � Users**: One-to-one through `contractPlayerUser`
- **Sessions** � **Videos**: One-to-many
- **Sessions** � **Scripts**: One-to-many
- **Scripts** � **Actions**: One-to-many
- **Actions � Videos**: Many-to-many through `contractVideoAction`
- **Users � Actions**: Many-to-many through `contractUserAction`

---

## Development Notes

- All timestamps are stored as SQLite DATE types and can include time components
- File uploads use multer middleware for handling multipart form data
- Authentication uses JWT tokens with configurable expiration
- Database operations use Sequelize ORM with TypeScript definitions
- Background jobs are queued for video processing and YouTube uploads
- Email notifications are sent for user registration and video processing completion
