

import React, { createContext, useContext, useEffect, useState } from "react";
import styles from "../Styles/OTSCSS/OTSMain.module.css";

const QuestionStatusContext = createContext();

export const useQuestionStatus = () => useContext(QuestionStatusContext);

export const QuestionStatusProvider = ({
  testData,
  activeSubject,
  activeSection,
  userAnswers,
  children,
}) => {
  const [statusCounts, setStatusCounts] = useState({
    answeredCount: 0,
    answeredAndMarkedForReviewCount: 0,
    markedForReviewCount: 0,
    notAnsweredCount: 0,
    notVisitedCount: 0,
    visitedCount: 0,
    totalQuestionsInTest: 0,
  });

  useEffect(() => {
    if (!testData || !Array.isArray(testData.subjects)) return;

    let totalQuestionsInTest = 0;
    let answered = 0;
    let answeredAndMarkedForReview = 0;
    let markedForReview = 0;
    let notAnswered = 0;
    let visited = 0;
    let notVisited = 0;

    testData.subjects.forEach((subject) => {
      subject.sections.forEach((section) => {
        section.questions.forEach((question) => {
          totalQuestionsInTest++;
          const qid = question.question_id;
          const answer = userAnswers[qid];

          if (answer) {
            const cls = answer.buttonClass;

            if (cls === styles.AnswerdBtnCls) {
              answered++;
              visited++;
            } else if (cls === styles.MarkedForReview) {
              markedForReview++;
              visited++;
            } else if (cls === styles.AnsMarkedForReview) {
              answeredAndMarkedForReview++;
              visited++;
            } else if (cls === styles.NotAnsweredBtnCls) {
              notAnswered++;
              visited++;
            }
          } else {
            notVisited++;
          }
        });
      });
    });

    setStatusCounts({
      answeredCount: answered,
      answeredAndMarkedForReviewCount: answeredAndMarkedForReview,
      markedForReviewCount: markedForReview,
      notAnsweredCount: notAnswered,
      notVisitedCount: notVisited,
      visitedCount: visited,
      totalQuestionsInTest,
    });
  }, [testData, userAnswers]);

  return (
    <QuestionStatusContext.Provider value={statusCounts}>
      {children}
    </QuestionStatusContext.Provider>
  );
};
