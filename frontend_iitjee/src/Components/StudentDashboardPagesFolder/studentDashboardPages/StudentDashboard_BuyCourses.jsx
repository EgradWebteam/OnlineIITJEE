import React, { useEffect } from 'react';
import styles from "../../../Styles/StudentDashboardCSS/StudentDashboard.module.css";

export default function StudentDashboard_BuyCourses() {
     useEffect(() => {
    console.log("buycourses")
      },[])
  return (
    <div className={styles.StudentDashboardBuyCoursesMainDiv}>
      buy courses
    </div>
  )
}
