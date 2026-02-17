# AGENT.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KyberVision22YouTubeUploader is a microservice in the KyberVision workflow that uploads processed sports analysis videos to YouTube. It is triggered by the KyberVision Queuer service (which is itself triggered by the KyberVision API) and updates the Videos table in the database upon upload completion.

## Key Commands

### Running the Uploader

```bash
node index.js --filename <filename> --videoId <videoId>
```

Both arguments are required:

- `--filename` (alias `-f`): Name of the video file in the PATH_VIDEOS_UPLOADED directory
- `--videoId` (alias `-v`): Database ID of the video record to update

### Installation

```bash
yarn install
```

## Environment Variables

Required `.env` file configuration:

```
PATH_VIDEOS_UPLOADED=/path/to/videos/directory
YOUTUBE_CLIENT_ID=your_google_client_id
YOUTUBE_CLIENT_SECRET=your_google_client_secret
YOUTUBE_REDIRECT_URI=your_redirect_uri
YOUTUBE_REFRESH_TOKEN=your_refresh_token
```

## Architecture

### Service Flow

1. **Trigger**: KyberVision API → Queuer → YouTubeUploader
2. **Upload**: YouTubeUploader authenticates with YouTube OAuth2 and uploads video
3. **Update**: Updates Videos table with YouTube video ID and completion status

### Code Structure

- `index.js`: Entry point that handles CLI arguments and orchestrates the upload
- `modules/uploader.js`: Core upload logic using Google APIs

### Critical Implementation Details

**Database Initialization**: The `kybervision22db` package requires explicit initialization before use. Always call `initModels()` from the package at the start of any function that accesses database models (see modules/uploader.js:10).

**Video Upload Process** (modules/uploader.js:7-58):

1. Initialize database models with `initModels()`
2. Create OAuth2 client with YouTube credentials
3. Upload video using `youtube.videos.insert()` with:
   - Title: filename
   - Description: "Uploaded by KyberVision22YouTubeUploader"
   - Privacy: "unlisted"
4. Update Video record in database:
   - Set `youTubeVideoId` from upload response
   - Set `processingCompleted = true`

**Error Handling**: The uploader throws errors back to index.js, which handles process exit codes (0 for success, 1 for failure).

## Database Integration

This service depends on the `kybervision22db` package (local file dependency at `../KyberVision22Db`).

**Video Table Fields Updated**:

- `youTubeVideoId`: The YouTube video ID returned after successful upload
- `processingCompleted`: Boolean flag set to true upon successful upload

**Important**: The Video record must already exist in the database with the provided videoId before upload begins.

## Authentication Setup

YouTube OAuth2 credentials must be obtained separately using the YouTubeOAuth2AuthorizerApp:

- Repository: https://github.com/costa-rica/YouTubeOAuth2AuthorizerApp
- This is a one-time setup to obtain refresh tokens for the .env file

## Related Services

- **KyberVision22 API**: Main API that receives video uploads and queues processing jobs
- **KyberVision Queuer**: Queue manager that triggers this uploader as a child process
- **KyberVision22Db**: Shared database package with Sequelize models and associations

## Documentation

- `docs/API_REFERENCE.md`: Complete API documentation for the KyberVision22 API, including the `/videos/upload-youtube` endpoint that initiates the workflow
- `docs/DATABASE_OVERVIEW.md`: Database schema details for the Videos table and related entities
