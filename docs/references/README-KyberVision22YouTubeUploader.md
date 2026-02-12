# KyberVision22YouTubeUploader

In the Kyber Vision workflow, this app is used to upload videos to YouTube. It is triggered by the Kyber Vision Queuer micro service - which is itself triggered by the Kyber Vision API. This service will update the Videos table in the database at the completion of the upload to YouTube.

## Using the app as a standalone

### 1. Set up YouTube account / upload API OAuth 2.0 (one time)

- use the YouTubeOAuth2AuthorizerApp to authorize
- found at: https://github.com/costa-rica/YouTubeOAuth2AuthorizerApp
- or see old instructions in the KyberVision16YouTubeUploader/README.md

### 2. Upload

- use index.js
- terminal command `node index.js --filename <filename>`

## Install

```bash
yarn install
yarn add googleapis dotenv yargs
```

## env

```bash
PATH_VIDEOS_UPLOADED=/Users/yourname/VideosToUpload
CLIENT_ID=your_google_client_id
CLIENT_SECRET=your_google_client_secret
REDIRECT_URI=your_redirect_uri
REFRESH_TOKEN=your_refresh_token
```
