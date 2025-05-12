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
      const verifySession = async () => {
    
        const localSessionId = localStorage.getItem("sessionId");
        const sessionSessionId = sessionStorage.getItem("sessionId");
        const studentId = localStorage.getItem("decryptedId");
    
        // If session is invalid, set sessionValid to false and return early
        if (!localSessionId || !sessionSessionId || localSessionId !== sessionSessionId) {
          setSessionValid(false);
          return;
        }
    
        try {
          // Send POST request to verify session
          const response = await fetch(`${BASE_URL}/student/verifySession`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studentId, sessionId: localSessionId }),
          });
    
          const data = await response.json();
    
          // If the session is invalid, set sessionValid to false and redirect to LoginPage
          if (!data.success) {
            setSessionValid(false);
           
            navigate("/LoginPage"); // Redirect to login page if session is invalid
          } else {
            setSessionValid(true)
           
             // Valid session
          }
        } catch (err) {
          console.error("Session check failed", err);
          setSessionValid(false);
          navigate("/LoginPage"); // Redirect to login page if there's an error
        }
      };
    
      verifySession();
    }, [activeSection]); 
    
    const location = useLocation();
    // useEffect(() => {
    //   const handleBeforeUnload = (e) => {
    //     // Check if it's a page reload
    //     if (sessionStorage.getItem('isReloading') === 'true') {
    //       // If it's a reload, we don't want to call the logout function
    //       sessionStorage.removeItem('isReloading'); // Clean up the flag
    //       return;
    //     }
   
    //     // Otherwise, handle tab close or back navigation
    //     handleLogout();
    //   };
   
    //   // Set a flag in sessionStorage when the page is about to reload
    //   const handleBeforeReload = () => {
    //     sessionStorage.setItem('isReloading', 'true');
    //   };
   
    //   window.addEventListener('beforeunload', handleBeforeUnload);
    //   window.addEventListener('beforeunload', handleBeforeReload);
   
    //   return () => {
    //     window.removeEventListener('beforeunload', handleBeforeUnload);
    //     window.removeEventListener('beforeunload', handleBeforeReload);
    //   };
    // }, []);
   
   
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
      // Push initial state to browser history
      window.history.pushState({ page: "dashboard" }, "", window.location.href);
   
      // Optional: Save to localStorage (in case you want to restore this later)
      localStorage.setItem("pageState", JSON.stringify({ page: "dashboard" }));
   
      // Handle the back button press
      const handlePopState = (event) => {
        const state = event.state;
        if (state?.page === "dashboard") {
          setShowLogoutPopup(true);
          // console.log("🔙 Back button detected - showing logout confirmation");
   
          // Re-push to history to prevent going further back without confirmation
          window.history.pushState({ page: "dashboard" }, "", window.location.href);
        }
      };
   
      // Attach the event listener
      window.addEventListener("popstate", handlePopState);
   
      // Cleanup on unmount
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }, []);
 
     //  Disable right-click globally
  // useEffect(() => {
  //   const handleRightClick = (e) => {
  //     e.preventDefault();
  //   };
 
  //   document.addEventListener("contextmenu", handleRightClick);
 
  //   return () => {
  //     document.removeEventListener("contextmenu", handleRightClick);
  //   };
  // }, []);
 
    // useEffect(() => {
    //   const onBackButton = (event) => {
    //     event.preventDefault();
    //     setShowLogoutPopup(true);
    //     window.history.pushState(null, "", window.location.pathname);
    //   };
 
    //   window.history.pushState(null, "", window.location.pathname);
    //   window.addEventListener("popstate", onBackButton);
   
    //   return () => {
    //     window.removeEventListener("popstate", onBackButton);
    //   };
    // }, []);
   
   
 
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
          navigate("/LoginPage");
        } else {
          await alert("No session found. Please log in again.", "error");
        }
      } catch (error) {
        //console.error("Logout error:", error);
      }
    };
   
   
  const renderStudentDashboardContent = () => {
   const localSessionId = localStorage.getItem('sessionId');
  const sessionSessionId = sessionStorage.getItem('sessionId');
  if (!localSessionId || !sessionSessionId || localSessionId !== sessionSessionId) {
  
    navigate('/LoginPage');
    return null;
  }
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
 
 