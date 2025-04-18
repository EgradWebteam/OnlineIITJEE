import React, { lazy, useEffect, useState,Suspense, useCallback } from 'react'
import StudentDashboardHeader from './StudentDashboardHeader.jsx';
import styles from "../../../Styles/StudentDashboardCSS/StudentDashboard.module.css";
import StudentDashboardLeftSideBar from './StudentDashboardLeftSidebar.jsx';
import { useLocation, } from 'react-router-dom';
// import { useStudent } from '../../../ContextFolder/StudentContext.jsx';
// Lazy loaded components
const StudentDashboardHome = lazy(() => import("../StudentDashboardFiles/StudentDashboardHome.jsx"));
const StudentDashboard_MyCourses = lazy(() => import("./StudentDashboard_MyCourses.jsx"));
const StudentDashboard_BuyCourses = lazy(() => import("./StudentDashboard_BuyCourses.jsx"));
const StudentDashboard_MyResults = lazy(() => import("./StudentDashboard_MyResults.jsx"));
const StudentDashboard_AccountSettings = lazy(() => import("./StudentDashboard_AccountSettings.jsx"));
export default function StudentDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const studentData = JSON.parse(localStorage.getItem('studentData'));
  const studentName = studentData?.userDetails?.candidate_name;
  const studentId = localStorage.getItem('decryptedId');
    useEffect(() => {
      const savedSection = localStorage.getItem("activeSection");
      if (savedSection) {
        setActiveSection(savedSection);
      }
    }, []);
   
    const handleSectionChange = useCallback((section) => {
      setActiveSection(section);
      localStorage.setItem("activeSection", section);
    }, []);
    useEffect(() => {
      const savedSection = localStorage.getItem("activeSection");
      setActiveSection(savedSection || "dashboard"); // fallback to dashboard
      setIsLoading(false); // always mark as done loading
    }, []);
    const location = useLocation();

    const renderStudentDashboardContent = () => {
      switch (activeSection) {
        case "dashboard":
          return <StudentDashboardHome studentName ={studentName}
          handleSectionChange={handleSectionChange}
          />;
        case "myCourses":
          return <StudentDashboard_MyCourses studentId = {studentId}/>;
        case "buyCourses":
          return <StudentDashboard_BuyCourses setActiveSection = {setActiveSection} studentId = {studentId}/>;
        case "results":
          return <StudentDashboard_MyResults userData ={studentData?.userDetails}  studentId = {studentId}/>;
        case "account":
          return <StudentDashboard_AccountSettings userData ={studentData?.userDetails}/>;
        default:
          return <StudentDashboardHome 
          handleSectionChange={handleSectionChange}
          />;
      }
    };

     // Until we know the correct section to show
  if (isLoading) {
    return <div>Loading Dashboard...</div>;
  }
  
  return (
    <div>
      <StudentDashboardHeader  userData ={studentData?.userDetails} setActiveSection={setActiveSection}/>
      <div className={styles.StudentDashboardContentHolder}>
        <div className={styles.studentDashboardLeftNavHolder}>
          <StudentDashboardLeftSideBar
          activeSection={activeSection} 
          handleSectionChange={handleSectionChange}
        />
        </div>
        <div className={styles.StudentDashboardRightSideContentHolder}>
          <div className={styles.StudentDashboardcontentArea}>
            <Suspense fallback={<div>Loading...</div>}>
              {renderStudentDashboardContent()}
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
