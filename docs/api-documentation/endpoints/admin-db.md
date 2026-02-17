# Admin DB Router

This router handles database administration including table inspection, backups, imports, and deletions.

## GET /admin-db/table/:tableName

Returns all rows from the specified database table.

- Authentication: Required

### Parameters

URL parameters:

- `tableName` (string, required): name of the database table to query

### Sample Request

```bash
curl --location 'http://localhost:3000/admin-db/table/Users' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...'
```

### Sample Response

```json
{
  "result": true,
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "username": "user"
    }
  ]
}
```

### Error Responses

#### Table not found (400)

```json
{
  "result": false,
  "message": "Table 'InvalidTable' not found."
}
```

## GET /admin-db/create-database-backup

Creates a zip backup of the entire database and returns the backup file path.

- Authentication: Required

### Sample Request

```bash
curl --location 'http://localhost:3000/admin-db/create-database-backup' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...'
```

### Sample Response

```json
{
  "result": true,
  "message": "Database backup completed",
  "backupFile": "/path/to/backups/db_backup_2026-02-17.zip"
}
```

## GET /admin-db/backup-database-list

Returns a list of all database backup zip files.

- Authentication: Required

### Sample Request

```bash
curl --location 'http://localhost:3000/admin-db/backup-database-list' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...'
```

### Sample Response

```json
{
  "result": true,
  "backups": [
    "db_backup_2026-02-15.zip",
    "db_backup_2026-02-17.zip"
  ]
}
```

## GET /admin-db/send-db-backup/:filename

Downloads a specific database backup file.

- Authentication: Required

### Parameters

URL parameters:

- `filename` (string, required): name of the backup zip file

### Sample Request

```bash
curl --location 'http://localhost:3000/admin-db/send-db-backup/db_backup_2026-02-17.zip' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...' \
--output backup.zip
```

### Sample Response

Binary zip file download.

### Error Responses

#### File not found (404)

```json
{
  "result": false,
  "message": "File not found."
}
```

## GET /admin-db/db-row-counts-by-table

Returns the row count for every table in the database.

- Authentication: Required

### Sample Request

```bash
curl --location 'http://localhost:3000/admin-db/db-row-counts-by-table' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...'
```

### Sample Response

```json
{
  "result": true,
  "arrayRowCountsByTable": [
    { "tableName": "Users", "rowCount": 5 },
    { "tableName": "Teams", "rowCount": 3 },
    { "tableName": "Videos", "rowCount": 12 }
  ]
}
```

## POST /admin-db/import-db-backup

Uploads and imports a database backup zip file. The zip is extracted, CSV files are read, and rows are appended to the database tables.

- Authentication: Required
- Request must be multipart/form-data
- The zip should contain a folder starting with `db_backup_` containing CSV files

### Parameters

Form data:

- `backupFile` (file, required): zip file containing the database backup

### Sample Request

```bash
curl --location 'http://localhost:3000/admin-db/import-db-backup' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...' \
--form 'backupFile=@"/path/to/db_backup_2026-02-17.zip"'
```

### Sample Response

```json
{
  "result": true,
  "message": "Database import completed successfully"
}
```

### Error Responses

#### No file uploaded (400)

```json
{
  "result": false,
  "message": "No file uploaded."
}
```

#### Import failed on a table (500)

```json
{
  "result": false,
  "error": "Error message here",
  "failedOnTableName": "Users"
}
```

## DELETE /admin-db/delete-db-backup/:filename

Deletes a specific database backup file from disk.

- Authentication: Required

### Parameters

URL parameters:

- `filename` (string, required): name of the backup zip file to delete

### Sample Request

```bash
curl --location --request DELETE 'http://localhost:3000/admin-db/delete-db-backup/db_backup_2026-02-17.zip' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...'
```

### Sample Response

```json
{
  "result": true,
  "message": "Backup file deleted successfully."
}
```

### Error Responses

#### File not found (404)

```json
{
  "result": false,
  "message": "File not found."
}
```

## DELETE /admin-db/the-entire-database

Deletes the entire SQLite database file. A backup is automatically created before deletion.

- Authentication: Required

### Sample Request

```bash
curl --location --request DELETE 'http://localhost:3000/admin-db/the-entire-database' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...'
```

### Sample Response

```json
{
  "result": true,
  "message": "Database successfully deleted.",
  "backupFile": "/path/to/backups/db_backup_2026-02-17_last_before_db_delete.zip"
}
```

### Error Responses

#### Database file not found (404)

```json
{
  "result": false,
  "message": "Database file not found."
}
```

## DELETE /admin-db/table/:tableName

Deletes all rows from the specified table (truncate).

- Authentication: Required

### Parameters

URL parameters:

- `tableName` (string, required): name of the database table to truncate

### Sample Request

```bash
curl --location --request DELETE 'http://localhost:3000/admin-db/table/Actions' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...'
```

### Sample Response

```json
{
  "result": true,
  "message": "Table 'Actions' has been deleted."
}
```

### Error Responses

#### Table not found (400)

```json
{
  "result": false,
  "message": "Table 'InvalidTable' not found."
}
```

## GET /admin-db/table-clean/:tableName

Fetches all records from a specific table. Functionally similar to GET /admin-db/table/:tableName but returns an empty array instead of a dummy row when the table is empty.

- Authentication: Required

### Parameters

URL parameters:

- `tableName` (string, required): name of the database table

### Sample Request

```bash
curl --location 'http://localhost:3000/admin-db/table-clean/Users' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...'
```

### Sample Response

```json
{
  "result": true,
  "data": [
    {
      "id": 1,
      "email": "user@example.com"
    }
  ]
}
```

### Error Responses

#### Table not found (400)

```json
{
  "result": false,
  "message": "Table 'InvalidTable' not found."
}
```

## DELETE /admin-db/table-row/:tableName/:rowId

Deletes a specific row from a table by its ID.

- Authentication: Required

### Parameters

URL parameters:

- `tableName` (string, required): name of the database table
- `rowId` (number, required): ID of the row to delete

### Sample Request

```bash
curl --location --request DELETE 'http://localhost:3000/admin-db/table-row/Users/5' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...'
```

### Sample Response

```json
{
  "result": true,
  "message": "Row 5 from table 'Users' has been deleted."
}
```

### Error Responses

#### Table not found (400)

```json
{
  "result": false,
  "message": "Table 'InvalidTable' not found."
}
```

## PUT /admin-db/table-row/:tableName/:rowId

Updates a specific row in a table, or creates a new row if the rowId is null/undefined.

- Authentication: Required

### Parameters

URL parameters:

- `tableName` (string, required): name of the database table
- `rowId` (number, required): ID of the row to update, or "null"/"undefined" to create a new row

Request body:

- key-value pairs matching the table's column names

### Sample Request (update)

```bash
curl --location --request PUT 'http://localhost:3000/admin-db/table-row/Users/5' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...' \
--header 'Content-Type: application/json' \
--data-raw '{
  "username": "updatedUsername"
}'
```

### Sample Response

```json
{
  "result": true,
  "message": "Row 5 in 'Users' successfully saved."
}
```

### Sample Request (create)

```bash
curl --location --request PUT 'http://localhost:3000/admin-db/table-row/Users/null' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...' \
--header 'Content-Type: application/json' \
--data-raw '{
  "email": "new@example.com",
  "username": "newuser"
}'
```

### Error Responses

#### Table not found (400)

```json
{
  "result": false,
  "message": "Table 'InvalidTable' not found."
}
```

#### Row not found (404)

```json
{
  "result": false,
  "message": "No record found with id 999 in table 'Users'."
}
```
