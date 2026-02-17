import styles from "../../styles/ManageUser/Login.module.css";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../reducers/user";
import { useRouter } from "next/router";
import InputPassword from "../common/InputPassword";
import Image from "next/image";
import TemplateView from "../../components/common/TemplateView";

export default function Login() {
  const [email, emailSetter] = useState(
    process.env.NEXT_PUBLIC_MODE == "workstation" ? "nrodrig1@gmail.com" : ""
  );
  const [password, passwordSetter] = useState(
    process.env.NEXT_PUBLIC_MODE == "workstation" ? "test" : ""
  );
  const dispatch = useDispatch();
  const router = useRouter();
  const userReducer = useSelector((state) => state.user);

  useEffect(() => {
    if (userReducer.token) {
      // Redirect if token exists
      router.push("/admin-db");
    }
  }, [userReducer]); // Run effect if token changes

  const sendPasswordBackToParent = (passwordFromInputPasswordElement) => {
    passwordSetter(passwordFromInputPasswordElement);
  };

  const handleClickLogin = async () => {
    console.log(
      "Login ---> API URL:",
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/login`
    );
    console.log("- handleClickLogin 👀");

    const bodyObj = { email, password };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/login`,
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
        resJson.email = email;
        dispatch(loginUser(resJson));
        router.push("/admin-db");
      } else {
        alert("You are not authorized to login.");
      }
    } else {
      const errorMessage =
        resJson?.error || `There was a server error: ${response.status}`;
      alert(errorMessage);
    }
  };

  const handleClickToReg = () => router.push("/register"); //eg.history.push('/login');

  return (
    // <main className={styles.main}>
    <TemplateView onlyVersionsVisible={true}>
      <div className={styles.divMainSub}>
        <div className={styles.divTitles}>
          {/* <Image
            src="/images/KyberV2Shiny.png"
            width={315}
            height={47}
            alt="Kyber Vision Logo"
          />
          <div>{process.env.NEXT_PUBLIC_API_BASE_URL}</div> */}
          <h1 className={styles.title}>Login</h1>
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
          <div className={styles.divBtnLogin}>
            <button
              className={styles.btnLogin}
              onClick={() => handleClickLogin()}
            >
              Login
            </button>
          </div>
          <div className={styles.divBtnNotReg}>
            <button
              className={styles.btnNotReg}
              onClick={() => {
                console.log("go to registration page");
                handleClickToReg();
              }}
            >
              Not registered ?
            </button>
          </div>
        </div>
      </div>
    </TemplateView>
    // {/* </main> */}
  );
}
