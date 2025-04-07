import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from "../../../Styles/StudentDashboardCSS/Student.module.css"; 
import stdLogo from '../../../assets/logoCap.jpeg'
import MainHeader from '../../LandingPagesFolder/mainPageHeaderFooterFolder/MainHeader';
import MainFooter from '../../LandingPagesFolder/mainPageHeaderFooterFolder/MainFooter';
import { BASE_URL } from '../../../../apiConfig'; 

export default function StudentLogin() {
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState("");  
  const [newPassword, setNewPassword] = useState("");  
  const [confirmPassword, setConfirmPassword] = useState("");  
  const [resetCode, setResetCode] = useState(""); 
  const [isForgotPassword, setIsForgotPassword] = useState(false); 
  const [isResetPassword, setIsResetPassword] = useState(false);  
  const navigate = useNavigate();

  // Check if the user is already logged in when the component loads
  useEffect(() => {
    const sessionId = localStorage.getItem('sessionId'); // Check if session ID is stored in localStorage
    if (sessionId) {
      navigate(`/StudentDashboard/${sessionId}`); // Redirect to dashboard if session ID exists
    }
  }, [navigate]);

  // Handle login form submission
 // Handle login form submission
const handleLogin = async (e) => {
  e.preventDefault();
  if (!username || !password) {
    alert("Please enter both username and password");
    return;
  }

  const loginData = {
    email: username,  // Use 'email' field for student login
    password: password,
  };

  console.log("Login button clicked", loginData);
  try {
    const response = await fetch(`${BASE_URL}/student/studentLogin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });
    const data = await response.json();

    if (response.ok) {
      console.log("Login successful", data);

      // Store session ID in localStorage after successful login
      const sessionId = data.sessionId; // Assuming response contains sessionId
      localStorage.setItem('sessionId', sessionId);  // Save session ID

      // Redirect to StudentDashboard with session ID in the URL
      navigate(`/StudentDashboard/${sessionId}`);  // Navigate to dashboard with session ID in URL
    } else {
      alert(data.message || "Login failed. Please try again.");
    }
  } catch (error) {
    console.error("Error during login:", error);
    alert("Something went wrong. Please try again later.");
  }
};


  // Handle forgot password form submission (Email submission)
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!username) {
      alert("Please enter your email to reset the password.");
      return;
    }

    const forgotPasswordData = { email: username };

    try {
      const response = await fetch("/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(forgotPasswordData),
      });

      const data = await response.json();

      if (isForgotPassword) {
        alert("Password reset instructions have been sent to your email.");
        setIsForgotPassword(false);  // Go back to login form after success
        setIsResetPassword(true);  // Show reset password form with reset code
      } else {
        alert(data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error during forgot password:", error);
      alert("Something went wrong. Please try again later.");
    }
  };

  // Handle reset password form submission
  const handleResetPassword = async (e) => {
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
      const response = await fetch("/reset-password", {
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
      console.error("Error during password reset:", error);
      alert("Something went wrong. Please try again later.");
    }
  };

  // // Handle logout (remove session ID)
  // const handleLogout = () => {
  //   localStorage.removeItem('sessionId');  // Remove session ID on logout
  //   navigate('/');  // Redirect to login page or home page
  // };

  return (
    <div className={styles.studentLoginHomePage}>
      <MainHeader/>
      <div className={styles.studentLoginPage}>
        <div className={styles.studentLoginContainer}>
          <div className={styles.studentLogo}>
            <img src={stdLogo} alt="Student Logo" />
          </div>
          <h1>{isForgotPassword ? "Forgot Password" : "Student Login"}</h1>

          <form onSubmit={isForgotPassword ? (isResetPassword ? handleResetPassword : handleForgotPassword) : handleLogin}>
            {/* Email input for login and forgot password */}
            <div className={styles.studentLoginFormInput}>
              <label>Email ID:</label>
              <input
                type="email"
                placeholder="Enter your email here"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* Password input for login */}
            {!isForgotPassword && !isResetPassword && (
              <div className={styles.studentLoginFormInput}>
                <label>Password:</label>
                <input
                  type="password"
                  placeholder="Enter your password here"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Reset Code and New Password fields for reset */}
            {isResetPassword && (
              <>
                <div className={styles.studentLoginFormInput}>
                  <label>Reset Code:</label>
                  <input
                    type="text"
                    placeholder="Enter the reset code sent to your email"
                    name="resetCode"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.studentLoginFormInput}>
                  <label>New Password:</label>
                  <input
                    type="password"
                    placeholder="Enter your new password"
                    name="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.studentLoginFormInput}>
                  <label>Confirm Password:</label>
                  <input
                    type="password"
                    placeholder="Confirm your new password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {/* Submit button */}
            <div className={styles.studentLoginFormSubmit}>
              <button type="submit">
                {isForgotPassword ? (isResetPassword ? "Submit New Password" : "Send Reset Code") : "Login"}
              </button>
            </div>
          </form>

          {/* Forgot password link */}
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
