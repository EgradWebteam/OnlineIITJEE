import React from 'react'
import StudentDashboardHeader from '../StudentDashboardPages/StudentDashboardHeader.jsx';
import styles from "../../../Styles/StudentDashboardCSS/StudentDashboard.module.css"
import StudentDashboardLeftSideBar from '../StudentDashboardPages/StudentDashboardLeftSidebar.jsx'
export default function StudentDashboard() {
  return (
    <div>
      <StudentDashboardHeader/>
      <div className={styles.StudentDashboardContentHolder}>
        <div className={styles.studentDashboardLeftNavHolder}>
          <StudentDashboardLeftSideBar/>
        </div>
        <div className={styles.StudentDashboardRightSideContentHolder}>

        </div>
      </div>
    </div>
  )
}
