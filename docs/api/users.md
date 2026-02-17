# users

Users endpoints for login, register, and password management.

- router file: src/routes/users.ts
- url prefix: /users

## POST /users/register

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

**Example:**

```bash
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "password": "securepassword"
  }'
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

## POST /users/login

Authenticates a user and returns a JWT token.

**Request Body:**

```json
{
  "email": "string (required)",
  "password": "string (required)",
  "userDeviceTimestamp": "string (ISO 8601, optional)",
  "deviceName": "string (optional)",
  "deviceType": "string (optional)",
  "isTablet": "boolean (optional)",
  "manufacturer": "string (optional)",
  "modelName": "string (optional)",
  "osName": "string (optional)",
  "osVersion": "string (optional)"
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.smith@example.com",
    "password": "securepassword",
    "userDeviceTimestamp": "2026-02-17T10:00:00.000Z",
    "deviceName": "Jane iPhone",
    "deviceType": "Phone",
    "isTablet": false,
    "manufacturer": "Apple",
    "modelName": "iPhone 15",
    "osName": "iOS",
    "osVersion": "17.0"
  }'
```

**Response:**

```json
{
  "message": "Successfully logged in",
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
- Records a ping with device metadata when `userDeviceTimestamp` is provided
- Updates user's `updatedAt` timestamp
- Returns user data without password
- Includes associated team contracts

## POST /users/request-reset-password-email

Sends a password-reset email containing a short-lived JWT link.

**Request Body:**

```json
{
  "email": "string (required)"
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/users/request-reset-password-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.smith@example.com"
  }'
```

**Response:**

```json
{
  "message": "Email sent successfully"
}
```

**Functionality:**

- Looks up user by email
- Generates a JWT that expires in 1 hour
- Emails the token to the user for use with `/users/reset-password-with-new-password`

## POST /users/reset-password-with-new-password

Resets the authenticated user's password. Requires a valid JWT (typically from the reset email).

**Auth:** `Authorization: Bearer <token>` (required)

**Request Body:**

```json
{
  "password": "string (required)"
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/users/reset-password-with-new-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <reset-token>" \
  -d '{
    "password": "newSecurePassword"
  }'
```

**Response:**

```json
{
  "message": "Password reset successfully"
}
```

**Functionality:**

- Identifies user from the JWT in the `Authorization` header
- Hashes the new password with bcrypt and persists it

## DELETE /users/delete-account

Permanently deletes a user account after credential verification.

**Request Body:**

```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Example:**

```bash
curl -X DELETE http://localhost:3000/users/delete-account \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.smith@example.com",
    "password": "securepassword"
  }'
```

**Response:**

```json
{
  "message": "Account deleted successfully"
}
```

**Functionality:**

- Verifies email and password before deletion
- Rejects accounts that have no stored password (Google-only accounts)
- Permanently destroys the user record

## POST /users/register-or-login-via-google

Registers a new user or logs in an existing user using a Google-provided identity. No password is stored.

**Request Body:**

```json
{
  "email": "string (required)",
  "name": "string (optional, full name from Google profile)"
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/users/register-or-login-via-google \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.smith@gmail.com",
    "name": "Jane Smith"
  }'
```

**Response:**

```json
{
  "message": "Successfully logged in",
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

- Derives `username` from the email local-part
- Splits `name` into `firstName` / `lastName` on the first space
- Creates a new user with `password: null` if the email is not yet registered
- Processes pending team invitations on new-user creation (same as `/register`)
- For existing users, touches `updatedAt` to mirror `/login` behavior
- Returns user data without password field

---
