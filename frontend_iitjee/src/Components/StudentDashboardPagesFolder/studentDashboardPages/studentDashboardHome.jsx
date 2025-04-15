import React, { useEffect } from 'react'
import styles from "../../../Styles/StudentDashboardCSS/StudentDashboardHome.module.css";
import MainPageCourseCards from '../../LandingPagesFolder/MainPageCourseCards';

export default function StudentDashboardHome({handleSectionChange, studentName}) {

  useEffect(() => {
console.log("dashboardhome")
  },[])
  return (
      <div>
      <div className={styles.gretingContainer}>
        <h3 className={styles.welcomeNoteStudentDashboard}>Welcome to eGRADTutor UG Online Courses.</h3>
        <p className={styles.studentHiMsg}>Hi, {studentName}</p>
      </div>
        
        <div className={styles.exploreCardsDiv}>
          <div className={styles.myCourseCarddivv}>
            <p>Explore Courses here</p>
            <button className={styles.btnForCourseinDashboardHome}
            onClick={() => handleSectionChange("myCourses")}
            >My Courses</button>
          </div>
          <div className={styles.myCourseCarddivv}>
            <p>Buy Courses here</p>
            <button className={styles.btnForCourseinDashboardHome}
            onClick={() => handleSectionChange("buyCourses")}
            >Buy Courses</button>
          </div>
        </div>
        <div className={styles.exploreCoursesHeadingDiv}>
        <h3 className={styles.exploreCoursesHeading}>Explore our courses</h3>
        </div>
        <div>
          <MainPageCourseCards/>
        </div>
      </div>
  )
}
