// WrappedExamSummaryRoute.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import OTSExamSummary from "./OTSExamSummary";
import { QuestionStatusProvider } from "../../../ContextFolder/CountsContext";

const WrappedExamSummaryRoute = () => {
  const location = useLocation();
  const {
    testData,
    userAnswers,
    isSubmitClicked,
    isAutoSubmitted,
    realTestId,
    realStudentId,
  } = location.state || {};

  return (
    <QuestionStatusProvider
      testData={testData}
      activeSubject={testData?.subjects?.[0]} // Or fetch active from state if available
      activeSection={
        testData?.subjects?.[0]?.sections?.[0] || null
      }
      userAnswers={userAnswers}
    >
      <OTSExamSummary
        isSubmitClicked={isSubmitClicked}
        isAutoSubmitted={isAutoSubmitted}
        testData={testData}
        userAnswers={userAnswers}
        realTestId={realTestId}
        realStudentId={realStudentId}
      />
    </QuestionStatusProvider>
  );
};

export default WrappedExamSummaryRoute;
