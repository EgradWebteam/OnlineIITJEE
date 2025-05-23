import React, { useEffect, useState,useCallback ,useRef} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { decryptBatch as decryptDataBatch, encryptBatch } from '../../../utils/cryptoUtils.jsx'; // Batch API decryption
import { Intstruction_content } from './InstructionsData.js';
import styles from "../../../Styles/OTSCSS/OTSMain.module.css"
import OTSHeader from '../OTSHeaderFolder/OTSHeader.jsx';
import {useStudent} from "../../../ContextFolder/StudentContext.jsx";
import LoadingSpinner from '../../../ContextFolder/LoadingSpinner.jsx';
import { BASE_URL } from "../../../ConfigFile/ApiConfigURL.js";
import defaultImage from "../../../assets/OTSTestInterfaceImages/StudentImage.png";
import adminCapImg from '../../../assets/logoCap.jpeg';
import ParentTabClosing from '../ParentTabClosing.jsx'

//  import DisableKeysAndMouseInteractions from '../../../ContextFolder/DisableKeysAndMouseInteractions.jsx';
const GeneralInstructions = () => {
    const { testId, studentId } = useParams();
    const navigate = useNavigate();

    const [realTestId, setRealTestId] = useState('');
    const [realStudentId, setRealStudentId] = useState('');
    const [isDecrypting, setIsDecrypting] = useState(true);
    const { studentData} = useStudent();
   // Disable all keyboard and mouse interactions globally
//   const [checkCompleted, setCheckCompleted] = useState(false);
//    DisableKeysAndMouseInteractions(null);
  const logoutHandledRef = useRef(false);

  useEffect(() => {
    const isTabRestored = performance.getEntriesByType("navigation")[0]?.type === "back_forward";

    // If restored via back/forward navigation
    if (isTabRestored) {
      sessionStorage.setItem('tabRestored', 'true');
    } 

  }, []);

  useEffect(() => {
    const handleInteraction = () => {
      const isTabRestored = sessionStorage.getItem('tabRestored') === 'true';

      if (isTabRestored && !logoutHandledRef.current) {
        logoutHandledRef.current = true;
        sessionStorage.removeItem('tabRestored');
        sessionStorage.removeItem('navigationToken');

        // Navigate to error page
        navigate('/Error');
      } 
    //   else {
    //     setCheckCompleted(true);
    // }
    };

    const events = ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, handleInteraction));

    // Optional: call once immediately
    handleInteraction();

    return () => {
      events.forEach(event => window.removeEventListener(event, handleInteraction));
    };
  }, [navigate]);


  

//  DisableKeysAndMouseInteractions(null);

    const userData = studentData?.userDetails;

    const studentName = userData?.candidate_name;
    const studentProfile = userData?.uploaded_photo;

    //  Read adminInfo from localStorage
  const adminInfo = JSON.parse(localStorage.getItem("adminInfo"));
  const isAdmin = adminInfo?.role === "admin";

      //WINDOW CLOSE DATA DELETE CODE START
    //   useEffect(() => {
    //     const handleUnload = () => {
    //       if (realTestId && realStudentId) {
    //         const url = `${BASE_URL}/OTSExamSummary/DeleteStudentDataWindowClose/${realStudentId}/${realTestId}`;
    
    //         // Use navigator.sendBeacon with POST to a wrapper endpoint, or use fetch (less reliable)
    //         // We'll use fetch here as it's DELETE
    //         navigator.sendBeacon = navigator.sendBeacon || function () {}; // fallback
    
    //         // Use fetch (best effort; may not always complete before unload)
    //         fetch(url, {
    //           method: "DELETE",
    //         })
    //           .then((res) => {
    //             //console.log("Deletion request sent on window close", res.status);
    //           })
    //           .catch((err) => {
    //             console.error(
    //               "Error sending deletion request on window close",
    //               err
    //             );
    //           });
    //       }
    //     };
    
    //     window.addEventListener("unload", handleUnload);
    
    //     return () => {
    //       window.removeEventListener("unload", handleUnload);
    //     };
    //   }, [realTestId, realStudentId]);

    // const handleBeforeUnload = useCallback(
    //     async (event) => {
    
    
    //       try {
    //         await fetch(`${BASE_URL}/OTSExamSummary/DeleteStudentDataWindowClose/${realStudentId}/${realTestId}`, {
    //           method: "DELETE",
    //           headers: {
    //             "Content-Type": "application/json",
    //           },
    //           body: JSON.stringify({
    //             studentId: realStudentId, // User ID
    //             testCreationTableId: realTestId, // Test ID
    //           }),
    //         });
    //         console.log(
    //           "User data deleted successfully before closing the window."
    //         );
    //       } catch (error) {
    //         console.error("Error deleting user data:", error);
    //       }
         
    
    //       // Once deletion is successful, remove the 'beforeunload' listener
    //       window.removeEventListener("beforeunload", preventUnload);
      
       
    //     },
    //     [realStudentId,realTestId]
    //   );

    //   useEffect(() => {
    //     window.addEventListener("beforeunload", handleBeforeUnload);
    //     return () => {
    //       window.removeEventListener("beforeunload", handleBeforeUnload);
    //     };
    //   }, [handleBeforeUnload]);


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


//       useEffect(() => {
//         const handleBeforeUnload = () => {
//           if (realTestId && realStudentId) {
//             const url = `${BASE_URL}/ResumeTest/updateResumeTest/${realStudentId}/${realTestId}`;
//             const data = new Blob(
//               [JSON.stringify({ studentId: realStudentId, testCreationTableId: realTestId })],
//               { type: "application/json" }
//             );
//             navigator.sendBeacon(url, data);
//           }
//         };
      
//         window.addEventListener("beforeunload", handleBeforeUnload);

    //   useEffect(() => {
    //     const handleBeforeUnload = () => {
    //       if (realTestId && realStudentId) {
    //         const url = `${BASE_URL}/OTSExamSummary/DeleteStudentDataWindowClose/${realStudentId}/${realTestId}`;
    //         const data = new Blob(
    //           [JSON.stringify({ studentId: realStudentId, testCreationTableId: realTestId })],
    //           { type: "application/json" }
    //         );
    //         navigator.sendBeacon(url, data);
    //       }
    //     };

      
    //     window.addEventListener("beforeunload", handleBeforeUnload);
      
    //     return () => {
    //       window.removeEventListener("beforeunload", handleBeforeUnload);
    //     };
    //   }, [realStudentId, realTestId]);
  //main code for delete student api end    

  

    useEffect(() => {
        const token = sessionStorage.getItem("navigationToken");
    
        if (!token) {
          navigate("/Error");
          return;
        }
    
        const decryptParams = async () => {
          try {
            const encryptedParams = [decodeURIComponent(testId)];
            if (studentId) {
              encryptedParams.push(decodeURIComponent(studentId));
            }
    
            const decryptedValues = await decryptDataBatch(encryptedParams);
    
            if (!decryptedValues || decryptedValues.length === 0) {
              navigate("/Error");
              return;
            }
    
            setRealTestId(decryptedValues[0]);
            if (studentId) {
              setRealStudentId(decryptedValues[1]); // set only if it's student flow
            }
    
            setIsDecrypting(false);
          } catch (error) {
            console.error("Batch decryption error:", error);
            navigate("/Error");
          }
        };
    
        decryptParams();
      }, [testId, studentId, navigate]);


    if (isDecrypting ) {
        return (
            <div>
                <h2> <LoadingSpinner /></h2>
            </div>
        );
    }
    
    //parent tab closing
    // const bc = new BroadcastChannel('test_channel');
 
    // bc.onmessage = async (event) => {
    //   if (event.data.action === 'resumeAndClose') {
    //     const { timeLeft } = event.data;
   
    //     try {
    //       const response = await fetch(`${BASE_URL}/ResumeTest/updateResumeTest/${realStudentId}/${realTestId}`, {
    //         method: 'PUT',
    //         headers: {
    //           'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify({
    //           studentId: realStudentId,
    //           testCreationTableId: realTestId,
    //           timeleft: timeLeft || ""
    //         })
    //       });
   
    //       if (!response.ok) {
    //         console.error("Failed to update resume status.");
    //       } else {
    //         console.log("Resume test API called successfully from child.");
    //       }
   
    //     } catch (err) {
    //       console.error("API error:", err);
    //     } finally {
    //       localStorage.removeItem('OTS_FormattedTime');
    //       window.close(); // Close child after sending the request
    //     }
    //     bc.close(); 
    //   }
    // };
      
    const handleNextClick = async () => {
        sessionStorage.setItem("navigationToken", "valid");
    
        try {
          const payload = studentId ? [realTestId, realStudentId] : [realTestId];
          const encryptedArray = await encryptBatch(payload);
    
          const encryptedTestId = encodeURIComponent(encryptedArray[0]);
    
          if (studentId) {
            const encryptedStudentId = encodeURIComponent(encryptedArray[1]);
            navigate(`/ExamInstructions/${encryptedTestId}/${encryptedStudentId}`);
          } else {
            navigate(`/ExamInstructions/${encryptedTestId}`);
          }
        } catch (error) {
          console.error("Encryption failed:", error);
          navigate("/Error");
        }
      };
      
    return (
        <div className={styles.InstrcutionMainDiv}>
            <div>
                <OTSHeader />
            </div>
            <div className={styles.instrcutionstudentProfileDiv}>
                <div className={styles.instructionSubdiv}>
                    <div className={styles.instrctionMianHeading}>
                        <h2>Instructions</h2>
                    </div>
                    <div className={styles.instrctionMianSubHeading}>
                        {Intstruction_content[0].Intstruction_content_text_center}
                    </div>

                    <div className={styles.instructionSection}>
                        <h3 className={styles.instructionHeading}>{Intstruction_content[0].Intstruction_content_text_subheading_1}</h3>
                        <ul>
                            <li>
                                "Please note: If you open any other window, switch tabs, or
                                minimize this window during the exam, it will be
                                automatically terminated. Be careful while taking the exam!"
                            </li>
                            <li>{Intstruction_content[0].Intstruction_content_points_1}</li>
                            <li>{Intstruction_content[0].Intstruction_content_points_2}</li>
                            <li>{Intstruction_content[0].Intstruction_content_points_3}</li>
                            <div className={styles.tableOFbtns}>
                                <div className={styles.rowTableClass}>
                                    <div className={styles.displayIcon}>
                                        <span className={`${styles.functionimageCls} ${styles.NotVisitedBehaviourBtns}`}>1</span>
                                    </div>
                                    <div className={styles.forTotalWidth}>{Intstruction_content[0].Intstruction_content_points_p1}</div>
                                </div>
                                <div className={styles.rowTableClass}>
                                    <div className={styles.displayIcon}>
                                        <span className={`${styles.functionimageCls} ${styles.NotAnsweredBtnCls}`}>3</span>
                                    </div>
                                    <div className={styles.forTotalWidth}>{Intstruction_content[0].Intstruction_content_points_p2}</div>
                                </div>
                                <div className={styles.rowTableClass}>
                                    <div className={styles.displayIcon}>
                                        <span className={`${styles.functionimageCls} ${styles.AnswerdBtnCls}`}>5</span>
                                    </div>
                                    <div className={styles.forTotalWidth}>{Intstruction_content[0].Intstruction_content_points_p3}</div>
                                </div>
                                <div className={styles.rowTableClass}>
                                    <div className={styles.displayIcon}>
                                        <span className={`${styles.functionimageCls} ${styles.MarkedForReview}`}>7</span>
                                    </div>
                                    <div className={styles.forTotalWidth}>{Intstruction_content[0].Intstruction_content_points_p4}</div>
                                </div>
                                <div className={styles.rowTableClass}>
                                    <div className={styles.displayIcon}>
                                        <span className={`${styles.functionimageCls} ${styles.AnsMarkedForReview}`}>9</span>
                                    </div >
                                    <div className={styles.forTotalWidth}>{Intstruction_content[0].Intstruction_content_points_p5}</div>
                                </div>
                            </div>
                            <li>{Intstruction_content[0].Intstruction_content_points_p}</li>
                        </ul>

                        <h3 className={styles.instructionHeading}>{Intstruction_content[0].Intstruction_content_text_subheading_2}</h3>
                        <ul>
                            <li>{Intstruction_content[0].Intstruction_content_points_4}</li>
                            <ul>
                                <li>{Intstruction_content[0].Intstruction_content_points_4_a}</li>
                                <li>{Intstruction_content[0].Intstruction_content_points_4_b}</li>
                                <li>{Intstruction_content[0].Intstruction_content_points_4_c}</li>
                            </ul>
                            <li>
                                {Intstruction_content[0].Intstruction_content_points_5}
                                <strong> {Intstruction_content[0].span_1} </strong>
                                {Intstruction_content[0].Intstruction_content_points_5__}
                            </li>
                        </ul>

                        <h3 className={styles.instructionHeading}>{Intstruction_content[0].Intstruction_content_text_subheading_3}</h3>
                        <ul>
                            <li>{Intstruction_content[0].Intstruction_content_points_6}</li>
                            <ul>
                                <li>{Intstruction_content[0].Intstruction_content_points_6_a}</li>
                                <li>{Intstruction_content[0].Intstruction_content_points_6_b}</li>
                                <li>
                                    {Intstruction_content[0].Intstruction_content_points_6_c}
                                    <strong> {Intstruction_content[0].span_2} </strong>
                                </li>
                                <li>
                                    {Intstruction_content[0].Intstruction_content_points_6_d}
                                    <strong> {Intstruction_content[0].span_3} </strong>
                                    {Intstruction_content[0].Intstruction_content_points_6_d__}
                                </li>
                                <li>{Intstruction_content[0].Intstruction_content_points_6_e}</li>
                            </ul>
                            <li>
                                {Intstruction_content[0].Intstruction_content_points_7}
                                <strong> {Intstruction_content[0].span_4} </strong>
                                {Intstruction_content[0].Intstruction_content_points_7__}
                            </li>
                            <li>{Intstruction_content[0].Intstruction_content_points_8}</li>
                        </ul>

                        <h3 className={styles.instructionHeading}>{Intstruction_content[0].Intstruction_content_text_subheading_4}</h3>
                        <ul>
                            <li>{Intstruction_content[0].Intstruction_content_points_9}</li>
                            <li>{Intstruction_content[0].Intstruction_content_points_10}</li>
                            <li>{Intstruction_content[0].Intstruction_content_points_11}</li>
                            <li>{Intstruction_content[0].Intstruction_content_points_12}</li>
                        </ul>
                    </div>

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
                        <p title={isAdmin ? "Admin" : studentName}>{isAdmin ? "Admin" : studentName}</p></div>
                    </div>
                </div>

            </div>
          
            <div className={styles.nextBtnDiv}>
                <button onClick={handleNextClick}>Next <span className={styles.nextBtnArrow}>&rarr;</span></button>
            </div>
            <ParentTabClosing realStudentId={realStudentId} realTestId={realTestId} />

        </div>

    );

};

export default GeneralInstructions;
