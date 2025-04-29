import React, { memo,useState } from "react";
import styles from "../../Styles/LandingPageCSS/LandingPageIITJEE.module.css";
import testSeriesImg from "../../assets/opqb.png";
import videoLectureImg from "../../assets/orvlm.png";
import questionBankImg from "../../assets/otsm.png";
import { useNavigate, useLocation } from "react-router-dom";

const MainPageCourseCards = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showComingSoonPopup, setShowComingSoonPopup] = useState(false);
  // Extract the studentId from localStorage
  const studentId = localStorage.getItem("userId");
  const studentDashboardPath = `/StudentDashboard/${studentId}`;

  const isOnStudentDashboard = location.pathname.startsWith(`/StudentDashboard/`);

  const courses = [
    { title: "TEST SERIES", image: testSeriesImg, path: "/OTSHomePage" },
    { title: "RECORDED VIDEO LECTURES", image: videoLectureImg, path: "/ORVLHomePage" },
    { title: "PRACTICE QUESTION BANK", image: questionBankImg, path: "/ORVLHomePage" },
  ];

  const handleExploreClick = (coursePath,course) => {
    if (course.title === "PRACTICE QUESTION BANK") {
      setShowComingSoonPopup(true); // Show popup instead of navigating
      return;
    }


    if (isOnStudentDashboard) {
      localStorage.setItem("activeSection", "buyCourses");
      navigate(studentDashboardPath, { state: { activeSection: "buyCourses" } });
    } else {
      navigate(coursePath);
    }
  };
  

  return (
    <div className={styles.courseCardContainer}>
      {courses.map((course, index) => (
        <div key={index} className={styles.courseCardDiv}>
          <div className={styles.courseImage}>
            <img src={course.image} alt={course.title} />
          </div>
          <h3 className={styles.courseCardTitle}>{course.title}</h3>
          <button
            className={styles.exploreBtn}
            onClick={() => handleExploreClick(course.path,course)}
          >
            Explore
          </button>
        </div>
      ))}
      
      {showComingSoonPopup && (
        <div className={styles.ClosePopupOverlay}>
          <div className={styles.ClosePopupContent}>
            <h3>Coming Soon!</h3>
            <button
              onClick={() => setShowComingSoonPopup(false)}
              className={styles.closePopupBtn}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default MainPageCourseCards;
