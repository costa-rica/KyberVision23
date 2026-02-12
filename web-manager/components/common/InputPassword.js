import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
// import { useDispatch, useSelector } from "react-redux";
import styles from "../../styles/common/InputPassword.module.css";

export default function InputPassword(props) {
  const [passwordVisible, passwordVisibleSetter] = useState(false);
  const [password, passwordSetter] = useState("");

  const togglePasswordVisibility = () => {
    passwordVisibleSetter((prev) => !prev);
  };

  const changeHandler = (e) => {
    passwordSetter(e.target.value);
    // dispatch(savePassword(e.target.value));
    props.sendPasswordBackToParent(e.target.value);
  };

  return (
    // <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
    <div className={styles.divSuperInput}>
      <input
        className={styles.inputPassword}
        // style={{
        //   borderRadius: "12px",
        //   fontSize: "xx-large",
        //   padding: "1rem",
        //   marginBottom: "2rem",
        //   width: "90%",
        // }}
        onChange={changeHandler}
        value={password}
        placeholder="password"
        type={passwordVisible ? "text" : "password"}
      />

      <FontAwesomeIcon
        icon={passwordVisible ? faEyeSlash : faEye}
        onClick={togglePasswordVisibility}
        className={styles.iconEye}
        style={{ color: passwordVisible ? "#000" : "#aaa" }}
      />
    </div>
  );
}
