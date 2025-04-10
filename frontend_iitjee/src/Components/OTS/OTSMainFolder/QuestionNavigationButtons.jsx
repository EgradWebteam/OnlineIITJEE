import React from 'react';
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";

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
  setSelectedOption
}) {
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
  
    // Save Answer
    // setUserAnswers(prev => ({
    //   ...prev,
    //   [qid]: savedData,
      
    // }));
    setUserAnswers(prev => {
      const updated = {
        ...prev,
        [qid]: savedData,
      };
      console.log("Saved Answer:", updated[qid]);
      return updated;
    });
  
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
        // Go to next subject
        const currentSubjectIndex = testData.subjects.findIndex(sub => sub.SubjectName === activeSubject);
        const nextSubject = testData.subjects[currentSubjectIndex + 1];
  
        if (nextSubject) {
          setActiveSubject(nextSubject.SubjectName);
          setActiveSection(nextSubject.sections?.[0]?.SectionName || null);
          setActiveQuestionIndex(0);
        } else {
           // All subjects and sections completed, reset to first subject
        console.log(" All subjects and sections completed!");
        setActiveSubject(testData.subjects[0]?.SubjectName);  // Reset to first subject
        setActiveSection(testData.subjects[0]?.sections?.[0]?.SectionName || null); // Reset to first section
        setActiveQuestionIndex(0);  // Reset to first question
        }
      }
    }
  };
  
  
  // const handleSaveAndNext = () => {
  //   const subject = testData?.subjects?.find(sub => sub.SubjectName === activeSubject);
  //   const section = subject?.sections?.find(sec => sec.SectionName === activeSection);
  //   const question = section?.questions?.[activeQuestionIndex];
  //   if (!question) return;
  
  //   const qid = question.question_id;
  //   const subjectId = subject.subjectId;
  //   const sectionId = section.sectionId;
  //   const qTypeId = question?.questionType?.quesionTypeId;
  
  //   // Default class: Not Answered
  //   let buttonClass = styles.NotAnsweredBtnCls;
  
  //   // Determine class and build answer object based on question type
  //   let savedData = {
  //     subjectId,
  //     sectionId,
  //     questionId: qid,
  //     type: "",
  //     buttonClass,
  //   };
  
  //   if ([1, 2].includes(qTypeId)) {
  //     // MCQ
  //     if (selectedOption?.option_id) {
  //       savedData = {
  //         ...savedData,
  //         optionId: selectedOption.option_id,
  //         optionIndex: selectedOption.option_index,
  //         type: "MCQ",
  //         buttonClass: styles.AnswerdBtnCls,
  //       };
  //     }
  //   } else if ([3, 4].includes(qTypeId)) {
  //     // MSQ
  //     if (selectedOptionsArray && selectedOptionsArray.length > 0) {
  //       savedData = {
  //         ...savedData,
  //         selectedOptions: selectedOptionsArray,
  //         type: "MSQ",
  //         buttonClass: styles.AnswerdBtnCls,
  //       };
  //     }
  //   } else if ([5, 6].includes(qTypeId)) {
  //     // NAT
  //     if (natValue && natValue.trim() !== "") {
  //       savedData = {
  //         ...savedData,
  //         natAnswer: natValue,
  //         type: "NAT",
  //         buttonClass: styles.AnswerdBtnCls,
  //       };
  //     }
  //   }
  
  //   // Save to userAnswers
  //   setUserAnswers(prev => {
  //     const updated = {
  //       ...prev,
  //       [qid]: savedData,
  //     };
  //     console.log("Saved Answer:", updated[qid]);
  //     return updated;
  //   });
  
  //   // Go to next question
  //   const totalQuestions = section?.questions?.length || 0;
  //   if (activeQuestionIndex < totalQuestions - 1) {
  //     setActiveQuestionIndex(prev => prev + 1);
  //   } else {
  //     console.log("Last question in section reached.");
  //   }
  // };
  const handleMarkedForReview = () => {
    const subject = testData?.subjects?.find(sub => sub.SubjectName === activeSubject);
    const section = subject?.sections?.find(sec => sec.SectionName === activeSection);
    const question = section?.questions?.[activeQuestionIndex];
    if (!question) return;
  
    const qid = question.question_id;
    const subjectId = subject.subjectId;
    const sectionId = section.sectionId;
    const qTypeId = question?.questionType?.quesionTypeId;
  
    // Default class: Not Answered
    let buttonClass = styles.MarkedForReview;
  
    // Determine class and build answer object based on question type
    let savedData = {
      subjectId,
      sectionId,
      questionId: qid,
      type: "",
      buttonClass,
    };
  
    if ([1, 2].includes(qTypeId)) {
      // MCQ
      if (selectedOption?.option_id) {
        savedData = {
          ...savedData,
          optionId: selectedOption.option_id,
          optionIndex: selectedOption.option_index,
          type: "MCQ",
          buttonClass: styles.AnsMarkedForReview,
        };
      }
    } else if ([3, 4].includes(qTypeId)) {
      // MSQ
      if (selectedOptionsArray && selectedOptionsArray.length > 0) {
        savedData = {
          ...savedData,
          selectedOptions: selectedOptionsArray,
          type: "MSQ",
          buttonClass: styles.AnsMarkedForReview,
        };
      }
    } else if ([5, 6].includes(qTypeId)) {
      // NAT
      if (natValue && natValue.trim() !== "") {
        savedData = {
          ...savedData,
          natAnswer: natValue,
          type: "NAT",
          buttonClass: styles.AnsMarkedForReview,
        };
      }
    }
  
    // Save to userAnswers
    setUserAnswers(prev => {
      const updated = {
        ...prev,
        [qid]: savedData,
      };
      console.log("Saved Answer:", updated[qid]);
      return updated;
    });
  
    // Go to next question
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
        // Go to next subject
        const currentSubjectIndex = testData.subjects.findIndex(sub => sub.SubjectName === activeSubject);
        const nextSubject = testData.subjects[currentSubjectIndex + 1];
  
        if (nextSubject) {
          setActiveSubject(nextSubject.SubjectName);
          setActiveSection(nextSubject.sections?.[0]?.SectionName || null);
          setActiveQuestionIndex(0);
        } else {
           // All subjects and sections completed, reset to first subject
        console.log(" All subjects and sections completed!");
        setActiveSubject(testData.subjects[0]?.SubjectName);  // Reset to first subject
        setActiveSection(testData.subjects[0]?.sections?.[0]?.SectionName || null); // Reset to first section
        setActiveQuestionIndex(0);  // Reset to first question
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

    // Clear answer from userAnswers state
    setUserAnswers(prev => {
      const updated = { ...prev };
      delete updated[qid]; // Remove answer for the current question
      console.log("Cleared Answer:", qid);
      return updated;
    });

    // Reset selected options or values
    // Clear selected option, selectedOptionsArray, and natValue
    setSelectedOption(null); // Assuming you are managing this state
    setSelectedOptionsArray([]); // Reset MSQ answers
    setNatValue(""); // Reset NAT answer
  };
  const handlePrevious = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex(prev => prev - 1);
    } else {
      // Optionally handle the case when there's no previous question (e.g., disable the button or show a message).
      console.log("This is the first question.");
    }
  };
  return (
    <div className={styles.QuestionNavigationButtonsMainContainer}>
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
      <div>
        <button className={styles.submitNavigationBtn}>Submit</button>
      </div>
    </div>
  );
}
