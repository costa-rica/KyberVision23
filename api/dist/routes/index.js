"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = __importDefault(require("../modules/logger"));
const router = express_1.default.Router();
router.get("/", (req, res) => {
    // logger.info("index endpoint called 🚀");
    // const templatePath = path.join("./src/templates/index.html");
    // const publicPath = path.join(__dirname, "public");
    // // const urlLogo = `${process.env.URL_BASE_KV_API}/images/KyberV2Shiny.png`;
    // const urlLogo = path.join(publicPath, "kyberVisionLogo01.png");
    // let indexHtml = fs.readFileSync(templatePath, "utf8");
    // indexHtml = indexHtml.replace("{{urlLogo}}", urlLogo);
    // res.sendFile(indexHtml);
    try {
        // Use the compiled template path at runtime
        const templatePath = path_1.default.resolve(__dirname, "../templates/index.html");
        let html = fs_1.default.readFileSync(templatePath, "utf8");
        // ✅ Use a web URL path (not path.join / filesystem path)
        // Option A: root-relative path, served by express.static(...)
        // const logoUrl = "kyberVisionLogo01.png";
        // Option B (also fine): full absolute URL if you prefer
        const logoUrl = `${process.env.URL_BASE_KV_API}/kyberVisionLogo01.png`;
        // const logoUrl = `http://localhost:3000/kyberVisionLogo01.png`;
        // Replace all occurrences of {{urlLogo}}
        // html = html.replace(/{{urlLogo}}/g, logoUrl);
        html = html.replace("{{urlLogo}}", logoUrl);
        res.type("html").send(html);
    }
    catch (err) {
        logger_1.default.error("Error serving index page:", err);
        res.status(500).json({ error: "Internal server error" });
    }
    // try {
    // 	const templatePath = path.join(__dirname, "../templates/index.html");
    // 	let htmlContent = fs.readFileSync(templatePath, "utf8");
    // 	// Replace template variables
    // 	htmlContent = htmlContent.replace("{{urlLogo}}", "kyberVisionLogo01.png");
    // 	res.setHeader("Content-Type", "text/html");
    // 	res.send(htmlContent);
    // } catch (error) {
    // 	logger.error("Error serving index page:", error);
    // 	res.status(500).json({ error: "Internal server error" });
    // }
});
exports.default = router;
