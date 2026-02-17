import styles from "../../../styles/modals/ModalInformation.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRectangleXmark } from "@fortawesome/free-solid-svg-icons";

export default function ModalYesNo(props) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalTop}>
          <FontAwesomeIcon
            icon={faRectangleXmark}
            onClick={() => props.isModalOpenSetter(false)}
            className={styles.closeModalIcon}
          />
          <h2>{props.title}</h2>
        </div>
        <div>{props.content}</div>
        <div className={styles.modalBottom}>
          <button
            className={styles.button}
            onClick={() => {
              props.handleNo();
              props.isModalOpenSetter(false);
            }}
          >
            {props.noOptionText || "Cancel"}
          </button>
          <button
            className={styles.btnYes}
            onClick={() => {
              props.handleYes();
              props.isModalOpenSetter(false);
            }}
          >
            {props.yesOptionText || "Yes"}
          </button>
        </div>
      </div>
    </div>
  );
}
