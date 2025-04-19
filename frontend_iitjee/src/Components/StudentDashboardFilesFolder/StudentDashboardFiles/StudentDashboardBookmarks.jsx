import React from 'react';
import globalCSS from "../../../Styles/Global.module.css";
import styles from "../../../Styles/StudentDashboardCSS/StudentDashboard.module.css";
const StudentDashboardBookmarks = () => {
  return (
    <div className={styles.studentDashboardBookMarksMainDiv}>
      <div className={globalCSS.stuentDashboardGlobalHeading}>
        <h3>BookMarks</h3>
      </div>
      <div className={styles.StudentdashboardBookMarksSubDiv}>
        <div className={styles.bookMarksTestName}>
         <h4>TestNme</h4>
        </div>
       <div className={styles.questionsContainerInBookMarks}>
        <div>question</div>
        <div>option</div>
        <div>solutionbtn</div>
        <div>solution</div>
       </div>
      </div>
    </div>
  )
}

export default StudentDashboardBookmarks
