import React, { lazy, useEffect, useState,Suspense, useCallback  } from 'react'
import StudentDashboardHeader from './StudentDashboardHeader.jsx';
import styles from "../../../Styles/StudentDashboardCSS/StudentDashboard.module.css";
import StudentDashboardLeftSideBar from './StudentDashboardLeftSidebar.jsx';
import { useLocation,useNavigate, useParams  } from 'react-router-dom';
import LoadingSpinner from '../../../ContextFolder/LoadingSpinner.jsx'
import { BASE_URL } from '../../../ConfigFile/ApiConfigURL.js';
 import BackButtonHandler from './BackButtonHandler.jsx';
import { useAlert } from "../StudentDashboardFiles/AlertContext";
const StudentDashboardBookmarks = lazy(() => import('./StudentDashboardBookmarks.jsx'));
const StudentDashboardHome = lazy(() => import("./StudentDashboardHome.jsx"));
const StudentDashboard_MyCourses = lazy(() => import("./StudentDashboard_MyCourses.jsx"));
const StudentDashboard_BuyCourses = lazy(() => import("./StudentDashboard_BuyCourses.jsx"));
const StudentDashboard_MyResults = lazy(() => import("./StudentDashboard_MyResults.jsx"));
const StudentDashboard_AccountSettings = lazy(() => import("./StudentDashboard_AccountSettings.jsx"));
const CustomLogoutPopup = lazy(() => import('./CustomLogoutPop.jsx'));
 
export default function StudentDashboard() {
  const [sessionValid, setSessionValid] = useState(null); 

  const [activeSection, setActiveSection] = useState("dashboard");
   const [activeSubSection, setActiveSubSection] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const studentData = JSON.parse(localStorage.getItem('studentData'));
  const studentName = studentData?.userDetails?.candidate_name;
  const studentId = sessionStorage.getItem('decryptedId');
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const { alert } = useAlert();
  const navigate = useNavigate();
    // useEffect(() => {
    //   const savedSection = localStorage.getItem("activeSection");
    //   if (savedSection) {
    //     setActiveSection(savedSection);
    //   }
    // }, []);
   

    
    // const handleSectionChange = useCallback((section) => {
    //   setActiveSection(section);
    //   localStorage.setItem("activeSection", section);
    // }, []);
  useEffect(() => {
    const savedState = localStorage.getItem("studentDashboardState");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.activeSection) {
          setActiveSection(parsed.activeSection); //Use embedded activeSection
        }
      } catch (err) {
        console.error("Failed to parse studentDashboardState:", err);
      }
    }
  }, []);

  const handleSectionChange = useCallback((section) => {
    setActiveSection(section);

    // Optional: Only persist minimal state when switching away from "myCourses"
    localStorage.setItem(
      "studentDashboardState",
      JSON.stringify({ activeSection: section })
    );
  }, []);

    const location = useLocation();

   
    useEffect(() => {
      let timeoutId;
      const resetInactivityTimer = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          handleLogout();
        }, 30 * 60 * 1000);
      };
      const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
   
      events.forEach(event => {
        window.addEventListener(event, resetInactivityTimer);
      });
      resetInactivityTimer();
   
      return () => {
        events.forEach(event => {
          window.removeEventListener(event, resetInactivityTimer);
        });
        clearTimeout(timeoutId);
      };
    }, []);
  useEffect(() => {
    const sectionFromRoute = location.state?.activeSection;
    if (sectionFromRoute && !sessionStorage.getItem("sectionFromRouteUsed")) {
      setActiveSection(sectionFromRoute);
      localStorage.setItem("studentDashboardState", JSON.stringify({ activeSection: sectionFromRoute }));
      sessionStorage.setItem("sectionFromRouteUsed", "true");
    } else {
      const savedState = localStorage.getItem("studentDashboardState");
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          if (parsedState?.activeSection) {
            setActiveSection(parsedState.activeSection);
          }
        } catch (err) {
          console.error("Failed to parse studentDashboardState:", err);
        }
      } else {
        setActiveSection("dashboard");
      }
    }

    setIsLoading(false);
  }, [location.state]);

 const closeTestWindowIfOpen = () => {
  if (window.testWindowRef && !window.testWindowRef.closed) {
    window.testWindowRef.close();
    window.testWindowRef = null;
  }
};
     
    const handleLogout = async () => {
 
      const sessionId = localStorage.getItem("sessionId");
   
      if (!sessionId) {
         await alert("No session found. Please log in again.", "error");
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
           closeTestWindowIfOpen();  
          navigate("/LoginPage");
        } else {
          await alert("No session found. Please log in again.", "error");
        }
      } catch (error) {
        //console.error("Logout error:", error);
      }
    };
   const channel = new BroadcastChannel('session_channel');
channel.onmessage = (event) => {
  if (event.data.type === 'LOGOUT') {
   handleLogout();
  }
};
  const renderStudentDashboardContent = () => {

      switch (activeSection) {
        case "dashboard":
          return <StudentDashboardHome studentName ={studentName}
          handleSectionChange={handleSectionChange}
          />;
        case "myCourses":
          return <StudentDashboard_MyCourses userData ={studentData?.userDetails} studentId = {studentId} activeSection={activeSection}/>;
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
  if (isLoading) {
    return <div><LoadingSpinner/></div>;
  }
 
  return (
    <div className={styles.StudentDashboardInterFace}>
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
    <BackButtonHandler/>
 
    </div>
  );
}
 
 