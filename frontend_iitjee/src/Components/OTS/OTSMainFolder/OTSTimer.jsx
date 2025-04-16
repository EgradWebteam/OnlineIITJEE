import React from 'react';
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";
import {useTimer} from "../../../ContextFolder/TimerContext.jsx"

export default function OtsTimer() {
  const { formattedTime } = useTimer();
  return (
    <div className={styles.OtsTimerMainDiv}>
      <div className={styles.otsSectionsDiv}>Sections</div>
      <div className={styles.OtsTimerDiv}>
        Time Left: {formattedTime}
      </div>
    </div>
  )
}
