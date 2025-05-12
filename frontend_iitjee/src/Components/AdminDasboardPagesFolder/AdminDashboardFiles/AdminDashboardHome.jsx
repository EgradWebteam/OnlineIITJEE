// AdminDashboardHome.jsx
import React, { useState,useEffect } from 'react';
import styles  from '../../../Styles/AdminDashboardCSS/AdminDashboard.module.css'; 
import AdminLeftSideBar from './AdminLeftSideBar.jsx';  
import AdminDashboardHeader from './AdminDashboardHeader.jsx'; 
import DashBoard from './DashBoard.jsx';
import CourseCreationTab from './CourseCreationTab.jsx';
import TestCreationTab from './TestCreationTab.jsx';
import DocumentUpload from '../AdminDashboardFiles/DocumentUpload.jsx';
import InstructionsTab from '../AdminDashboardFiles/InstructionsTab.jsx';
import { BASE_URL } from '../../../ConfigFile/ApiConfigURL.js';
import CustomLogoutPopup from '../../StudentDashboardFilesFolder/StudentDashboardFiles/CustomLogoutPop.jsx';

export default function AdminDashboardHome() {

  const [activeComponent, setActiveComponent] = useState('dashboard');
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [isReload, setIsReload] = useState(false);

const handleConfirmForBrowserBackButton=()=>{
  setShowLogoutPopup(false);
 handleLogout(); 
}
useEffect(() => {
     const navEntries = performance.getEntriesByType("navigation");
     const wasReload = navEntries.length && navEntries[0].type === "reload";
     setIsReload(wasReload)
     // If reloaded, store a flag in sessionStorage
     
     const handlePopState = () => {
       setShowLogoutPopup(true); // Always show popup on back
     };
   
     // Push an initial state if it's first visit (not refresh)
     if (!wasReload) {
       window.history.pushState(null, "", window.location.pathname);
     }
   
   
     // Attach the event listener
     window.addEventListener("popstate", handlePopState);
   
     // Cleanup on unmount
     return () => {
       window.removeEventListener("popstate", handlePopState);
     };
   }, [isReload]);
    const handleLogout = () => {
   
         const sessionId = localStorage.getItem("sessionId");
       
         if (!sessionId) {
            alert("No session found. Please log in again.", "error");
            window.location.replace("/AdminLoginPage");
           return;
         }
       
        //  try {
        //    const response = await fetch(`${BASE_URL}/admin/adminLogin`, {
        //      method: "POST",
        //      headers: {
        //        "Content-Type": "application/json",
        //      },
        //      body: JSON.stringify({ sessionId }),
        //    });
       
        //    const data = await response.json();
        //    if (response.ok) {
        //      localStorage.clear();  
        //      window.location.replace("/AdminLoginPage");
        //    } else {
        //      await alert("No session found. Please log in again.", "error");
        //    }
        //  } catch (error) {
        //    //console.error("Logout error:", error);
        //  }
       };
  const handleMenuClick = (component) => {
    setActiveComponent(component);
  };
  const renderMainContent = () => {
    switch (activeComponent) {
      case 'dashboard':
        return <DashBoard />;
      case 'course-creation':
        return <CourseCreationTab  portalid={1}/>;
      case 'test-creation':
        return <TestCreationTab />;
      case 'document-upload':
        return <DocumentUpload />;
      case 'instruction':
        return <InstructionsTab />;
      default:
        return <DashBoard />;
    }
  };

  return (
    <div >
      {/* Static Header */}
      <AdminDashboardHeader />
      
      <div className={styles.appLayout}>
        {/* Static Sidebar */}
        <AdminLeftSideBar onMenuClick={handleMenuClick} activeComponent={activeComponent} />

        {/* Dynamic Main Content */}
        <div className={styles.mainContent}>
          {renderMainContent()} {/* Render dynamic content based on the selected component */}
        </div>
      </div>
      {showLogoutPopup && (
      <CustomLogoutPopup
        onConfirm={handleConfirmForBrowserBackButton}
        onCancel={() => {
          //console.log("❌ User canceled logout from popup");
          setShowLogoutPopup(false);
        }}
      />
      
    )}
    </div>
  );
}
