import React, { useState,useEffect } from "react";
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";
import { useQuestionStatus } from "../../../ContextFolder/CountsContext.jsx";
import { BASE_URL } from '../../../config/apiConfig.js';

const ExamSummaryComponent = ({
  // userAnswers,
  // testData,
  onCancelSubmit,
  realTestId,
  realStudentId,
}) => {
  const [showSubmittedPopup, setShowSubmittedPopup] = useState(false);
  const {
    answeredCount,
    answeredAndMarkedForReviewCount,
    markedForReviewCount,
    notAnsweredCount,
    notVisitedCount,
    visitedCount,
    totalQuestionsInTest,
  } = useQuestionStatus();

  // const [courseCreationId, setCourseCreationId] = useState([]);

  // useEffect(() => {
  //   const fetchCourseId = async () => {
  //     try {
  //       const response = await fetch(
  //         `${BASE_URL}/OTSExamSummary/OTSTestData/${realTestId}`
  //       );

  //       if (!response.ok) {
  //         throw new Error("Failed to fetch test details");
  //       }

  //       const data = await response.json();

  //       setCourseCreationId(data.testDetails);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };

  //   if (realTestId) {
  //     fetchCourseId();
  //   }
  // }, [realTestId]);



  // const handleConfirmSubmit = async () => {
  //   try {
  //     setShowSubmittedPopup(true);
  
  //     const postData = {
  //       studentId: realStudentId,
  //       courseCreationId: courseCreationId,
  //       test_creation_table_id: realTestId,
  //       test_status: "Completed",
  //       connection_status: "Disconnected",
  //     };
  
  //     console.log("Post data for updating status:", postData);
  
  //     const updateResponse = await fetch(
  //       `${BASE_URL}/OTSExamSummary/UpdateTestAttemptStatus`,
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(postData),
  //       }
  //     );
  
  //     if (!updateResponse.ok) {
  //       throw new Error(`Status update failed: ${updateResponse.statusText}`);
  //     }
  
  //     const updateResult = await updateResponse.json();
  //     console.log("Update result:", updateResult);
  
  //     if (updateResult.message && updateResult.message.includes("No records found")) {
  //       alert("Alert: Your test attempt status could not be updated in the database.");
  //       return;
  //     }
  
  //     console.log("Test status updated successfully");
  
  //     // Fetching exam summary and student marks
  //     console.log("Fetching data from API...");
  //     const apiEndpoints = [
  //       `${BASE_URL}/OTSExamSummary/FetchExamSummaryCounts/${realTestId}/${realStudentId}`,
  //       `${BASE_URL}/OTSExamSummary/FetchStudentMarks/${realTestId}/${realStudentId}`,
  //     ];
  
  //     const responses = await Promise.allSettled(
  //       apiEndpoints.map((endpoint) =>
  //         fetch(endpoint).then(async (response) => {
  //           if (!response.ok)
  //             throw new Error(`HTTP ${response.status} - ${await response.text()}`);
  //           return response.json();
  //         })
  //       )
  //     );
  
  //     const [examSummary, studentMarks] = responses;
  
  //     // Detailed logging for better debugging
  //     console.log("Exam Summary Status:", examSummary.status);
  //     console.log("Student Marks Status:", studentMarks.status);
  
  //     if (examSummary.status === "rejected") {
  //       console.error("Exam Summary Error:", examSummary.reason);
  //       alert("Error: Failed to fetch exam summary. Please try again.");
  //       return;
  //     }
  
  //     if (studentMarks.status === "rejected") {
  //       console.error("Student Marks Error:", studentMarks.reason);
  //       alert("Error: Failed to fetch student marks. Please try again.");
  //       return;
  //     }
  
  //     console.log("Exam Summary:", examSummary.value);
  //     console.log("Student Marks:", studentMarks.value);
  //   } catch (error) {
  //     console.error("Unexpected error during submission process:", error);
  //     alert("An unexpected error occurred. Please try again.");
  //   }
  // };

  
  const [courseCreationId, setCourseCreationId] = useState([]);

  useEffect(() => {
    const fetchCourseId = async () => {
      try {
        const response = await fetch(
       `   ${BASE_URL}/OTSExamSummary/OTSTestData/${realTestId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch test details");
        }

        const data = await response.json();
console.log("DATAAAAAAAA",data)
if (response.ok) {
  setCourseCreationId(data.course_creation_id); // Only storing the course_creation_id
} else {
  console.error("Failed to fetch:", data.message);
}
      } catch (error) {
        console.log(error);
      }
    };

    if (realTestId) {
      fetchCourseId();
    }
  }, [realTestId]);

console.log("courseCreationId",courseCreationId)

  const handleConfirmSubmit = async () => {
    console.log("realStudentId,courseCreationId,realTestId,",realStudentId,courseCreationId,realTestId)
    try {
      setShowSubmittedPopup(true);

      const postData = {
        studentId: realStudentId,
        courseCreationId: courseCreationId,
        test_creation_table_id: realTestId,
        test_status: "completed",
        connection_status: "disconnected",
      };

      console.log("Post data for updating status:", postData);

      const updateResponse = await fetch(`${BASE_URL}/OTSExamSummary/UpdateTestAttemptStatus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      if (!updateResponse.ok) {
        const errorMessage = await updateResponse.text();
        console.error("Error details:", errorMessage);
        throw new Error('Status update failed: ' + errorMessage);

      }

      const updateResult = await updateResponse.json();
      console.log("Update result:", updateResult);

      if (updateResult.message?.includes("No matching")) {
        alert("Alert: Your test attempt status could not be updated in the database.");
        return;
      }

      console.log("Test status updated successfully");

      const [summaryRes, marksRes] = await Promise.allSettled([
        fetch(`${BASE_URL}/OTSExamSummary/FetchExamSummaryCounts/${realTestId}/${realStudentId}`),
        fetch(`${BASE_URL}/OTSExamSummary/FetchStudentMarks/${realTestId}/${realStudentId}`),
      ]);

      const examSummary =
        summaryRes.status === "fulfilled" ? await summaryRes.value.json() : null;
      const studentMarks =
        marksRes.status === "fulfilled" ? await marksRes.value.json() : null;

      if (!examSummary) {
        alert("Failed to fetch exam summary.");
        return;
      }

      if (!studentMarks) {
        alert("Failed to fetch student marks.");
        return;
      }

      console.log("Exam Summary:", examSummary);
      console.log("Student Marks:", studentMarks);
    } catch (error) {
      console.error("Unexpected error during submission process:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  const handleViewReport = () => {
    // Pass 'results' section via URL param (for immediate effect)
    const destinationURL = `/StudentDashboard/6?section=results`;

    if (window.opener) {
      // Set location of opener (parent window)
      window.opener.location.href = destinationURL;

      // Optional: Add safety net token too
      window.opener.localStorage.setItem("activeSection", "results");

      // Close current popup
      setTimeout(() => {
        window.open("", "_self").close();
      }, 50);
    } else {
      // Fallback if not a popup
      localStorage.setItem("activeSection", "results");
      window.location.href = destinationURL;
    }
  };

  return (
    <div className={styles.examSummaryContainer}>
      {!showSubmittedPopup ? (
        <>
          <h2>Exam Summary</h2>
          <table className={styles.summaryTable}>
            <thead>
              <tr>
                <th>Total Questions</th>
                <th>Answered</th>
                <th>Answered & Marked for Review</th>
                <th>Marked for Review</th>
                <th>Not Answered</th>
                <th>Visited</th>
                <th>Not Visited</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{totalQuestionsInTest}</td>
                <td>{answeredCount}</td>
                <td>{answeredAndMarkedForReviewCount}</td>
                <td>{markedForReviewCount}</td>
                <td>{notAnsweredCount}</td>
                <td>{visitedCount}</td>
                <td>{notVisitedCount}</td>
              </tr>
            </tbody>
          </table>

          <div className={styles.confirmationText}>
            Are you sure you want to submit? No changes will be allowed after
            submission.
          </div>

          <div className={styles.buttonGroup}>
            <button className={styles.yesBtn} onClick={handleConfirmSubmit}>
              Yes
            </button>
            <button className={styles.noBtn} onClick={onCancelSubmit}>
              No
            </button>
          </div>
        </>
      ) : (
        <div className={styles.submissionPopup}>
          <h2>Your Test has been Submitted!</h2>
          <p>You can now view your report.</p>
          <button className={styles.viewReportBtn} onClick={handleViewReport}>
            View Report
          </button>
        </div>
      )}
    </div>
  );
};

export default ExamSummaryComponent;
