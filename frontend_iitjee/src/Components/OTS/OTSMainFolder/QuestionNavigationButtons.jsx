import React, { useEffect, useState } from 'react';
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";
import ExamSummaryComponent from './OTSExamSummary';
import { BASE_URL } from '../../../ConfigFile/ApiConfigURL.js';
import { useQuestionStatus,QuestionStatusProvider } from '../../../ContextFolder/CountsContext.jsx';
import { useTimer } from '../../../ContextFolder/TimerContext.jsx'; 
export default function QuestionNavigationButtons({
  testData,
  activeSubject,
  activeSection,
  activeQuestionIndex,
  setActiveQuestionIndex,
  userAnswers,
  setUserAnswers,
  selectedOption,         // for MCQ
  selectedOptionsArray,   // for MSQ
  natValue ,              // for NAT
  setActiveSubject,
  setActiveSection,
  setSelectedOptionsArray,
  setNatValue,
  setSelectedOption,
  realStudentId,
  realTestId,
}) {
  const {
    answeredCount,
    answeredAndMarkedForReviewCount,
    markedForReviewCount,
    notAnsweredCount,
    notVisitedCount,
    visitedCount,
    totalQuestionsInTest,
  } = useQuestionStatus();
  const [showExamSummary, setShowExamSummary] = useState(false);
  const { timeSpent } = useTimer();  // Get timeSpent in seconds
  console.log("Time Spent (seconds):", timeSpent);

  useEffect(() => {
    if (!testData || !testData.subjects) return;
  
    const updatedAnswers = { ...userAnswers };
    testData.subjects.forEach(subject => {
      subject.sections.forEach(section => {
        const firstQ = section.questions[0];
        if (firstQ && !updatedAnswers[firstQ.question_id]) {
          updatedAnswers[firstQ.question_id] = {
            subjectId: subject.subjectId,
            sectionId: section.sectionId,
            questionId: firstQ.question_id,
            buttonClass: styles.NotAnsweredBtnCls,
            type: "",
          };
        }
      });
    });
  
    setUserAnswers(updatedAnswers);
  }, [testData]);
  

  // const handleSaveAndNext = () => {
  //   const subject = testData?.subjects?.find(sub => sub.SubjectName === activeSubject);
  //   const section = subject?.sections?.find(sec => sec.SectionName === activeSection);
  //   const question = section?.questions?.[activeQuestionIndex];
  //   if (!question) return;
  
  //   const qid = question.question_id;
  //   const subjectId = subject.subjectId;
  //   const sectionId = section.sectionId;
  //   const qTypeId = question?.questionType?.quesionTypeId;
  
  //   let buttonClass = styles.NotAnsweredBtnCls;
  
  //   let savedData = {
  //     subjectId,
  //     sectionId,
  //     questionId: qid,
  //     type: "",
  //     buttonClass,
  //   };
  
  //   if ([1, 2].includes(qTypeId) && selectedOption?.option_id) {
  //     savedData = {
  //       ...savedData,
  //       optionId: selectedOption.option_id,
  //       optionIndex: selectedOption.option_index,
  //       type: "MCQ",
  //       buttonClass: styles.AnswerdBtnCls,
  //     };
  //   } else if ([3, 4].includes(qTypeId) && selectedOptionsArray?.length > 0) {
  //     savedData = {
  //       ...savedData,
  //       selectedOptions: selectedOptionsArray,
  //       type: "MSQ",
  //       buttonClass: styles.AnswerdBtnCls,
  //     };
  //   } else if ([5, 6].includes(qTypeId) && natValue?.trim() !== "") {
  //     savedData = {
  //       ...savedData,
  //       natAnswer: natValue,
  //       type: "NAT",
  //       buttonClass: styles.AnswerdBtnCls,
  //     };
  //   }
  
  //   setUserAnswers(prev => {
  //     const updated = {
  //       ...prev,
  //       [qid]: savedData,
  //     };
  
  //     //  Pre-fill the next question as NotAnswered (only if not saved yet)
  //     const totalQuestions = section?.questions?.length || 0;
  //     const isLastQuestion = activeQuestionIndex === totalQuestions - 1;
  
  //     if (!isLastQuestion) {
  //       const nextQuestion = section?.questions?.[activeQuestionIndex + 1];
  //       if (nextQuestion && !updated[nextQuestion.question_id]) {
  //         updated[nextQuestion.question_id] = {
  //           subjectId,
  //           sectionId,
  //           questionId: nextQuestion.question_id,
  //           buttonClass: styles.NotAnsweredBtnCls,
  //           type: ""
  //         };
  //       }
  //     }
  
  //     return updated;
  //   });
  
  //   //  Handle Navigation
  //   const totalQuestions = section?.questions?.length || 0;
  //   const isLastQuestion = activeQuestionIndex === totalQuestions - 1;
  
  //   if (!isLastQuestion) {
  //     setActiveQuestionIndex(prev => prev + 1);
  //   } else {
  //     const currentSectionIndex = subject.sections.findIndex(sec => sec.SectionName === activeSection);
  //     const nextSection = subject.sections[currentSectionIndex + 1];
  
  //     if (nextSection) {
  //       setActiveSection(nextSection.SectionName);
  //       setActiveQuestionIndex(0);
  //     } else {
  //       const currentSubjectIndex = testData.subjects.findIndex(sub => sub.SubjectName === activeSubject);
  //       const nextSubject = testData.subjects[currentSubjectIndex + 1];
  
  //       if (nextSubject) {
  //         setActiveSubject(nextSubject.SubjectName);
  //         setActiveSection(nextSubject.sections?.[0]?.SectionName || null);
  //         setActiveQuestionIndex(0);
  //       } else {
  //         console.log(" All subjects and sections completed!");
  //         setActiveSubject(testData.subjects[0]?.SubjectName);
  //         setActiveSection(testData.subjects[0]?.sections?.[0]?.SectionName || null);
  //         setActiveQuestionIndex(0);
  //       }
  //     }
  //   }
  // };
  // const handleMarkedForReview = () => {
  //   const subject = testData?.subjects?.find(sub => sub.SubjectName === activeSubject);
  //   const section = subject?.sections?.find(sec => sec.SectionName === activeSection);
  //   const question = section?.questions?.[activeQuestionIndex];
  //   if (!question) return;
  
  //   const qid = question.question_id;
  //   const subjectId = subject.subjectId;
  //   const sectionId = section.sectionId;
  //   const qTypeId = question?.questionType?.quesionTypeId;
  
  //   let buttonClass = styles.MarkedForReview;
  
  //   let savedData = {
  //     subjectId,
  //     sectionId,
  //     questionId: qid,
  //     type: "",
  //     buttonClass,
  //   };
  
  //   if ([1, 2].includes(qTypeId) && selectedOption?.option_id) {
  //     savedData = {
  //       ...savedData,
  //       optionId: selectedOption.option_id,
  //       optionIndex: selectedOption.option_index,
  //       type: "MCQ",
  //       buttonClass: styles.AnsMarkedForReview,
  //     };
  //   } else if ([3, 4].includes(qTypeId) && selectedOptionsArray?.length > 0) {
  //     savedData = {
  //       ...savedData,
  //       selectedOptions: selectedOptionsArray,
  //       type: "MSQ",
  //       buttonClass: styles.AnsMarkedForReview,
  //     };
  //   } else if ([5, 6].includes(qTypeId) && natValue?.trim() !== "") {
  //     savedData = {
  //       ...savedData,
  //       natAnswer: natValue,
  //       type: "NAT",
  //       buttonClass: styles.AnsMarkedForReview,
  //     };
  //   }
  
  //   // Save answer and initialize next question if needed
  //   setUserAnswers(prev => {
  //     const updated = {
  //       ...prev,
  //       [qid]: savedData,
  //     };
  
  //     const totalQuestions = section?.questions?.length || 0;
  //     const isLastQuestion = activeQuestionIndex === totalQuestions - 1;
  
  //     if (!isLastQuestion) {
  //       const nextQuestion = section?.questions?.[activeQuestionIndex + 1];
  //       if (nextQuestion && !updated[nextQuestion.question_id]) {
  //         updated[nextQuestion.question_id] = {
  //           subjectId,
  //           sectionId,
  //           questionId: nextQuestion.question_id,
  //           buttonClass: styles.NotAnsweredBtnCls,
  //           type: "",
  //         };
  //       }
  //     }
  
  //     return updated;
  //   });
  
  //   // Navigate to next question/section/subject
  //   const totalQuestions = section?.questions?.length || 0;
  //   const isLastQuestion = activeQuestionIndex === totalQuestions - 1;
  
  //   if (!isLastQuestion) {
  //     setActiveQuestionIndex(prev => prev + 1);
  //   } else {
  //     const currentSectionIndex = subject.sections.findIndex(sec => sec.SectionName === activeSection);
  //     const nextSection = subject.sections[currentSectionIndex + 1];
  
  //     if (nextSection) {
  //       setActiveSection(nextSection.SectionName);
  //       setActiveQuestionIndex(0);
  //     } else {
  //       const currentSubjectIndex = testData.subjects.findIndex(sub => sub.SubjectName === activeSubject);
  //       const nextSubject = testData.subjects[currentSubjectIndex + 1];
  
  //       if (nextSubject) {
  //         setActiveSubject(nextSubject.SubjectName);
  //         setActiveSection(nextSubject.sections?.[0]?.SectionName || null);
  //         setActiveQuestionIndex(0);
  //       } else {
  //         console.log("All subjects and sections completed!");
  //         setActiveSubject(testData.subjects[0]?.SubjectName);
  //         setActiveSection(testData.subjects[0]?.sections?.[0]?.SectionName || null);
  //         setActiveQuestionIndex(0);
  //       }
  //     }
  //   }
  // };
  
  // Handle Clear Response
 

  const navigateToNext = (subject, section, activeQuestionIndex) => {
    const totalQuestions = section?.questions?.length || 0;
    const isLastQuestion = activeQuestionIndex === totalQuestions - 1;
 
    if (!isLastQuestion) {
      setActiveQuestionIndex((prev) => prev + 1);
    } else {
      const currentSectionIndex = subject.sections.findIndex(
        (sec) => sec.SectionName === activeSection
      );
      const nextSection = subject.sections[currentSectionIndex + 1];
 
      if (nextSection) {
        setActiveSection(nextSection.SectionName);
        setActiveQuestionIndex(0);
      } else {
        const currentSubjectIndex = testData.subjects.findIndex(
          (sub) => sub.SubjectName === activeSubject
        );
        const nextSubject = testData.subjects[currentSubjectIndex + 1];
 
        if (nextSubject) {
          setActiveSubject(nextSubject.SubjectName);
          setActiveSection(nextSubject.sections?.[0]?.SectionName || null);
          setActiveQuestionIndex(0);
        } else {
          console.log("All subjects and sections completed!");
          setActiveSubject(testData.subjects[0]?.SubjectName);
          setActiveSection(
            testData.subjects[0]?.sections?.[0]?.SectionName || null
          );
          setActiveQuestionIndex(0);
        }
      }
    }
  };
 
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



  const handleSaveAndNext = async () => {
    const subject = testData?.subjects?.find(sub => sub.SubjectName === activeSubject);
    const section = subject?.sections?.find(sec => sec.SectionName === activeSection);
    const question = section?.questions?.[activeQuestionIndex];
    if (!question) return;
  
    const qid = question.question_id;
    const subjectId = subject.subjectId;
    const sectionId = section.sectionId;
    const qTypeId = question?.questionType?.quesionTypeId;

    let buttonClass = styles.NotAnsweredBtnCls;
    let savedData = { subjectId, sectionId, questionId: qid, type: "", buttonClass };
  
    let optionIndexesStr = "";
    let optionCharCodes = [];
    let calcVal = "";
  
    if ([1, 2].includes(qTypeId) && selectedOption?.option_index) {
      optionIndexesStr = selectedOption.option_index;
  
      const matchedOption = question.options.find(
        opt => opt.option_index === selectedOption.option_index
      );
      optionCharCodes = matchedOption ? [matchedOption.option_id] : [];
  
      savedData = {
        ...savedData,
        optionId: matchedOption?.option_id,
        optionIndex: selectedOption.option_index,
        buttonClass: styles.AnswerdBtnCls,
        type: "MCQ"
      };
    } else if ([3, 4].includes(qTypeId) && Array.isArray(selectedOptionsArray) && selectedOptionsArray.length > 0) {
      optionIndexesStr = selectedOptionsArray.join(",");
    
      optionCharCodes = selectedOptionsArray.map(optIndex => {
        const match = question.options.find(qOpt => qOpt.option_index === optIndex);
        return match?.option_id;
      }).filter(Boolean);
    
      savedData = {
        ...savedData,
        selectedOptions: selectedOptionsArray, // or rename to selectedOptionIndexes for clarity
        buttonClass: styles.AnswerdBtnCls,
        type: "MSQ"
      };
    } else if ([5, 6].includes(qTypeId) && natValue?.trim() !== "") {
      calcVal = natValue;
      optionIndexesStr = ""
      optionCharCodes = [];
      savedData = {
        ...savedData,
        natAnswer: natValue,
        buttonClass: styles.AnswerdBtnCls,
        type: "NAT"
      };
    }
  
    // Save to local state
    setUserAnswers(prev => {
      const updated = { ...prev, [qid]: savedData };
  
      const totalQuestions = section?.questions?.length || 0;
      if (activeQuestionIndex < totalQuestions - 1) {
        const nextQuestion = section?.questions?.[activeQuestionIndex + 1];
        if (nextQuestion && !updated[nextQuestion.question_id]) {
          updated[nextQuestion.question_id] = {
            subjectId,
            sectionId,
            questionId: nextQuestion.question_id,
            buttonClass: styles.NotAnsweredBtnCls,
            type: ""
          };
        }
      }
      return updated;
    });
  
    // Send to backend
    await saveUserResponse({
      realStudentId,
      realTestId,
      subject_id: subjectId,
      section_id: sectionId,
      question_id: qid,
      question_type_id: qTypeId,
      optionIndexes1: optionIndexesStr,
      optionIndexes1CharCodes: optionCharCodes,
      calculatorInputValue: calcVal,
      answered: "1" // answered
    });
  
    // Move to next question
    navigateToNext(subject, section, activeQuestionIndex);
  };
  
  const handleMarkedForReview = async () => {
    const subject = testData?.subjects?.find(sub => sub.SubjectName === activeSubject);
    const section = subject?.sections?.find(sec => sec.SectionName === activeSection);
    const question = section?.questions?.[activeQuestionIndex];
    if (!question) return;
  
    const qid = question.question_id;
    const subjectId = subject.subjectId;
    const sectionId = section.sectionId;
    const qTypeId = question?.questionType?.quesionTypeId;
  
    let buttonClass = styles.MarkedForReview;
    let savedData = { subjectId, sectionId, questionId: qid, type: "", buttonClass };
  
    let optionIndexesStr = "";
    let optionCharCodes = [];
    let calcVal = "";
  
    if ([1, 2].includes(qTypeId) && selectedOption?.option_index) {
      optionIndexesStr = selectedOption.option_index;
  
      const matchedOption = question.options.find(
        opt => opt.option_index === selectedOption.option_index
      );
      optionCharCodes = matchedOption ? [matchedOption.option_id] : [];
  
      buttonClass = styles.AnsMarkedForReview;
      savedData = {
        ...savedData,
        optionId: matchedOption?.option_id,
        optionIndex: selectedOption.option_index,
        buttonClass,
        type: "MCQ"
      };
    } else if ([3, 4].includes(qTypeId) && Array.isArray(selectedOptionsArray) && selectedOptionsArray.length > 0) {
      optionIndexesStr = selectedOptionsArray.join(",");
    
      optionCharCodes = selectedOptionsArray.map(optIndex => {
        const match = question.options.find(qOpt => qOpt.option_index === optIndex);
        return match?.option_id;
      }).filter(Boolean);
    
      savedData = {
        ...savedData,
        selectedOptions: selectedOptionsArray, // or rename to selectedOptionIndexes for clarity
        buttonClass: styles.AnsMarkedForReview,
        type: "MSQ"
      };
    } else if ([5, 6].includes(qTypeId) && natValue?.trim() !== "") {
      calcVal = natValue;
      buttonClass = styles.AnsMarkedForReview;
      savedData = {
        ...savedData,
        natAnswer: natValue,
        buttonClass,
        type: "NAT"
      };
    }
  
    // Save to local state
    setUserAnswers(prev => {
      const updated = { ...prev, [qid]: savedData };
  
      const totalQuestions = section?.questions?.length || 0;
      if (activeQuestionIndex < totalQuestions - 1) {
        const nextQuestion = section?.questions?.[activeQuestionIndex + 1];
        if (nextQuestion && !updated[nextQuestion.question_id]) {
          updated[nextQuestion.question_id] = {
            subjectId,
            sectionId,
            questionId: nextQuestion.question_id,
            buttonClass: styles.NotAnsweredBtnCls,
            type: ""
          };
        }
      }
      return updated;
    });
  
    // Save to backend
    await saveUserResponse({
      realStudentId,
      realTestId,
      subject_id: subjectId,
      section_id: sectionId,
      question_id: qid,
      question_type_id: qTypeId,
      optionIndexes1: optionIndexesStr,
      optionIndexes1CharCodes: optionCharCodes,
      calculatorInputValue: calcVal,
      answered: "2" // marked for review
    });
  
    // Move to next question
    navigateToNext(subject, section, activeQuestionIndex);
  };
  

  
  
  // const handleClearResponse = () => {
  //   const subject = testData?.subjects?.find(sub => sub.SubjectName === activeSubject);
  //   const section = subject?.sections?.find(sec => sec.SectionName === activeSection);
  //   const question = section?.questions?.[activeQuestionIndex];
  //   if (!question) return;
  
  //   const qid = question.question_id;
  
  //   // Reset selections
  //   setSelectedOption(null);
  //   setSelectedOptionsArray([]);
  //   setNatValue("");
  
  //   // Instead of deleting, mark as Not Answered
  //   setUserAnswers(prev => {
  //     const updated = {
  //       ...prev,
  //       [qid]: {
  //         subjectId: subject.subjectId,
  //         sectionId: section.sectionId,
  //         questionId: qid,
  //         type: "",
  //         buttonClass: styles.NotAnsweredBtnCls,
  //       }
  //     };
  //     console.log("Cleared and updated Answer:", updated[qid]);
  //     return updated;
  //   });
  // };
  





  const handleClearResponse = async () => {
    const subject = testData?.subjects?.find(sub => sub.SubjectName === activeSubject);
    const section = subject?.sections?.find(sec => sec.SectionName === activeSection);
    const question = section?.questions?.[activeQuestionIndex];
  
    if (!question) return;
  
    const qid = question.question_id;
  
    // Reset selections
    setSelectedOption(null);
    setSelectedOptionsArray([]);
    setNatValue("");
  
    // Mark as Not Answered in state
    setUserAnswers(prev => {
      const updated = {
        ...prev,
        [qid]: {
          subjectId: subject.subjectId,
          sectionId: section.sectionId,
          questionId: qid,
          type: "",
          buttonClass: styles.NotAnsweredBtnCls,
        },
      };
      console.log("Cleared and updated Answer:", updated[qid]);
      return updated;
    });
  
    try {
      // Call DELETE API without a body
      const response = await fetch(`${BASE_URL}/OTS/ClearResponse/${realStudentId}/${realTestId}/${qid}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const data = await response.json();
  
      if (!data.success) {
        console.warn('Delete API response:', data.message);
      } else {
        console.log('Response deleted from DB');
      }
    } catch (err) {
      console.error('Error deleting user response:', err);
    }
  };











  
  const handlePrevious = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex(prev => prev - 1);
    } else {
      // Optionally handle the case when there's no previous question (e.g., disable the button or show a message).
      console.log("This is the first question.");
    }
  };

  const formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };
  
  const handleSubmitClick = async () => {
    const formattedTimeSpent = formatTime(timeSpent);  // Format it into HH:MM:SS
    console.log("timespenthours:", formattedTimeSpent)
    setShowExamSummary(true);
    const attemptedCount =  answeredAndMarkedForReviewCount+answeredCount;
   const notAttemptedCount =  markedForReviewCount+notAnsweredCount;
    const examSummaryData = {
      studentId: realStudentId,
      test_creation_table_id: realTestId,
      totalQuestions: totalQuestionsInTest,
      totalAnsweredQuestions: answeredCount,
      totalAnsweredMarkForReviewQuestions: answeredAndMarkedForReviewCount,
      totalMarkForReviewQuestions: markedForReviewCount,
      totalNotAnsweredQuestions: notAnsweredCount,
      totalVisitedQuestionQuestions: visitedCount,
      totalNotVisitedQuestions: notVisitedCount,
      totalAttemptedQuestions: attemptedCount,
      totalNotAttemptedQuestions: notAttemptedCount,
      TimeSpent: formattedTimeSpent,
    };
  
    try {
      const response = await fetch(`${BASE_URL}/OTSExamSummary/SaveExamSummary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(examSummaryData),
      });
  console.log("examSummaryData",examSummaryData)
      const result = await response.json();
  
      if (response.ok) {
        console.log("Success:", result.message);
      } else {
        console.error("Failed:", result.message);
      }
    } catch (error) {
      console.error("Error posting exam summary:", error);
    }
  };
  
  return (
    <div className={styles.QuestionNavigationButtonsMainContainer}>
      <div className={styles.btnsSubContainer}>
        <div className={styles.navigationBtnHolderSubContainer}>
          <button className={styles.markedForReviewNavigationBtn} onClick={handleMarkedForReview}>Marked For Review & Next</button>
          <button className={styles.clearResponseBtn} onClick={handleClearResponse}>Clear Response</button>
        </div>
        <div className={styles.navigationBtnHolderSubContainer}>
          {!(
            activeQuestionIndex === 0 &&
            testData?.subjects?.[0]?.SubjectName === activeSubject &&
            testData?.subjects?.[0]?.sections?.[0]?.SectionName === activeSection
          ) && (
              <button className={styles.previousBtn} onClick={handlePrevious}>Previous</button>
            )}
          <button className={styles.saveandnextNavigationBtn} onClick={handleSaveAndNext}>Save & Next</button>
        </div>
      </div>
      <div className={styles.submitBtnCls}>
        <button
          className={styles.submitNavigationBtn}
          onClick={handleSubmitClick}
        >
          Submit
        </button>
      </div>
      <div>
      {showExamSummary && (
          <div className={styles.ExamSummaryMainDiv}>
            <div className={styles.ExamSummarysubDiv}>
                 <QuestionStatusProvider
                        testData={testData}
                        activeSubject={activeSubject}
                        activeSection={activeSection}
                        userAnswers={userAnswers}
                      >
                         <ExamSummaryComponent
                testData={testData}
                userAnswers={userAnswers}
                onCancelSubmit={() => setShowExamSummary(false)}  // Close summary
                setUserAnswers={setUserAnswers}
                realTestId={realTestId}
                realStudentId={realStudentId}
              />
                      </QuestionStatusProvider>
             
            </div>
          </div>
        )}
      </div>


    </div>
  );
}
