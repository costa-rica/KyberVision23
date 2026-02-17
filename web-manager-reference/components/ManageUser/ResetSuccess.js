// OLD /components/ManageUser/ResetSuccess.js
// /components/ManageUser/ResetSuccess.js
import styles from "../../styles/ManageUser/Register.module.css";
import Image from "next/image";

const ResetSuccess = () => {
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
      <div>
        <h1>Successfully updated your password.</h1>
        <div style={{ width: "100%", textAlign: "center" }}>
          <h3>Please go back to your device app and login.</h3>
        </div>
      </div>
    </main>
  );
};

export default ResetSuccess;
