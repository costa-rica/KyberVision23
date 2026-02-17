# Videos Router

This router handles video uploads, retrieval, deletion, and video montage processing.

## GET /videos

Returns all videos in the database with associated session data.

- Authentication: Required

### Sample Request

```bash
curl --location 'http://localhost:3000/videos' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...'
```

### Sample Response

```json
{
  "result": true,
  "videosArray": [
    {
      "id": 1,
      "sessionId": 1,
      "filename": "kv_videoId1_sessionId1.mp4",
      "url": "https://example.com/videos/1",
      "videoFileSizeInMb": 150.5,
      "processingCompleted": true,
      "session": {
        "id": 1,
        "teamId": 1,
        "sessionDate": "2026-02-17T20:00:00.000Z"
      }
    }
  ]
}
```

## GET /videos/team/:teamId

Returns all processed videos for a specific team with session data.

- Authentication: Required
- Only returns videos where processingCompleted is true

### Parameters

URL parameters:

- `teamId` (number, required): ID of the team

### Sample Request

```bash
curl --location 'http://localhost:3000/videos/team/1' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...'
```

### Sample Response

```json
{
  "result": true,
  "videosArray": [
    {
      "id": 1,
      "sessionId": 1,
      "filename": "kv_videoId1_sessionId1.mp4",
      "processingCompleted": true,
      "session": {
        "id": 1,
        "teamId": 1,
        "sessionDate": "2026-02-17T20:00:00.000Z"
      }
    }
  ]
}
```

## POST /videos/upload-youtube

Uploads a video file, creates a database record, generates ContractVideoAction records for all actions in the session, and queues a YouTube upload job.

- Authentication: Required
- Request must be multipart/form-data
- Request timeout is extended to 40 minutes for large uploads
- User must be a member of the team associated with the session

### Parameters

Form data:

- `video` (file, required): the video file to upload
- `sessionId` (number, required): ID of the session this video belongs to

### Sample Request

```bash
curl --location 'http://localhost:3000/videos/upload-youtube' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...' \
--form 'video=@"/path/to/video.mp4"' \
--form 'sessionId="1"'
```

### Sample Response

```json
{
  "result": true,
  "message": "All good."
}
```

### Error Responses

#### Missing session ID (400)

```json
{
  "result": false,
  "message": "sessionId is required"
}
```

#### No video file (400)

```json
{
  "result": false,
  "message": "No video file uploaded"
}
```

#### Session not found (404)

```json
{
  "result": false,
  "message": "Session not found"
}
```

#### User not authorized (403)

```json
{
  "result": false,
  "message": "User does not have privileges to upload video for this session"
}
```

## DELETE /videos/:videoId

Deletes a video, including its YouTube upload and local database record.

- Authentication: Required

### Parameters

URL parameters:

- `videoId` (number, required): ID of the video to delete

### Sample Request

```bash
curl --location --request DELETE 'http://localhost:3000/videos/1' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...'
```

### Sample Response

```json
{
  "message": "Video deleted successfully"
}
```

## POST /videos/montage-service/queue-a-job

Queues a video montage creation job. The montage is assembled from selected actions in a video.

- Authentication: Required

### Parameters

Request body:

- `videoId` (number, required): ID of the source video
- `actionsArray` (array, required): array of action objects to include in the montage
- `token` (string, required): authentication token passed to the worker

### Sample Request

```bash
curl --location 'http://localhost:3000/videos/montage-service/queue-a-job' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...' \
--header 'Content-Type: application/json' \
--data-raw '{
  "videoId": 1,
  "actionsArray": [
    { "timestampFromStartOfVideo": 10.5 },
    { "timestampFromStartOfVideo": 45.2 }
  ],
  "token": "eyJhbGciOiJIUzI1NiIs..."
}'
```

### Sample Response

```json
{
  "result": true,
  "message": "Job queued successfully",
  "data": {}
}
```

### Error Responses

#### Video not found (404)

```json
{
  "result": false,
  "message": "Video not found"
}
```

#### Video filename missing (400)

```json
{
  "result": false,
  "message": "Video filename is missing"
}
```

## POST /videos/montage-service/video-completed-notify-user

Sends an email notification to the authenticated user that their video montage is ready, with a tokenized download link.

- Authentication: Required

### Parameters

Request body:

- `filename` (string, required): filename of the completed montage video

### Sample Request

```bash
curl --location 'http://localhost:3000/videos/montage-service/video-completed-notify-user' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...' \
--header 'Content-Type: application/json' \
--data-raw '{
  "filename": "montage_video_1.mp4"
}'
```

### Sample Response

```json
{
  "result": true,
  "message": "Email sent successfully"
}
```

### Error Responses

#### User not found (404)

```json
{
  "result": false,
  "message": "User not found"
}
```

## GET /videos/montage-service/play-video/:tokenizedMontageFilename

Streams a completed montage video in the browser. The filename is embedded in a JWT token for secure access.

- Authentication: Not required (token-based access)

### Parameters

URL parameters:

- `tokenizedMontageFilename` (string, required): JWT token containing the montage filename

### Sample Request

```bash
curl --location 'http://localhost:3000/videos/montage-service/play-video/eyJhbGciOiJIUzI1NiIs...'
```

### Sample Response

Binary video file stream.

### Error Responses

#### Invalid token (401)

```json
{
  "result": false,
  "message": "Invalid token"
}
```

#### File not found (404)

```json
{
  "result": false,
  "message": "File not found"
}
```

## GET /videos/montage-service/download-video/:tokenizedMontageFilename

Downloads a completed montage video as a file attachment. The filename is embedded in a JWT token for secure access.

- Authentication: Not required (token-based access)

### Parameters

URL parameters:

- `tokenizedMontageFilename` (string, required): JWT token containing the montage filename

### Sample Request

```bash
curl --location 'http://localhost:3000/videos/montage-service/download-video/eyJhbGciOiJIUzI1NiIs...' \
--output montage.mp4
```

### Sample Response

Binary video file download with `Content-Disposition: attachment` header.

### Error Responses

#### Invalid token (401)

```json
{
  "result": false,
  "message": "Invalid token"
}
```

#### File not found (404)

```json
{
  "result": false,
  "message": "File not found"
}
```

## GET /videos/user

Returns all processed videos uploaded by the authenticated user, with session data.

- Authentication: Required
- Only returns videos where processingCompleted is true

### Sample Request

```bash
curl --location 'http://localhost:3000/videos/user' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...'
```

### Sample Response

```json
{
  "result": true,
  "videosArray": [
    {
      "id": 1,
      "sessionId": 1,
      "filename": "kv_videoId1_sessionId1.mp4",
      "processingCompleted": true,
      "session": {
        "id": 1,
        "teamId": 1,
        "sessionDate": "2026-02-17T20:00:00.000Z"
      }
    }
  ]
}
```
