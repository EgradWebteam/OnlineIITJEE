import React, { useEffect } from 'react';
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";
import {useTimer} from "../../../ContextFolder/TimerContext.jsx"
import { BASE_URL } from '../../../ConfigFile/ApiConfigURL.js';
export default function OtsTimer({realStudentId, realTestId}) {
  const { formattedTime } = useTimer();

  // storing time in localstorage to store
      useEffect(() => {
        if (formattedTime && realTestId && realStudentId) {
          const key = `OTS_FormattedTime`;
          localStorage.setItem(key, formattedTime);
        }
      }, [formattedTime, realTestId, realStudentId]);
   // Persist to server every 5 seconds
   useEffect(() => {
    if (!realTestId || !realStudentId) return;

    const saveTimerToDB = () => {
      const key = `OTS_FormattedTime`;
      const time = localStorage.getItem(key);

      fetch(`${BASE_URL}/ResumeTest/save-timer`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: realTestId,
          studentId: realStudentId,
          timeLeft: time 
        })
      })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      })
      .catch(err => {
        console.error('Error saving timer:', err);
      });
    };

    // Only interval (no immediate call), every 5000 ms (5 sec)
    const id = setInterval(saveTimerToDB, 60000);
    return () => clearInterval(id);
  }, [realTestId, realStudentId]);
      
  return (
    <div className={styles.OtsTimerMainDiv}>
      <div className={styles.otsSectionsDiv}>Sections</div>
      <div className={styles.OtsTimerDiv}>
        Time Left: {formattedTime}
      </div>
    </div>
  )
}
