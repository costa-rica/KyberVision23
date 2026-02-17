/// old /components/ManageUser/ResetPassword.js

// /components/ManageUser/ResetPassword.js
import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/ManageUser/ResetPassword.module.css";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";

const ResetPassword = ({ token }) => {
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const router = useRouter();

	const handleResetPassword = async () => {
		if (!password || password.length < 3) {
			alert("Please enter a password with at least 3 characters.");
			return;
		}

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/reset-password-with-new-password/`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ password }),
			}
		);

		if (response.ok) {
			router.push("/forgot-password/reset-successful");
		} else {
			alert("Error resetting password. Please try again.");
		}
	};

	return (
		<main className={styles.main}>
			<div className={styles.divTitles}>
				<Image
					src="/images/KyberV2Shiny.png"
					width={315}
					height={47}
					alt="Kyber Vision Logo"
				/>
			</div>
			<div className={styles.divMainSub}>
				<h1 className={styles.title}>Enter New Password:</h1>
				<div className={styles.inputContainer}>
					<input
						type={showPassword ? "text" : "password"}
						className={styles.inputPassword}
						onChange={(e) => setPassword(e.target.value)}
						value={password}
						placeholder="New Password"
					/>
					<FontAwesomeIcon
						icon={showPassword ? faEyeSlash : faEye}
						className={styles.eyeIcon}
						onClick={() => setShowPassword(!showPassword)}
					/>
				</div>
				<button className={styles.btnReset} onClick={handleResetPassword}>
					Reset Password
				</button>
			</div>
		</main>
	);
};

export default ResetPassword;
