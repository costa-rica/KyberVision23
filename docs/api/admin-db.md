# adminDb

Database administration endpoints for backup, import, and table management.

- router file: src/routes/adminDb.ts
- url prefix: /admin-db

**Auth:** All endpoints require `Authorization: Bearer <token>`.

**Valid table names:** `User`, `Video`, `Action`, `ContractLeagueTeam`, `Complex`, `ContractTeamUser`, `League`, `Session`, `OpponentServeTimestamp`, `Player`, `ContractTeamPlayer`, `Script`, `ContractVideoAction`, `Team`, `ContractPlayerUser`, `ContractUserAction`, `PendingInvitations`, `Ping`

---

## GET /admin-db/table/:tableName

Retrieves all data from a specific database table.

**Parameters:**

- `tableName`: Name of the database table

**Example:**

```bash
curl http://localhost:3000/admin-db/table/User \
  -H "Authorization: Bearer <token>"
```

**Response:**

```json
{
  "result": true,
  "data": []
}
```

**Functionality:**

- Returns all records from specified table
- If the table is empty, returns a single dummy row with all attributes set to `null` (useful for inferring column names)
- Returns `400` if `tableName` is not a recognised model

## GET /admin-db/create-database-backup

Creates a backup of the entire database as a ZIP file.

**Example:**

```bash
curl http://localhost:3000/admin-db/create-database-backup \
  -H "Authorization: Bearer <token>"
```

**Response:**

```json
{
  "result": true,
  "message": "Database backup completed",
  "backupFile": "string (absolute path to the created ZIP file)"
}
```

## GET /admin-db/backup-database-list

Lists all available database backup ZIP files.

**Example:**

```bash
curl http://localhost:3000/admin-db/backup-database-list \
  -H "Authorization: Bearer <token>"
```

**Response:**

```json
{
  "result": true,
  "backups": ["db_backup_2026-02-17.zip"]
}
```

## GET /admin-db/send-db-backup/:filename

Downloads a specific backup ZIP file as an attachment.

**Parameters:**

- `filename`: Name of the backup file to download

**Example:**

```bash
curl http://localhost:3000/admin-db/send-db-backup/db_backup_2026-02-17.zip \
  -H "Authorization: Bearer <token>" \
  -O
```

**Response:** Binary file download (`Content-Disposition: attachment`). Returns `404` if the file does not exist.

## GET /admin-db/db-row-counts-by-table

Returns row counts for all database tables.

**Example:**

```bash
curl http://localhost:3000/admin-db/db-row-counts-by-table \
  -H "Authorization: Bearer <token>"
```

**Response:**

```json
{
  "result": true,
  "arrayRowCountsByTable": [
    {
      "tableName": "User",
      "rowCount": 12
    }
  ]
}
```

## GET /admin-db/table-clean/:tableName

Retrieves all data from a specific table. Unlike `GET /admin-db/table/:tableName`, returns an empty array when the table has no rows (no dummy row is injected).

**Parameters:**

- `tableName`: Name of the database table

**Example:**

```bash
curl http://localhost:3000/admin-db/table-clean/Session \
  -H "Authorization: Bearer <token>"
```

**Response:**

```json
{
  "result": true,
  "data": []
}
```

## POST /admin-db/import-db-backup

Imports data from a backup ZIP file into the database.

**Request:** `multipart/form-data` with a `backupFile` field containing the ZIP.

**Example:**

```bash
curl -X POST http://localhost:3000/admin-db/import-db-backup \
  -H "Authorization: Bearer <token>" \
  -F "backupFile=@/path/to/db_backup_2026-02-17.zip"
```

**Response:**

```json
{
  "result": true,
  "message": "Import completed successfully"
}
```

**Functionality:**

- Extracts the ZIP to a temporary directory
- Locates the inner `db_backup_*` folder produced by the backup routine
- Reads each CSV file and appends rows to the matching database table
- Returns `500` with `failedOnTableName` if a table import fails
- Cleans up temporary files and the uploaded ZIP after processing

## DELETE /admin-db/delete-db-backup/:filename

Deletes a specific backup ZIP file from the backup directory.

**Parameters:**

- `filename`: Name of the backup file to delete

**Example:**

```bash
curl -X DELETE http://localhost:3000/admin-db/delete-db-backup/db_backup_2026-02-17.zip \
  -H "Authorization: Bearer <token>"
```

**Response:**

```json
{
  "result": true,
  "message": "Backup file deleted successfully."
}
```

## DELETE /admin-db/the-entire-database

Permanently deletes the database file. A backup is automatically created first with the suffix `_last_before_db_delete`.

**Example:**

```bash
curl -X DELETE http://localhost:3000/admin-db/the-entire-database \
  -H "Authorization: Bearer <token>"
```

**Response:**

```json
{
  "result": true,
  "message": "Database successfully deleted.",
  "backupFile": "string (absolute path to the pre-deletion backup)"
}
```

**Functionality:**

- Creates a safety backup before deletion
- Deletes the SQLite file specified by `PATH_DATABASE` + `NAME_DB` env vars
- Returns `404` if the database file does not exist

## DELETE /admin-db/table/:tableName

Truncates all data from a specific table (all rows are deleted).

**Parameters:**

- `tableName`: Name of the table to truncate

**Example:**

```bash
curl -X DELETE http://localhost:3000/admin-db/table/Ping \
  -H "Authorization: Bearer <token>"
```

**Response:**

```json
{
  "result": true,
  "message": "Table 'Ping' has been deleted."
}
```

## DELETE /admin-db/table-row/:tableName/:rowId

Deletes a specific row from a table by its `id`.

**Parameters:**

- `tableName`: Name of the table
- `rowId`: ID of the row to delete

**Example:**

```bash
curl -X DELETE http://localhost:3000/admin-db/table-row/User/42 \
  -H "Authorization: Bearer <token>"
```

**Response:**

```json
{
  "result": true,
  "message": "Row 42 from table 'User' has been deleted."
}
```

## PUT /admin-db/table-row/:tableName/:rowId

Updates an existing row or creates a new one in a specific table.

**Parameters:**

- `tableName`: Name of the table
- `rowId`: ID of the row to update, or `null` / `undefined` to create a new record

**Request Body:** JSON object with the fields to set.

**Example (update):**

```bash
curl -X PUT http://localhost:3000/admin-db/table-row/User/42 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"firstName": "Jane", "lastName": "Smith"}'
```

**Example (create):**

```bash
curl -X PUT http://localhost:3000/admin-db/table-row/User/null \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"firstName": "New", "lastName": "User", "email": "new@example.com"}'
```

**Response:**

```json
{
  "result": true,
  "message": "Row 42 in 'User' successfully saved."
}
```

**Functionality:**

- `rowId` of `null` or `undefined` triggers a `Model.create()` call
- Otherwise performs a `Model.update()` and returns `404` if no matching row is found

---
