import React, { useEffect, useState } from 'react';
import styles from "../../../Styles/StudentDashboardCSS/StudentDashboard.module.css";
import { BASE_URL } from '../../../ConfigFile/ApiConfigURL.js';
import { encryptBatch } from '../../../utils/cryptoUtils.jsx';
import { useNavigate } from 'react-router-dom';
import { FaBookReader } from "react-icons/fa";


export default function TestDetailsContainer({ course, onBack, studentId }) {
  const [groupedTests, setGroupedTests] = useState({});
  const [courseName, setCourseName] = useState('');
  const [selectedTestType, setSelectedTestType] = useState('Select Type Of Test');
  const [encryptedStudentId, setEncryptedStudentId] = useState('');

  const course_creation_id = course?.course_creation_id;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourseTests = async () => {
      try {
        const res = await fetch(`${BASE_URL}/studentmycourses/coursetestdetails/${course_creation_id}/${studentId}`);
        const data = await res.json();

        const tests = data.test_details.tests;
        const type = data.test_details.type_of_test_name;

        const testIds = tests.map(test => test.test_creation_table_id);
        const combinedToEncrypt = [...testIds, studentId]; // Single encryption call

        const encryptedArray = await encryptBatch(combinedToEncrypt);
        const encryptedTestIds = encryptedArray.slice(0, testIds.length);
        const encryptedStudent = encryptedArray[testIds.length];

        const grouped = {};
        tests.forEach((test, index) => {
          const testType = type;
          if (!grouped[testType]) grouped[testType] = [];
          grouped[testType].push({
            ...test,
            encryptedTestId: encryptedTestIds[index],
          });
        });

        setEncryptedStudentId(encryptedStudent);
        setGroupedTests(grouped);
        setCourseName(data.course_name);
      } catch (err) {
        console.error("Failed to fetch or encrypt test details", err);
      }
    };

    if (course_creation_id && studentId) {
      fetchCourseTests();
    }
  }, [course_creation_id, studentId]);

  const allTestTypes = ['Select Type Of Test', ...Object.keys(groupedTests)];

  function getCurrentLocalMySQLTime() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000; // offset in ms
    const localTime = new Date(now - offset).toISOString().slice(0, 19).replace('T', ' ');
    return localTime;
  }

  const formattedTime = getCurrentLocalMySQLTime();

  const handleStartTestClick = async (testCreationTableId, encryptedTestId) => {
    const testStatusData = {
      studentregistrationId: studentId,
      courseCreationId: course_creation_id,
      testCreationTableId: testCreationTableId,
      studentTestStartTime: formattedTime,
      testAttemptStatus: 'started',
      testConnectionStatus: 'active',
      testConnectionTime: formattedTime
    };

    try {
      const response = await fetch(`${BASE_URL}/studentmycourses/InsertOrUpdateTestAttemptStatus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testStatusData),
      });

      const result = await response.json();

      if (response.ok) {
        console.log(result.message);

        sessionStorage.setItem('navigationToken', 'valid');

        const screenWidth = window.screen.availWidth;
        const screenHeight = window.screen.availHeight;
        const url = `/GeneralInstructions/${encodeURIComponent(encryptedTestId)}/${encodeURIComponent(encryptedStudentId)}`;
        const features = `width=${screenWidth},height=${screenHeight},top=0,left=0`;

        window.open(url, '_blank', features);
      } else {
        console.error('Failed to insert/update test status:', result.error);
      }
    } catch (error) {
      console.error('Error during test status insertion/update:', error);
    }
  };

  const handleViewReportClickMycourses = (testId) => {
    navigate(`/StudentReport/${testId}`);
  };

  return (
    <div className={styles.testDetailsConatinerMainDiv}>
      <div className={styles.goBackInTestContainerDiv}>
        <button className={styles.goBackBtn} onClick={onBack}>Go Back</button>
      </div>

      <div className={styles.courseNameHolderDiv}>
        <h2>{courseName}</h2>
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
              {tests.map(test => {
                console.log(`Test ID: ${test.test_creation_table_id}, Attempt Status: ${test.test_attempt_status}`);
                return (
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
                   
                    {test.test_attempt_status?.toLowerCase().trim() === 'completed' ? (
                      <button
                        className={styles.viewReportBtn}
                        onClick={() => handleViewReportClickMycourses(test.test_creation_table_id)}
                      >
                        View Report &gt;&gt;
                      </button>
                    ) : (
                      <button
                        className={styles.startTestBtn}
                        onClick={() => handleStartTestClick(test.test_creation_table_id, test.encryptedTestId)}
                      >
                        Start Test &gt;&gt;
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div className={styles.testContainerDivForflex}>
            <h3 style={{ textAlign: 'center', margin: '1rem 0', color: '#0f172a' }}>{selectedTestType}</h3>
            {groupedTests[selectedTestType]?.map(test => {
              console.log(`Test ID: ${test.test_creation_table_id}, Attempt Status: ${test.test_attempt_status}`);
              return (
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
                  {test.test_attempt_status?.toLowerCase().trim() === 'completed' ? (
                    <button
                      className={styles.viewReportBtn}
                      onClick={() => handleViewReportClickMycourses(test.test_creation_table_id)}
                    >
                      View Report &gt;&gt;
                    </button>
                  ) : (
                    <button
                      className={styles.startTestBtn}
                      onClick={() => handleStartTestClick(test.test_creation_table_id, test.encryptedTestId)}
                    >
                      Start Test &gt;&gt;
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
