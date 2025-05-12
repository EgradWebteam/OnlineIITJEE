import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from '../../../Styles/StudentDashboardCSS/CustomLogoutPopup.module.css';

export default function BackButtonHandler() {
  const [showPopup, setShowPopup] = useState(false);
  const [preventNavigation, setPreventNavigation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handlePopState = (event) => {
      if (!preventNavigation) {
        setShowPopup(true);
        setPreventNavigation(true)
        window.history.pushState(null, null, window.location.pathname);
      }
    };
    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [preventNavigation]);

  const handleConfirm = () => {
    setShowPopup(false);
    setPreventNavigation(false);
    navigate("/LoginPage"); 
  };

  const handleCancel = () => {
    setShowPopup(false);
    setPreventNavigation(false);
  };

  return (
    <>
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <p>Are you sure you want to logout?</p>
            <div className={styles.buttons}>
              <button onClick={handleConfirm} className={styles.yes}>Yes</button>
              <button onClick={handleCancel} className={styles.no}>No</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
