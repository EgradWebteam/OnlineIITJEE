import React from "react";
import styles from "../../../Styles/StudentDashboardCSS/CustomLogoutPopup.module.css";
 
export default function CustomLogoutPopup({ onConfirm, onCancel }) {
  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popup}>
        <p>Are you sure you want to logout?</p>
        <div className={styles.buttons}>
          <button onClick={onConfirm} className={styles.yes}>Yes</button>
          <button onClick={onCancel} className={styles.no}>No</button>
        </div>
      </div>
    </div>
  );
}