import React, { useState,useRef,useEffect } from "react";
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";
import { useNavigate,useLocation, useParams } from 'react-router-dom';
import { FaLongArrowAltLeft } from "react-icons/fa";
import StudentReport from "./StudentReport";
import SolutionsTab from "./SolutionsTab";
import axios from "axios";
import { BASE_URL } from "../../../ConfigFile/ApiConfigURL.js";
const StudentReportMain = () => {
  const [activeTab, setActiveTab] = useState("Your Performance");
  const navigate = useNavigate();
  const handleGoBack = () => {
    navigate(-1);
    // This will run when the component unmounts, and we can clear localStorage
    localStorage.removeItem("activeButton");
      localStorage.removeItem("activeTab");
  };
  const { testId } = useParams();
  const location = useLocation();
  const { studentId,userData, test_name, total_marks, duration } = location.state || {};

  const [data, setData] = useState(null);
  const [testPaperData, setTestPaperData] = useState([]);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState([]);
  const [subjectMarks, setSubjectMarks] = useState([]);
  const [error, setError] = useState(null);
  const [selectedSubjectSection, setSelectedSubjectSection] = useState(null);
  const hasFetchedData = useRef(false);
  const hasFetchedSolutions = useRef(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const summaryRes = await fetch(`${BASE_URL}/MyResults/StudentRankSummary/${studentId}/${testId}`);
        const summaryData = await summaryRes.json();
        setData(summaryData);

        const subjectMarksRes = await axios.get(
          `${BASE_URL}/MyResults/TestSubjectWiseStudentMarks/${studentId}/${testId}`
        );
        setSubjectMarks(subjectMarksRes.data.subjects);
      } catch (err) {
        setError("Error fetching data. Please try again later.");
        console.error("Error fetching data:", err);
      }
    };

    if (activeTab === "Your Performance" && !hasFetchedData.current && studentId && testId) {
      fetchData();
      hasFetchedData.current = true;
    }
  }, [activeTab, studentId, testId]);


  useEffect(() => {
    const fetchTestPaper = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/MyResults/StudentReportQuestionPaper/${testId}/${studentId}`
        );
        const data = response.data;
        setTestPaperData(data);
  
        if (data?.subjects?.length > 0) {
          const firstSubject = data.subjects[0];
  
          if (firstSubject.sections && firstSubject.sections.length > 0) {
            const firstSection = firstSubject.sections[0];
            setSelectedSubjectSection({
              SubjectName: firstSubject.SubjectName,
              SectionName: firstSection.SectionName,
              questions: firstSection.questions || [],
            });
          } else {
            setSelectedSubjectSection({
              SubjectName: firstSubject.SubjectName,
              SectionName: null,
              questions: firstSubject.sections?.[0]?.questions || [],
            });
          }
        }
  
        const bookmarkedQuestions = data.subjects.flatMap((subject) =>
          subject.sections.flatMap((section) =>
            section.questions
              .filter((question) => question.bookMark_Qid !== null)
              .map((question) => question.bookMark_Qid)
          )
        );
  
        setBookmarkedQuestions(bookmarkedQuestions);
      } catch (err) {
        console.error("Error fetching test paper:", err);
      }
    };
  
    if (activeTab === "Solutions" && !hasFetchedSolutions.current && testId && studentId) {
      fetchTestPaper();
      hasFetchedSolutions.current = true;
    }
  }, [activeTab, testId, studentId]);
  
  if (error) {
    return <div>{error}</div>;
  }
  useEffect(() => {
  const savedTab = localStorage.getItem("activeTab");
  if (savedTab) {
    setActiveTab(savedTab);
  }
}, []);

  const handleTabChange = (tab) => {
  setActiveTab(tab);
  localStorage.setItem("activeTab", tab);
};

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
              TotalMarks: <b>{total_marks}</b>
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
             onClick={() => handleTabChange("Your Performance")}
          >
            Your Performance
          </button>
          <button
            className={`${styles.performanceButtonsInStudentReport} ${
              activeTab === "Solutions" ? styles.performanceBtnActive : ""
            }`}
           onClick={() => handleTabChange("Solutions")}
          >
            Solutions
          </button>
        </div>
        {/* Conditional rendering based on active tab */}
        <div className={styles.studentReportTabContent}>
          {activeTab === "Your Performance" && (
            <div>
              <StudentReport testId={testId} studentId={studentId} data = {data} subjectMarks = {subjectMarks}/>
            </div>
          )}
          {activeTab === "Solutions" && (
            <div>
              <SolutionsTab testId={testId} setBookmarkedQuestions = {setBookmarkedQuestions} bookmarkedQuestions = {bookmarkedQuestions}
               studentId={studentId} setSelectedSubjectSection = {setSelectedSubjectSection} selectedSubjectSection = {selectedSubjectSection}
                userData={userData} 
                testPaperData = {testPaperData}/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentReportMain;
