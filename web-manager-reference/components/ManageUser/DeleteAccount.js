import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/ManageUser/DeleteAccount.module.css";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../reducers/user";

export default function DeleteAccount() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const router = useRouter();
	const dispatch = useDispatch();

	const handleDeleteAccount = async () => {
		if (!password || !email) {
			alert("Please enter a password and email.");
			return;
		}

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/delete-account/`,
			{
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ password, email }),
			}
		);

		if (response.ok) {
			alert("Successfully deleted user");
			dispatch(logoutUser());
			router.push("/");
		} else {
			alert("Error deleting account. Please try again.");
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
				<div className={styles.divTitle}>
					<h1 className={styles.title}>Delete Account</h1>
				</div>
				<div className={styles.inputContainer}>
					<h3>Email:</h3>
					<input
						// type={showPassword ? "text" : "password"}
						className={styles.inputPassword}
						onChange={(e) => setEmail(e.target.value)}
						value={email}
						placeholder="Email"
					/>
				</div>
				<div className={styles.inputContainer}>
					<h3>Password:</h3>
					<input
						type={showPassword ? "text" : "password"}
						className={styles.inputPassword}
						onChange={(e) => setPassword(e.target.value)}
						value={password}
						placeholder="Password"
					/>
					<FontAwesomeIcon
						icon={showPassword ? faEyeSlash : faEye}
						className={styles.eyeIcon}
						onClick={() => setShowPassword(!showPassword)}
					/>
				</div>
				<button className={styles.btnReset} onClick={handleDeleteAccount}>
					Delete Account
				</button>
			</div>
		</main>
	);
}
