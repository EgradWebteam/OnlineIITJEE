import React, { useEffect, useRef } from "react";
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";
import { FaChevronRight } from "react-icons/fa";
import { useStudent } from "../../../ContextFolder/StudentContext.jsx";
import defaultImage from "../../../assets/OTSTestInterfaceImages/StudentImage.png";
import adminCapImg from '../../../assets/logoCap.jpeg';
export default function OTSRightSideBar({
  testData,
  activeSubject,
  activeSection,
  activeQuestionIndex,
  setActiveQuestionIndex,
  userAnswers,
  setUserAnswers,
  autoSaveNATIfNeeded,
  showSidebar,
  setShowSidebar,
}) {
  const { studentData } = useStudent();
  if (!testData || !Array.isArray(testData.subjects)) return null;

  // Find active subject
  const subject = testData.subjects.find(
    (subj) => subj.SubjectName === activeSubject
  );

  // Get active section from that subject
  const section = subject?.sections?.find(
    (sec) => sec.SectionName === activeSection
  );

  const userData = studentData?.userDetails;
  const studentProfile = userData?.uploaded_photo;
  const studentName = userData?.candidate_name;

    
    //  Read adminInfo from localStorage
  const adminInfo = JSON.parse(localStorage.getItem("adminInfo"));
  const isAdmin = adminInfo?.role === "admin";

   
  useEffect(() => {
    if (!testData || !Array.isArray(testData.subjects)) return;

    const subject = testData.subjects.find(
      (subj) => subj.SubjectName === activeSubject
    );
    const section = subject?.sections?.find(
      (sec) => sec.SectionName === activeSection
    );
    const firstQuestion = section?.questions?.[0];

    if (firstQuestion && !userAnswers?.[firstQuestion.question_id]) {
      setUserAnswers((prev) => ({
        ...prev,
        [firstQuestion.question_id]: {
          subjectId: subject.subjectId,
          sectionId: section.sectionId,
          questionId: firstQuestion.question_id,
          buttonClass: styles.NotAnsweredBtnCls,
          type: "", // no answer yet
        },
      }));
    }
  }, [testData, activeSubject, activeSection, userAnswers]);

  // Calculate counts for each category (Answered, Not Answered, Not Visited, Marked for Review, etc.)
  const answeredCount =
    section?.questions?.filter((q) => {
      const savedAnswer = userAnswers?.[q.question_id];
      return (
        savedAnswer?.buttonClass === styles.AnswerdBtnCls ||
        savedAnswer?.buttonClass === styles.AnsMarkedforReviewBehaviourBtns
      );
    }).length || 0;

  const notAnsweredCount =
    section?.questions?.filter((q) => {
      const savedAnswer = userAnswers?.[q.question_id];
      return savedAnswer?.buttonClass === styles.NotAnsweredBtnCls;
    }).length || 0;

  const notVisitedCount =
    section?.questions?.filter((q) => {
      const savedAnswer = userAnswers?.[q.question_id];
      return !savedAnswer; // No saved answer means it has not been visited
    }).length || 0;

  const markedForReviewCount =
    section?.questions?.filter((q) => {
      const savedAnswer = userAnswers?.[q.question_id];
      return savedAnswer?.buttonClass === styles.MarkedForReview;
    }).length || 0;

  const answeredAndMarkedForReviewCount =
    section?.questions?.filter((q) => {
      const savedAnswer = userAnswers?.[q.question_id];
      return savedAnswer?.buttonClass === styles.AnsMarkedForReview;
    }).length || 0;

    const handleQuestionClick = async (index) => {
      await autoSaveNATIfNeeded(); // Make sure current NAT is saved/cleared before switching
    
      const subject = testData?.subjects?.find((sub) => sub.SubjectName === activeSubject);
      const section = subject?.sections?.find((sec) => sec.SectionName === activeSection);
      const question = section?.questions?.[index];
      if (!question) return;
    
      const existing = userAnswers?.[question.question_id];
    
      // Only apply NotAnsweredBtnCls if this question hasn't been touched
      if (!existing) {
        setUserAnswers((prev) => ({
          ...prev,
          [question.question_id]: {
            subjectId: subject.subjectId,
            sectionId: section.sectionId,
            questionId: question.question_id,
            buttonClass: styles.NotAnsweredBtnCls,
            type: "", // no answer yet
          },
        }));
      }
    
      setActiveQuestionIndex(index);
    };
    
    
  // const [showSidebar, setShowSidebar] = useState(true);
  // Toggle Sidebar visibility when button is clicked
  const toggleSidebar = () => {
    setShowSidebar((prev) => !prev); // Toggle state
  };

  const questionsContainerRef = useRef(null);

  return (
    <div className={styles.OTSRightSideBarMainContainer}>
      {/* Student Profile */}
      <div className={styles.StudentProfileHolderOTS}>
        <div className={styles.profileImage}>
          {isAdmin ? (
            // Admin Profile
            <img
              src={adminCapImg}
              alt="Admin Cap"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultImage;
              }}
            />
          ) : (
            //  Student Profile
            <img
              src={studentProfile || defaultImage}
              alt="Student Profile"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultImage;
              }}
            />
          )}
        </div>
        <div className={styles.StdNameForProfile}>
        <p>{isAdmin ? "Admin" : studentName}</p></div>
      </div>

      <div
        className={`${styles.rightChevronBtn} ${
          !showSidebar ? styles.rightChevronBtnFortransform : ""
        }`}
      >
        <button onClick={toggleSidebar}>
          <FaChevronRight />
        </button>
      </div>
      <div className={showSidebar ? "" : styles.hiddenSidebar}>
        {/* Question Behavior Legends */}
        <div className={styles.OTSRightSideBarSubContainer}>
          <div className={styles.OTSBehaviourCountBtnsContainer}>
            <div className={styles.OTSBehaviourBtnsClass}>
              <p
                className={`${styles.behaviorBtnImg} ${styles.AnsweredBehaviourBtns}`}
              >
                <span>{answeredCount}</span>
              </p>
              <p className={styles.fntSize}>Answered </p>
            </div>
            <div className={styles.OTSBehaviourBtnsClass}>
              <p
                className={`${styles.behaviorBtnImg} ${styles.NotAnsweredBehaviourBtns}`}
              >
                <span>{notAnsweredCount}</span>
              </p>
              <p className={styles.fntSize}>Not Answered </p>
            </div>
            <div className={styles.OTSBehaviourBtnsClass}>
              <p
                className={`${styles.behaviorBtnImg} ${styles.NotVisitedBehaviourBtns}`}
              >
                <span>{notVisitedCount}</span>
              </p>
              <p className={styles.fntSize}>Not Visited </p>
            </div>
            <div className={styles.OTSBehaviourBtnsClass}>
              <p
                className={`${styles.behaviorBtnImg} ${styles.MarkedforReviewBehaviourBtns}`}
              >
                <span>{markedForReviewCount}</span>
              </p>
              <p className={styles.fntSize}>Marked for Review </p>
            </div>
            <div className={styles.behaviorBtnImgMarkedForReiew}>
              <p
                className={`${styles.behaviorBtnImg} ${styles.AnsMarkedforReviewBehaviourBtns}`}
              >
                <span>{answeredAndMarkedForReviewCount}</span>
              </p>
              <p className={styles.fntSize}>Answered & Marked for Review </p>
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

        {/* <div className={styles.chevRonLeftForMobileRes} onClick={scrollLeft}><FaChevronCircleLeft /></div> */}
        {/* Active Section Questions */}
        <div className={styles.AllQuestionRenderBox}>
          <p className={styles.chooseQuestionInRightSideBar}>
            Choose a Question
          </p>
          <div
            className={styles.QuestionsBtnsConatiner}
            ref={questionsContainerRef}
          >
            {section?.questions?.map((q, index) => {
              const savedAnswer = userAnswers?.[q.question_id];

              // Check if this saved answer belongs to the current section
              const isFromCurrentSection =
                savedAnswer?.sectionId === section?.sectionId;

              // Apply only if it's from current section, else treat as not visited
              const answerClass = isFromCurrentSection
                ? savedAnswer?.buttonClass ||
                  (index === 0
                    ? styles.NotAnsweredBtnCls
                    : styles.NotVisitedBehaviourBtns)
                : index === 0
                ? styles.NotAnsweredBtnCls
                : styles.NotVisitedBehaviourBtns;

              return (
                <button
                  key={index}
                  className={`${styles.OTSQuestionBtn} ${
                    index === activeQuestionIndex
                      ? styles.activeQuestionBtn
                      : ""
                  } ${answerClass}`}
                  onClick={() => handleQuestionClick(index)}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
        {/* <div className={styles.chevRonrightForMobileRes} onClick={scrollRight}><FaChevronCircleRight/></div> */}
      </div>
    </div>
  );
}
