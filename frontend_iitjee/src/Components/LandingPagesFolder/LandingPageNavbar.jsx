import React, { useState } from 'react'
import styles from "../../Styles/LandingPageCSS/LandingPageIITJEE.module.css";

export default function LandingPageNavbar() { 
    const [showCourseDropDown, setShowCourseDropDown] = useState(false);
    const [activeBtn, setActiveBtn] = useState("HOME");
    
    const handleNavClick = (btnName) => {
        setActiveBtn(btnName);
        if (btnName === "COURSES") {
          setShowCourseDropDown((prev) => !prev);
        } else {
          setShowCourseDropDown(false); // close dropdown when other buttons are clicked
        }
      };
  return (
    <div className={styles.mainNavbarContainer}>
      <div className={styles.navBarSubConatainer}>
        <ul className={styles.navBarLinks}>
            <li>
                <button className={`${styles.navBarBtn} ${activeBtn === "HOME" ? styles.activeBtn : ""
              }`} onClick={() => handleNavClick("HOME")}>HOME</button></li>
            <li>
                <button onClick={() => handleNavClick("COURSES")}
                 className={`${styles.navBarBtn} ${activeBtn === "COURSES" ? styles.activeBtn : ""}`}>
                  COURSES <span className={showCourseDropDown ? styles.arrowUp : styles.arrowDown}></span>
                 </button>
                {showCourseDropDown && (
                <ul className={styles.coursesDropDownMenu}>
                    <li><button>Online Test Series</button></li>
                    <li><button>Online Recorded Video Lectures</button></li>
                    <li><button>Online Practice Question Bank</button></li>
                </ul>
                 )}
            </li>
            <li><button className={`${styles.navBarBtn} ${activeBtn === "REGISTRATION" ? styles.activeBtn : ""}`}
           onClick={() => handleNavClick("REGISTRATION")}
            >REGISTRATION GUIDE</button></li>
        </ul>
      </div>
    </div>
  )
}
