import express from "express";
import type { Request, Response } from "express";
import path from "path";
import fs from "fs";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
	// console.log("index endpoint called 🚀");

	// const templatePath = path.join("./src/templates/index.html");
	// const publicPath = path.join(__dirname, "public");
	// // const urlLogo = `${process.env.URL_BASE_KV_API}/images/KyberV2Shiny.png`;
	// const urlLogo = path.join(publicPath, "kyberVisionLogo01.png");

	// let indexHtml = fs.readFileSync(templatePath, "utf8");
	// indexHtml = indexHtml.replace("{{urlLogo}}", urlLogo);
	// res.sendFile(indexHtml);

	try {
		// Use the compiled template path at runtime
		const templatePath = path.resolve(__dirname, "../templates/index.html");
		let html = fs.readFileSync(templatePath, "utf8");

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
	} catch (err) {
		console.error("Error serving index page:", err);
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
	// 	console.error("Error serving index page:", error);
	// 	res.status(500).json({ error: "Internal server error" });
	// }
});

export default router;
