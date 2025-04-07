import React, { useState, useEffect, lazy, Suspense } from "react";
import {
  FaTh,
  FaBook,
  FaShoppingCart,
  FaListAlt,
  FaUser,
  FaBars,
  FaTimes
} from "react-icons/fa";
import styles from "../../../Styles/StudentDashboardCSS/StudentDashboard.module.css";

// Lazy loaded components
const StudentDashboardHome = lazy(() => import("../StudentDashboardPages/StudentDashboardHome.jsx"));
const StudentDashboard_MyCourses = lazy(() => import("../StudentDashboardPages/StudentDashboard_MyCourses.jsx"));
const StudentDashboard_BuyCourses = lazy(() => import("../StudentDashboardPages/StudentDashboard_BuyCourses.jsx"));
const StudentDashboard_MyResults = lazy(() => import("../StudentDashboardPages/StudentDashboard_MyResults.jsx"));
const StudentDashboard_AccountSettings = lazy(() => import("../StudentDashboardPages/StudentDashboard_AccountSettings.jsx"));

// Sidebar data
const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: <FaTh /> },
  { id: "myCourses", label: "My Courses", icon: <FaBook /> },
  { id: "buyCourses", label: "Buy Courses", icon: <FaShoppingCart /> },
  { id: "results", label: "My Results", icon: <FaListAlt /> },
  { id: "account", label: "My Account", icon: <FaUser /> }
];

const StudentDashboardLeftSideBar = () => {
  const [activeSection, setActiveSection] = useState("myCourses");
  const [showSidebar, setShowSidebar] = useState(true); // Toggle for mobile

  useEffect(() => {
    const savedSection = localStorage.getItem("activeSection");
    if (savedSection) {
      setActiveSection(savedSection);
    }
  }, []);

  const handleSectionChange = (section) => {
    setActiveSection(section);
    localStorage.setItem("activeSection", section);
    // Don't auto-close sidebar anymore
  };
  

  const renderStudentDashboardContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <StudentDashboardHome />;
      case "myCourses":
        return <StudentDashboard_MyCourses />;
      case "buyCourses":
        return <StudentDashboard_BuyCourses />;
      case "results":
        return <StudentDashboard_MyResults />;
      case "account":
        return <StudentDashboard_AccountSettings />;
      default:
        return <StudentDashboardHome />;
    }
  };

  return (
    <div className={styles.stuentDashboardMainContentContainer}>
      {/* Hamburger for Mobile */}
      <div className={styles.studentDashboardHamburgerMenu}>
        <button onClick={() => setShowSidebar(!showSidebar)}>
          {showSidebar ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`${styles.studentDashboardLeftsidebar} ${
          showSidebar ? styles.sidebarVisible : styles.sidebarHidden
        }`}
      >
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            className={`${styles.LeftsidebarItem} ${
              activeSection === item.id ? styles.activeLeftSideItem : ""
            }`}
            onClick={() => handleSectionChange(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Right side content */}
      <div className={styles.StudentDashboardcontentArea}>
        <Suspense fallback={<div>Loading...</div>}>
          {renderStudentDashboardContent()}
        </Suspense>
      </div>
    </div>
  );
};

export default StudentDashboardLeftSideBar;
