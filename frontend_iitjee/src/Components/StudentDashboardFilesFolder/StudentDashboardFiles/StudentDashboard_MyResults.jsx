import React, { useEffect, useState } from 'react';
import globalCSS from "../../../Styles/Global.module.css";
import styles from "../../../Styles/StudentDashboardCSS/StudentDashboard.module.css";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../../../ConfigFile/ApiConfigURL.js';

export default function StudentDashboard_MyResults({ studentId,userData }) {
  const [testData, setTestData] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const navigate = useNavigate();
console.log("userData",userData)
  const handleViewReportClick = (testId,test) => {
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

  useEffect(() => {
    if (!studentId) return;

    const fetchResultTestData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/MyResults/FetchResultTestdata/${studentId}`);
        if (response.data.success) {
          setTestData(response.data.data);
        } else {
          console.error('Failed to fetch data');
        }
      } catch (error) {
        console.error('Error fetching test result data:', error);
      }
    };

    fetchResultTestData();
  }, [studentId]);

  // Set first exam active once test data is loaded
  useEffect(() => {
    if (testData.length > 0 && !selectedExam) {
      const firstExam = testData[0].exam_name;
      setSelectedExam(firstExam);
    }
  }, [testData, selectedExam]);


  // Group by exam name
  const groupedByExam = {};
  if (Array.isArray(testData)) {
    testData.forEach(test => {
      if (!groupedByExam[test.exam_name]) {
        groupedByExam[test.exam_name] = [];
      }
      groupedByExam[test.exam_name].push(test);
    });
  }

  const examNames = Object.keys(groupedByExam);
console.log("examNames",examNames)
  return (
    <div className={styles.StudentDashboardMyCoursesMainDiv}>
      <div className={globalCSS.stuentDashboardGlobalHeading}>
        <h3>My Results</h3>
      </div>

      {/* Exam Buttons */}
      
      <div className={globalCSS.examButtonsDiv}>
        {examNames.map((exam, idx) => (
          <button
            key={idx}
            className={`${globalCSS.examButtons} ${selectedExam === exam ? globalCSS.examActiveBtn : ""}`}
            onClick={() => setSelectedExam(exam)}
          >
            {exam}
          </button>
        ))}
      </div>

      {/* Tests for Selected Exam */}
      <div className={styles.myResultsSubContainer}>
        {selectedExam && groupedByExam[selectedExam]?.map((test, idx) => (
          <div key={idx} className={styles.resultsMainDiv}>
            <div className={styles.resultsSubDiv}>
              <p className={styles.testNameInResults}>{test.test_name}</p>
              <div className={styles.resultsViewReportBtn}>
                <button onClick={() => handleViewReportClick(test.test_creation_table_id,test)}>
                  VIEW REPORT <span className={styles.resultsBtnIcon}><MdKeyboardDoubleArrowRight /></span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
