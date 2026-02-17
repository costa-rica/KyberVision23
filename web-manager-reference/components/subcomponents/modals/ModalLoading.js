import React from "react";
import styles from "../../../styles/modals/ModalLoading.module.css";

// export default function ModalLoading({ isVisible }) {
export default function ModalLoading({ isVisible, sizeOfParent = false }) {
  if (!isVisible) return null;
  const overlayClass = sizeOfParent
    ? styles.modalOverlayParentSize
    : styles.modalOverlay;

  return (
    // <div className={styles.modalOverlay}>
    <div className={overlayClass}>
      <div className={styles.dotsLoader}>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
      </div>
    </div>
  );
}
