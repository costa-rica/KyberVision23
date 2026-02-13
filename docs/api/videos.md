# videos

Video upload, processing, and montage management.

- router file: src/routes/videos.ts
- url prefix: /videos

## GET /videos/

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

## GET /videos/team/:teamId

Gets all videos for a specific team.

**Parameters:**

- `teamId`: ID of the team

**Response:** Same format as GET /videos/ but filtered by team

## POST /videos/upload-youtube

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

## DELETE /videos/:videoId

Deletes a video and removes it from YouTube.

**Parameters:**

- `videoId`: ID of the video to delete

**Response:**

```json
{
  "message": "Video deleted successfully"
}
```

## POST /videos/montage-service/queue-a-job

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

## POST /videos/montage-service/video-completed-notify-user

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

## GET /videos/montage-service/play-video/:tokenizedMontageFilename

Streams a completed video montage for viewing.

**Parameters:**

- `tokenizedMontageFilename`: JWT token containing filename

**Response:** Video file stream

## GET /videos/montage-service/download-video/:tokenizedMontageFilename

Downloads a completed video montage.

**Parameters:**

- `tokenizedMontageFilename`: JWT token containing filename

**Response:** Video file as attachment

## GET /videos/user

Gets all videos for the authenticated user.

**Response:** Same format as GET /videos/ but filtered by user's teams
