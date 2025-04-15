import React, { useEffect } from 'react';
import globalCSS from "../../../Styles/Global.module.css";
import styles from "../../../Styles/StudentDashboardCSS/StudentDashboard.module.css";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";

export default function StudentDashboard_MyResults() {
     useEffect(() => {
    console.log("myresults")
      },[])
  return (
    <div className={styles.StudentDashboardMyCoursesMainDiv}>
      <div className={globalCSS.stuentDashboardGlobalHeading}>
        <h3>My Results</h3>
      </div>
      <div className={styles.myResultsSubContainer}>
        <div className={styles.resultsMainDiv}>
          <div className={styles.resultsSubDiv}>
            <p className={styles.testNameInResults}>TEST</p>
            <div className={styles.resultsViewReportBtn}>
              <button>VIEW REPORT <span className={styles.resultsBtnIcon}><MdKeyboardDoubleArrowRight /></span> </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
