import React, { useEffect } from 'react';
import { useQuestionStatus } from '../../../ContextFolder/CountsContext.jsx';
import { useTimer } from '../../../ContextFolder/TimerContext.jsx';

export default function ExamSummaryCollector({ onDataReady, realStudentId, realTestId, summaryData }) {
  const {
    answeredCount,
    answeredAndMarkedForReviewCount,
    markedForReviewCount,
    notAnsweredCount,
    notVisitedCount,
    visitedCount,
    totalQuestionsInTest,
  } = useQuestionStatus();

  const { timeSpent } = useTimer();

  useEffect(() => {
    // ✅ Update the ref value instead of state
    summaryData.current = {
      realStudentId,
      realTestId,
      answeredCount,
      answeredAndMarkedForReviewCount,
      markedForReviewCount,
      notAnsweredCount,
      notVisitedCount,
      visitedCount,
      totalQuestionsInTest,
      timeSpent,
    };

    // console.log("📊 summaryDataRef:", summaryData.current);

    if (onDataReady) {
      summaryData = summaryData.current
    }
  }, [
    realStudentId,
    realTestId,
    answeredCount,
    answeredAndMarkedForReviewCount,
    markedForReviewCount,
    notAnsweredCount,
    notVisitedCount,
    visitedCount,
    totalQuestionsInTest,
    timeSpent,
    onDataReady,
  ]);

  return null;
}
