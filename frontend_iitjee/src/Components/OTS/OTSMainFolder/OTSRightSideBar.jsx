import React from 'react';
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";
import studentImg from "../../../assets/OtsCourseCardImages/ots1.png";

export default function OTSRightSideBar({
  testData,
  activeSubject,
  activeSection,
  activeQuestionIndex,
  setActiveQuestionIndex
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

  // ✅ Handle Question Click
  const handleQuestionClick = (index) => {
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
            <p className={styles.fntSize}>Answered</p>
          </div>
          <div className={styles.OTSBehaviourBtnsClass}>
            <p className={`${styles.behaviorBtnImg} ${styles.NotAnsweredBehaviourBtns}`} id='NotAnsweredBehaviourBtns'></p>
            <p className={styles.fntSize}>Not Answered</p>
          </div>
          <div className={styles.OTSBehaviourBtnsClass}>
            <p className={`${styles.behaviorBtnImg} ${styles.NotVisitedBehaviourBtns}`} id="NotVisitedBehaviourBtns"></p>
            <p className={styles.fntSize}>Not Visited</p>
          </div>
          <div className={styles.OTSBehaviourBtnsClass}>
            <p className={`${styles.behaviorBtnImg} ${styles.MarkedforReviewBehaviourBtns}`} id='MarkedforReviewBehaviourBtns'></p>
            <p className={styles.fntSize}>Marked for Review</p>
          </div>
          <div className={styles.behaviorBtnImgMarkedForReiew}>
            <p className={`${styles.behaviorBtnImg} ${styles.AnsMarkedforReviewBehaviourBtns}`} id='AnsMarkedforReviewBehaviourBtns'></p>
            <p className={styles.fntSize}>Answered & Marked for Review (will be considered for evaluation)</p>
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
          {section?.questions?.map((_, index) => (
            <button
              key={index}
              className={`${styles.OTSQuestionBtn} ${index === activeQuestionIndex ? styles.activeQuestionBtn : ''}`}
              onClick={() => handleQuestionClick(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
