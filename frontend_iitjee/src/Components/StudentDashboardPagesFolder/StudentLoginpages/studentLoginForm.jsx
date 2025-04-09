import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from "../../../Styles/StudentDashboardCSS/Student.module.css"; 

export default function StudentLoginForm({ 
  isForgotPassword, 
  isResetPassword, 
  username, 
  password, 
  newPassword, 
  confirmPassword, 
  resetCode, 
  setUsername, 
  setPassword, 
  setNewPassword, 
  setConfirmPassword, 
  setResetCode, 
  handleLogin, 
  handleForgotPassword, 
  handleResetPassword
}) {

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const newPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const resetCodeRef = useRef(null);

  return (
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
          ref={emailRef} // Use ref here
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
            ref={passwordRef} // Use ref here
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
              ref={resetCodeRef} // Use ref here
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
              ref={newPasswordRef} // Use ref here
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
              ref={confirmPasswordRef} // Use ref here
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
  );
}
