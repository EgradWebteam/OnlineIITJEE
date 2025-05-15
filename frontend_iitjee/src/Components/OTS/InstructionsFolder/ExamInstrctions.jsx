import React, { useEffect, useState,useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  decryptBatch as decryptDataBatch,
  encryptBatch,
} from "../../../utils/cryptoUtils.jsx";
import { BASE_URL } from "../../../ConfigFile/ApiConfigURL.js";
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";
import { useStudent } from "../../../ContextFolder/StudentContext.jsx";
import OTSHeader from "../OTSHeaderFolder/OTSHeader.jsx";
import defaultImage from "../../../assets/OTSTestInterfaceImages/StudentImage.png";
import LoadingSpinner from '../../../ContextFolder/LoadingSpinner.jsx'
import adminCapImg from '../../../assets/logoCap.jpeg';
import ParentTabClosing from '../ParentTabClosing.jsx'
import TermsAndConditions from "../../GlobalFiles/TermsAndConditions.jsx";
// import DisableKeysAndMouseInteractions from "../../../ContextFolder/DisableKeysAndMouseInteractions.jsx";

const ExamInstructions = () => {
  const { testId, studentId } = useParams();
  const navigate = useNavigate();
const [openTermsAndConditions, setOpenTermsAndConditions] = useState(false);
  const [realTestId, setRealTestId] = useState("");
  const [realStudentId, setRealStudentId] = useState("");
  const [instructionsData, setInstructionsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false); // 👈 Track checkbox
  const { studentData } = useStudent();
   // Disable all keyboard and mouse interactions globally
  //  DisableKeysAndMouseInteractions(null);

  const userData = studentData?.userDetails;
  const studentName = userData?.candidate_name;
 const studentProfile = userData?.uploaded_photo;

  //  Read adminInfo from localStorage
  const adminInfo = JSON.parse(localStorage.getItem("adminInfo"));
  const isAdmin = adminInfo?.role === "admin";

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

    // useEffect(() => {
    //     const handleBeforeUnload = () => {
    //       if (realTestId && realStudentId) {
    //         const url = `${BASE_URL}/ResumeTest/updateResumeTest/${realStudentId}/${realTestId}`;

     
    //         const data = JSON.stringify({
    //           studentId: realStudentId,
    //           testCreationTableId: realTestId,
    //         });
     
    //         const blob = new Blob([data], { type: "application/json" });
    //         navigator.sendBeacon(url, blob);
    //       }
    //     };
     
    //     window.addEventListener("beforeunload", handleBeforeUnload);
     
    //     return () => {
    //       window.removeEventListener("beforeunload", handleBeforeUnload);
    //     };
    //   }, [realStudentId, realTestId]);



    // const handleBeforeUnload = useCallback(
    //   async (event) => {
  
  
    //     try {
    //       await fetch(`${BASE_URL}/OTSExamSummary/DeleteStudentDataWindowClose/${realStudentId}/${realTestId}`, {
    //         method: "DELETE",
    //         headers: {
    //           "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({
    //           studentId: realStudentId, // User ID
    //           testCreationTableId: realTestId, // Test ID
    //         }),
    //       });
    //       console.log(
    //         "User data deleted successfully before closing the window."
    //       );
    //     } catch (error) {
    //       console.error("Error deleting user data:", error);
    //     }
       
  
    //     // Once deletion is successful, remove the 'beforeunload' listener
    //     window.removeEventListener("beforeunload", preventUnload);
    
     
    //   },
    //   [realStudentId,realTestId]
    // );

    // useEffect(() => {
    //   window.addEventListener("beforeunload", handleBeforeUnload);
    //   return () => {
    //     window.removeEventListener("beforeunload", handleBeforeUnload);
    //   };
    // }, [handleBeforeUnload]);
    
  useEffect(() => {
    const token = sessionStorage.getItem("navigationToken");
    if (!token) {
      navigate("/Error");
      return;
    }

    const decryptAndFetch = async () => {
      try {
        let decryptedTestId = "";
        let decryptedStudentId = "";

        if (studentId) {
          const [testIdDecrypted, studentIdDecrypted] = await decryptDataBatch([
            decodeURIComponent(testId),
            decodeURIComponent(studentId),
          ]);
          decryptedTestId = testIdDecrypted;
          decryptedStudentId = studentIdDecrypted;
        } else {
          [decryptedTestId] = await decryptDataBatch([
            decodeURIComponent(testId),
          ]);
        }

        setRealTestId(decryptedTestId);
        setRealStudentId(decryptedStudentId); // empty string if admin

        const response = await fetch(
          `${BASE_URL}/studentmycourses/instructions/${decryptedTestId}`
        );
        if (!response.ok) throw new Error("Failed to fetch instructions");

        const data = await response.json();
        setInstructionsData(data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error:", err);
        navigate("/Error");
      }
    };

    decryptAndFetch();
  }, [testId, studentId, navigate]);

  if (isLoading) {
    return (
      <div className={styles.loadingText}>
        <LoadingSpinner />
      </div>
    );
  }
  // const bc = new BroadcastChannel('test_channel');
 
  //   bc.onmessage = async (event) => {
  //     if (event.data.action === 'resumeAndClose') {
  //       const { timeLeft } = event.data;
   
  //       try {
  //         const response = await fetch(`${BASE_URL}/ResumeTest/updateResumeTest/${realStudentId}/${realTestId}`, {
  //           method: 'PUT',
  //           headers: {
  //             'Content-Type': 'application/json'
  //           },
  //           body: JSON.stringify({
  //             studentId: realStudentId,
  //             testCreationTableId: realTestId,
  //             timeleft: timeLeft || ""
  //           })
  //         });
   
  //         if (!response.ok) {
  //           console.error("Failed to update resume status.");
  //         } else {
  //           console.log("Resume test API called successfully from child.");
  //         }
   
  //       } catch (err) {
  //         console.error("API error:", err);
  //       } finally {
  //         localStorage.removeItem('OTS_FormattedTime');
  //         window.close(); // Close child after sending the request
  //       }
  //     }
  //   };


  const examName = instructionsData[0]?.exam_name || "Exam";
  const instructionPoints = instructionsData[0]?.instruction_points || [];

  const handleBeginTest = async () => {
    sessionStorage.setItem("navigationToken", "valid");

    try {
      const encrypted = studentId
        ? await encryptBatch([realTestId, realStudentId])
        : await encryptBatch([realTestId]);

      const encryptedTestId = encodeURIComponent(encrypted[0]);
      const encryptedStudentId = studentId
        ? encodeURIComponent(encrypted[1])
        : null;

      const route = studentId
        ? `/OTSRootFile/${encryptedTestId}/${encryptedStudentId}`
        : `/OTSRootFile/${encryptedTestId}`; // <-- Use a route for admin preview

      navigate(route);
    } catch (error) {
      console.error("Encryption failed:", error);
      navigate("/Error");
    }
  };
  return (
    <div className={styles.examInstructionsContainer}>
      <div>
        <OTSHeader />
      </div>
      <div className={styles.instrcutionstudentProfileDiv}>
      <div className={styles.examinstructionSubdiv}>
        <div className={styles.examinstrctionMianHeading}>
          <h2>{examName}</h2></div>
        <ul className={styles.instructionList}>
          {instructionPoints.map((point, idx) => (
            <li key={idx} className={styles.instructionPointItem}>
              {point}
            </li>
          ))}
        </ul>
      </div>

        <div className={styles.userImageDivInst}>
          <div className={styles.userDetailsHolder}>
            <div className={styles.userImageSubDiv}>
              {isAdmin ? (
                // Admin Profile
                <img
                  src={adminCapImg}
                  alt="Admin Cap"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultImage;
                  }}
                />
              ) : (
                //  Student Profile
                <img
                  src={studentProfile || defaultImage}
                  alt="Student Profile"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultImage;
                  }}
                />
              )}
            </div>
            <div className={styles.StdNameForData}>
            <p title={isAdmin ? "Admin" : studentName}>{isAdmin ? "Admin" : studentName}</p>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.termandConditionsMainDiv}>
        <div className={styles.termsandConditionsDiv}>
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={() => setAcceptedTerms((prev) => !prev)}
          />
          <span className={styles.spanAccept}>
            I accept all{" "}
            <span className={styles.tcPopup} onClick={() => setOpenTermsAndConditions(true)}>
              terms & conditions
            </span>
          </span>
        </div>

        <div className={styles.readytoBeginDiv}>
          <button className={styles.previuosBtn} onClick={() => navigate(-1)}>
            <span className={styles.previosBtnArrow}>&lt;</span> Previous
          </button>
          <button
            className={`${styles.readyBeginBtn} ${
              !acceptedTerms ? styles.disabledBtn : ""
            }`}
            disabled={!acceptedTerms} //  Disable until accepted
            onClick={handleBeginTest}
          >
            I am ready to begin{" "}
            <span className={styles.nextBtnArrow}>&rarr;</span>
          </button>
        </div>
        {openTermsAndConditions && (
            <TermsAndConditions setIsModalOpen={setOpenTermsAndConditions} />
          )}
      </div>
      <ParentTabClosing realStudentId={realStudentId} realTestId={realTestId}  />
    </div>
  );
};

export default ExamInstructions;
