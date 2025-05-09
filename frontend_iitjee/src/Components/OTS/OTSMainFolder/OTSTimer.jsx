import React, { useEffect } from 'react';
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";
import {useTimer} from "../../../ContextFolder/TimerContext.jsx"

export default function OtsTimer({realStudentId, realTestId}) {
  const { formattedTime } = useTimer();

  // storing time in localstorage to store
      useEffect(() => {
        if (formattedTime && realTestId && realStudentId) {
          const key = `OTS_FormattedTime`;
          localStorage.setItem(key, formattedTime);
        }
      }, [formattedTime, realTestId, realStudentId]);

  return (
    <div className={styles.OtsTimerMainDiv}>
      <div className={styles.otsSectionsDiv}>Sections</div>
      <div className={styles.OtsTimerDiv}>
        Time Left: {formattedTime}
      </div>
    </div>
  )
}
