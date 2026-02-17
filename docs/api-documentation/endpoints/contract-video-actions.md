# Contract Video Actions Router

This router handles the relationship between videos and actions, primarily for syncing video playback timestamps with scripted actions.

## POST /contract-video-actions/scripting-sync-video-screen/update-delta-time-all-actions-in-script

Updates the delta time offset for all ContractVideoAction records associated with a specific script and video. This adjusts the time synchronization between scripted actions and video playback.

- Authentication: Required

### Parameters

Request body:

- `newDeltaTimeInSeconds` (number, required): the new time offset in seconds to apply
- `scriptId` (number, required): ID of the script whose actions to update
- `videoId` (number, required): ID of the video to update the delta time for

### Sample Request

```bash
curl --location 'http://localhost:3000/contract-video-actions/scripting-sync-video-screen/update-delta-time-all-actions-in-script' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...' \
--header 'Content-Type: application/json' \
--data-raw '{
  "newDeltaTimeInSeconds": -3.5,
  "scriptId": 1,
  "videoId": 2
}'
```

### Sample Response

```json
{
  "result": true,
  "message": "ContractVideoAction modified with success",
  "scriptId": 1,
  "updatedCount": 45
}
```

### Error Responses

#### No actions found for script (404)

```json
{
  "result": false,
  "message": "Actions not found",
  "scriptId": 1
}
```

#### No ContractVideoActions found for video (404)

```json
{
  "result": false,
  "message": "ContractVideoActions not found for video 2",
  "scriptId": 1,
  "videoId": 2
}
```
