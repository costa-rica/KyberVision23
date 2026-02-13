# contract-video-actions

Video-to-action synchronization management.

- router file: src/routes/contract-video-actions.ts
- url prefix: /contract-video-actions

## POST /contract-video-actions/scripting-sync-video-screen/update-delta-time-all-actions-in-script

Updates the time synchronization offset for all actions in a script relative to a video.

**Request Body:**

```json
{
  "newDeltaTimeInSeconds": "number (required)",
  "scriptId": "number (required)",
  "videoId": "number (required)"
}
```

**Response:**

```json
{
  "result": true,
  "message": "ContractVideoAction modified with success",
  "scriptId": "number",
  "updatedCount": "number"
}
```

**Functionality:**

- Updates deltaTimeInSeconds for all actions in specified script
- Synchronizes action timestamps with video timeline
- Used for video analysis and review features
