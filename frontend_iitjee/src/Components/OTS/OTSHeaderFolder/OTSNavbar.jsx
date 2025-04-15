import React, { useState } from 'react'
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";
import { FcDocument } from "react-icons/fc";
import { IoIosAlert } from "react-icons/io";
import OTSQuestionPaper from './OTSQuestionPaper';

export default function OTSNavbar({testName, testData}) {

  const [showQuestions, setShowQuestions] = useState(false);
  const [showInstrutions, setShowInstrcutions] = useState(false);

  const openQuestionPaper = () => {
    setShowQuestions(true);
    setShowInstrcutions(false);
  };

  const closeQuestionPaper = () => {
    setShowQuestions(false);
    setShowInstrcutions(false);
  };
  const openInstructions = () => {
    setShowInstrcutions(true);
    setShowQuestions(false);
  };

  const closeInstructions = () => {
    setShowInstrcutions(false);
    setShowQuestions(false);
  };
  return (
    <div className={styles.OTSNavbarMainContainer}>
      <div className={styles.OTSTestNameHolder}>
          <p>{testName}</p>
      </div>
      <div className={styles.OTSInstrctionsDivHolder}>
          <button onClick={openQuestionPaper}><IoIosAlert className={styles.InstIcon}/>View Questions</button>
          <button onClick={openInstructions}><FcDocument className={styles.InstIcon}/>View Instructions</button>
      </div>
      {showQuestions &&(
        <OTSQuestionPaper
        testName ={testName}
        testData ={testData}
        />
      )}
    </div>
  )
}

