# Users Router

This router handles user registration, authentication, password reset, Google sign-in, and account deletion.

## POST /users/register

Creates a new user account with email and password. Sends a registration email and processes any pending team invitations for the email address.

- Authentication: Not required
- Username is derived from the email local-part
- Password is hashed with bcrypt before storage
- Returns a JWT access token with no expiration

### Parameters

Request body:

- `email` (string, required): user's email address
- `password` (string, required): user's password
- `firstName` (string, optional): user's first name
- `lastName` (string, optional): user's last name

### Sample Request

```bash
curl --location 'http://localhost:3000/users/register' \
--header 'Content-Type: application/json' \
--data-raw '{
  "email": "user@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe"
}'
```

### Sample Response

```json
{
  "message": "Successfully created user",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "user",
    "firstName": "John",
    "lastName": "Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Error Responses

#### Missing required fields (400)

```json
{
  "error": "All fields are required."
}
```

#### User already exists (400)

```json
{
  "error": "User already exists."
}
```

## POST /users/login

Authenticates a user with email and password and returns a JWT access token. Optionally records device ping data for latency tracking.

- Authentication: Not required
- Returns JWT access token with no expiration
- User object is returned without the password field

### Parameters

Request body:

- `email` (string, required): user's email address
- `password` (string, required): user's password
- `userDeviceTimestamp` (string, optional): device timestamp for ping tracking
- `deviceName` (string, optional): device name
- `deviceType` (string, optional): device type
- `isTablet` (boolean, optional): whether device is a tablet
- `manufacturer` (string, optional): device manufacturer
- `modelName` (string, optional): device model name
- `osName` (string, optional): operating system name
- `osVersion` (string, optional): operating system version

### Sample Request

```bash
curl --location 'http://localhost:3000/users/login' \
--header 'Content-Type: application/json' \
--data-raw '{
  "email": "user@example.com",
  "password": "securepassword123"
}'
```

### Sample Response

```json
{
  "message": "Successfully logged in",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "user",
    "firstName": "John",
    "lastName": "Doe",
    "ContractTeamUsers": []
  }
}
```

### Error Responses

#### Missing required fields (400)

```json
{
  "error": "Email and password are required."
}
```

#### User not found (404)

```json
{
  "error": "User not found."
}
```

#### Missing password / Google-only account (401)

```json
{
  "error": "User missing password. Probably registered via Google."
}
```

#### Invalid password (401)

```json
{
  "error": "Invalid password."
}
```

## POST /users/request-reset-password-email

Sends a password reset email with a JWT token that expires in 1 hour.

- Authentication: Not required

### Parameters

Request body:

- `email` (string, required): user's email address

### Sample Request

```bash
curl --location 'http://localhost:3000/users/request-reset-password-email' \
--header 'Content-Type: application/json' \
--data-raw '{
  "email": "user@example.com"
}'
```

### Sample Response

```json
{
  "message": "Email sent successfully"
}
```

### Error Responses

#### Missing email (400)

```json
{
  "error": "Email is required."
}
```

#### User not found (404)

```json
{
  "error": "User not found."
}
```

## POST /users/reset-password-with-new-password

Resets the authenticated user's password.

- Authentication: Required (JWT token from the reset email)

### Parameters

Request body:

- `password` (string, required): the new password

### Sample Request

```bash
curl --location 'http://localhost:3000/users/reset-password-with-new-password' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...' \
--header 'Content-Type: application/json' \
--data-raw '{
  "password": "newpassword456"
}'
```

### Sample Response

```json
{
  "message": "Password reset successfully"
}
```

### Error Responses

#### Missing password (400)

```json
{
  "error": "Password is required."
}
```

#### User not found (404)

```json
{
  "error": "User not found."
}
```

## DELETE /users/delete-account

Deletes a user account after verifying email and password.

- Authentication: Not required (authenticates via request body)

### Parameters

Request body:

- `email` (string, required): user's email address
- `password` (string, required): user's password

### Sample Request

```bash
curl --location --request DELETE 'http://localhost:3000/users/delete-account' \
--header 'Content-Type: application/json' \
--data-raw '{
  "email": "user@example.com",
  "password": "securepassword123"
}'
```

### Sample Response

```json
{
  "message": "Account deleted successfully"
}
```

### Error Responses

#### Missing required fields (400)

```json
{
  "error": "Email and password are required."
}
```

#### User not found (404)

```json
{
  "error": "User not found."
}
```

#### Missing password / Google-only account (401)

```json
{
  "error": "User missing password. Probably registered via Google."
}
```

#### Invalid password (401)

```json
{
  "error": "Invalid password."
}
```

## POST /users/register-or-login-via-google

Registers a new user or logs in an existing user via Google. No password is stored for Google-only accounts.

- Authentication: Not required
- Creates a new account if the email doesn't exist (no password stored)
- Processes pending team invitations for new accounts
- Returns JWT access token with no expiration

### Parameters

Request body:

- `email` (string, required): user's email from Google
- `name` (string, optional): user's display name from Google (split into firstName/lastName)

### Sample Request

```bash
curl --location 'http://localhost:3000/users/register-or-login-via-google' \
--header 'Content-Type: application/json' \
--data-raw '{
  "email": "user@gmail.com",
  "name": "John Doe"
}'
```

### Sample Response

```json
{
  "message": "Successfully logged in",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@gmail.com",
    "username": "user",
    "firstName": "John",
    "lastName": "Doe",
    "ContractTeamUsers": []
  }
}
```

### Error Responses

#### Missing email (400)

```json
{
  "error": "Email is required."
}
```

### Using the access token

The access token returned from login or register should be included in the `Authorization` header for all protected endpoints:

```bash
curl --location 'http://localhost:3000/teams' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...'
```
