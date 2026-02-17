# Product Requirements Document: Kyber Vision 23 Database Manager Web

The objective of this project is to be the web app that allows admin users to manage database functionality such as view, add, update, and delete rows. Also allows for the backup and restoration of the entire database.

## Codebase refactor

This project was started without a src/ directory but we have added a src/ directory to keep all the code base.

This is a frontend-only client. It does NOT contain API routes. All backend logic lives in a separate project.

## API documentation

This website will be supported by the API. See the docs/API_REFERENCE.md for endpoint requests and responses.

- Axios client (`src/lib/api/client.ts`) with request/response interceptors
- Base URL from `NEXT_PUBLIC_API_BASE_URL` environment variable
- JWT tokens automatically injected via request interceptor
- Response interceptor handles 401s by clearing auth state

## Redux

This website will use redux package to have persistent user data. We want users to be logged in and certain data to be maintained by the site so they do not have to keep logging in.

- Redux Toolkit with Redux Persist
- Auth slice: User credentials, JWT tokens, admin status
- Meditation slice: Meditation data and creation state
- Only auth state persisted to localStorage

## Pages

### Landing page (src/app/(public)/page.tsx)

We currently have a login modal, but we'll need modals for register and forgot password.

- Login Modal will have one api endpoint: POST /users/login
- Register Modal will have one api endpoint: POST /users/register
- Forgot password will have one endpoitn: POST /users/request-reset-password-email

### Home page (src/app/(dashboard)/dashboard/page.tsx)

The home page will be a page that will make a call to the API, which will be a separate project that will connect using `NEXT_PUBLIC_API_BASE_URL` environment variable. The API request will be to an endpoint that will get all the data from a table in the database. So this home page by default will call a table say Users table. Then it will display all the users in the database. But there should be a way for the user to select other tables – like a dropdown or something functional. Columns of the table should be dynamic. So there should be a way for the user to select which columns they want and which they don’t want visible. There will be some columns that by default are not visible.
We’ll want a form probably just above the table that is collapsable and expandable. It should have labels and inputs for each column in the table, so the form itself will need to be responsive to the columns sent by the api so when the user table is selected it will display different labels and inputs than when the Action table is sent.
This form will allow for users to add rows, clear, and update data in a row.

Each row in the table should be selectable which will populate the form above with the data from that row.

- get table names: GET /admin-db/db-row-counts-by-table
  - using the tableName subelements, store these data so they can be used in the drop down that our fronend user can then select tables from.
- populate table: GET /admin-db/table/:tableName endpoint.
  - use the tableName element from GET /admin-db/db-row-counts-by-table response
- delete rows: DELETE /admin-db/table-row/:tableName/:rowId
- when a row is modified or a row is created send request to PUT /admin-db/table-row/:tableName/:rowId

### db-backups page (src/app/(dashboard)/db-backups/page.tsx)

This page should work with the admin-db/ endpoints of the API.

The topmost section is the “Backup and Restore” section. Where there should be a button that allows the user to “Create Backup”. When pressed the overlay will show while the button triggers a request to the API – a separate application. Use the GET /admin-db/create-database-backup endpoint to create a back up

IN the same section there will be a list of the database backups available. Each filename will be a hyperlink that will download the file. Use the GET /admin-db/backup-database-list to get the list of backups and use the GET /admin-db/send-db-backup/:filename endpoint to download a .zip backup file.

Beneath that there will be a small file input that will let’s users choose files from their computer and upload .zip files, which will be the form these backups are created and stored in. Use the POST /admin-db/import-db-backup endpoint to send the .zip file.

The bottom will have a separate, second, section called “Tables” This will just be a table that lists table names in the left column and row counts on the right column. use the GET /admin-db/db-row-counts-by-table to get the list of tables and the row counts.

## LoadingOverlay

We have a standardized LoadingOverlay component that will display an animation that indicates the page is loading, src/components/loading-overlay.tsx. It will put a transparent overlay over the entire screen so the user cannot click on buttons. The transparent layer should not be 100% transparent so the user is aware there is an overlay. This component to be flexible to be able to receive updates as needed depending on the loading or process that is occurring.
