import React from 'react'
import styles from "../../../Styles/StudentDashboardCSS/StudentDashboardHome.module.css";

export default function StudentDashboardHome() {
  return (
    <div className={styles.studentDashboardHomeMainContainer}>
      <div className={styles.studentDashboardHomeSubContainer}>
        <h3 className={styles.welcomeNoteStudentDashboard}>Welcome to eGRADTutor UG Online Courses.</h3>
        <p>Hi, ...</p>
        <div className={styles.exploreCardsDiv}>
          <div className={styles.myCourseCarddivv}>
            <p>Explore Courses here</p>
            <button className={styles.btnForCourseinDashboardHome}>My Courses</button>
          </div>
          <div className={styles.myCourseCarddivv}>
            <p>Buy Courses here</p>
            <button className={styles.btnForCourseinDashboardHome}>My Courses</button>
          </div>
        </div>
      </div>
    </div>
  )
}
