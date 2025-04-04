import React, { useState } from 'react'
import styles from "../../Styles/LandingPageCSS/LandingPageIITJEE.module.css";

export default function LandingPageNavbar() { 
    const [showCourseDropDown, setShowCourseDropDown] = useState(false)
    
    const toggleCourseDropDown = () => {
        setShowCourseDropDown((prev) => !prev);
    }
  return (
    <div className={styles.mainNavbarContainer}>
      <div className={styles.navBarSubConatainer}>
        <ul className={styles.navBarLinks}>
            <li><button className={styles.navBarBtn}>HOME</button></li>
            <li>
                <button onClick={toggleCourseDropDown} className={styles.navBarBtn}>COURSES</button>
                {showCourseDropDown && (
                <ul className={styles.coursesDropDownMenu}>
                    <li><button>Online Test Series</button></li>
                    <li><button>Online Recorded Video Lectures</button></li>
                    <li><button>Online Practice Question Bank</button></li>
                </ul>
                 )}
            </li>
            <li><button className={styles.navBarBtn}>REGISTRATION GUIDE</button></li>
        </ul>
         <button></button>
      </div>
    </div>
  )
}
