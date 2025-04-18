import React, { useEffect, useState } from 'react';
import styles from "../../../Styles/StudentDashboardCSS/StudentDashboard.module.css";
import headerImage from '../../../assets/EGTLogoExamHeaderCompressed.jpg';
import logostudent from '../../../assets/OtsCourseCardImages/iit_jee1.png';
import { useNavigate } from 'react-router-dom'; // Import useNavigate to handle redirection
import { BASE_URL } from "../../../ConfigFile/ApiConfigURL.js";// Import your API base URL

const  StudentDashboardHeader = ({userData, setActiveSection})  => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate(); // Initialize navigate hook for redirection
 useEffect(() => {
console.log("headetstudentdashboard")
  },[])
  // Handle mouse events to show/hide profile menu
  const handleMouseEnter = () => {
    setShowProfileMenu(true);
  };

  const handleMouseLeave = () => {
    setShowProfileMenu(false);
  };
  const AZURE_STORAGE_BASE_URL = `https://${import.meta.env.VITE_AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${import.meta.env.VITE_AZURE_CONTAINER_NAME}`;
  const SAS_TOKEN = `?${import.meta.env.VITE_AZURE_SAS_TOKEN}`
  const studentProfile = userData?.uploaded_photo
  ? `${AZURE_STORAGE_BASE_URL}/${import.meta.env.VITE_AZURE_DOCUMENT_FOLDER}/${userData.uploaded_photo}${SAS_TOKEN}`
  : logostudent;
  // Handle logout functionality
  const handleLogout = async () => {
    const sessionId = localStorage.getItem('sessionId'); // Retrieve sessionId from localStorage
  
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
        body: JSON.stringify({ sessionId }), // Send sessionId in the request body
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Clear all items from localStorage
        localStorage.clear(); // Removes all data stored in localStorage
  
        // Redirect the user to the login page or home page after logout
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
          <img src={headerImage} alt='logoImage' />
        </div>

        {/* Logo & Profile Menu */}
        <div
          className={styles.profileWrapper}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className={styles.studentLogo}>
            <img src={studentProfile} alt="studentProfile" />
          </div>

          {showProfileMenu && (
            <div className={styles.onHoverOFstudent}>
              <div onClick={() => setActiveSection("account")}>Profile</div>
              <div onClick={() => setActiveSection("account")}>Change Password</div>
              <div className={styles.LogoutBtnDivStudent}>
                <button onClick={handleLogout}>Log Out</button> {/* Trigger logout on click */}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(StudentDashboardHeader);
