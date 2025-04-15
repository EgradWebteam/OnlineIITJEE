import React, { useEffect, useState } from 'react';
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";
import SubjectsAndSectionsConatiner from './SubjectsAndSectionsConatiner.jsx';
import QuestionsMainContainer from './QuestionsMainContainer.jsx';
import OTSRightSideBar from './OTSRightSideBar.jsx';
import QuestionNavigationButtons from './QuestionNavigationButtons.jsx';
import axios from 'axios'
import {BASE_URL} from '../../../../apiConfig.js'

export default function OTSMain({ testData,realTestId }) {
  const [activeSubject, setActiveSubject] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  /* for implementing functionality buttons and store user response */
  const [userAnswers, setUserAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedOptionsArray, setSelectedOptionsArray] = useState([]);
  const [natValue, setNatValue] = useState("");
  // Reset question index when section changes
  useEffect(() => {
    setActiveQuestionIndex(0); // This resets to 1st question when section changes
  }, [activeSection]);

  
  const [testPaperData, setTestPaperData] = useState([]);
 
useEffect(() => {
  const fetchTestPaper = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/OTS/QuestionPaper/${realTestId}`);
      setTestPaperData(response.data);
    } catch (err) {
      console.error("Error fetching test paper:", err);
    }
  };

  fetchTestPaper();
}, [realTestId]);

 
  return (
    <div>
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
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          userAnswers={userAnswers} 
            selectedOptionsArray={selectedOptionsArray}
            setSelectedOptionsArray={setSelectedOptionsArray}
            natValue={natValue}
            setNatValue={setNatValue}
        />
      </div>
      <div>
        <OTSRightSideBar
          testData={testData}
          activeSubject={activeSubject}
          activeSection={activeSection}
          activeQuestionIndex={activeQuestionIndex} 
          setActiveQuestionIndex={setActiveQuestionIndex}
          userAnswers={userAnswers}
          setUserAnswers={setUserAnswers}
        />
      </div>
    </div>
      <div className={styles.QuestionNavigationBTns}>
        <QuestionNavigationButtons
          testData={testData}
          activeSubject={activeSubject}
          activeSection={activeSection}
          activeQuestionIndex={activeQuestionIndex}
          setActiveQuestionIndex={setActiveQuestionIndex}
          userAnswers={userAnswers}
          setUserAnswers={setUserAnswers}
          selectedOption={selectedOption}
          selectedOptionsArray={selectedOptionsArray}
          natValue={natValue}
          setActiveSubject={setActiveSubject}
          setActiveSection={setActiveSection} 
            setSelectedOptionsArray={setSelectedOptionsArray}
            setNatValue={setNatValue}
            setSelectedOption={setSelectedOption}
        />
      </div>
    </div>
   
  );
}
