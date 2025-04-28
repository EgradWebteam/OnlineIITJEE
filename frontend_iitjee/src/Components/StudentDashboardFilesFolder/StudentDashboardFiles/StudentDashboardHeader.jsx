import React, { useState } from "react";
import styles from "../../../Styles/StudentDashboardCSS/StudentDashboard.module.css";
import headerImage from "../../../assets/EGTLogoExamHeaderCompressed.png";
import defaultImage from "../../../assets/OTSTestInterfaceImages/StudentImage.png";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../../ConfigFile/ApiConfigURL.js";

const StudentDashboardHeader = ({ userData, setActiveSection, setActiveSubSection }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navigate = useNavigate(); 

const studentProfile = userData?.uploaded_photo;
  // Handle mouse events to show/hide profile menu
  const handleMouseEnter = () => {
    setShowProfileMenu(true);
  };

  const handleMouseLeave = () => {
    setShowProfileMenu(false);
  };

  const handleLogout = async () => {
    const sessionId = sessionStorage.getItem("sessionId"); 
  
    if (!sessionId) {
      alert("No session found. Please log in again.");
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
        sessionStorage.clear(); 
        localStorage.clear(); 
        navigate("/LoginPage");
      } else {
        alert(data.message || "Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Something went wrong. Please try again later.");
    }
  };
  
  return (
    <div className={styles.MainDivStudentDasboard}>
      <div className={styles.studentDashboardHeaderMain}>
        <div className={styles.studentDashboardHeaderLogoDiv}>
          <img src={headerImage} alt="logoImage" />
        </div>

        {/* Logo & Profile Menu */}
        <div
          className={styles.profileWrapper}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className={styles.studentLogo}>
  
          <img
  src={studentProfile || defaultImage}
  alt="Student Profile"
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = defaultImage;
  }}
/>

          </div>

          {showProfileMenu && (
            <div className={styles.onHoverOFstudent}>
              <div onClick={() => {
                setActiveSection("account");
                setActiveSubSection("profile");
              }}>Profile</div>
              <div onClick={() => {
                setActiveSection("account");
                setActiveSubSection("password");
              }}>
                Change Password
              </div>
              <div className={styles.LogoutBtnDivStudent}>
                <button onClick={handleLogout}>Log Out</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(StudentDashboardHeader);
