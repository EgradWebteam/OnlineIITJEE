import React, { useState, useEffect } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import styles from "../../../Styles/StudentDashboardCSS/Student.module.css"; 
import stdLogo from '../../../assets/logoCap.jpeg';
import MainHeader from '../../LandingPagesFolder/MainPageHeaderFooterFolder/mainHeader.jsx';
import MainFooter from '../../LandingPagesFolder/mainPageHeaderFooterFolder/MainFooter';
import { BASE_URL } from "../../../config/apiConfig.js";
import StudentLoginForm from './studentLoginForm';
import { useStudent } from '../../../context/StudentContext.jsx';
import { v4 as uuidv4 } from 'uuid';
export default function StudentLogin() {
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState("");  
  const [newPassword, setNewPassword] = useState("");  
  const [confirmPassword, setConfirmPassword] = useState("");  
  const [resetCode, setResetCode] = useState(""); 
  const [isForgotPassword, setIsForgotPassword] = useState(false); 
  const [isResetPassword, setIsResetPassword] = useState(false);  
  const navigate = useNavigate();
  const { setStudentData } = useStudent();


  // Handle login form submission
  const handleLogin = async (e) => {
    const sessionId = uuidv4(); 
    e.preventDefault();
    if (!username || !password) {
      alert("Please enter both username and password");
      return;
    }

    const loginData = {
      email: username,  // Use 'email' field for student login
      password: password,
      sessionId: sessionId
    };

    try {
      const response = await fetch(`${BASE_URL}/student/studentLogin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });
      const data = await response.json();
debugger
      if (response.ok) {
        if (response.ok) {
          const decryptedId = data.decryptedId;
          const accessToken = data.accessToken;
          const sessionId = data.sessionId;
          const userId = data.user_Id;
          const studentInfo = data
        
          // Save basic stuff in localStorage
          localStorage.setItem('decryptedId', decryptedId);
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('sessionId', sessionId);
          localStorage.setItem('userId', userId);
          setStudentData(studentInfo);
          console.log(studentInfo)
          navigate(`/StudentDashboard/${userId}`);
        }
        
      } else {
        alert(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("Something went wrong. Please try again later.");
    }
};

  // Handle forgot password form submission
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!username) {
      alert("Please enter your email to reset the password.");
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
        setIsForgotPassword(true);  // Go back to login form after success
        setIsResetPassword(true);  // Show reset password form with reset code
        alert("Password reset instructions have been sent to your email.");
      } else {
        alert(data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      alert("Something went wrong. Please try again later.");
    }
  };

  // Handle reset password form submission
  const handleResetPassword = async (e) => {
    debugger
    e.preventDefault();
    if (!resetCode || !newPassword || !confirmPassword) {
      alert("Please enter reset code, new password, and confirm password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
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
        alert("Password has been reset successfully. You can now log in.");
        setIsResetPassword(false);  // Go back to login form after success
      } else {
        alert(data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      alert("Something went wrong. Please try again later.");
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
          <StudentLoginForm 
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
          />

          {/* Forgot password and registration links */}
          {!isForgotPassword && !isResetPassword && (
            <div className={styles.studentLoginLinks}>
              <p>New here? <Link to="/StudentRegistrationPage">Register</Link></p>
              <p><a href="#" onClick={() => setIsForgotPassword(true)}>Forgot Password?</a></p>
            </div>
          )}

          {isResetPassword && (
            <div className={styles.backToLoginLink}>
              <a href="#" onClick={() => setIsResetPassword(false)}>Back to Login</a>
            </div>
          )}
        </div>
      </div>
      <MainFooter />
    </div>
  );
}
