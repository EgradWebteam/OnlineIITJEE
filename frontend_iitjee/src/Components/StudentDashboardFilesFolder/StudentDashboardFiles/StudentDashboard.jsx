import React, { lazy, useEffect, useState,Suspense, useCallback } from 'react'
import StudentDashboardHeader from './StudentDashboardHeader.jsx';
import styles from "../../../Styles/StudentDashboardCSS/StudentDashboard.module.css";
import StudentDashboardLeftSideBar from './StudentDashboardLeftSidebar.jsx';
import { useLocation,useNavigate  } from 'react-router-dom';
import LoadingSpinner from '../../../ContextFolder/LoadingSpinner.jsx'
import { BASE_URL } from '../../../ConfigFile/ApiConfigURL.js'; 
const StudentDashboardBookmarks = lazy(() => import('./StudentDashboardBookmarks.jsx'));
const StudentDashboardHome = lazy(() => import("./StudentDashboardHome.jsx"));
const StudentDashboard_MyCourses = lazy(() => import("./StudentDashboard_MyCourses.jsx"));
const StudentDashboard_BuyCourses = lazy(() => import("./StudentDashboard_BuyCourses.jsx"));
const StudentDashboard_MyResults = lazy(() => import("./StudentDashboard_MyResults.jsx"));
const StudentDashboard_AccountSettings = lazy(() => import("./StudentDashboard_AccountSettings.jsx"));

export default function StudentDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
   const [activeSubSection, setActiveSubSection] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const studentData = JSON.parse(localStorage.getItem('studentData'));
  const studentName = studentData?.userDetails?.candidate_name;
  const studentId = sessionStorage.getItem('decryptedId');
  const navigate = useNavigate();
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
    const location = useLocation();
    useEffect(() => {
      const sectionFromRoute = location.state?.activeSection;
      if (sectionFromRoute && !sessionStorage.getItem("sectionFromRouteUsed")) {
        setActiveSection(sectionFromRoute);
        localStorage.setItem("activeSection", sectionFromRoute);
        sessionStorage.setItem("sectionFromRouteUsed", "true");
      } else {
        const savedSection = localStorage.getItem("activeSection") || "dashboard";
        setActiveSection(savedSection);
      }
    
      setIsLoading(false);
    }, [location.state]);
    // useEffect(() => {
    //   const logoutTimer = setTimeout(() => {
    //     console.log("🔒 Auto logout triggered after 4 hours");
    //     handleLogout();
    //   }, 4 * 60 * 60 * 1000); 
    
    //   return () => clearTimeout(logoutTimer); 
    // }, []);
 
    // Auto Logout When user is idle in the dashboard 30mins and also closes the tab
    useEffect(() => {
      let idleTimer;
    
      const resetIdleTimer = () => {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
          console.log("Auto logout triggered after 30 minutes of complete inactivity");
          handleLogout();
        }, 30 * 60 * 1000); // 30 minutes
      };
    
      const events = ["mousemove", "keydown", "wheel", "scroll", "touchstart"];
      events.forEach(event => window.addEventListener(event, resetIdleTimer));
    
      resetIdleTimer(); // Start idle timer initially
    
      // Handle tab close event
      const handleBeforeUnload = (event) => {
        handleLogout();  // Perform logout when tab is closed
      };
    
      // Add the beforeunload event listener
      window.addEventListener("beforeunload", handleBeforeUnload);
    
      // Cleanup function to remove event listeners
      return () => {
        events.forEach(event => window.removeEventListener(event, resetIdleTimer));
        clearTimeout(idleTimer);
        window.removeEventListener("beforeunload", handleBeforeUnload);  // Remove beforeunload listener
      };
    }, []);
      
    const handleLogout = async () => {

      const sessionId = localStorage.getItem("sessionId");
    
      if (!sessionId) {
        alert("No session found. Please log in again.");
        navigate("/LoginPage");
        return;
      }
    
      try {
        const response = await fetch(`${BASE_URL}/student/studentLogout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        });
    
        const data = await response.json();
        if (response.ok) {
          localStorage.clear();  
          navigate("/LoginPage");
        } else {
          alert(data.message || "Logout failed. Please try again.");
        }
      } catch (error) {
        console.error("Logout error:", error);
        // alert("Something went wrong. Please try again.");
      }
    };
    
    
    const renderStudentDashboardContent = () => {
      switch (activeSection) {
        case "dashboard":
          return <StudentDashboardHome studentName ={studentName}
          handleSectionChange={handleSectionChange}
          />;
        case "myCourses":
          return <StudentDashboard_MyCourses userData ={studentData?.userDetails} studentId = {studentId}/>;
        case "buyCourses":
          return <StudentDashboard_BuyCourses setActiveSection = {setActiveSection} studentId = {studentId}/>;
        case "results":
          return <StudentDashboard_MyResults userData ={studentData?.userDetails}  studentId = {studentId}/>;
          case "bokmarks":
            return <StudentDashboardBookmarks userData ={studentData?.userDetails}  studentId = {studentId}/>;
        case "account":
          return <StudentDashboard_AccountSettings userData ={studentData?.userDetails}
          activeSubSection={activeSubSection}
          setActiveSubSection={setActiveSubSection}
          />;
        default:
          return <StudentDashboardHome 
          handleSectionChange={handleSectionChange}
          />;
      }
    };

     // Until we know the correct section to show
  if (isLoading) {
    return <div><LoadingSpinner/></div>;
  }
  
  return (
    <div>
      <StudentDashboardHeader  userData ={studentData?.userDetails} setActiveSection={setActiveSection} setActiveSubSection={setActiveSubSection}/>
      <div className={styles.StudentDashboardContentHolder}>
        <div className={styles.studentDashboardLeftNavHolder}>
          <StudentDashboardLeftSideBar
          activeSection={activeSection} 
          handleSectionChange={handleSectionChange}
        />
        </div>
        <div className={styles.StudentDashboardRightSideContentHolder}>
          <div className={styles.StudentDashboardcontentArea}>
            <Suspense fallback={<div> <LoadingSpinner /></div>}>
              {renderStudentDashboardContent()}
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
