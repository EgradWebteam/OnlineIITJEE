import React, { useEffect, useState } from 'react';
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";
import SubjectsAndSectionsConatiner from './SubjectsAndSectionsConatiner.jsx';
import QuestionsMainContainer from './QuestionsMainContainer.jsx';
import OTSRightSideBar from './OTSRightSideBar.jsx';

export default function OTSMain({ testData }) {
  const [activeSubject, setActiveSubject] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  // Reset question index when section changes
useEffect(() => {
  setActiveQuestionIndex(0); // This resets to 1st question when section changes
}, [activeSection]);

  return (
    <div className={styles.OTSMainFileMainContainer}>
      <div className={styles.OTSMainFileSubContainer}>
        <SubjectsAndSectionsConatiner
          testData={testData}
          activeSubject={activeSubject}
          setActiveSubject={setActiveSubject}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
        <QuestionsMainContainer
          testData={testData}
          activeSubject={activeSubject}
          activeSection={activeSection}
          activeQuestionIndex={activeQuestionIndex}
        />
      </div>
      <div>
        <OTSRightSideBar
          testData={testData}
          activeSubject={activeSubject}
          activeSection={activeSection}
          activeQuestionIndex={activeQuestionIndex} 
          setActiveQuestionIndex={setActiveQuestionIndex}
        />
      </div>
    </div>
  );
}
