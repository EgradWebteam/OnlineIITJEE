import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { decryptBatch } from "../../utils/cryptoUtils.jsx";
import styles from "../../Styles/OTSCSS/OTSMain.module.css";
import OTSHeader from "./OTSHeaderFolder/OTSHeader.jsx";
import OTSNavbar from "./OTSHeaderFolder/OTSNavbar.jsx";
import OTSMain from "./OTSMainFolder/OTSMain.jsx";
import axios from "axios";
import { BASE_URL } from '../../config/apiConfig.js';

export default function OTSRootFile() {
  const { testId, studentId } = useParams();
  const navigate = useNavigate();

  const [realTestId, setRealTestId] = useState("");
  const [realStudentId, setRealStudentId] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("navigationToken");
    if (!token) {
      navigate("/Error");
      return;
    }

    const decryptParams = async () => {
      try {
        if (studentId) {
          const [decryptedTestId, decryptedStudentId] = await decryptBatch([
            decodeURIComponent(testId),
            decodeURIComponent(studentId),
          ]);
          setRealTestId(decryptedTestId);
          setRealStudentId(decryptedStudentId);
        } else {
          const [decryptedTestId] = await decryptBatch([
            decodeURIComponent(testId),
          ]);
          setRealTestId(decryptedTestId);
        }
      } catch (error) {
        console.error("Decryption failed:", error);
        navigate("/Error");
      }
    };

    decryptParams();
  }, [testId, studentId, navigate]);

  const [testPaperData, setTestPaperData] = useState([]);

  useEffect(() => {
    const fetchTestPaper = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/OTS/QuestionPaper/${realTestId}`
        );
        setTestPaperData(response.data);
      } catch (err) {
        console.error("Error fetching test paper:", err);
      }
    };

    fetchTestPaper();
  }, [realTestId]);

  const testName = testPaperData.TestName;

  useEffect(() => {
    const handleUnload = () => {
      if (realTestId && realStudentId) {
        const url = `${BASE_URL}/OTSExamSummary/DeleteStudentDataWindowClose/${realStudentId}/${realTestId}`;
  
        // Use navigator.sendBeacon with POST to a wrapper endpoint, or use fetch (less reliable)
        // We'll use fetch here as it's DELETE
        navigator.sendBeacon = navigator.sendBeacon || function() {}; // fallback
  
        // Use fetch (best effort; may not always complete before unload)
        fetch(url, {
          method: "DELETE",
        }).then(res => {
          console.log("Deletion request sent on window close", res.status);
        }).catch(err => {
          console.error("Error sending deletion request on window close", err);
        });
      }
    };
  
    window.addEventListener("unload", handleUnload);
  
    return () => {
      window.removeEventListener("unload", handleUnload);
    };
  }, [realTestId, realStudentId]);

  

  return (
    <div className={styles.OTSRootMainContainer}>
      <OTSHeader />
      <OTSNavbar
        realTestId={realTestId}
        testName={testName}
        testData={testPaperData}
      />
      <OTSMain
        testData={testPaperData}
        realStudentId={realStudentId}
        realTestId={realTestId}
      />
    </div>
  );
}
