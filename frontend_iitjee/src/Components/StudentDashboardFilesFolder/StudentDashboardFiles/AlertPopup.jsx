import React from 'react';
import styles from '../../../Styles/StudentDashboardCSS/AlertPopup.module.css';

 function AlertPopup({ message, onClose, type = "info" }) {
  
  return (
    <div className={styles.overlay}>
      <div className={`${styles.popup} ${styles[type]}`}>
        <p>{message}</p>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
}
export default AlertPopup