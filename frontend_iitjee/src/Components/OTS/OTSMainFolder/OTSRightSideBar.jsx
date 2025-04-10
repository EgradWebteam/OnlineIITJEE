import React from 'react';
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";
import studentImg from "../../../assets/OtsCourseCardImages/iit_jee1.png";

export default function OTSRightSideBar({
  testData,
  activeSubject,
  activeSection,
  activeQuestionIndex,
  setActiveQuestionIndex,
  userAnswers,
  setUserAnswers
}) {

  if (!testData || !Array.isArray(testData.subjects)) return null;

  // Find active subject
  const subject = testData.subjects.find(
    (subj) => subj.SubjectName === activeSubject
  );

  // Get active section from that subject
  const section = subject?.sections?.find(
    (sec) => sec.SectionName === activeSection
  );
 // Calculate counts for each category (Answered, Not Answered, Not Visited, Marked for Review, etc.)
 const answeredCount = section?.questions?.filter(q => {
  const savedAnswer = userAnswers?.[q.question_id];
  return savedAnswer?.buttonClass === styles.AnswerdBtnCls || savedAnswer?.buttonClass === styles.AnsMarkedforReviewBehaviourBtns;
}).length || 0;

const notAnsweredCount = section?.questions?.filter(q => {
  const savedAnswer = userAnswers?.[q.question_id];
  return savedAnswer?.buttonClass === styles.NotAnsweredBtnCls;
}).length || 0;

const notVisitedCount = section?.questions?.filter(q => {
  const savedAnswer = userAnswers?.[q.question_id];
  return !savedAnswer;  // No saved answer means it has not been visited
}).length || 0;

const markedForReviewCount = section?.questions?.filter(q => {
  const savedAnswer = userAnswers?.[q.question_id];
  return savedAnswer?.buttonClass === styles.MarkedForReview;
}).length || 0;

const answeredAndMarkedForReviewCount = section?.questions?.filter(q => {
  const savedAnswer = userAnswers?.[q.question_id];
  return savedAnswer?.buttonClass === styles.AnsMarkedforReviewBehaviourBtns;
}).length || 0;
  const handleQuestionClick = (index) => {
    const question = section?.questions?.[index];
    if (!question) return;
  
    const existing = userAnswers?.[question.question_id];
  
    // Only apply NotAnsweredBtnCls if this question hasn't been touched
    if (!existing) {
      setUserAnswers(prev => ({
        ...prev,
        [question.question_id]: {
          subjectId: subject.subjectId,
          sectionId: section.sectionId,
          questionId: question.question_id,
          buttonClass: styles.NotAnsweredBtnCls,
          type: "", // no answer yet
        }
      }));
    }
  
    setActiveQuestionIndex(index);
  };
  
  

  
  return (
    <div className={styles.OTSRightSideBarMainContainer}>

      {/* Student Profile */}
      <div className={styles.StudentProfileHolderOTS}>
        <div className={styles.profileImage}>
          <img src={studentImg} alt='studentimg' />
        </div>
        <p>Student</p>
      </div>

      {/* Question Behavior Legends */}
      <div className={styles.OTSRightSideBarSubContainer}>
        <div className={styles.OTSBehaviourCountBtnsContainer}>
        <div className={styles.OTSBehaviourBtnsClass}>
            <p className={`${styles.behaviorBtnImg} ${styles.AnsweredBehaviourBtns}`}></p>
            <p className={styles.fntSize}>Answered ({answeredCount})</p>
          </div>
          <div className={styles.OTSBehaviourBtnsClass}>
            <p className={`${styles.behaviorBtnImg} ${styles.NotAnsweredBehaviourBtns}`} id='NotAnsweredBehaviourBtns'></p>
            <p className={styles.fntSize}>Not Answered ({notAnsweredCount})</p>
          </div>
          <div className={styles.OTSBehaviourBtnsClass}>
            <p className={`${styles.behaviorBtnImg} ${styles.NotVisitedBehaviourBtns}`} id="NotVisitedBehaviourBtns"></p>
            <p className={styles.fntSize}>Not Visited ({notVisitedCount})</p>
          </div>
          <div className={styles.OTSBehaviourBtnsClass}>
            <p className={`${styles.behaviorBtnImg} ${styles.MarkedforReviewBehaviourBtns}`} id='MarkedforReviewBehaviourBtns'></p>
            <p className={styles.fntSize}>Marked for Review ({markedForReviewCount})</p>
          </div>
          <div className={styles.behaviorBtnImgMarkedForReiew}>
            <p className={`${styles.behaviorBtnImg} ${styles.AnsMarkedforReviewBehaviourBtns}`} id='AnsMarkedforReviewBehaviourBtns'></p>
            <p className={styles.fntSize}>Answered & Marked for Review ({answeredAndMarkedForReviewCount})</p>
          </div>
        </div>
      </div>

      {/*  Subject and Section Name */}
      <div className={styles.SectionsAndSubjectDiv}>
        {subject && (
          <>
            <p className={styles.SubjectHeading}>{subject.SubjectName}</p>
            <span className={styles.symbolGap}>-</span>
            {section && (
              <p className={styles.SectionHeading}>{section.SectionName}</p>
            )}
          </>
        )}
      </div>

      {/* Active Section Questions */}
      <div className={styles.AllQuestionRenderBox}>
        <p>Choose a Question</p>
        <div className={styles.QuestionsBtnsConatiner}>
          {section?.questions?.map((q, index) => {
            const savedAnswer = userAnswers?.[q.question_id];

            // Check if this saved answer belongs to the current section
            const isFromCurrentSection = savedAnswer?.sectionId === section?.sectionId;

            // Apply only if it's from current section, else treat as not visited
            const answerClass = isFromCurrentSection
              ? savedAnswer?.buttonClass || (index === 0 ? styles.NotAnsweredBtnCls : styles.NotVisitedBehaviourBtns)
              : (index === 0 ? styles.NotAnsweredBtnCls : styles.NotVisitedBehaviourBtns);

            return (
              <button
                key={index}
                className={`${styles.OTSQuestionBtn} ${index === activeQuestionIndex ? styles.activeQuestionBtn : ''} ${answerClass}`}
                onClick={() => handleQuestionClick(index)}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
