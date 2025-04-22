import React, { memo } from "react";
import styles from "../../Styles/LandingPageCSS/LandingPageIITJEE.module.css";
import testSeriesImg from "../../assets/opqb.png";
import videoLectureImg from "../../assets/orvlm.png";
import questionBankImg from "../../assets/otsm.png";
import { useNavigate, useLocation } from "react-router-dom";

const MainPageCourseCards = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract the studentId from localStorage
  const studentId = localStorage.getItem("decryptedId");
  const studentDashboardPath = `/StudentDashboard/${studentId}`;

  const isOnStudentDashboard = location.pathname.startsWith(`/StudentDashboard/`);

  const courses = [
    { title: "TEST SERIES", image: testSeriesImg, path: "/OTSHomePage" },
    { title: "RECORDED VIDEO LECTURES", image: videoLectureImg, path: "/ORVLHomePage" },
    { title: "PRACTICE QUESTION BANK", image: questionBankImg, path: "/ORVLHomePage" },
  ];

  const handleExploreClick = (coursePath) => {
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
            onClick={() => handleExploreClick(course.path)}
          >
            Explore
          </button>
        </div>
      ))}
    </div>
  );
});

export default MainPageCourseCards;
