const app = require("./app"); // Import the configured app
const PORT = process.env.PORT || 8003;
const NAME_APP = process.env.NAME_APP || "KyberVision23Queuer";

// Override console.log and console.error to include the app name
console.log = (
  (log) => (message) =>
    log(`[${NAME_APP}] ${message}`)
)(console.log);

console.error = (
  (log) => (message) =>
    log(`[${NAME_APP}] ${message}`)
)(console.error);

// Capture stack traces for errors
process.on("uncaughtException", (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  console.error(`Stack Trace:\n${err.stack}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error(`Unhandled Rejection at:`, promise);
  console.error(`Reason:`, reason);
});

// Start the server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running at http://0.0.0.0:${PORT}`);
});
