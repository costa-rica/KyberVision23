const fs = require("fs");
const path = require("path");

const sourceDir = path.join(__dirname, "..", "assets");
const destDir = path.join(__dirname, "..", "dist", "assets");

if (!fs.existsSync(sourceDir)) {
  console.warn(`⚠️ Assets source directory not found: ${sourceDir}`);
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });

const entries = fs.readdirSync(sourceDir);
for (const entry of entries) {
  const sourcePath = path.join(sourceDir, entry);
  const destPath = path.join(destDir, entry);

  if (fs.statSync(sourcePath).isFile()) {
    fs.copyFileSync(sourcePath, destPath);
  }
}
