import React, { useEffect, useState } from "react";
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";
import SubjectsAndSectionsConatiner from "./SubjectsAndSectionsConatiner.jsx";
import QuestionsMainContainer from "./QuestionsMainContainer.jsx";
import OTSRightSideBar from "./OTSRightSideBar.jsx";
import QuestionNavigationButtons from "./QuestionNavigationButtons.jsx";
import { QuestionStatusProvider } from "../../../ContextFolder/CountsContext.jsx";
import { TimerProvider } from "../../../ContextFolder/TimerContext.jsx";
import OtsTimer from "./OTSTimer.jsx";

export default function OTSMain({ testData, realStudentId, realTestId }) {
  const [activeSubject, setActiveSubject] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  /* for implementing functionality buttons and store user response */
  const [userAnswers, setUserAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedOptionsArray, setSelectedOptionsArray] = useState([]);
  const [natValue, setNatValue] = useState("");
    const [showSidebar, setShowSidebar] = useState(true); 
    const [isAutoSubmitted,setIsAutoSubmitted]= useState(false); 

  // Reset question index when section changes
  useEffect(() => {
    setActiveQuestionIndex(0); // This resets to 1st question when section changes
  }, [activeSection]);

  // const autoSaveNATIfNeeded = () => {
  //   const subject = testData?.subjects?.find(
  //     (sub) => sub.SubjectName === activeSubject
  //   );
  //   const section = subject?.sections?.find(
  //     (sec) => sec.SectionName === activeSection
  //   );
  //   const question = section?.questions?.[activeQuestionIndex];
  //   const qTypeId = question?.questionType?.quesionTypeId;

  //   if ([5, 6].includes(qTypeId) && natValue?.trim() !== "") {
  //     const qid = question.question_id;
  //     const subjectId = subject.subjectId;
  //     const sectionId = section.sectionId;

  //     const savedData = {
  //       subjectId,
  //       sectionId,
  //       questionId: qid,
  //       natAnswer: natValue,
  //       type: "NAT",
  //       buttonClass: styles.AnswerdBtnCls,
  //     };

  //     setUserAnswers((prev) => ({
  //       ...prev,
  //       [qid]: savedData,
  //     }));
  //   }
  // };

  const autoSaveNATIfNeeded = () => {
    const subject = testData?.subjects?.find(
      (sub) => sub.SubjectName === activeSubject
    );
    const section = subject?.sections?.find(
      (sec) => sec.SectionName === activeSection
    );
    const question = section?.questions?.[activeQuestionIndex];
    const qTypeId = question?.questionType?.quesionTypeId;
  
    if ([5, 6].includes(qTypeId) && natValue?.trim() !== "") {
      const qid = question.question_id;
      const subjectId = subject.subjectId;
      const sectionId = section.sectionId;
  
      //  Check previous answer's buttonClass
      const prevAnswer = userAnswers?.[qid];
      const wasMarkedForReview = prevAnswer?.buttonClass === styles.AnsMarkedForReview;
  
      const savedData = {
        subjectId,
        sectionId,
        questionId: qid,
        natAnswer: natValue,
        type: "NAT",
        //  Preserve Marked for Review if previously set
        buttonClass: wasMarkedForReview ? styles.AnsMarkedForReview : styles.AnswerdBtnCls,
      };
  
      setUserAnswers((prev) => ({
        ...prev,
        [qid]: savedData,
      }));
    }
  };
  console.log("isAutoSubmitted MAIN",isAutoSubmitted)
  
  return (
    <div>
      <div className={`${styles.OTSMainFileMainContainer} ${styles.OTSWaterMark}`}>
        <div className={styles.OTSMainFileSubContainer}>
          <TimerProvider testData={testData}>
            <OtsTimer testData={testData}/>
          </TimerProvider>
          <SubjectsAndSectionsConatiner
            testData={testData}
            activeSubject={activeSubject}
            setActiveSubject={setActiveSubject}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            autoSaveNATIfNeeded={autoSaveNATIfNeeded}
            setUserAnswers={setUserAnswers}
            userAnswers={userAnswers}
            activeQuestionIndex={activeQuestionIndex}
            setActiveQuestionIndex={setActiveQuestionIndex}
            showSidebar={showSidebar}
            setShowSidebar={setShowSidebar}
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
            showSidebar={showSidebar}
            setShowSidebar={setShowSidebar}
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
              showSidebar={showSidebar}
              setShowSidebar={setShowSidebar}
            />
       
        </div>
      </div>
      <div className={styles.QuestionNavigationBTns}>
        <QuestionStatusProvider
          testData={testData}
          activeSubject={activeSubject}
          activeSection={activeSection}
          userAnswers={userAnswers}
        >
          <TimerProvider testData={testData}>
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
            setIsAutoSubmitted={setIsAutoSubmitted}
            isAutoSubmitted={isAutoSubmitted}
          />
          </TimerProvider>
        </QuestionStatusProvider>
      </div>
    </div>
  );
}
