import React, { useState, useRef } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Importing React icons
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
  handleResetPassword // This is the function that handles the reset password API call
}) {

  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [showNewPassword, setShowNewPassword] = useState(false); // State to toggle new password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State to toggle confirm password visibility

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const newPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const resetCodeRef = useRef(null);

  // Validation function for new password and confirm password
  const isPasswordValid = newPassword && confirmPassword && newPassword === confirmPassword;

  // Function to handle button text change depending on mode
  const getButtonText = () => {

    if (isForgotPassword) {
      return isResetPassword ? "Save Password" : "Send Reset Code";
    } else {
      return "Login";
    }
  };

  // Determine if the button should be disabled
  const isButtonDisabled = () => {
    if (isForgotPassword) {
      return isResetPassword ? !isPasswordValid : false;
    } else {
      return false;
    }
  };


  return (
    <form onSubmit={isForgotPassword ? (isResetPassword ? handleResetPassword : handleForgotPassword) : handleLogin}>
      
      {/* Email input for login and forgot password */}
      {!isResetPassword && (
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
      )}

      {/* Password input for login */}
      {!isForgotPassword && !isResetPassword && (
        <div className={styles.studentLoginFormInput}>
          <label>Password:</label>
          <div className={styles.passwordInputWrapper}>
            <input
              type={showPassword ? "text" : "password"} // Toggle password visibility
              placeholder="Enter your password here"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              ref={passwordRef} // Use ref here
              required
            />
            <span 
              className={styles.passwordToggle} 
              onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
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
            <div className={styles.passwordInputWrapper}>
              <input
                type={showNewPassword ? "text" : "password"} // Toggle password visibility
                placeholder="Enter your new password"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                ref={newPasswordRef} // Use ref here
                required
              />
              <span 
                className={styles.passwordToggle} 
                onClick={() => setShowNewPassword(!showNewPassword)} // Toggle new password visibility
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>
          <div className={styles.studentLoginFormInput}>
            <label>Confirm Password:</label>
            <div className={styles.passwordInputWrapper}>
              <input
                type={showConfirmPassword ? "text" : "password"} // Toggle password visibility
                placeholder="Confirm your new password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                ref={confirmPasswordRef} // Use ref here
                required
              />
              <span 
                className={styles.passwordToggle} 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)} // Toggle confirm password visibility
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {/* Display error if new password and confirm password do not match */}
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className={styles.passwordError}>Passwords do not match</p>
            )}
          </div>
        </>
      )}

      {/* Submit button */}
      <div className={styles.studentLoginFormSubmit}>
        <button type="submit" disabled={isButtonDisabled()}> 
          {getButtonText()} {/* Dynamic button text */}
        </button>
      </div>
    </form>
  );
}
