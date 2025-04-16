import React, { useEffect, useState } from 'react';
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";
import SubjectsAndSectionsConatiner from './SubjectsAndSectionsConatiner.jsx';
import QuestionsMainContainer from './QuestionsMainContainer.jsx';
import OTSRightSideBar from './OTSRightSideBar.jsx';
import QuestionNavigationButtons from './QuestionNavigationButtons.jsx';


export default function OTSMain({ testData,realStudentId,realTestId }) {
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



  const autoSaveNATIfNeeded = () => {
    const subject = testData?.subjects?.find(sub => sub.SubjectName === activeSubject);
    const section = subject?.sections?.find(sec => sec.SectionName === activeSection);
    const question = section?.questions?.[activeQuestionIndex];
    const qTypeId = question?.questionType?.quesionTypeId;
  
    if ([5, 6].includes(qTypeId) && natValue?.trim() !== "") {
      const qid = question.question_id;
      const subjectId = subject.subjectId;
      const sectionId = section.sectionId;
  
      const savedData = {
        subjectId,
        sectionId,
        questionId: qid,
        natAnswer: natValue,
        type: "NAT",
        buttonClass: styles.AnswerdBtnCls,
      };
  
      setUserAnswers(prev => ({
        ...prev,
        [qid]: savedData,
      }));
    }
  };
  
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
          autoSaveNATIfNeeded={autoSaveNATIfNeeded}
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
          autoSaveNATIfNeeded={autoSaveNATIfNeeded}
        />
      </div>
    </div>
      <div className={styles.QuestionNavigationBTns}>
        <QuestionNavigationButtons
          testData={testData}
          realStudentId={realStudentId}
          realTestId={realTestId}
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
