import React, { useState } from 'react';
import styles from "../../../Styles/StudentDashboardCSS/Student.module.css"; // Using the same classes as StudentLogin
import stdLogo from '../../../assets/logoCapImg.2509a17adb384c89e21a.jpeg'
import MainHeader from '../../LandingPagesFolder/mainPageHeaderFooterFolder/MainHeader';
import MainFooter from '../../LandingPagesFolder/mainPageHeaderFooterFolder/MainFooter';

export default function StudentLogin() {
  const [username, setUsername] = useState("");  // Track student username (email)
  const [password, setPassword] = useState("");  // Track student password
  const [newPassword, setNewPassword] = useState("");  // Track new password during reset
  const [confirmPassword, setConfirmPassword] = useState("");  // Track confirm password during reset
  const [resetCode, setResetCode] = useState("");  // Track reset code during reset
  const [isForgotPassword, setIsForgotPassword] = useState(false);  // State to track the form view (login or forgot password)
  const [isResetPassword, setIsResetPassword] = useState(false);  // State to track if reset password code is sent

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
      const response = await fetch("/student-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData), 
      });
      const data = await response.json();

      if (response.ok) {
        console.log("Login successful", data);
        window.location.href = "/student-dashboard";  // Redirect to student dashboard on success
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

  return (
    <div className={styles.studentLoginHomePage}>
       <MainHeader/>
    <div className={styles.studentLoginPage}>
      <div className={styles.studentLoginContainer}>
        <div className={styles.studentLogo}>
        <img src={stdLogo} alt=""stdLogo/>
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
            <p>New here? <a href="/student-registration">Register</a></p>
            <p><a href="#" onClick={() => setIsForgotPassword(true)}>Forgot Password?</a></p>
          </div>
        )}

        {/* Back to login link */}
        {isForgotPassword && !isResetPassword && (
          <div className={styles.backToLoginLink}>
            <a href="#" onClick={() => setIsForgotPassword(false)}>Back to Login</a>
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
