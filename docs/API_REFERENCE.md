# KyberVision23 API Reference

This API is an ExpressJS TypeScript API that provides a RESTful interface for interacting with the SQLite database using Sequelize ORM.

This file serves as the top-level API index.

Each resource has its own documentation under the [`/api`](./api) folder:

- [Admin DB](./api/admin-db.md)
- [contract-player-users](./api/contract-player-users.md)
- [contract-team-users](./api/contract-team-users.md)
- [contract-user-actions](./api/contract-user-actions.md)
- [contract-video-actions](./api/contract-video-actions.md)
- [Leagues](./api/leagues.md)
- [Players](./api/players.md)
- [scripts](./api/scripts.md)
- [Sessions](./api/sessions.md)
- [Teams](./api/teams.md)
- [Users](./api/users.md)
- [Videos](./api/videos.md)

For database tables, see [DATABASE_OVERVIEW.md](./DATABASE_OVERVIEW.md).

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
