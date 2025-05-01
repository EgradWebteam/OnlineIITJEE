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
import axios from "axios";

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

  console.log("studentid, testid:", realStudentId, realTestId);

  // useEffect(() => {
  //   const fetchUserAnswersAfterResume = async () => {
  //     if (!realStudentId || !realTestId) {
  //       console.warn("Missing realStudentId or realTestId. Skipping fetch.");
  //       return;
  //     }
  
  //     try {
  //       const response = await axios.get(
  //         `${BASE_URL}/ResumeTest/getResumedUserresponses/${realStudentId}/${realTestId}`
  //       );
  
  //       const data = response.data;
  //       console.log("Fetched resume data:", data);
  
  //       const userAnswers = {};
  //       let firstSubject = null;
  //       let firstSection = null;
  //       let firstQuestion = null;
  
  //       data.subjects?.forEach(subject => {
  //         if (!firstSubject) firstSubject = subject.subject_id;
  
  //         subject.sections?.forEach(section => {
  //           if (!firstSection) firstSection = section.section_id;
  
  //           section.questions?.forEach(question => {
  //             const {
  //               question_id,
  //               user_answer,
  //               question_status,
  //               question_type_id
  //             } = question;
  
  //             let buttonClass = styles.NotAnsweredBtnCls;
  //             if (question_status === 1) buttonClass = styles.AnswerdBtnCls;
  //             else if (question_status === 2) buttonClass = styles.AnsMarkedForReview;
  //             else if (question_status === 3) buttonClass = styles.NotAnsweredBtnCls;
  //             else if (question_status === 4) buttonClass = styles.MarkedForReview;
  
  //             const entry = {
  //               questionId: question_id,
  //               subjectId: subject.subject_id,
  //               sectionId: section.section_id,
  //               buttonClass,
  //             };
  
  //             if (question_type_id === 1 || question_type_id === 2) {
  //               entry.type = 'MCQ';
  //               entry.optionIndex = user_answer || null;
  //             } else if (question_type_id === 3 || question_type_id === 4) {
  //               entry.type = 'MSQ';
  //               entry.selectedOptions = user_answer
  //                 ? user_answer.split(',').map(opt => opt.trim())
  //                 : [];
  //             } else if (question_type_id === 5 || question_type_id === 6) {
  //               entry.type = 'NAT';
  //               entry.natAnswer = user_answer || '';
  //             }
  
  //             console.log(`Parsed entry for question ${question_id}:`, entry);
  
  //             userAnswers[question_id] = entry;
  
  //             if (!firstQuestion && user_answer) {
  //               firstQuestion = { ...entry };
  //             }
  //           });
  //         });
  //       });
  
  //       console.log("Setting userAnswers:", userAnswers);
  //       setUserAnswers(userAnswers);
  
  //       console.log("Setting activeSubject:", firstSubject);
  //       setActiveSubject(firstSubject);
  
  //       console.log("Setting activeSection:", firstSection);
  //       setActiveSection(firstSection);
  
  //       console.log("Setting activeQuestionIndex: 0");
  //       setActiveQuestionIndex(0);
  
  //       if (firstQuestion) {
  //         console.log("First answered question for UI input:", firstQuestion);
  //         if (firstQuestion.type === 'MCQ') {
  //           console.log("Prefilling selectedOption:", firstQuestion.optionIndex);
  //           setSelectedOption(firstQuestion.optionIndex);
  //         } else if (firstQuestion.type === 'MSQ') {
  //           console.log("Prefilling selectedOptionsArray:", firstQuestion.selectedOptions);
  //           setSelectedOptionsArray(firstQuestion.selectedOptions);
  //         } else if (firstQuestion.type === 'NAT') {
  //           console.log("Prefilling natValue:", firstQuestion.natAnswer);
  //           setNatValue(firstQuestion.natAnswer);
  //         }
  //       } else {
  //         console.log("No answered question found to prefill inputs.");
  //       }
  
  //     } catch (err) {
  //       console.error("Error fetching resumed answers:", err);
  //     }
  //   };
  
  //   fetchUserAnswersAfterResume();
  // }, [realStudentId, realTestId]);
  

  // prefilling data when user resume the test..
useEffect(() => {
  const fetchUserAnswersAfterResume = async () => {
    if (!realStudentId || !realTestId) {
      console.warn("Missing realStudentId or realTestId. Skipping fetch.");
      return;
    }

    try {
      const response = await axios.get(
        `${BASE_URL}/ResumeTest/getResumedUserresponses/${realStudentId}/${realTestId}`
      );

      const data = response.data;
      console.log("Fetched resume data:", data);

      const userAnswers = {};
      let firstSubject = null;
      let firstSection = null;
      let firstQuestion = null;

      data.subjects?.forEach(subject => {
        if (firstSubject === null) firstSubject = subject.subject_id;

        subject.sections?.forEach(section => {
          const sectionId = section.section_id ?? 0;
          if (firstSection === null) firstSection = sectionId;

          section.questions?.forEach(question => {
            const {
              question_id,
              user_answer,
              question_status,
              question_type_id
            } = question;

            let buttonClass = styles.NotAnsweredBtnCls;
            if (question_status === 1) buttonClass = styles.AnswerdBtnCls;
            else if (question_status === 2) buttonClass = styles.AnsMarkedForReview;
            else if (question_status === 3) buttonClass = styles.NotAnsweredBtnCls;
            else if (question_status === 4) buttonClass = styles.MarkedForReview;

            const entry = {
              questionId: question_id,
              subjectId: subject.subject_id,
              sectionId: sectionId,
              buttonClass,
            };

            if (question_type_id === 1 || question_type_id === 2) {
              entry.type = 'MCQ';
              entry.optionIndex = user_answer || null;
            } else if (question_type_id === 3 || question_type_id === 4) {
              entry.type = 'MSQ';
              entry.selectedOptions = user_answer
                ? user_answer.split(',').map(opt => opt.trim())
                : [];
            } else if (question_type_id === 5 || question_type_id === 6) {
              entry.type = 'NAT';
              entry.natAnswer = user_answer || '';
            }

            console.log(`Parsed entry for question ${question_id}:`, entry);

            userAnswers[question_id] = entry;

            if (!firstQuestion && user_answer) {
              firstQuestion = { ...entry };
            }
          });
        });
      });

      setUserAnswers(userAnswers);
      setActiveSubject(firstSubject);
      setActiveSection(firstSection ?? 0); // ensures 0 is used when needed
      setActiveQuestionIndex(0);

      if (firstQuestion) {
        if (firstQuestion.type === 'MCQ') {
          setSelectedOption(firstQuestion.optionIndex);
        } else if (firstQuestion.type === 'MSQ') {
          setSelectedOptionsArray(firstQuestion.selectedOptions);
        } else if (firstQuestion.type === 'NAT') {
          setNatValue(firstQuestion.natAnswer);
        }
      }

    } catch (err) {
      console.error("Error fetching resumed answers:", err);
    }
  };

  fetchUserAnswersAfterResume();
}, [realStudentId, realTestId]);

  

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
              realStudentId = {realStudentId}
               realTestId={realTestId}
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