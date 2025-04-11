import React, { lazy, useEffect, useState,Suspense, useCallback } from 'react'
import StudentDashboardHeader from '../StudentDashboardPages/StudentDashboardHeader.jsx';
import styles from "../../../Styles/StudentDashboardCSS/StudentDashboard.module.css";
import StudentDashboardLeftSideBar from '../StudentDashboardPages/StudentDashboardLeftSidebar.jsx';

// Lazy loaded components
const StudentDashboardHome = lazy(() => import("../StudentDashboardPages/StudentDashboardHome.jsx"));
const StudentDashboard_MyCourses = lazy(() => import("../StudentDashboardPages/StudentDashboard_MyCourses.jsx"));
const StudentDashboard_BuyCourses = lazy(() => import("../StudentDashboardPages/StudentDashboard_BuyCourses.jsx"));
const StudentDashboard_MyResults = lazy(() => import("../StudentDashboardPages/StudentDashboard_MyResults.jsx"));
const StudentDashboard_AccountSettings = lazy(() => import("../StudentDashboardPages/StudentDashboard_AccountSettings.jsx"));
export default function StudentDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);

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
    
  
    const renderStudentDashboardContent = () => {
      switch (activeSection) {
        case "dashboard":
          return <StudentDashboardHome 
          handleSectionChange={handleSectionChange}
          />;
        case "myCourses":
          return <StudentDashboard_MyCourses studentId = {studentId}/>;
        case "buyCourses":
          return <StudentDashboard_BuyCourses setActiveSection = {setActiveSection} studentId = {studentId}/>;
        case "results":
          return <StudentDashboard_MyResults />;
        case "account":
          return <StudentDashboard_AccountSettings />;
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
      <StudentDashboardHeader />
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
