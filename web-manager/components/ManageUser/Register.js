import styles from "../../styles/ManageUser/Register.module.css";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../reducers/user";
import { useRouter } from "next/router";
import InputPassword from "../common/InputPassword";
import Image from "next/image";

export default function Register() {
  const [email, emailSetter] = useState("");
  const [password, passwordSetter] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();
  // const user = useSelector((state) => state.user);

  const sendPasswordBackToParent = (passwordFromInputPasswordElement) => {
    console.log(
      `- in sendPasswordBackToParent: ${passwordFromInputPasswordElement} ✅`
    );
    passwordSetter(passwordFromInputPasswordElement);
  };

  const handleClickReg = async () => {
    if (!email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }
    if (password.length < 3) {
      alert("Please enter a password with at least 3 characters.");
      return;
    }

    const bodyObj = {
      email,
      password,
      username: email.split("@")[0],
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyObj),
      }
    );

    console.log("Received response:", response.status);

    let resJson = null;
    const contentType = response.headers.get("Content-Type");

    if (contentType?.includes("application/json")) {
      resJson = await response.json();
    }
    if (response.ok) {
      if (resJson.user.isAdminForKvManagerWebsite) {
        // resJson.email = email;
        dispatch(loginUser(resJson));
        router.push("/admin-db");
      } else {
        alert(
          "You have been registered but are still not authorized to login. Contact Kyber Vision for access."
        );
      }
    } else {
      const errorMessage = resJson?.error || `Error: ${response.status}`;
      alert(errorMessage);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.divMainSub}>
        <div className={styles.divTitles}>
          <Image
            src="/images/kyberVisionLogo01.png"
            width={315}
            height={47}
            alt="Kyber Vision Logo"
          />
          <div>{process.env.NEXT_PUBLIC_API_BASE_URL}</div>
          <h1 className={styles.title}>Register</h1>
        </div>

        <div className={styles.divInputsAndBtns}>
          <div className={styles.divSuperInput}>
            <input
              className={styles.inputEmail}
              onChange={(e) => emailSetter(e.target.value)}
              value={email}
              placeholder="email"
            />
          </div>

          <InputPassword sendPasswordBackToParent={sendPasswordBackToParent} />
          <div className={styles.divBtnRegister}>
            <button
              className={styles.btnRegister}
              onClick={() => handleClickReg()}
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
