import React from 'react'
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";
import { FcDocument } from "react-icons/fc";
import { IoIosAlert } from "react-icons/io";

export default function OTSNavbar({testName}) {
  return (
    <div className={styles.OTSNavbarMainContainer}>
      <div className={styles.OTSTestNameHolder}>
          <p>{testName}</p>
      </div>
      <div className={styles.OTSInstrctionsDivHolder}>
          <p><IoIosAlert className={styles.InstIcon}/>View Questions</p>
          <p><FcDocument className={styles.InstIcon}/>View Instructions</p>
      </div>
    </div>
  )
}

