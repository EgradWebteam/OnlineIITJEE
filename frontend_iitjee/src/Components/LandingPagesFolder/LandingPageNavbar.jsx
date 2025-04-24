import React, { useState } from 'react'
import styles from "../../Styles/LandingPageCSS/LandingPageIITJEE.module.css";
import { useNavigate } from 'react-router-dom';

export default function LandingPageNavbar() { 
    const [showCourseDropDown, setShowCourseDropDown] = useState(false);
    const [activeBtn, setActiveBtn] = useState("HOME");
    const navigate = useNavigate();
    
    const handleNavClick = (btnName) => {
      setActiveBtn(btnName);
      if (btnName === "COURSES") {
        setShowCourseDropDown((prev) => !prev);
      } else {
        setShowCourseDropDown(false);
        // navigate to main home page
        if (btnName === "HOME") {
          navigate("/");
        }
        if (btnName === "REGISTRATION") {
          navigate("/CourseRegistrationGuide");
        }
      }
    };
  
    const handleCourseClick = (path) => {
      setShowCourseDropDown(false); // hide dropdown
      navigate(path);
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
                    <li><button onClick={() => handleCourseClick("/OTSHomePage")}>Online Test Series</button></li>
                    <li><button onClick={() => handleCourseClick("/ORVLHomePage")}>Online Recorded Video Lectures</button></li>
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
