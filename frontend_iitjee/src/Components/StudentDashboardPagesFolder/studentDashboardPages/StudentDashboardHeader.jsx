import React, { useState } from 'react';
import styles from "../../Styles/StudentDashboardCSS/StudentDashboard.module.css";
import headerImage from '../../assets/EGTLogoExamHeaderCompressed.jpg';
import logostudent from '../../assets/OtsCourseCardImages/ots1.png';

export default function StudentDashboardHeader() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleMouseEnter = () => {
    setShowProfileMenu(true);
  };

  const handleMouseLeave = () => {
    setShowProfileMenu(false);
  };

  return (
    <div className={styles.MainDivStudentDasboard}>
      <div className={styles.studentDashboardHeaderMain}>
        <div className={styles.studentDashboardHeaderLogoDiv}>
          <img src={headerImage} alt='logoImage' />
        </div>

        {/* Logo & Profile Menu */}
        <div
          className={styles.profileWrapper}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className={styles.studentLogo}>
            <img src={logostudent} alt="studentlogo" />
          </div>

          {showProfileMenu && (
            <div className={styles.onHoverOFstudent}>
              <div>Profile</div>
              <div>Change Password</div>
              <div className={styles.LogoutBtnDivStudent}>
                <button>Log Out</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
