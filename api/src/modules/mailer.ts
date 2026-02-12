import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

const transporter = nodemailer.createTransport({
	service: "Gmail",
	host: "smtp.gmail.com",
	port: 465,
	secure: true,
	auth: {
		user: process.env.ADMIN_EMAIL_ADDRESS,
		pass: process.env.ADMIN_EMAIL_PASSWORD,
	},
});

export const sendRegistrationEmail = async (
	toEmail: string,
	username: string
): Promise<any> => {
	try {
		// const templatePath = path.join(
		// 	"./src/templates/registrationConfirmationEmail.html"
		// );
		const templatePath = path.join(
			__dirname,
			"../templates/registrationConfirmationEmail.html"
		);

		let emailTemplate = fs.readFileSync(templatePath, "utf8");
		const urlLogo = `${process.env.URL_BASE_KV_API}/images/KyberV2Shiny.png`;

		emailTemplate = emailTemplate.replace("{{username}}", username);
		emailTemplate = emailTemplate.replace("{{urlLogo}}", urlLogo);

		const mailOptions = {
			from: process.env.ADMIN_EMAIL_ADDRESS,
			to: toEmail,
			subject: "Confirmation: Kyber Vision Registration ",
			html: emailTemplate,
		};

		const info = await transporter.sendMail(mailOptions);
		console.log("Email sent:", info.response);
		return info;
	} catch (error) {
		console.error("Error sending email [sendRegistrationEmail]:", error);
		throw error;
	}
};

export const sendResetPasswordEmail = async (
	toEmail: string,
	token: string
): Promise<any> => {
	try {
		const templatePath = path.join(
			__dirname,
			"../templates/resetPasswordLinkEmail.html"
		);
		// console.log("[ sendResetPasswordEmail 1]templatePath:", templatePath);

		let emailTemplate = fs.readFileSync(templatePath, "utf8");
		const resetLink = `${process.env.URL_KV_MANAGER_WEBSITE}/forgot-password/reset/${token}`;
		const urlLogo = `${process.env.URL_BASE_KV_API}/images/KyberV2Shiny.png`;

		// console.log("[ sendResetPasswordEmail 2]resetLink:", resetLink);
		// console.log("[ sendResetPasswordEmail 2]urlLogo:", urlLogo);
		emailTemplate = emailTemplate.replace("{{resetLink}}", resetLink);
		emailTemplate = emailTemplate.replace("{{urlLogo}}", urlLogo);

		console.log("[ sendResetPasswordEmail 3]emailTemplate:");

		const mailOptions = {
			from: process.env.ADMIN_EMAIL_ADDRESS,
			to: toEmail,
			subject: "Password Reset Request",
			html: emailTemplate,
		};

		const info = await transporter.sendMail(mailOptions);
		console.log("Email sent:", info.response);
		return info;
	} catch (error) {
		console.error("Error sending email [sendResetPasswordEmail]:", error);
		throw error;
	}
};

export const sendVideoMontageCompleteNotificationEmail = async (
	toEmail: string,
	tokenizedFilename: string
): Promise<any> => {
	try {
		const templatePath = path.join(
			__dirname,
			"../templates/videoMontageCompleteNotificationEmail.html"
		);

		let emailTemplate = fs.readFileSync(templatePath, "utf8");

		const montageUrlPlay = `${process.env.URL_BASE_KV_API}/videos/montage-service/play-video/${tokenizedFilename}`;
		const montageUrlDownload = `${process.env.URL_BASE_KV_API}/videos/montage-service/download-video/${tokenizedFilename}`;
		const urlLogo = `${process.env.URL_BASE_KV_API}/images/KyberV2Shiny.png`;

		emailTemplate = emailTemplate.replace(
			/{{montageUrlPlay}}/g,
			montageUrlPlay
		);
		emailTemplate = emailTemplate.replace(
			/{{montageUrlDownload}}/g,
			montageUrlDownload
		);
		emailTemplate = emailTemplate.replace("{{urlLogo}}", urlLogo);

		const mailOptions = {
			from: process.env.ADMIN_EMAIL_ADDRESS,
			to: toEmail,
			subject: "Your Video Montage is Ready!",
			html: emailTemplate,
		};

		const info = await transporter.sendMail(mailOptions);
		console.log("✅ Email sent:", info.response);
		return info;
	} catch (error) {
		console.error(
			"❌ Error sending email [sendVideoMontageCompleteNotificationEmail]:",
			error
		);
		throw error;
	}
};

export const sendJoinSquadNotificationEmail = async (
	toEmail: string
): Promise<any> => {
	console.log("-- sendJoinSquadNotificationEmail --");
	try {
		const templatePath = path.join(
			__dirname,
			"../templates/requestToRegisterEmail.html"
		);

		let emailTemplate = fs.readFileSync(templatePath, "utf8");

		const urlLogo = `${process.env.URL_BASE_KV_API}/images/KyberV2Shiny.png`;
		const urlRegister = `https://${process.env.PREFIX_VIDEO_FILE_NAME}-manager.dashanddata.com/register`;

		emailTemplate = emailTemplate.replace(/{{urlRegister}}/g, urlRegister);
		emailTemplate = emailTemplate.replace(/{{urlLogo}}/g, urlLogo);

		const mailOptions = {
			from: process.env.ADMIN_EMAIL_ADDRESS,
			to: toEmail,
			subject: "You have been invited to join a squad on Kyber Vision!",
			html: emailTemplate,
		};

		const info = await transporter.sendMail(mailOptions);
		console.log("✅ Email sent:", info.response);
		return info;
	} catch (error) {
		console.error(
			"❌ Error sending email [sendJoinSquadNotificationEmail]:",
			error
		);
		throw error;
	}
};
