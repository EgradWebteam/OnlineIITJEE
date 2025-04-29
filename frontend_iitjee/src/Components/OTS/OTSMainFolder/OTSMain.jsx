import React, { useEffect, useState } from "react";
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";
import SubjectsAndSectionsConatiner from "./SubjectsAndSectionsConatiner.jsx";
import QuestionsMainContainer from "./QuestionsMainContainer.jsx";
import OTSRightSideBar from "./OTSRightSideBar.jsx";
import QuestionNavigationButtons from "./QuestionNavigationButtons.jsx";
import { QuestionStatusProvider } from "../../../ContextFolder/CountsContext.jsx";
import { TimerProvider } from "../../../ContextFolder/TimerContext.jsx";
import OtsTimer from "./OTSTimer.jsx";
import { BASE_URL } from '../../../ConfigFile/ApiConfigURL.js';

export default function OTSMain({ testData, realStudentId, realTestId,warningMessage }) {
  const [activeSubject, setActiveSubject] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  /* for implementing functionality buttons and store user response */
  const [userAnswers, setUserAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedOptionsArray, setSelectedOptionsArray] = useState([]);
  const [natValue, setNatValue] = useState("");
    const [showSidebar, setShowSidebar] = useState(true); 

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

    const saveUserResponse = async ({
      realStudentId,
      realTestId,
      subject_id,
      section_id,
      question_id,
      question_type_id,
      optionIndexes1 = "",
      optionIndexes2 = "",
      optionIndexes1CharCodes = [],
      optionIndexes2CharCodes = [],
      calculatorInputValue = "",
      answered = "1", // default to '1' for answered, pass '2' for review
    }) => {
      try {
        const payload = {
          realStudentId,
          realTestId,
          subject_id,
          section_id,
          questionId: question_id,
          questionTypeId: question_type_id,
          optionIndexes1,
          optionIndexes2,
          optionIndexes1CharCodes,
          optionIndexes2CharCodes,
          calculatorInputValue,
          answered,
        };
   
        const res = await fetch(`${BASE_URL}/OTS/SaveResponse`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
   
        const data = await res.json();
        console.log("SaveResponse API result:", data);
   
        return data;
      } catch (error) {
        console.error("Error in saveUserResponse:", error);
        return { success: false, message: "Network error" };
      }
    };
  
    const autoSaveNATIfNeeded = async () => {
      const subject = testData?.subjects?.find(
        (sub) => sub.SubjectName === activeSubject
      );
      const section = subject?.sections?.find(
        (sec) => sec.SectionName === activeSection
      );
      const question = section?.questions?.[activeQuestionIndex];
      const qTypeId = question?.questionType?.quesionTypeId;
    
      if (!question || ![5, 6].includes(qTypeId)) return;
    
      const qid = question.question_id;
      const subjectId = subject.subjectId;
      const sectionId = section.sectionId;
    
       // Early exit if any required ID is missing
  if (!realStudentId || !realTestId) {
    console.warn("Missing required IDs for autoSaveNATIfNeeded. Skipping.");
    return;
  }
      const prevAnswer = userAnswers?.[qid];
      const wasPreviouslyAnswered = prevAnswer?.type === "NAT" && prevAnswer?.natAnswer?.trim();
    
      // ✅ Case 1: NAT has a value → Save
      if (natValue?.trim() !== "") {
        const wasMarkedForReview = prevAnswer?.buttonClass === styles.AnsMarkedForReview;
    
        const savedData = {
          subjectId,
          sectionId,
          questionId: qid,
          natAnswer: natValue,
          type: "NAT",
          buttonClass: wasMarkedForReview ? styles.AnsMarkedForReview : styles.AnswerdBtnCls,
        };
    
        // Save locally
        setUserAnswers((prev) => ({
          ...prev,
          [qid]: savedData,
        }));
    
        // Save to backend
        try {
          await saveUserResponse({
            realStudentId,
            realTestId,
            subject_id: subjectId,
            section_id: sectionId,
            question_id: qid,
            question_type_id: qTypeId,
            optionIndexes1: "",
            optionIndexes1CharCodes: [],
            calculatorInputValue: natValue,
            answered: "1",
          });
        } catch (error) {
          console.error("Auto-save NAT failed:", error);
        }
    
      // ✅ Case 2: NAT is cleared → Only DELETE if it was previously answered
      } else if (wasPreviouslyAnswered) {
        setUserAnswers((prev) => ({
          ...prev,
          [qid]: {
            subjectId,
            sectionId,
            questionId: qid,
            type: "",
            buttonClass: styles.NotAnsweredBtnCls,
          },
        }));
    
        try {
          const response = await fetch(
            `${BASE_URL}/OTS/ClearResponse/${realStudentId}/${realTestId}/${qid}`,
            {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
    
          const data = await response.json();
          if (!data.success) {
            console.warn('Delete API response:', data.message);
          } else {
            console.log('Response deleted from DB');
          }
        } catch (err) {
          console.error('Error deleting user response:', err);
        }
      }
    };
    
    
    
  return (
    <div>
      <div className={`${styles.OTSMainFileMainContainer} ${styles.OTSWaterMark}`}>
        <div className={styles.OTSMainFileSubContainer}>
          <TimerProvider testData={testData}>
            <OtsTimer testData={testData}/>
          </TimerProvider>
          {warningMessage && (
        <div className={styles.warning_message}>
          <p>
            Warning: You are currently taking the test. Please do not switch to
            another tab, course or test, refresh the page, or use any keyboard
            actions that could interrupt the test. Also, avoid minimizing or
            maximizing the screen.
          </p>
        </div>
      )}
          <SubjectsAndSectionsConatiner
            testData={testData}
            activeSubject={activeSubject}
            setActiveSubject={setActiveSubject}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            autoSaveNATIfNeeded={autoSaveNATIfNeeded}
            setUserAnswers={setUserAnswers}
            userAnswers={userAnswers}
            setActiveQuestionIndex={setActiveQuestionIndex}
            showSidebar={showSidebar}
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
          />
          </TimerProvider>
        </QuestionStatusProvider>
      </div>
    </div>
  );
}