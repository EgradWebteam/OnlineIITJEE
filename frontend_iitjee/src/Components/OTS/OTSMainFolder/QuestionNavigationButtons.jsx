import React, { useEffect, useState } from 'react';
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";
import ExamSummaryComponent from './OTSExamSummary';
import {BASE_URL} from '../../../../apiConfig.js'
import { useQuestionStatus,QuestionStatusProvider } from '../../../ContextFolder/CountsContext.jsx';
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
  

  const handleSaveAndNext = () => {
    const subject = testData?.subjects?.find(sub => sub.SubjectName === activeSubject);
    const section = subject?.sections?.find(sec => sec.SectionName === activeSection);
    const question = section?.questions?.[activeQuestionIndex];
    if (!question) return;
  
    const qid = question.question_id;
    const subjectId = subject.subjectId;
    const sectionId = section.sectionId;
    const qTypeId = question?.questionType?.quesionTypeId;
  
    let buttonClass = styles.NotAnsweredBtnCls;
  
    let savedData = {
      subjectId,
      sectionId,
      questionId: qid,
      type: "",
      buttonClass,
    };
  
    if ([1, 2].includes(qTypeId) && selectedOption?.option_id) {
      savedData = {
        ...savedData,
        optionId: selectedOption.option_id,
        optionIndex: selectedOption.option_index,
        type: "MCQ",
        buttonClass: styles.AnswerdBtnCls,
      };
    } else if ([3, 4].includes(qTypeId) && selectedOptionsArray?.length > 0) {
      savedData = {
        ...savedData,
        selectedOptions: selectedOptionsArray,
        type: "MSQ",
        buttonClass: styles.AnswerdBtnCls,
      };
    } else if ([5, 6].includes(qTypeId) && natValue?.trim() !== "") {
      savedData = {
        ...savedData,
        natAnswer: natValue,
        type: "NAT",
        buttonClass: styles.AnswerdBtnCls,
      };
    }
  
    setUserAnswers(prev => {
      const updated = {
        ...prev,
        [qid]: savedData,
      };
  
      //  Pre-fill the next question as NotAnswered (only if not saved yet)
      const totalQuestions = section?.questions?.length || 0;
      const isLastQuestion = activeQuestionIndex === totalQuestions - 1;
  
      if (!isLastQuestion) {
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
  
    //  Handle Navigation
    const totalQuestions = section?.questions?.length || 0;
    const isLastQuestion = activeQuestionIndex === totalQuestions - 1;
  
    if (!isLastQuestion) {
      setActiveQuestionIndex(prev => prev + 1);
    } else {
      const currentSectionIndex = subject.sections.findIndex(sec => sec.SectionName === activeSection);
      const nextSection = subject.sections[currentSectionIndex + 1];
  
      if (nextSection) {
        setActiveSection(nextSection.SectionName);
        setActiveQuestionIndex(0);
      } else {
        const currentSubjectIndex = testData.subjects.findIndex(sub => sub.SubjectName === activeSubject);
        const nextSubject = testData.subjects[currentSubjectIndex + 1];
  
        if (nextSubject) {
          setActiveSubject(nextSubject.SubjectName);
          setActiveSection(nextSubject.sections?.[0]?.SectionName || null);
          setActiveQuestionIndex(0);
        } else {
          console.log(" All subjects and sections completed!");
          setActiveSubject(testData.subjects[0]?.SubjectName);
          setActiveSection(testData.subjects[0]?.sections?.[0]?.SectionName || null);
          setActiveQuestionIndex(0);
        }
      }
    }
  };
  const handleMarkedForReview = () => {
    const subject = testData?.subjects?.find(sub => sub.SubjectName === activeSubject);
    const section = subject?.sections?.find(sec => sec.SectionName === activeSection);
    const question = section?.questions?.[activeQuestionIndex];
    if (!question) return;
  
    const qid = question.question_id;
    const subjectId = subject.subjectId;
    const sectionId = section.sectionId;
    const qTypeId = question?.questionType?.quesionTypeId;
  
    let buttonClass = styles.MarkedForReview;
  
    let savedData = {
      subjectId,
      sectionId,
      questionId: qid,
      type: "",
      buttonClass,
    };
  
    if ([1, 2].includes(qTypeId) && selectedOption?.option_id) {
      savedData = {
        ...savedData,
        optionId: selectedOption.option_id,
        optionIndex: selectedOption.option_index,
        type: "MCQ",
        buttonClass: styles.AnsMarkedForReview,
      };
    } else if ([3, 4].includes(qTypeId) && selectedOptionsArray?.length > 0) {
      savedData = {
        ...savedData,
        selectedOptions: selectedOptionsArray,
        type: "MSQ",
        buttonClass: styles.AnsMarkedForReview,
      };
    } else if ([5, 6].includes(qTypeId) && natValue?.trim() !== "") {
      savedData = {
        ...savedData,
        natAnswer: natValue,
        type: "NAT",
        buttonClass: styles.AnsMarkedForReview,
      };
    }
  
    // Save answer and initialize next question if needed
    setUserAnswers(prev => {
      const updated = {
        ...prev,
        [qid]: savedData,
      };
  
      const totalQuestions = section?.questions?.length || 0;
      const isLastQuestion = activeQuestionIndex === totalQuestions - 1;
  
      if (!isLastQuestion) {
        const nextQuestion = section?.questions?.[activeQuestionIndex + 1];
        if (nextQuestion && !updated[nextQuestion.question_id]) {
          updated[nextQuestion.question_id] = {
            subjectId,
            sectionId,
            questionId: nextQuestion.question_id,
            buttonClass: styles.NotAnsweredBtnCls,
            type: "",
          };
        }
      }
  
      return updated;
    });
  
    // Navigate to next question/section/subject
    const totalQuestions = section?.questions?.length || 0;
    const isLastQuestion = activeQuestionIndex === totalQuestions - 1;
  
    if (!isLastQuestion) {
      setActiveQuestionIndex(prev => prev + 1);
    } else {
      const currentSectionIndex = subject.sections.findIndex(sec => sec.SectionName === activeSection);
      const nextSection = subject.sections[currentSectionIndex + 1];
  
      if (nextSection) {
        setActiveSection(nextSection.SectionName);
        setActiveQuestionIndex(0);
      } else {
        const currentSubjectIndex = testData.subjects.findIndex(sub => sub.SubjectName === activeSubject);
        const nextSubject = testData.subjects[currentSubjectIndex + 1];
  
        if (nextSubject) {
          setActiveSubject(nextSubject.SubjectName);
          setActiveSection(nextSubject.sections?.[0]?.SectionName || null);
          setActiveQuestionIndex(0);
        } else {
          console.log("All subjects and sections completed!");
          setActiveSubject(testData.subjects[0]?.SubjectName);
          setActiveSection(testData.subjects[0]?.sections?.[0]?.SectionName || null);
          setActiveQuestionIndex(0);
        }
      }
    }
  };
  
  // Handle Clear Response
  const handleClearResponse = () => {
    const subject = testData?.subjects?.find(sub => sub.SubjectName === activeSubject);
    const section = subject?.sections?.find(sec => sec.SectionName === activeSection);
    const question = section?.questions?.[activeQuestionIndex];
    if (!question) return;
  
    const qid = question.question_id;
  
    // Reset selections
    setSelectedOption(null);
    setSelectedOptionsArray([]);
    setNatValue("");
  
    // Instead of deleting, mark as Not Answered
    setUserAnswers(prev => {
      const updated = {
        ...prev,
        [qid]: {
          subjectId: subject.subjectId,
          sectionId: section.sectionId,
          questionId: qid,
          type: "",
          buttonClass: styles.NotAnsweredBtnCls,
        }
      };
      console.log("Cleared and updated Answer:", updated[qid]);
      return updated;
    });
  };
  
  const handlePrevious = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex(prev => prev - 1);
    } else {
      // Optionally handle the case when there's no previous question (e.g., disable the button or show a message).
      console.log("This is the first question.");
    }
  };

  
  const handleSubmitClick = async () => {
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
      TimeSpent: "01:15:30",
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
              />
                      </QuestionStatusProvider>
             
            </div>
          </div>
        )}
      </div>


    </div>
  );
}
