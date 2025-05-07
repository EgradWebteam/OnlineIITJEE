import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from "../../../Styles/StudentDashboardCSS/Student.module.css"; 
import stdLogo from '../../../assets/logoCap.jpeg';
import MainHeader from '../../LandingPagesFolder/MainPageHeaderFooterFiles/MainHeader.jsx';
import MainFooter from '../../LandingPagesFolder/MainPageHeaderFooterFiles/MainFooter.jsx';
import { BASE_URL } from "../../../ConfigFile/ApiConfigURL.js";
import StudentLoginFormeGradTutor from './StudentLoginFormeGradTutor.jsx';
import { useStudent } from '../../../ContextFolder/StudentContext.jsx';
import { v4 as uuidv4 } from 'uuid';
import { useAlert } from "../StudentDashboardFiles/AlertContext";
export default function StudentLogineGradTutor() {
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState("");  
  const [newPassword, setNewPassword] = useState("");  
  const [confirmPassword, setConfirmPassword] = useState("");  
  const [resetCode, setResetCode] = useState(""); 
  const [isForgotPassword, setIsForgotPassword] = useState(false); 
  const [isResetPassword, setIsResetPassword] = useState(false);  
  const [failedAttempts, setFailedAttempts] = useState(0); 
  const navigate = useNavigate();
  const { setStudentData } = useStudent();
  const { alert } = useAlert();
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form submission
  
    // Generate a new session ID for login
    const sessionId = uuidv4();
    const storedSessionId = localStorage.getItem('sessionId'); // Check if session ID exists in localStorage
  
    // If sessionId exists in localStorage, log the user out before logging in
    if (storedSessionId) {
      try {
        const response = await fetch(`${BASE_URL}/student/studentLogout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId: storedSessionId }), // Send stored sessionId for logout
        });
  
        const data = await response.json();
  
        if (response.ok) {
          console.log("Logout successful:", data);
          // Clear session data from localStorage and sessionStorage after logout
          localStorage.removeItem("sessionId");
          sessionStorage.removeItem("sessionId");
        } else {
          console.error("Logout failed:", data.message || "Unknown error");
        }
      } catch (error) {
        console.error("Error during logout request:", error);
      }
    }
  
    // Proceed with login process
    if (!username || !password) {
      await alert("Please enter both username and password");
      return;
    }
  
    const loginData = {
      email: username,
      password: password,
      sessionId: sessionId,
    };
  
    try {
      // Make the login request
      const response = await fetch(`${BASE_URL}/student/studentLogin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        const decryptedId = data.decryptedId;
        const accessToken = data.accessToken;
        const sessionId = data.sessionId;
        const userId = data.user_Id;
        const studentInfo = data;
  
        // Store the session and student data in localStorage and sessionStorage
        localStorage.setItem('decryptedId', decryptedId);
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('sessionId', sessionId);
        localStorage.setItem('userId', userId);
        sessionStorage.setItem('sessionId', sessionId);
        sessionStorage.setItem('decryptedId', decryptedId);
        sessionStorage.setItem('accessToken', accessToken);
        sessionStorage.setItem('userId', userId);
  
        setStudentData(studentInfo); // Set student info in the state
  
        // Navigate to the student's dashboard
        navigate(`/StudentDashboard/${userId}`);
      } else {
        // Handle failed login attempts here (401 or other errors)
        setFailedAttempts((prev) => prev + 1);
  
        if (data.message === "You are already logged in. Please log out before logging in again.") {
          await alert(data.message);
          return;
        }
  
        // Check for max login attempts
        if (failedAttempts >= 3) {
          await alert("You have exceeded the maximum number of login attempts. Please reset your password.");
          setIsForgotPassword(true);
          return;
        }
  
        const remainingAttempts = 3 - failedAttempts;
        await alert(`You have ${remainingAttempts} attempt${remainingAttempts > 1 ? "s" : ""} left. Please try again.`);
      }
    } catch (error) {
      console.error("Error during login:", error);
      await alert("Something went wrong. Please try again later.");
    }
  };
  
  
  


  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!username) {
      await alert("Please enter your email to reset the password.");
      return;
    }

    const forgotPasswordData = { email: username };

    try {
      const response = await fetch(`${BASE_URL}/student/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(forgotPasswordData),
      });
      const data = await response.json();
      if (response.ok) {
        // Reset failed attempts after password reset request
        setFailedAttempts(0);
        setIsForgotPassword(true);  
        setIsResetPassword(true);  
        await alert("Password reset instructions have been sent to your email.");
      } else {
        await alert(data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      await alert("Something went wrong. Please try again later.");
    }
  };

  const handleResetPassword = async (e) => {
    
    e.preventDefault();
  
    if (!resetCode || !newPassword || !confirmPassword) {
      await alert("Please enter reset code, new password, and confirm password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      await alert("Passwords do not match.");
      return;
    }

    const resetPasswordData = {
      email: username,
      resetCode: resetCode,
      newPassword: newPassword,
    };

    try {
      const response = await fetch(`${BASE_URL}/student/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resetPasswordData),
      });

      const data = await response.json();
      if (response.ok) {
        await alert("Password has been reset successfully. You can now log in.");
        setIsForgotPassword(false);   
        setIsResetPassword(false);    
      } else {
        await alert(data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      await alert("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className={styles.studentLoginHomePage}>
      <MainHeader />
      <div className={styles.studentLoginPage}>
        <div className={styles.studentLoginContainer}>
          <div className={styles.studentLogo}>
            <img src={stdLogo} alt="Student Logo" />
          </div>
          <h1>{isForgotPassword ? "Forgot Password" : "Student Login"}</h1>
          
          {/* Render the form here */}
          <StudentLoginFormeGradTutor 
            isForgotPassword={isForgotPassword}
            isResetPassword={isResetPassword}
            username={username}
            password={password}
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            resetCode={resetCode}
            setUsername={setUsername}
            setPassword={setPassword}
            setNewPassword={setNewPassword}
            setConfirmPassword={setConfirmPassword}
            setResetCode={setResetCode}
            handleLogin={handleLogin}
            handleForgotPassword={handleForgotPassword}
            handleResetPassword={handleResetPassword}
            setIsResetPassword={setIsResetPassword}
            setIsForgotPassword={setIsForgotPassword}
            failedAttempts={failedAttempts}
            setFailedAttempts={setFailedAttempts}
          />

          {/* Forgot password and registration links */}
          {!isForgotPassword && !isResetPassword && (
            <div className={styles.studentLoginLinks}>
              <p>New here? <Link to="/StudentRegistrationPage">Register</Link></p>
              <p>
  <button 
    type="button" 
    onClick={() => setIsForgotPassword(true)}
    className={styles.forgotPasswordButton} // Optionally, you can add a class for styling
  >
    Forgot Password?
  </button>
</p>
            </div>
          )}
        </div>

      </div>
      <MainFooter />
    </div>
  );
}
