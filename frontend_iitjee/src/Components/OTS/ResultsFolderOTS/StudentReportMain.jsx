import React, { useState } from "react";
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";
import { useNavigate,useLocation, useParams } from 'react-router-dom';
import { FaLongArrowAltLeft } from "react-icons/fa";
import StudentReport from "./StudentReport";
import SolutionsTab from "./SolutionsTab";
const StudentReportMain = () => {
  const [activeTab, setActiveTab] = useState("Your Performance");
  const navigate = useNavigate();
  const handleGoBack = () => {
    navigate(-1);
    // This will run when the component unmounts, and we can clear localStorage
    localStorage.removeItem("activeButton");
  };
  const { testId } = useParams();
  const location = useLocation();
  const { studentId,userData, test_name, total_marks, duration } = location.state || {};



  

  return (
    <div className={styles.StudentReportMainDiv}>
      <div className={styles.StudentReportSubDiv}>
        <div className={styles.studentReportHeaderMain}>
          <div className={styles.studentReportHeaderDiv}>
            <div className={styles.studentReportHeader}>{activeTab}</div>
          </div>
          <button
            className={styles.studentReportBackButton}
            onClick={handleGoBack}
          >
            <FaLongArrowAltLeft className={styles.studentReportBackArrow} />
          </button>
        </div>
        <div className={styles.studentReportTestDetailsContiner}>
          <ul className={styles.testDetailsContainerSub}>
            <li>
              Test Name: <b>{test_name}</b>
            </li>
            <li>
              TotalMatks: <b>{total_marks}.</b>
            </li>
            <li>
              Duration: <b>{duration}</b>
            </li>
          </ul>
        </div>
        <div className={styles.studentReportPerformanceBtns}>
          <button
            className={`${styles.performanceButtonsInStudentReport} ${
              activeTab === "Your Performance"
                ? styles.performanceBtnActive
                : ""
            }`}
            onClick={() => setActiveTab("Your Performance")}
          >
            Your Performance
          </button>
          <button
            className={`${styles.performanceButtonsInStudentReport} ${
              activeTab === "Solutions" ? styles.performanceBtnActive : ""
            }`}
            onClick={() => setActiveTab("Solutions")}
          >
            Solutions
          </button>
        </div>
        {/* Conditional rendering based on active tab */}
        <div className={styles.studentReportTabContent}>
          {activeTab === "Your Performance" && (
            <div>
              <StudentReport testId={testId} studentId={studentId}/>
            </div>
          )}
          {activeTab === "Solutions" && (
            <div>
              <SolutionsTab testId={testId} studentId={studentId} userData={userData}/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentReportMain;
