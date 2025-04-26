import React,{useState,useEffect } from "react";
import {  useParams,useNavigate } from "react-router-dom";
import { decryptBatch } from "../../../utils/cryptoUtils.jsx";
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";

const ViewReportPage = () => {
    const navigate = useNavigate();
    const { testId, studentId } = useParams();
    const [realTestId, setRealTestId] = useState("");
    const [realStudentId, setRealStudentId] = useState("");
  
    useEffect(() => {
      const token = sessionStorage.getItem("navigationToken");
      if (!token) {
        navigate("/Error");
        return;
      }
  
      const decryptAndFetchTestPaper = async () => {
        try {
          let testIdValue = "";
          let studentIdValue = "";
  
          if (studentId) {
            const [decryptedTestId, decryptedStudentId] = await decryptBatch([
              decodeURIComponent(testId),
              decodeURIComponent(studentId),
            ]);
            testIdValue = decryptedTestId;
            studentIdValue = decryptedStudentId;
          } else {
            [testIdValue] = await decryptBatch([decodeURIComponent(testId)]);
          }
  
          setRealTestId(testIdValue);
          setRealStudentId(studentIdValue);
        } catch (error) {
          console.error("Error during decryption or fetch:", error);
          navigate("/Error");
        }
      };
  
      decryptAndFetchTestPaper();
    }, [testId, studentId, navigate]);
    const handleViewReport = () => {
        // localStorage.removeItem("examSummaryEntered");
        localStorage.removeItem("examSubmitted");
    
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
    <div className={styles.submissionPopup}>
      <h2>Your Test has been Submitted!</h2>
      <p>You can now view your report.</p>
      <button className={styles.viewReportBtn} onClick={handleViewReport}>
        View Report
      </button>
    </div>
  );
};

export default ViewReportPage;
