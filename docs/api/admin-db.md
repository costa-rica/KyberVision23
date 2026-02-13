# adminDb

Database administration endpoints for backup, import, and table management.

- router file: src/routes/admin-db.ts
- url prefix: /admin-db

## GET /admin-db/table/:tableName

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

## GET /admin-db/create-database-backup

Creates a backup of the entire database as a ZIP file.

**Response:**

```json
{
  "result": true,
  "message": "Database backup completed",
  "backupFile": "string (file path)"
}
```

## GET /admin-db/backup-database-list

Lists all available database backup files.

**Response:**

```json
{
  "result": true,
  "backups": ["string array of zip filenames"]
}
```

## GET /admin-db/send-db-backup/:filename

Downloads a specific backup file.

**Parameters:**

- `filename`: Name of the backup file to download

## GET /admin-db/db-row-counts-by-table

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

## POST /admin-db/import-db-backup

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

## DELETE /admin-db/delete-db-backup/:filename

Deletes a specific backup file.

**Parameters:**

- `filename`: Name of the backup file to delete

## DELETE /admin-db/the-entire-database

Deletes the entire database file after creating a backup.

**Response:**

```json
{
  "result": true,
  "message": "Database successfully deleted.",
  "backupFile": "string (backup file path)"
}
```

## DELETE /admin-db/table/:tableName

Truncates all data from a specific table.

**Parameters:**

- `tableName`: Name of the table to truncate

## GET /admin-db/table-clean/:tableName

Alternative endpoint to retrieve table data (same as GET /admin-db/table/:tableName).

## DELETE /admin-db/table-row/:tableName/:rowId

Deletes a specific row from a table.

**Parameters:**

- `tableName`: Name of the table
- `rowId`: ID of the row to delete

## PUT /admin-db/table-row/:tableName/:rowId

Updates or creates a row in a specific table.

**Parameters:**

- `tableName`: Name of the table
- `rowId`: ID of the row to update (or null/undefined for new row)

**Request Body:** Object with fields to update/create

---
