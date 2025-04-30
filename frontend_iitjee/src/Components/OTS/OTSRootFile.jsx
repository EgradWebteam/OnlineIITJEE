import React, { useEffect, useState,useRef,useCallback } from "react";
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

  //WINDOW CLOSE DATA DELETE CODE START
  // useEffect(() => {
  //   const handleUnload = () => {
  //     if (realTestId && realStudentId) {
  //       const url = `${BASE_URL}/OTSExamSummary/DeleteStudentDataWindowClose/${realStudentId}/${realTestId}`;

  //       // Use navigator.sendBeacon with POST to a wrapper endpoint, or use fetch (less reliable)
  //       // We'll use fetch here as it's DELETE
  //       navigator.sendBeacon = navigator.sendBeacon || function () {}; // fallback

  //       // Use fetch (best effort; may not always complete before unload)
  //       fetch(url, {
  //         method: "DELETE",
  //       })
  //         .then((res) => {
  //           //console.log("Deletion request sent on window close", res.status);
  //         })
  //         .catch((err) => {
  //           console.error(
  //             "Error sending deletion request on window close",
  //             err
  //           );
  //         });
  //     }
  //   };

  //   window.addEventListener("unload", handleUnload);

  //   return () => {
  //     window.removeEventListener("unload", handleUnload);
  //   };
  // }, [realTestId, realStudentId]);

      const handleBeforeUnload = useCallback(
          async (event) => {
      
      
            try {
              await fetch(`${BASE_URL}/ResumeTest/updateResumeTest/${realStudentId}/${realTestId}`, {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  studentId: realStudentId, // User ID
                  testCreationTableId: realTestId, // Test ID
                }),
              });
              console.log(
                "User data deleted successfully before closing the window."
              );
            } catch (error) {
              console.error("Error deleting user data:", error);
            }
           
      
            // Once deletion is successful, remove the 'beforeunload' listener
            window.removeEventListener("beforeunload", preventUnload);
        
         
          },
          [realStudentId,realTestId]
        );
  
        useEffect(() => {
          window.addEventListener("beforeunload", handleBeforeUnload);
          return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
          };
        }, [handleBeforeUnload]);
  //WINDOW CLOSE DATA DELETE CODE START


  //KEYBOARD KEYS DISABLE ALERT CODE START
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
  //KEYBOARD KEYS DISABLE ALERT CODE END
  

  //TERMINATION PAGE CODE START
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isMetaPressed, setIsMetaPressed] = useState(false);
  const [warningMessage,setWarningMessage] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const handleKeyDown = (event) => {
    if (event.key === "Shift") {
      event.preventDefault();
      setIsShiftPressed(true);
    }
    if (event.key === "Meta" || event.key === "Win") {
      event.preventDefault();
      setIsMetaPressed(true);
    }
    if (event.key === "s" && isShiftPressed && isMetaPressed) {
      event.preventDefault();
      window.history.back();
      window.close();
    }

    if (isShiftPressed && isMetaPressed) {
      event.preventDefault();
    }
  };

  const handleKeyUp = (event) => {
    if (event.key === "Shift") {
      event.preventDefault();
      setIsShiftPressed(false);
    }
    if (event.key === "Meta" || event.key === "Win") {
      event.preventDefault();
      setIsMetaPressed(false);
    }
  };


  const handleVisibilityChange = () => {
    if (document.hidden) {
      // setWarningMessage(true)
    } else {
      setWarningMessage(true)
      // Set a timeout to hide the warning message after 1 minute
    setTimeout(() => {
      setWarningMessage(false);
    }, 10000); // 60,000 milliseconds = 1 minute
    }
  };
  const handleBlur = () => {
    //("Window is not focused");
    setViolationCount((prevCount) => {
      const newCount = prevCount + 1;

      if (newCount < 4) {
 
      } else {
        navigate("/OTSTerminationPage");
        localStorage.removeItem("popupWindowURL1");
        localStorage.removeItem("popupWindowURL2");
        localStorage.removeItem("popupWindowURL3");
      }

      return newCount;
    });

  };

  useEffect(() => {
    if ("hidden" in document) {
      document.addEventListener("visibilitychange", handleVisibilityChange);


      window.addEventListener("blur", handleBlur);

      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keyup", handleKeyUp);
    } else {
      //console.log("Page Visibility API is not supported");
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
   window.removeEventListener("blur", handleBlur);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [isShiftPressed, isMetaPressed]);
  //TERMINATION PAGE  CODE END


  return (
    <div className={styles.OTSRootMainContainer}>
      <div className={styles.OTSPC}>
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
        warningMessage={warningMessage}
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
    </div>
  );
}
