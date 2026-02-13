# Logging Fix Instructions for Child Microservices

## Problem

Child processes (like KyberVision23YouTubeUploader) were adding their own console prefixes, which then got captured by the parent (KyberVision23Queuer) and re-prefixed, resulting in double brackets:

```
[KyberVision23Queuer] [KyberVision23Queuer] Unhandled Rejection at:
```

## Solution

Remove all console overrides and manual bracket prefixing from child process microservices. The parent (Queuer) will handle all prefixing.

## Changes Required in KyberVision23YouTubeUploader

### 1. Remove Console Overrides (if they exist)

If the YouTubeUploader has code like this in its entry point, **remove it**:

```javascript
// ❌ REMOVE THIS
const NAME_APP = process.env.NAME_APP || "SomeServiceName";

logger.info = (
  (log) => (message) =>
    log(`[${NAME_APP}] ${message}`)
)(logger.info);

logger.error = (
  (log) => (message) =>
    log(`[${NAME_APP}] ${message}`)
)(logger.error);
```

### 2. Remove Manual Brackets from Error Handlers

If there are error handlers with manual bracket prefixes, remove the brackets:

```javascript
// ❌ BEFORE (wrong):
process.on("uncaughtException", (err) => {
  logger.error(`[${NAME_APP}] Uncaught Exception: ${err.message}`);
  logger.error(`[${NAME_APP}] Stack Trace:\n${err.stack}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error(`[${NAME_APP}] Unhandled Rejection at:`, promise);
  logger.error(`[${NAME_APP}] Reason:`, reason);
});
```

```javascript
// ✅ AFTER (correct):
process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  logger.error(`Stack Trace:\n${err.stack}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled Rejection at:`, promise);
  logger.error(`Reason:`, reason);
});
```

### 3. Use Plain Console Statements

All logger.info and logger.error calls should be plain, without any manual prefixing:

```javascript
// ✅ CORRECT - No brackets, no prefixes
logger.info("✅ initModels() is called successfully.");
logger.info("YouTubeVideo ID:", res.data.id);
logger.info("KV Video ID:", videoId);
logger.info("✅ Upload completed!");

logger.error("❌ Upload failed:", err.message);
logger.error(err.stack);
```

The parent (Queuer) will automatically add:

- `[KyberVision23Queuer] Microservice Output:` for stdout
- `[KyberVision23Queuer] Microservice Error:` for stderr

## Expected Terminal Output After Fix

```
[KyberVision23Queuer] ✅ Server running at http://0.0.0.0:8003
[KyberVision23Queuer] Adding job to queue: KyberVision23YouTubeUploader
[KyberVision23Queuer] Job added to queue 'KyberVision23YouTubeUploader' with ID: 4
[KyberVision23Queuer] ⚙️ Starting Job ID: 4
[KyberVision23Queuer] --- New Logging ---
[KyberVision23Queuer] filename: kv22-videoId0005-sessionId5.mp4
[KyberVision23Queuer] videoId: 5
[KyberVision23Queuer] Microservice Output: ✅ initModels() is called successfully.
[KyberVision23Queuer] Microservice Output: YouTubeVideo ID: W2Vl82GDWsk
[KyberVision23Queuer] Microservice Output: KV Video ID: 5
[KyberVision23Queuer] Microservice Error: ❌ Upload failed: SQLITE_ERROR: no such table: videos
[KyberVision23Queuer] Microservice Error: Error
    at Database.<anonymous> (/Users/nick/Documents/KyberVision23Db/node_modules/sequelize/lib/dialects/sqlite/query.js:185:27)
    ...
[KyberVision23Queuer] Microservice exited with code 1
[KyberVision23Queuer] ❌ Job 4 failed: Microservice failed with code 1
```

## Benefits

1. **Single, consistent prefix** - All output has `[KyberVision23Queuer]`
2. **Clear origin markers** - "Microservice Output/Error" indicates child process logs
3. **Simpler child services** - No console override boilerplate
4. **Easier debugging** - Immediate visual distinction between parent and child logs

## Apply to Other Child Services

The same changes should be applied to:

- KyberVision23VideoMontageMaker
- Any future microservices spawned by the Queuer

## Testing

After making changes:

1. Start the Queuer: `npm start`
2. Trigger a job (e.g., YouTube upload)
3. Verify logs show only single brackets: `[KyberVision23Queuer]`
4. Verify child output is prefixed with "Microservice Output:" or "Microservice Error:"
