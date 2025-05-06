import React, { useEffect, useState } from 'react';
import styles from "../../../Styles/StudentDashboardCSS/StudentDashboard.module.css";
import { BASE_URL } from '../../../ConfigFile/ApiConfigURL.js';
import { encryptBatch } from '../../../utils/cryptoUtils.jsx';
import { useNavigate } from 'react-router-dom';
import { FaBookReader } from "react-icons/fa";

export default function TestDetailsContainer({ course, onBack, studentId,userData }) {
  const [groupedTests, setGroupedTests] = useState({});
  const [courseName, setCourseName] = useState('');
  const [selectedTestType, setSelectedTestType] = useState('Select Type Of Test');
  const [showPopup, setShowPopup] = useState(false);

  const course_creation_id = course?.course_creation_id;
  const navigate = useNavigate();
  // const [timeSpent, setTimeSpent] = useState(null);
  // const [timeLefSt, setTimeLeft] = useState(null);
  // useEffect(() => {
  //   const handleTimerUpdate = (event) => {
  //     // Get data from the custom event
  //     const { timeLeft, timeSpent } = event.detail;
  //     console.log(timeLeft, timeSpent)
  //     setTimeLeft(timeLeft);
  //     setTimeSpent(timeSpent);
  //   };

  //   // Add event listener for 'timerUpdate' event
  //   window.addEventListener("timerUpdate", handleTimerUpdate);

  //   // Cleanup the event listener on unmount
  //   return () => {
  //     window.removeEventListener("timerUpdate", handleTimerUpdate);
  //   };
  // }, []);
  useEffect(() => {
    const fetchCourseTests = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/studentmycourses/coursetestdetails/${course_creation_id}/${studentId}`
        );
        const data = await res.json();
  
        // Updated structure: data.test_details is an array
        const grouped = {};
  
        data.test_details.forEach(group => {
          const testType = group.type_of_test_name;
          grouped[testType] = group.tests;
        });
  
        setGroupedTests(grouped);
        setCourseName(data.course_name);
      } catch (err) {
        console.error("Failed to fetch test details", err);
      }
    };
  
    if (course_creation_id && studentId) {
      fetchCourseTests();
    }
  }, [course_creation_id, studentId]);
  

  const allTestTypes = ['Select Type Of Test', ...Object.keys(groupedTests)];

  function getCurrentLocalMySQLTime() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localTime = new Date(now - offset).toISOString().slice(0, 19).replace('T', ' ');
    return localTime;
  }

  const formattedTime = getCurrentLocalMySQLTime();
  // let newWinRef = null;

  // const handleStartTestClick = async (testCreationTableId) => {
  //   try {
  //       // calling test attemt status api
  //   const checkActiveTestResponse = await fetch(`${BASE_URL}/studentmycourses/CheckActiveTestOfStudent/${studentId}`);
  //   const checkActiveTestData = await checkActiveTestResponse.json();

  //   // If there's already an active test, block the user
  //   if (checkActiveTestData.activeTestExists) {
  //     alert("You already have an active test in progress. Please complete it before starting another one.");
  //     return;
  //   }
  //     const [encryptedTestId, encryptedStudentId] = await encryptBatch([testCreationTableId, studentId]);

  //     const testStatusData = {
  //       studentregistrationId: studentId,
  //       courseCreationId: course_creation_id,
  //       testCreationTableId: testCreationTableId,
  //       studentTestStartTime: formattedTime,
  //       testAttemptStatus: 'started',
  //       testConnectionStatus: 'active',
  //       testConnectionTime: formattedTime
  //     };

  //     const response = await fetch(`${BASE_URL}/studentmycourses/InsertOrUpdateTestAttemptStatus`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(testStatusData),
  //     });

  //     const result = await response.json();

  //     if (response.ok) {
  //       // console.log(result.message);

  //       sessionStorage.setItem('navigationToken', 'valid');

  //       const screenWidth = window.screen.availWidth;
  //       const screenHeight = window.screen.availHeight;
  //       const url = `/GeneralInstructions/${encodeURIComponent(encryptedTestId)}/${encodeURIComponent(encryptedStudentId)}`;
  //       const features = `width=${screenWidth},height=${screenHeight},top=0,left=0`;

  //       window.open(url, '_blank', features);
  //         // Now 'url' will be set based on the value of param4
  //         newWinRef = window.open(
  //           url,
  //           "_blank",
  //           `width=${screenWidth},height=${screenHeight},fullscreen=yes`
  //       );

  //       const monitorWindow = setInterval(() => {
  //           if (newWinRef.closed) {
  //               console.log("Quiz window closed");
  //               clearInterval(monitorWindow);

  //               if (!finalHeartbeatSent) {
  //                   fetch(`${BASE_URL}/OTSExamSummary/DeleteStudentDataWindowClose/${studentId}/${testCreationTableId}`, {
  //                       method: "DELETE",
  //                       headers: {
  //                           "Content-Type": "application/json",
  //                       },
  //                       body: JSON.stringify({
  //                         studentId: studentId,
  //                           testCreationTableId: testCreationTableId,
  //                       }),
  //                   }).catch((error) => {
  //                       console.error("Error deleting data on window close:", error);
  //                   });
                    
              
  //               }
  //           }
  //       }, 1000);
  //     } else {
  //       console.error('Failed to insert/update test status:', result.error);
  //     }
  //   } catch (error) {
  //     console.error('Error during test status insertion/update:', error);
  //   }
  // };

  // let newWinRef = null;

const handleStartTestClick = async (testCreationTableId) => {
  try {
    // calling test attempt status API
    const checkActiveTestResponse = await fetch(`${BASE_URL}/studentmycourses/CheckActiveTestOfStudent/${studentId}`);
    const checkActiveTestData = await checkActiveTestResponse.json();

    if (checkActiveTestData.activeTestExists) {
      // alert("You already have an active test in progress. Please complete it before starting another one.");
      setShowPopup(true);
      return;
    }

    const [encryptedTestId, encryptedStudentId] = await encryptBatch([testCreationTableId, studentId]);

    const testStatusData = {
      studentregistrationId: studentId,
      courseCreationId: course_creation_id,
      testCreationTableId: testCreationTableId,
      studentTestStartTime: formattedTime,
      testAttemptStatus: 'started',
      testConnectionStatus: 'active',
      testConnectionTime: formattedTime
    };

    const response = await fetch(`${BASE_URL}/studentmycourses/InsertOrUpdateTestAttemptStatus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testStatusData),
    });

    const result = await response.json();

    if (response.ok) {
      sessionStorage.setItem('navigationToken', 'valid');

      const screenWidth = window.screen.availWidth;
      const screenHeight = window.screen.availHeight;
      const url = `/GeneralInstructions/${encodeURIComponent(encryptedTestId)}/${encodeURIComponent(encryptedStudentId)}`;
      const features = `width=${screenWidth},height=${screenHeight},top=0,left=0`;

      // Open the new window
      const newWinRef = window.open(url, "_blank", `width=${screenWidth},height=${screenHeight},fullscreen=yes`);

      if (newWinRef) {
        window.addEventListener('beforeunload', () => {
          if (newWinRef && !newWinRef.closed) {
            const key = `OTS_FormattedTime`;
            const timeLeft = localStorage.getItem(key);
        
            console.log("Sending timeLeft to API:", timeLeft);
        
            // if (!timeLeft) {
            //   console.warn("No timeLeft found in localStorage.");
            //   return;
            // }
           
              fetch(`${BASE_URL}/ResumeTest/updateResumeTest/${studentId}/${testCreationTableId}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  studentId: studentId,
                  testCreationTableId: testCreationTableId,
                  timeleft: timeLeft
                }),
              }).catch((error) => {
                console.error("Error deleting data on window close:", error);
              });

              localStorage.removeItem(`OTS_FormattedTime`)
            
            newWinRef.close();
          }
        });
        const monitorWindow = setInterval(() => {
          if (newWinRef.closed) {
            console.log("Quiz window closed");
            clearInterval(monitorWindow);


            const key = `OTS_FormattedTime`;
            const timeLeft = localStorage.getItem(key);
        
            console.log("Sending timeLeft to API:", timeLeft);
        
            // if (!timeLeft) {
            //   console.warn("No timeLeft found in localStorage.");
            //   return;
            // }
           
              fetch(`${BASE_URL}/ResumeTest/updateResumeTest/${studentId}/${testCreationTableId}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  studentId: studentId,
                  testCreationTableId: testCreationTableId,
                  timeleft: timeLeft
                }),
              }).catch((error) => {
                console.error("Error deleting data on window close:", error);
              });

              localStorage.removeItem(`OTS_FormattedTime`)
            
          }
        }, 1000);
      } else {
        console.error("Failed to open the quiz window.");
      }
    } else {
      console.error('Failed to insert/update test status:', result.error);
    }
  } catch (error) {
    console.error('Error during test status insertion/update:', error);
  }
};


  const handleViewReportClickMycourses = (testId,test) => {
    // console.log("test",test)
    navigate(`/StudentReport/${testId}`, {
      state: {
        studentId: studentId,
        test_name: test.test_name,
        total_marks: test.total_marks,
        duration: test.duration,
        userData:userData
      }
      
    });
  };

  return (
    <div className={styles.testDetailsConatinerMainDiv}>
      <div className={styles.goBackInTestContainerDiv}>
        <button className={styles.goBackBtn} onClick={onBack}>Go Back</button>
      </div>

      <div className={styles.courseNameHolderDiv}>
        <h2 className={styles.CourseNameForTest}>{courseName}</h2>
      </div>

      <div className={styles.typeOfTestsSelector}>
        <select
          value={selectedTestType}
          onChange={(e) => setSelectedTestType(e.target.value)}
        >
          {allTestTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className={styles.testsContainer}>
        {selectedTestType === 'Select Type Of Test' ? (
          Object.entries(groupedTests).map(([type, tests]) => (
            <div key={type} className={styles.testContainerDivForflex}>
              <h3 style={{ textAlign: 'center', margin: '1rem 0', color: '#0f172a' }}>{type}</h3>
              {tests.map(test => (
                <div key={test.test_creation_table_id} className={styles.testCard}>
                  <div className={styles.testContainerSub}>
                    <div className={styles.testContainerIcon}><FaBookReader /></div>
                    <div className={styles.testInfoBox}>
                      <h4>{test.test_name}</h4>
                      <div className={styles.durationHolderdiv}>
                        <p>{type}</p>
                        <p>Total Marks: {test.total_marks} Marks</p>
                        <p>Duration: {test.duration} Minutes</p>
                      </div>
                    </div>
                  </div>

                  {/* {test.test_attempt_status?.toLowerCase().trim() === 'completed' ? (
                    <button
                      className={styles.viewReportBtn}
                      onClick={() => handleViewReportClickMycourses(test.test_creation_table_id,test)}
                    >
                      View Report &gt;&gt;
                    </button>
                  ) : (
                    <button
                      className={styles.startTestBtn}
                      onClick={() => handleStartTestClick(test.test_creation_table_id)}
                    >
                      Start Test &gt;&gt;
                    </button>
                  )} */}
                  {(() => {
                     const status = test.status?.toLowerCase().trim();
                     const attemptStatus = test.test_attempt_status?.toLowerCase().trim();
                   
                     if (status !== 'active') {
                       return null; // No buttons if test is not active
                     }
                    if (attemptStatus === 'completed') {
                      return (
                        <button
                          className={styles.viewReportBtn}
                          onClick={() => handleViewReportClickMycourses(test.test_creation_table_id, test)}
                        >
                          View Report &gt;&gt;
                        </button>
                      );
                    } else if (attemptStatus === 'resumed') {
                      return (
                        <button
                          className={styles.resumeTestBtn}
                          onClick={() => handleStartTestClick(test.test_creation_table_id)}
                        >
                          Resume Test &gt;&gt;
                        </button>
                      );
                    } else {
                      return (
                        <button
                          className={styles.startTestBtn}
                          onClick={() => handleStartTestClick(test.test_creation_table_id)}
                        >
                          Start Test &gt;&gt;
                        </button>
                      );
                    }
                  })()}
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className={styles.testContainerDivForflex}>
            <h3 style={{ textAlign: 'center', margin: '1rem 0', color: '#0f172a' }}>{selectedTestType}</h3>
            {groupedTests[selectedTestType]?.map(test => (
              <div key={test.test_creation_table_id} className={styles.testCard}>
                <div className={styles.testContainerSub}>
                  <div className={styles.testContainerIcon}><FaBookReader /></div>
                  <div className={styles.testInfoBox}>
                    <h4>{test.test_name}</h4>
                    <div className={styles.durationHolderdiv}>
                      <p>Total Marks: {test.total_marks} Marks</p>
                      <p>Duration: {test.duration} Minutes</p>
                    </div>
                  </div>
                </div>
                {/* {test.test_attempt_status?.toLowerCase().trim() === 'completed' ? (
                  <button
                    className={styles.viewReportBtn}
                    onClick={() => handleViewReportClickMycourses(test.test_creation_table_id,test)}
                  >
                    View Report &gt;&gt;
                  </button>
                ) : (
                  <button
                    className={styles.startTestBtn}
                    onClick={() => handleStartTestClick(test.test_creation_table_id)}
                  >
                    Start Test &gt;&gt;
                  </button>
                )} */}
                {(() => {
                  const status = test.test_attempt_status?.toLowerCase().trim();
                  if (status === 'completed') {
                    return (
                      <button
                        className={styles.viewReportBtn}
                        onClick={() => handleViewReportClickMycourses(test.test_creation_table_id, test)}
                      >
                        View Report &gt;&gt;
                      </button>
                    );
                  } else if (status === 'resumed') {
                    return (
                      <button
                        className={styles.resumeTestBtn}
                        onClick={() => handleStartTestClick(test.test_creation_table_id)}
                      >
                        Resume Test &gt;&gt;
                      </button>
                    );
                  } else {
                    return (
                      <button
                        className={styles.startTestBtn}
                        onClick={() => handleStartTestClick(test.test_creation_table_id)}
                      >
                        Start Test &gt;&gt;
                      </button>
                    );
                  }
                })()}
              </div>
            ))}
          </div>
        )}
      </div>

      {showPopup && (
        <div className={styles.modalOverlayTest}>
          <div className={styles.modalContentTest}>
            <h3>Active Test In Progress</h3>
            <p>You already have an active test. Please complete it before starting a new one.</p>
            <button onClick={() => setShowPopup(false)} className={styles.closeModalBtnTest}>Close</button>
          </div>
        </div>
      )}

    </div>
  );
}
