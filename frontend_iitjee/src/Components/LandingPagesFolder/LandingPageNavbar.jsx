import React, { useState, useEffect } from 'react';
import styles from "../../Styles/LandingPageCSS/LandingPageIITJEE.module.css";
import { useNavigate, useLocation } from 'react-router-dom';

export default function LandingPageNavbar() {
  const [showCourseDropDown, setShowCourseDropDown] = useState(false);
  const [activeBtn, setActiveBtn] = useState("HOME");
  const navigate = useNavigate();
  const location = useLocation();

  // 🔄 Update active button based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === "/" || path === "/home") {
      setActiveBtn("HOME");
    } else if (
      path.includes("/OTSHomePage") ||
      path.includes("/ORVLHomePage") ||
      path.includes("/PracticeQuestionBank")
    ) {
      setActiveBtn("COURSES");
    } else if (path === "/CourseRegistrationGuide") {
      setActiveBtn("REGISTRATION");
    } else {
      setActiveBtn(""); // default fallback
    }
  }, [location.pathname]);

  const handleNavClick = (btnName) => {
    if (btnName === "COURSES") {
      setActiveBtn("COURSES");
      setShowCourseDropDown((prev) => !prev);
    } else {
      setShowCourseDropDown(false);
      if (btnName === "HOME") {
        navigate("/");
      } else if (btnName === "REGISTRATION") {
        navigate("/CourseRegistrationGuide");
      }
    }
  };

  const handleCourseClick = (path) => {
    setShowCourseDropDown(false);
    navigate(path);
  };

  return (
    <div className={styles.mainNavbarContainer}>
      <div className={styles.navBarSubConatainer}>
        <ul className={styles.navBarLinks}>
          <li>
            <button
              className={`${styles.navBarBtn} ${activeBtn === "HOME" ? styles.activeBtn : ""}`}
              onClick={() => handleNavClick("HOME")}
            >
              HOME
            </button>
          </li>
          <li>
            <button
              onClick={() => handleNavClick("COURSES")}
              className={`${styles.navBarBtn} ${activeBtn === "COURSES" ? styles.activeBtn : ""}`}
            >
              COURSES{" "}
              <span className={showCourseDropDown ? styles.arrowUp : styles.arrowDown}></span>
            </button>
            {showCourseDropDown && (
              <ul className={styles.coursesDropDownMenu}>
                <li>
                  <button onClick={() => handleCourseClick("/OTSHomePage")}>
                    Online Test Series
                  </button>
                </li>
                <li>
                  <button onClick={() => handleCourseClick("/ORVLHomePage")}>
                    Online Recorded Video Lectures
                  </button>
                </li>
                <li>
                  <button onClick={() => handleCourseClick("/PracticeQuestionBank")}>
                    Online Practice Question Bank
                  </button>
                </li>
              </ul>
            )}
          </li>
          <li>
            <button
              className={`${styles.navBarBtn} ${activeBtn === "REGISTRATION" ? styles.activeBtn : ""}`}
              onClick={() => handleNavClick("REGISTRATION")}
            >
              REGISTRATION GUIDE
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
