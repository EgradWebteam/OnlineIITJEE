import React, { useState } from 'react';
import styles from '../../../Styles/AdminDashboardCSS/AdminDashboard.module.css'; // Importing CSS module for styling
import headerImage from '../../../assets/EGTLogoExamHeaderCompressed.jpg';

const AdminDashboardHeader = () => {
  // State to track active button
  const [activeButton, setActiveButton] = useState('admin');

  // Handle click on buttons and update activeButton state
  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
  };

  return (
    <div className={styles.header}>
      <div className="logo"></div>
      <div className={styles.headerButtons}>
        <button
          className={activeButton === 'admin' ? styles.active : ''}
          onClick={() => handleButtonClick('admin')}
        >
          OTS Course Admin
          {activeButton === 'admin' && <span className={styles.activeDot}></span>}
        </button>
        <button
          className={activeButton === 'profile' ? styles.active : ''}
          onClick={() => handleButtonClick('profile')}
        >
          Profile
          {activeButton === 'profile' && <span className={styles.activeDot}></span>}
        </button>
        <button
          className={activeButton === 'student' ? styles.active : ''}
          onClick={() => handleButtonClick('student')}
        >
          Student Info
          {activeButton === 'student' && <span className={styles.activeDot}></span>}
        </button>
        <button
          className={activeButton === 'logout' ? styles.active : ''}
          onClick={() => handleButtonClick('logout')}
        >
          LogOut
          {activeButton === 'logout' && <span className={styles.activeDot}></span>}
        </button>
      </div>
    </div>
  );
};

export default React.memo(AdminDashboardHeader);
