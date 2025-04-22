import React, { useState } from 'react'
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";
import { FcDocument } from "react-icons/fc";
import { IoIosAlert } from "react-icons/io";
import OTSQuestionPaper from './OTSQuestionPaper';
import OTSInstrcutions from './OTSInstrcutions';

export default function OTSNavbar({testName, testData,realTestId}) {

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
          <button onClick={openQuestionPaper}><IoIosAlert className={styles.InstIcon}/><span className={styles.OTSViewqestionsFormobileRes}>View Questions</span></button>
          <button onClick={openInstructions}><FcDocument className={styles.InstIcon}/><span className={styles.OTSViewqestionsFormobileRes}>View Instructions</span></button>
      </div>
      {showQuestions &&(
        <OTSQuestionPaper
        testName ={testName}
        testData ={testData}
        realTestId={realTestId}
        closeQuestionPaper={closeQuestionPaper}
        />
      )}
     { showInstrutions &&(
      <OTSInstrcutions
      closeInstructions={closeInstructions}
      />
     )}
    </div>
  )
}

