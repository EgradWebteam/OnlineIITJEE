import React, { useState, useEffect } from "react";
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";
import { useQuestionStatus } from "../../../ContextFolder/CountsContext.jsx";
import { BASE_URL } from "../../../ConfigFile/ApiConfigURL.js";
import { useAlert } from "../../StudentDashboardFilesFolder/StudentDashboardFiles/AlertContext.jsx";
const ExamSummaryComponent = ({

  onCancelSubmit,
  realTestId,
  realStudentId,
  isSubmitClicked,
  isAutoSubmitted,
  setShowExamSummary
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
  const [courseCreationId, setCourseCreationId] = useState([]);
  const { alert } = useAlert();
  
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const enteredSummary = localStorage.getItem("examSummaryEntered") === "true";
      if (enteredSummary) {
        setShowExamSummary(true);
        // e.preventDefault();
        // e.returnValue = ""; // This line triggers the popup
      }
    };
  
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
  
  

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

  const handleConfirmSubmit = async () => {

    try {
      setShowSubmittedPopup(true);
      localStorage.setItem("examSubmitted", "true"); // ✅ Only set when confirmed


      const postData = {
        studentId: realStudentId,
        courseCreationId: courseCreationId,
        test_creation_table_id: realTestId,
        test_status: "completed",
        connection_status: "disconnected",
      };

      // console.log("Post data for updating status:", postData);

      const updateResponse = await fetch(
        `${BASE_URL}/OTSExamSummary/UpdateTestAttemptStatus`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postData),
        }
      );

      if (!updateResponse.ok) {
        const errorMessage = await updateResponse.text();
        console.error("Error details:", errorMessage);
        throw new Error("Status update failed: " + errorMessage);
      }

      const updateResult = await updateResponse.json();
      // console.log("Update result:", updateResult);

      if (updateResult.message?.includes("No matching")) {
       await  alert(
          "Alert: Your test attempt status could not be updated in the database."
        );
        return;
      }

      // console.log("Test status updated successfully");

        // Check for missing IDs (admin/test mode safeguard)
    if (!realTestId || !realStudentId) {
      console.warn("Missing test/student ID, skipping summary and marks fetch.");
      return;
    }

      const [summaryRes, marksRes] = await Promise.allSettled([
        fetch(
          `${BASE_URL}/OTSExamSummary/FetchExamSummaryCounts/${realTestId}/${realStudentId}`
        ),
        fetch(
          `${BASE_URL}/OTSExamSummary/FetchStudentMarks/${realTestId}/${realStudentId}`
        ),
      ]);

      const examSummary =
        summaryRes.status === "fulfilled"
          ? await summaryRes.value.json()
          : null;
      const studentMarks =
        marksRes.status === "fulfilled" ? await marksRes.value.json() : null;

      if (!examSummary) {
        await alert("Failed to fetch exam summary.");
        return;
      }

      if (!studentMarks) {
        await alert("Failed to fetch student marks.");
        return;
      }

      // console.log("Exam Summary:", examSummary);
      // console.log("Student Marks:", studentMarks);
    } catch (error) {
      console.error("Unexpected error during submission process:", error);
      await alert("An unexpected error occurred. Please try again.");
    }
  };

  // const handleViewReport = () => {
  //   localStorage.removeItem("examSummaryEntered");
  //   localStorage.removeItem("examSubmitted");
  //   const localStorageUserId = localStorage.getItem('userId');
  //   // Pass 'results' section via URL param (for immediate effect)
  //   const destinationURL = `/StudentDashboard/${localStorageUserId}?section=results`;

  //   if (window.opener) {
  //     // Set location of opener (parent window)
  //     window.opener.location.href = destinationURL;

  //     // Optional: Add safety net token too
  //     window.opener.localStorage.setItem("activeSection", "results");

  //     // Close current popup
  //     setTimeout(() => {
  //       window.open("", "_self").close();
  //     }, 50);
  //   } else {
  //     // Fallback if not a popup
  //     localStorage.setItem("activeSection", "results");
  //     window.location.href = destinationURL;
  //   }
  // };

  const handleViewReport = () => {
    localStorage.removeItem("examSummaryEntered");
    localStorage.removeItem("examSubmitted");
  
    const localStorageUserId = localStorage.getItem('userId');
    const adminInfo = JSON.parse(localStorage.getItem("adminInfo"));
    const isAdmin = adminInfo?.role === "admin";
  
    if (isAdmin) {
      if (window.opener) {
        window.opener.location.href = "/AdminDashboard";
        setTimeout(() => {
          window.open("", "_self").close();
        }, 50);
      } else {
        window.location.href = "/AdminDashboard";
      }
    } else {
      const destinationURL = `/StudentDashboard/${localStorageUserId}`;
  
      if (window.opener) {
        window.opener.location.href = destinationURL
        window.localStorage.setItem("activeSection", "results");
  
        setTimeout(() => {
          window.open("", "_self").close();
        }, 50);
      } else {
        localStorage.setItem("activeSection", "results");
        window.location.href = destinationURL;
      }
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

          {isAutoSubmitted ? (
            <div>
              <div className={styles.confirmationText}>
                <h2>Your Time is up!</h2>
                <h3>Your test is automatically submitted successfully.</h3>
              
              </div>

              <div className={styles.buttonGroup}>
                <button className={styles.yesBtn} onClick={handleConfirmSubmit}>
                  Okay
                </button>
              </div>
            </div>
          ) : (
            isSubmitClicked && (
              <div>
                <div className={styles.confirmationText}>
                  Are you sure you want to submit? No changes will be allowed
                  after submission.
                </div>

                <div className={styles.buttonGroup}>
                  <button
                    className={styles.yesBtn}
                    onClick={handleConfirmSubmit}
                  >
                    Yes
                  </button>
                  <button className={styles.noBtn} onClick={onCancelSubmit}>
                    No
                  </button>
                </div>
              </div>
            )
          )}
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
