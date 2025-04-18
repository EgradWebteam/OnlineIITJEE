import React, { useState} from "react";
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

// Sidebar data
const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: <FaTh /> },
  { id: "myCourses", label: "My Courses", icon: <FaBook /> },
  { id: "buyCourses", label: "Buy Courses", icon: <FaShoppingCart /> },
  { id: "results", label: "My Results", icon: <FaListAlt /> },
  { id: "account", label: "My Account", icon: <FaUser /> }
];

const StudentDashboardLeftSideBar = ({ activeSection, handleSectionChange }) => {
  const [showSidebar, setShowSidebar] = useState(true); // Toggle for mobile
  
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

    </div>
  );
};

export default React.memo(StudentDashboardLeftSideBar);
