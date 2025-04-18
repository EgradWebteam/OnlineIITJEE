import React from 'react'
import styles from "../../../Styles/StudentDashboardCSS/StudentDashboard.module.css";
 
const OrvlTopicCardSub = ({ title, context,  onGoToTest,portalId}) => {
    const showGoToTestSection = context === "myCourses";
    const testButtonLabel = portalId === 3 ? "Start Lecture" : "Go to Test";
    return (
    <div className={styles.testContainerDivForflex}>
       
            {showGoToTestSection &&
           <div className={styles.testCard}>
                    <h3 className={styles.HeadingForLectureCard}>{title}</h3>
                        <div className={styles.cardBottomGototest}>
           
            <button className={styles.startTestBtn} onClick={onGoToTest}>
                            {testButtonLabel} <span>&raquo;</span>
                          </button>
                      </div>
                  </div>
}
       
    </div>
  )
}
 
export default OrvlTopicCardSub