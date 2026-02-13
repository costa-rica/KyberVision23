# TRANSITION VideoMontageMaker Notes

## Operational Requirements
- `ffmpeg` must be installed on the worker-node host (`brew install ffmpeg` on macOS, `sudo apt install ffmpeg` on Ubuntu).
- Montage output directories must exist or be creatable by the worker-node process:
  - `PATH_VIDEOS_UPLOADED`
  - `PATH_VIDEOS_MONTAGE_CLIPS`
  - `PATH_VIDEOS_MONTAGE_COMPLETE`
- The API callback uses `URL_LOCAL_KV_API_FOR_VIDEO_MONTAGE_MAKER` and expects `Authorization: Bearer <token>`.

## Asset Packaging
- Watermark asset lives at `worker-node/assets/KyberV2Shiny.png`.
- `npm run build` copies assets into `worker-node/dist/assets` via `scripts/copy-assets.js`.
