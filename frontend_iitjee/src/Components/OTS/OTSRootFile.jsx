import React, { useEffect, useState,useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { decryptBatch } from "../../utils/cryptoUtils.jsx";
import styles from "../../Styles/OTSCSS/OTSMain.module.css";
import OTSHeader from "./OTSHeaderFolder/OTSHeader.jsx";
import OTSNavbar from "./OTSHeaderFolder/OTSNavbar.jsx";
import OTSMain from "./OTSMainFolder/OTSMain.jsx";
import axios from "axios";
import { BASE_URL } from "../../ConfigFile/ApiConfigURL.js";

export default function OTSRootFile() {
  const { testId, studentId } = useParams();
  const navigate = useNavigate();

  const [realTestId, setRealTestId] = useState("");
  const [realStudentId, setRealStudentId] = useState("");
  const [testPaperData, setTestPaperData] = useState([]);
  const [showCustomPopup, setShowCustomPopup] = useState(false);
  const pressedKeys = useRef(new Set());

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

        //  Move fetchTestPaper logic here
        const response = await axios.get(
          `${BASE_URL}/OTS/QuestionPaper/${testIdValue}`
        );
        setTestPaperData(response.data);
      } catch (error) {
        console.error("Error during decryption or fetch:", error);
        navigate("/Error");
      }
    };

    decryptAndFetchTestPaper();
  }, [testId, studentId, navigate]);

  const testName = testPaperData.TestName;

  useEffect(() => {
    const handleUnload = () => {
      if (realTestId && realStudentId) {
        const url = `${BASE_URL}/OTSExamSummary/DeleteStudentDataWindowClose/${realStudentId}/${realTestId}`;

        // Use navigator.sendBeacon with POST to a wrapper endpoint, or use fetch (less reliable)
        // We'll use fetch here as it's DELETE
        navigator.sendBeacon = navigator.sendBeacon || function () {}; // fallback

        // Use fetch (best effort; may not always complete before unload)
        fetch(url, {
          method: "DELETE",
        })
          .then((res) => {
            console.log("Deletion request sent on window close", res.status);
          })
          .catch((err) => {
            console.error(
              "Error sending deletion request on window close",
              err
            );
          });
      }
    };

    window.addEventListener("unload", handleUnload);

    return () => {
      window.removeEventListener("unload", handleUnload);
    };
  }, [realTestId, realStudentId]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Add pressed key to the set
      pressedKeys.current.add(event.key);

      // Convert Set to string format
      const keyActions = Array.from(pressedKeys.current).join(" + ");

      if (
        keyActions === "Shift + Control" ||
        keyActions === "Control + Shift" ||
        keyActions === "Shift" ||
        keyActions === "Control" ||
        keyActions === "Control" ||
        keyActions === "Shift + Control + S" ||
        keyActions === "Meta" ||
        keyActions === "Shift + Meta" ||
        keyActions === "Meta + Shift"
      ) {
        event.preventDefault(); // Prevents default browser action
      }
      if (keyActions !== null) {
        setShowCustomPopup(true);
      }
    };

    const handleKeyUp = (event) => {
      pressedKeys.current.delete(event.key);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

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
      {showCustomPopup && (
        <>
          <div className={styles.functionKeyActionAlertPopup}></div>
          <div className={styles.functionKeyActionAlertContainer}>
            <p className={styles.FunKeyPtag}>Warning!</p>
            <p className={styles.FunKeyPtag}>
              Pressing any <b>function keys or any other keys</b> are not
              allowed. Press OK to continue.
            </p>
            <button
              className={styles.FunKeyOkBtn}
              onClick={() => setShowCustomPopup(false)}
            >
              OK
            </button>
          </div>
        </>
      )}
    </div>
  );
}
