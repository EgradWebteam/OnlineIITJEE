import React from 'react';
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";

const SolutionsTab = () => {
  return (
    <div className={styles.solutionContainerMain}>
      <div className={styles.subjectDropDownContainer}>
        <select className={styles.subjectWiseDropDown}>
            <option>..</option>
        </select>
        <div className={styles.questionSolutionsDiv}>
          <span className={`${styles.waterMark} ${styles.topWaterMark}`}>..</span>
          <span className={`${styles.waterMark} ${styles.bottomWaterMark}`}>..</span>
          <span className={`${styles.waterMark} ${styles.middleWaterMark}`}>..</span>
          <span className={`${styles.waterMark} ${styles.rightWaterMark}`}>..</span>
          <div className={styles.QuestionImgDiv}>
            <img/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SolutionsTab
