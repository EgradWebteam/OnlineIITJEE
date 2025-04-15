import React, { useState } from 'react';
import styles from '../../../Styles/OTSCSS/OTSMain.module.css';

const ExamSummaryComponent = ({
  userAnswers,
  testData,
  onCancelSubmit,
}) => {
  const [showSubmittedPopup, setShowSubmittedPopup] = useState(false);

  let totalQuestions = 0;
  let answered = 0;
  let answeredAndMarkedForReview = 0;
  let markedForReview = 0;
  let notAnswered = 0;
  let visited = 0;
  let notVisited = 0;
  
  testData.subjects.forEach((subject) => {
    subject.sections.forEach((section) => {
      section.questions.forEach((question) => {
        totalQuestions++;
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
  
  const handleConfirmSubmit = () => {
    setShowSubmittedPopup(true);
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
      window.open('', '_self').close();
    }, 50);
  } else {
    // Fallback if not a popup
    localStorage.setItem("activeSection", "results");
    window.location.href = destinationURL;
  }
  }

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
                <td>{totalQuestions}</td>
                <td>{answered}</td>
                <td>{answeredAndMarkedForReview}</td>
                <td>{markedForReview}</td>
                <td>{notAnswered}</td>
                <td>{visited}</td>
                <td>{notVisited}</td>
              </tr>
            </tbody>
          </table>

          <div className={styles.confirmationText}>
            Are you sure you want to submit? No changes will be allowed after submission.
          </div>

          <div className={styles.buttonGroup}>
            <button className={styles.yesBtn} onClick={handleConfirmSubmit}>Yes</button>
            <button className={styles.noBtn} onClick={onCancelSubmit}>No</button>
          </div>
        </>
      ) : (
        <div className={styles.submissionPopup}>
          <h2>Your Test has been Submitted!</h2>
          <p>You can now view your report.</p>
          <button
            className={styles.viewReportBtn}
            onClick={handleViewReport}
          >
            View Report
          </button>
        </div>
      )}
    </div>
  );
};

export default ExamSummaryComponent;
