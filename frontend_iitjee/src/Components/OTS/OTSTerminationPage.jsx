import React, { useEffect } from "react";
// import React from "react";
import warning from "./otsimages/warning_img.png";

import styles from '../../Styles/OTSCSS/OTSMain.module.css';

const OTSTerminationPage = () => {


  // useEffect(() => {
  //   // Close the window after a short delay
  //   setTimeout(() => {

  //     window.close();
  //   }, 10000); // 10 seconds
  // }, []);

  return (
    <div className={styles.termination_page_container}>
      <div className={styles.termination_page_content}>
        <img className={styles.warning_img} src={warning} alt="warning" />
        <div className={styles.termination_page}>
          <h2 className={styles.title}>
            Note: System records every single interruption during the
            Assessment.
          </h2>
          <p className={styles.info}>
            Interruption is recorded in the system due to one of the following
            possible reasons:
          </p>
          <ul className={styles.reason_list}>
            <li className={styles.list_of_reasons}>
              You were trying to minimize OR toggle Assessment Console.
            </li>
            <li className={styles.list_of_reasons}>
              You have pressed special keys from your keyboard which are not
              allowed during the Assessment.
            </li>
            <li className={styles.list_of_reasons}>
              You have tried to move out of the Assessment Console which is not
              allowed.
            </li>
            <li className={styles.list_of_reasons}>
              You have tried to refresh the page.
            </li>
          </ul>
          <p className={styles.advice}>
            This window will close down and you have to re-launch the Assessment
            only after it is unlocked. Please be advised not to move out of the
            console during the assessment and not to navigate to other
            applications during the assessment.
          </p>
          <p className={styles.instructions}>
            <strong>How to proceed:</strong> Close the window and start again.{" "}
            <br />
            Please ensure that you do not move out of the Assessment window
            during the assessment. Use only the mouse to navigate.
          </p>
        </div>
      </div>
    </div>
  );
  
};

export default OTSTerminationPage;
